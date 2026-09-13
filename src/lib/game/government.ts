import { PARTY_MAP, type PartyId } from "./data";
import type { ElectionResult, GameState } from "./engine";

export interface Ministry {
  key: string;
  label: string;
  cost: number;
  note: string;
}

/** Nine seats at the cabinet table. The bigger the office, the dearer the price. */
export const MINISTRIES: Ministry[] = [
  { key: "pcm", label: "President of the Council", cost: 30, note: "Palazzo Chigi itself" },
  { key: "economy", label: "Economy & Finance", cost: 22, note: "The purse and the lira" },
  { key: "interior", label: "Interior", cost: 18, note: "Prefects, police, order" },
  { key: "foreign", label: "Foreign Affairs", cost: 16, note: "Brussels and Washington" },
  { key: "defence", label: "Defence", cost: 12, note: "The armed forces" },
  { key: "education", label: "Education", cost: 10, note: "Schools and universities" },
  { key: "health", label: "Health", cost: 10, note: "The USL machine" },
  { key: "transport", label: "Transport & Works", cost: 7, note: "Contracts and concrete" },
  { key: "agriculture", label: "Agriculture", cost: 6, note: "The rural vote" },
];

/** Pairs that will not sit in the same cabinet, whatever the arithmetic says. */
const VETOES: [PartyId, PartyId][] = [
  ["fi", "pds"],
  ["fi", "prc"],
  ["an", "pds"],
  ["an", "prc"],
  ["lega", "prc"],
  ["lega", "an"],
];

export function vetoed(a: PartyId, b: PartyId) {
  return VETOES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/** How two rival parties regard one another, symmetrised. */
export function mutual(a: PartyId, b: PartyId) {
  const ab = PARTY_MAP[a].relations[b] ?? 0;
  const ba = PARTY_MAP[b].relations[a] ?? 0;
  return Math.round((ab + ba) / 2);
}

export interface PartnerOffer {
  id: PartyId;
  seats: number;
  relation: number;
  available: boolean;
  reason: string;
}

/** Who will talk to you, given your relations and who is already at the table. */
export function partnerOffers(
  state: GameState,
  projection: ElectionResult,
  picked: PartyId[],
): PartnerOffer[] {
  return projection.rows
    .filter((r) => !r.minor && r.id !== state.party)
    .map((row) => {
      const id = row.id as PartyId;
      const r = { id, seats: row.seats };
      const relation = state.relations[id];
      if (vetoed(state.party, id)) {
        return { id, seats: r.seats, relation, available: false, reason: "Will not govern with you" };
      }
      if (relation < 15) {
        return { id, seats: r.seats, relation, available: false, reason: "Talks refused" };
      }
      const blocker = picked.find((p) => p !== id && (vetoed(p, id) || mutual(p, id) <= -45));
      if (blocker) {
        return {
          id,
          seats: r.seats,
          relation,
          available: false,
          reason: `Incompatible with ${PARTY_MAP[blocker].short}`,
        };
      }
      return { id, seats: r.seats, relation, available: true, reason: "Open to a deal" };
    });
}

export interface Leverage {
  points: number;
  seatWeight: number;
  relationBonus: number;
  partnerPenalty: number;
  majorityBonus: number;
}

/** Secret bargaining strength: your weight in the bloc, fewer partners, warmer relations. */
export function leverage(state: GameState, result: ElectionResult): Leverage {
  const mySeats = result.rows.find((r) => r.id === state.party)!.seats;
  const allies = result.allies;
  const seatWeight = Math.round((mySeats / Math.max(1, result.coalitionSeats)) * 70);
  const avgRel = allies.length
    ? allies.reduce((a, id) => a + state.relations[id], 0) / allies.length
    : 60;
  const relationBonus = Math.round(Math.max(-10, Math.min(18, avgRel * 0.22)));
  // small lists cost far less at the table than a full party
  const partnerPenalty = allies.length * 6 + result.minorAllies.length * 2;
  const majorityBonus = result.government ? 14 : 0;
  const points = Math.max(
    6,
    Math.min(100, seatWeight + relationBonus - partnerPenalty + majorityBonus),
  );
  return { points, seatWeight, relationBonus, partnerPenalty, majorityBonus };
}

export type Cabinet = Record<string, string>;

/** Offices you did not buy go to partners, biggest first; without partners, to you. */
export function fillCabinet(state: GameState, result: ElectionResult, claimed: string[]): Cabinet {
  // a small ally is only handed an office if it cleared 4% of the vote
  const partners = result.rows
    .filter((r) => r.ally && r.id !== state.party && (!r.minor || r.share >= 4))
    .sort((a, b) => b.seats - a.seats)
    .map((r) => r.id);
  const cabinet: Cabinet = {};
  let i = 0;
  for (const m of MINISTRIES) {
    if (claimed.includes(m.key) || partners.length === 0 || m.key === "pcm") {
      cabinet[m.key] = state.party;
    } else {
      cabinet[m.key] = partners[i++ % partners.length]!;
    }
  }
  return cabinet;
}
