import { EVENTS, PARTIES, PARTY_MAP, type Effect, type PartyId } from "./data";

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
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const clampRel = (n: number) => Math.max(-100, Math.min(100, Math.round(n)));

export function createGame(party: PartyId): GameState {
  const p = PARTY_MAP[party];
  const relations = {} as Record<PartyId, number>;
  for (const other of PARTIES) {
    relations[other.id] = other.id === party ? 100 : (p.relations[other.id] ?? 0);
  }
  return { party, turn: 0, ...p.start, relations, log: [] };
}

export function applyEffect(state: GameState, effect: Effect, note: string): GameState {
  const next: GameState = {
    ...state,
    popularity: clamp(state.popularity + (effect.popularity ?? 0)),
    economy: clamp(state.economy + (effect.economy ?? 0)),
    order: clamp(state.order + (effect.order ?? 0)),
    integrity: clamp(state.integrity + (effect.integrity ?? 0)),
    treasury: clamp(state.treasury + (effect.treasury ?? 0)),
    relations: { ...state.relations },
    turn: state.turn + 1,
    log: [...state.log, note],
  };
  for (const [id, delta] of Object.entries(effect.relations ?? {})) {
    const key = id as PartyId;
    if (key === state.party) continue;
    next.relations[key] = clampRel(next.relations[key] + (delta as number));
  }
  return next;
}

/** The campaign a given party actually plays: shared events plus its own. */
export function eventsFor(party: PartyId) {
  return EVENTS.filter((e) => !e.only || e.only.includes(party));
}

export function totalTurns(party: PartyId) {
  return eventsFor(party).length;
}

export interface ElectionRow {
  id: PartyId;
  share: number;
  seats: number;
  ally: boolean;
}

export interface ElectionResult {
  rows: ElectionRow[];
  playerShare: number;
  coalitionShare: number;
  coalitionSeats: number;
  allies: PartyId[];
  government: boolean;
  verdict: string;
}

/** 630 seats in the Chamber, allocated broadly in proportion to the vote. */
export function runElection(state: GameState): ElectionResult {
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

  const others = 100 - 18; // minor lists and abstention-adjusted remainder
  const sum = raw.reduce((a, b) => a + b.value, 0);
  const rows: ElectionRow[] = raw
    .map((r) => ({
      id: r.id,
      share: Math.round(((r.value / sum) * others + Number.EPSILON) * 10) / 10,
      seats: 0,
      ally: r.id === state.party || state.relations[r.id] >= 20,
    }))
    .sort((a, b) => b.share - a.share);

  const shareSum = rows.reduce((a, b) => a + b.share, 0);
  rows.forEach((r) => {
    r.seats = Math.round((r.share / shareSum) * 630);
  });

  const playerShare = rows.find((r) => r.id === state.party)!.share;
  const coalition = rows.filter((r) => r.ally);
  const coalitionShare = Math.round(coalition.reduce((a, b) => a + b.share, 0) * 10) / 10;
  const coalitionSeats = coalition.reduce((a, b) => a + b.seats, 0);
  const allies = coalition.filter((r) => r.id !== state.party).map((r) => r.id);
  const government = coalitionSeats >= 316;
  const top = rows[0]!;
  const largest = top.id === state.party;

  let verdict: string;
  if (government && largest) {
    verdict = `${p.leader} is sworn in at the Quirinale. ${p.short} leads the first government of the Second Republic.`;
  } else if (government) {
    verdict = `Your coalition has a majority, but ${PARTY_MAP[top.id].short} is its largest party — ${p.leader} governs as a junior partner.`;
  } else if (largest) {
    verdict = `${p.short} is the biggest party in the Chamber and still short of a majority. Weeks of consultations begin.`;
  } else if (playerShare > p.base) {
    verdict = `${p.short} grew but sits in opposition. A base to build on for the next round.`;
  } else {
    verdict = `${p.short} loses ground and goes into opposition. The party begins asking who is to blame.`;
  }

  return { rows, playerShare, coalitionShare, coalitionSeats, allies, government, verdict };
}

export const METRICS = [
  { key: "popularity", label: "Popularity" },
  { key: "economy", label: "Economy" },
  { key: "order", label: "Public order" },
  { key: "integrity", label: "Integrity" },
  { key: "treasury", label: "Party funds" },
] as const;
