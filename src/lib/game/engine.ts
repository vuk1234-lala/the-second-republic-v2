import { EVENTS, PARTIES, PARTY_MAP, type Effect, type PartyId } from "./data";
import { axisRelationDrift, campaignMultiplier, createHq, hasHq, stepHq, type HqState } from "./hq";
import { finalIdentity, monthIndex, MOMENTS } from "./identity";
import { affinity, blocOfParty, MINOR_MAP, minorsAt } from "./minors";


export interface GameState {
  party: PartyId;
  turn: number;
  popularity: number;
  economy: number;
  order: number;
  integrity: number;
  treasury: number;
  relations: Record<PartyId, number>;
  log: string[];
  /** markers raised by choices (name changes, the television announcement…) */
  flags: string[];
  /** Forza Italia's headquarters at Milano 2 — only meaningful when playing FI */
  hq: HqState;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const clampRel = (n: number) => Math.max(-100, Math.min(100, Math.round(n)));

export function createGame(party: PartyId): GameState {
  const p = PARTY_MAP[party];
  const relations = {} as Record<PartyId, number>;
  for (const other of PARTIES) {
    relations[other.id] = other.id === party ? 100 : (p.relations[other.id] ?? 0);
  }
  return { party, turn: 0, ...p.start, relations, log: [], flags: [], hq: createHq(party) };
}

export function applyEffect(
  state: GameState,
  effect: Effect,
  note: string,
  flag?: string,
): GameState {
  const isFi = hasHq(state.party);
  const rawPop = effect.popularity ?? 0;
  const gain = isFi && rawPop > 0 ? rawPop * campaignMultiplier(state.hq) : rawPop;
  const hq = isFi ? stepHq(state.hq, effect.hq, gain) : state.hq;

  const next: GameState = {
    ...state,
    hq,
    popularity: clamp(state.popularity + gain),
    economy: clamp(state.economy + (effect.economy ?? 0)),
    order: clamp(state.order + (effect.order ?? 0)),
    integrity: clamp(state.integrity + (effect.integrity ?? 0)),
    treasury: clamp(state.treasury + (effect.treasury ?? 0)),
    relations: { ...state.relations },
    turn: state.turn + 1,
    log: [...state.log, note],
    flags: flag && !state.flags.includes(flag) ? [...state.flags, flag] : state.flags,
  };
  const drift = isFi ? axisRelationDrift(hq) : {};
  for (const [id, delta] of Object.entries(effect.relations ?? {})) {
    const key = id as PartyId;
    if (key === state.party) continue;
    next.relations[key] = clampRel(next.relations[key] + (delta as number));
  }
  for (const [id, delta] of Object.entries(drift)) {
    const key = id as PartyId;
    if (key === state.party) continue;
    next.relations[key] = clampRel(next.relations[key] + (delta as number));
  }
  return next;
}

/** The month the campaign has reached, as an absolute index (Jan 1992 = 0). */
export function campaignMonth(state: GameState): number {
  const events = eventsFor(state.party);
  const event = events[Math.min(state.turn, events.length - 1)];
  return event ? monthIndex(event.date) : MOMENTS.start;
}


/** The campaign a given party actually plays: shared events plus its own. */
export function eventsFor(party: PartyId) {
  return EVENTS.filter(
    (e) => (!e.only || e.only.includes(party)) && !(e.not ?? []).includes(party),
  );
}

export function totalTurns(party: PartyId) {
  return eventsFor(party).length;
}

export interface ElectionRow {
  id: string;
  share: number;
  seats: number;
  ally: boolean;
  /** a small list, never negotiated with directly */
  minor: boolean;
}

export interface ElectionResult {
  rows: ElectionRow[];
  playerShare: number;
  coalitionShare: number;
  coalitionSeats: number;
  /** the big parties sitting in your bloc */
  allies: PartyId[];
  /** the small lists that came in on their own to make up the numbers */
  minorAllies: string[];
  government: boolean;
  verdict: string;
}

/** 630 seats in the Chamber, allocated broadly in proportion to the vote. */
export function runElection(state: GameState, chosenAllies?: PartyId[]): ElectionResult {
  const p = PARTY_MAP[state.party];
  const perf =
    (state.popularity - 45) * 0.28 +
    (state.economy - 45) * 0.14 +
    (state.integrity - 50) * 0.12 +
    (state.order - 50) * 0.06 +
    (state.treasury - 45) * 0.04;

  const raw = PARTIES.map((party) => {
    if (party.id === state.party) {
      return { id: party.id, value: Math.max(2, party.base + perf) };
    }
    // rivals drift with your relations: friends lend votes, enemies harden
    const rel = state.relations[party.id];
    const drift = -perf * 0.18 + (rel > 20 ? -1.5 : rel < -40 ? 1.5 : 0);
    return { id: party.id, value: Math.max(1.5, party.base + drift) };
  });

  const minors = minorsAt(1994, state.flags);
  const minorTotal = minors.reduce((a, m) => a + m.share, 0);
  const bigShare = Math.max(50, 100 - minorTotal);
  const sum = raw.reduce((a, b) => a + b.value, 0);

  const majorRows: ElectionRow[] = raw.map((r) => ({
    id: r.id,
    share: Math.round(((r.value / sum) * bigShare + Number.EPSILON) * 10) / 10,
    seats: 0,
    minor: false,
    ally:
      r.id === state.party ||
      (chosenAllies ? chosenAllies.includes(r.id) : state.relations[r.id] >= 20),
  }));
  const minorRows: ElectionRow[] = minors.map((m) => ({
    id: m.id,
    share: Math.round((m.share + Number.EPSILON) * 10) / 10,
    seats: 0,
    minor: true,
    ally: false,
  }));

  const rows = [...majorRows, ...minorRows].sort((a, b) => b.share - a.share);
  const shareSum = rows.reduce((a, b) => a + b.share, 0);
  rows.forEach((r) => {
    r.seats = Math.round((r.share / shareSum) * 630);
  });

  // the small lists come in on their own account, as far as the numbers require
  const myBloc = blocOfParty(state.party, state.flags);
  let seated = rows.filter((r) => r.ally).reduce((a, b) => a + b.seats, 0);
  const candidates = rows
    .filter((r) => r.minor)
    .map((r) => ({ row: r, aff: affinity(myBloc, MINOR_MAP[r.id]!.bloc) }))
    .filter((c) => c.aff > 0)
    .sort((a, b) => b.aff - a.aff || b.row.seats - a.row.seats);
  for (const c of candidates) {
    if (seated >= 316) break;
    c.row.ally = true;
    seated += c.row.seats;
  }

  const playerShare = rows.find((r) => r.id === state.party)!.share;
  const coalition = rows.filter((r) => r.ally);
  const coalitionShare = Math.round(coalition.reduce((a, b) => a + b.share, 0) * 10) / 10;
  const coalitionSeats = coalition.reduce((a, b) => a + b.seats, 0);
  const allies = coalition
    .filter((r) => !r.minor && r.id !== state.party)
    .map((r) => r.id as PartyId);
  const minorAllies = coalition.filter((r) => r.minor).map((r) => r.id);
  const government = coalitionSeats >= 316;
  const top = rows[0]!;
  const largest = top.id === state.party;

  let verdict: string;
  if (government && largest) {
    verdict = `${p.leader} is sworn in at the Quirinale. ${p.short} leads the first government of the Second Republic.`;
  } else if (government) {
    verdict = `Your coalition has a majority, but ${finalIdentity(top.id, state.party, state.flags).short} is its largest party — ${p.leader} governs as a junior partner.`;
  } else if (largest) {
    verdict = `${p.short} is the biggest party in the Chamber and still short of a majority. Weeks of consultations begin.`;
  } else if (playerShare > p.base) {
    verdict = `${p.short} grew but sits in opposition. A base to build on for the next round.`;
  } else {
    verdict = `${p.short} loses ground and goes into opposition. The party begins asking who is to blame.`;
  }

  return {
    rows,
    playerShare,
    coalitionShare,
    coalitionSeats,
    allies,
    minorAllies,
    government,
    verdict,
  };
}

export const METRICS = [
  { key: "order", label: "Public order" },
  { key: "integrity", label: "Integrity" },
  { key: "treasury", label: "Party funds" },
] as const;

