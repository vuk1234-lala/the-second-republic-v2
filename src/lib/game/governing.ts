import type { PartyId } from "./data";
import { START_COUNTRY, tickCountry, type CountryStats } from "./country";
import { GOV_EVENTS, type Bloc, type GovChoice, type GovEvent } from "./govevents";
import { MINISTRIES, type Cabinet } from "./government";

export const TERM_MONTHS = 60;

const LEFT: PartyId[] = ["pds", "prc", "ppi"];
export function blocOf(party: PartyId): Bloc {
  return LEFT.includes(party) ? "left" : "right";
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Month 0 is June 1994; the term runs to May 1999. */
export function monthLabel(turn: number) {
  const abs = 5 + turn; // June = index 5
  return `${MONTHS[abs % 12]} ${1994 + Math.floor(abs / 12)}`;
}

/**
 * The order of business for a five-year term: events are dealt round-robin
 * across the nine ministries, so each department returns roughly every nine
 * months, and only the bloc-specific files of your own side are opened.
 */
export function scheduleFor(party: PartyId): GovEvent[] {
  const bloc = blocOf(party);
  const byMinistry = MINISTRIES.map((m) =>
    GOV_EVENTS.filter((e) => e.ministry === m.key && (!e.bloc || e.bloc === bloc)),
  );
  const out: GovEvent[] = [];
  const depth = Math.max(...byMinistry.map((l) => l.length));
  for (let i = 0; i < depth; i++) {
    for (const list of byMinistry) {
      const e = list[i];
      if (e) out.push(e);
    }
  }
  return out.slice(0, TERM_MONTHS);
}

export interface QueuedPulse {
  turn: number;
  effect: Partial<Record<keyof CountryStats, number>>;
}

export interface GovDispatch {
  date: string;
  ministry: string;
  headline: string;
  decision: string;
}

export interface GovState {
  party: PartyId;
  cabinet: Cabinet;
  turn: number;
  stats: CountryStats;
  previous: CountryStats;
  pulses: QueuedPulse[];
  log: GovDispatch[];
}

export function createGovernment(party: PartyId, cabinet: Cabinet): GovState {
  return {
    party,
    cabinet,
    turn: 0,
    stats: { ...START_COUNTRY },
    previous: { ...START_COUNTRY },
    pulses: [],
    log: [],
  };
}

const LIMITS: Record<keyof CountryStats, [number, number]> = {
  growth: [-8, 10],
  crime: [0, 100],
  welfare: [0, 100],
  budget: [-100, 100],
  debt: [0, 100],
  approval: [0, 100],
};

function applyPulses(stats: CountryStats, pulses: QueuedPulse[]): CountryStats {
  const next = { ...stats };
  for (const q of pulses) {
    for (const [k, v] of Object.entries(q.effect)) {
      const key = k as keyof CountryStats;
      const [lo, hi] = LIMITS[key];
      next[key] = Math.round(Math.max(lo, Math.min(hi, next[key] + (v as number))) * 10) / 10;
    }
  }
  return next;
}

export function governEvent(state: GovState): GovEvent | undefined {
  return scheduleFor(state.party)[state.turn];
}

/** Decide, then let the month pass: standing effects first, then anything due. */
export function applyGovChoice(state: GovState, event: GovEvent, choice: GovChoice): GovState {
  const queue: QueuedPulse[] = [
    ...state.pulses,
    ...choice.pulses.map((p) => ({ turn: state.turn + p.after, effect: p.effect })),
  ];
  const due = queue.filter((q) => q.turn <= state.turn);
  const rest = queue.filter((q) => q.turn > state.turn);
  const stats = applyPulses(tickCountry(state.stats), due);

  return {
    ...state,
    turn: state.turn + 1,
    previous: state.stats,
    stats,
    pulses: rest,
    log: [
      ...state.log,
      {
        date: monthLabel(state.turn),
        ministry: event.ministry,
        headline: event.headline,
        decision: choice.label,
      },
    ],
  };
}

export function termVerdict(stats: CountryStats) {
  const score =
    stats.approval * 0.4 +
    stats.welfare * 0.2 +
    (100 - stats.crime) * 0.2 +
    (stats.budget + 100) * 0.1 +
    (100 - stats.debt) * 0.1 +
    stats.growth * 3;
  if (stats.debt >= 94) return "The state defaults. The government falls and the term ends in disgrace.";
  if (score >= 70) return "Five years completed and a country visibly changed. You go to the country as a favourite.";
  if (score >= 55) return "A full term served with credit. Re-election is plausible, if not certain.";
  if (score >= 42) return "You survived the legislature. The voters are unconvinced.";
  return "The term ends in exhaustion and recrimination. The opposition is already measuring the curtains.";
}
