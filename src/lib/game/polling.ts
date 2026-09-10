import { PARTIES, PARTY_MAP, type PartyId } from "./data";
import type { GameState } from "./engine";
import { entryShare } from "./hq";
import { identityOf, MOMENTS, monthLabelFor, type Identity } from "./identity";

export type PollId = PartyId | "psi" | "minor";

export interface PollParty {
  id: PollId;
  /** left-to-right seating order in the Chamber */
  order: number;
  name: string;
  short: string;
  color: string;
  /** share at the general election of 5–6 April 1992 */
  r1992: number;
  seats1992: number;
}

/** The Chamber elected in April 1992, the last of the First Republic. */
export const RESULT_1992: PollParty[] = [
  { id: "prc", order: 0, name: "Rifondazione Comunista", short: "PRC", color: "var(--party-prc)", r1992: 5.6, seats1992: 35 },
  { id: "pds", order: 1, name: "Partito Democratico della Sinistra", short: "PDS", color: "var(--party-pds)", r1992: 16.1, seats1992: 107 },
  { id: "psi", order: 2, name: "Partito Socialista Italiano", short: "PSI", color: "var(--party-psi)", r1992: 13.6, seats1992: 92 },
  { id: "minor", order: 3, name: "Minor lists (PRI, PLI, PSDI, Verdi, Rete…)", short: "Others", color: "var(--party-minor)", r1992: 20.9, seats1992: 101 },
  { id: "ppi", order: 4, name: "Democrazia Cristiana", short: "DC", color: "var(--party-ppi)", r1992: 29.7, seats1992: 206 },
  { id: "fi", order: 5, name: "Forza Italia", short: "FI", color: "var(--party-fi)", r1992: 0, seats1992: 0 },
  { id: "lega", order: 6, name: "Lega Nord", short: "LN", color: "var(--party-lega)", r1992: 8.7, seats1992: 55 },
  { id: "an", order: 7, name: "Movimento Sociale Italiano", short: "MSI–DN", color: "var(--party-msi)", r1992: 5.4, seats1992: 34 },
];

export const POLL_META: Record<PollId, PollParty> = Object.fromEntries(
  RESULT_1992.map((p) => [p.id, p]),
) as Record<PollId, PollParty>;

/** Cheap deterministic noise in [-1, 1] from a string seed. */
function noise(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) / 4294967295) * 2 - 1;
}

/** Stated margin of error of every published poll, in points. */
export const MARGIN_OF_ERROR = 5;
/** Field variation actually applied to a published figure. */
const SAMPLING = 2;

export interface PollRow {
  id: PollId;
  value: number;
  delta: number | null;
}

export interface Poll {
  month: number;
  date: string;
  pollster: string;
  rows: PollRow[];
}

const POLLSTERS = ["Doxa", "Datamedia", "Abacus", "Makno", "Doxa", "Directa", "Abacus", "Datamedia", "Makno"];

/** How well the player is doing, converted into points of national support. */
function standing(state: GameState): number {
  const start = PARTY_MAP[state.party].start;
  const raw =
    (state.popularity - start.popularity) * 0.42 +
    (state.integrity - start.integrity) * 0.12 +
    (state.order - start.order) * 0.07 +
    (state.treasury - start.treasury) * 0.04;
  return Math.max(-9, Math.min(11, raw));
}

interface Ctx {
  player: PartyId;
  flags: string[];
  month: number;
  /** the player's standing at that month */
  push: number;
  /** Forza Italia's entry share, worked out at headquarters */
  entry?: number;
}

function dcTarget(ctx: Ctx): number {
  if (ctx.player !== "ppi") return 10;
  return Math.max(6, Math.min(21, 9.5 + ctx.push));
}

function baseline(id: PollId, ctx: Ctx): number {
  const m = ctx.month;
  const since = Math.max(0, m - MOMENTS.start);
  switch (id) {
    case "fi": {
      const entered =
        ctx.player === "fi" ? ctx.flags.includes("fi:entry") || m >= MOMENTS.fiEntry : m >= MOMENTS.fiEntry;
      if (!entered) return 0;
      if (ctx.player === "fi") return ctx.entry ?? 20;
      return 20;
    }
    case "ppi": {
      const target = dcTarget(ctx);
      return target + (29.7 - target) * Math.exp(-since / 7);
    }
    case "psi": {
      const glide = 13.6 * Math.exp(-since / 12);
      if (m < MOMENTS.craxi) return glide;
      const atFall = 13.6 * Math.exp(-(MOMENTS.craxi - MOMENTS.start) / 12);
      // Craxi shielded from the worst of the outcry: the party survives, diminished
      if (ctx.flags.includes("psi:saved")) {
        return Math.max(6, 6 + (atFall - 6) * Math.exp(-(m - MOMENTS.craxi) / 6));
      }
      return Math.max(0.4, 0.4 + (atFall - 0.4) * Math.exp(-(m - MOMENTS.craxi) / 1.5));
    }
    case "pds":
      return 16.1 + Math.min(since, 21) * 0.16 + (ctx.player === "pds" ? ctx.push : 0);
    case "lega":
      return 8.7 + Math.min(since, 21) * 0.05 + (ctx.player === "lega" ? ctx.push : 0);
    case "prc":
      return 5.6 - Math.min(since, 21) * 0.02 + (ctx.player === "prc" ? ctx.push : 0);
    case "an": {
      const renamed = identityOf("an", ctx).short === "AN";
      return (
        5.4 + Math.min(since, 21) * 0.09 + (renamed ? 6.4 : 0) + (ctx.player === "an" ? ctx.push : 0)
      );
    
    }
    case "minor":
      // the old minor lists slowly shed votes to the new formations
      return Math.max(13.5, 20.9 - Math.min(since, 21) * 0.32);
    default:
      return 0;
  }
}

function computePoll(ctx: Ctx, index: number): Poll {
  const rows = RESULT_1992.map((p) => {
    const value = Math.max(0, baseline(p.id, ctx));
    const jitter = value === 0 ? 0 : noise(`${p.id}-${ctx.month}-${index}`) * SAMPLING;
    return { id: p.id as PollId, value: Math.max(value === 0 ? 0 : 0.3, value + jitter) };
  });
  const total = rows.reduce((a, b) => a + b.value, 0);

  return {
    month: ctx.month,
    date: monthLabelFor(ctx.month),
    pollster: POLLSTERS[index % POLLSTERS.length]!,
    rows: rows
      .map((r) => ({
        id: r.id,
        value: Math.round(((r.value / total) * 100 + Number.EPSILON) * 10) / 10,
        delta: null as number | null,
      }))
      .sort((a, b) => b.value - a.value),
  };
}

/** A poll is published every three months from June 1992 to the vote. */
export function pollMonths(current: number): number[] {
  const out: number[] = [];
  for (let m = MOMENTS.start; m <= Math.min(current, MOMENTS.election); m += 3) out.push(m);
  return out;
}

/**
 * The published polling series for a campaign. Earlier polls use a share of the
 * player's eventual standing, so the trend line reflects how the campaign went.
 */
export function pollsFor(state: GameState, currentMonth: number): Poll[] {
  const push = standing(state);
  const months = pollMonths(currentMonth);
  const span = Math.max(1, currentMonth - MOMENTS.start);
  const entry = state.party === "fi" ? entryShare(state.hq) : undefined;
  const polls = months.map((month, i) =>
    computePoll(
      {
        player: state.party,
        flags: state.flags,
        month,
        ...(entry === undefined ? {} : { entry }),
        push: push * Math.min(1, (month - MOMENTS.start) / span),
      },
      i,
    ),
  );
  // fill in the change on the previous published poll
  return polls.map((poll, i) => {
    const prev = polls[i - 1];
    if (!prev) return poll;
    return {
      ...poll,
      rows: poll.rows.map((r) => {
        const before = prev.rows.find((x) => x.id === r.id);
        return {
          ...r,
          delta: before ? Math.round((r.value - before.value) * 10) / 10 : null,
        };
      }),
    };
  });
}

export interface DiagramRow {
  id: string;
  order: number;
  name: string;
  short: string;
  color: string;
  share: number;
  seats: number;
  mine?: boolean;
  ally?: boolean;
}

export function rows1992(): DiagramRow[] {
  return RESULT_1992.filter((p) => p.r1992 > 0).map((p) => ({
    id: p.id,
    order: p.order,
    name: p.name,
    short: p.short,
    color: p.color,
    share: p.r1992,
    seats: p.seats1992,
  }));
}

/** Turn any set of shares into a 630-seat chamber. */
export function seatsFromShares(rows: { share: number }[]): number[] {
  const total = rows.reduce((a, b) => a + b.share, 0) || 1;
  return rows.map((r) => Math.round((r.share / total) * 630));
}

/** Display metadata for a party as it stands at a given moment. */
export function metaFor(id: PollId, ctx: { player: PartyId; flags: string[]; month: number }): Identity & { order: number } {
  const meta = POLL_META[id];
  if (id === "psi" || id === "minor") {
    return { name: meta.name, short: meta.short, color: meta.color, order: meta.order };
  }
  const ident = identityOf(id, ctx);
  return { ...ident, order: meta.order };
}

/** The general election of 1999, fought on the record of the legislature. */
export function election1999(input: {
  party: PartyId;
  flags: string[];
  approval: number;
  growth: number;
  crime: number;
  welfare: number;
  debt: number;
}): { rows: DiagramRow[]; verdict: string } {
  const record =
    (input.approval - 50) * 0.22 +
    input.growth * 1.1 +
    (55 - input.crime) * 0.06 +
    (input.welfare - 45) * 0.06 +
    (60 - input.debt) * 0.04;

  const shares = PARTIES.map((p) => {
    const incumbent = p.id === input.party;
    const base = p.id === "fi" ? 20 : p.base + (p.id === "an" ? 6 : 0);
    const value = incumbent ? base + record : base - record * 0.22;
    return { id: p.id, value: Math.max(1.5, value) };
  });
  const all = [...shares, { id: "minor" as PollId, value: 13 }];
  const total = all.reduce((a, b) => a + b.value, 0);

  const rows: DiagramRow[] = all
    .map((r) => {
      const meta = metaFor(r.id, {
        player: input.party,
        flags: input.flags,
        month: MOMENTS.election,
      });
      return {
        id: r.id,
        order: meta.order,
        name: meta.name,
        short: meta.short,
        color: meta.color,
        share: Math.round(((r.value / total) * 100 + Number.EPSILON) * 10) / 10,
        seats: 0,
        mine: r.id === input.party,
      };
    })
    .sort((a, b) => b.share - a.share);
  const seats = seatsFromShares(rows);
  rows.forEach((r, i) => {
    r.seats = seats[i]!;
  });

  const mine = rows.find((r) => r.mine)!;
  const largest = rows[0]!.id === input.party;
  const verdict = largest
    ? `${mine.short} is returned as the largest party in the Chamber with ${mine.share.toFixed(1)}%.`
    : `${mine.short} takes ${mine.share.toFixed(1)}% and is beaten into second place by ${rows[0]!.short}.`;
  return { rows, verdict };
}
