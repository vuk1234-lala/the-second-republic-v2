import type { PartyId } from "./data";
import { MINOR_MAP } from "./minors";

/** Absolute month index, January 1992 = 0. June 1992 = 5, March 1994 = 26. */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthIndex(date: string): number {
  const [name, year] = date.trim().split(" ");
  const m = MONTH_NAMES.indexOf(name ?? "");
  const y = Number(year ?? "1992");
  if (m < 0 || Number.isNaN(y)) return 0;
  return (y - 1992) * 12 + m;
}

export function monthLabelFor(index: number): string {
  return `${MONTH_NAMES[((index % 12) + 12) % 12]} ${1992 + Math.floor(index / 12)}`;
}

/** Key moments of the campaign, as month indices. */
export const MOMENTS = {
  start: 5, // June 1992
  craxi: 11, // December 1992 — the avviso di garanzia
  ppiCongress: 23, // December 1993 — the shield and the name
  fiEntry: 24, // January 1994 — "Italy is the country I love"
  fiuggi: 25, // February 1994 — the turn at Fiuggi
  election: 26, // March 1994
} as const;

export interface Identity {
  name: string;
  short: string;
  color: string;
}

/** Flags a choice can raise, recorded on the game state. */
export const FLAGS = {
  fiuggi: "an:fiuggi",
  flame: "an:flame",
  keepDc: "dc:dc",
  becomePpi: "dc:ppi",
  pattoSegni: "dc:segni",
  fiEntry: "fi:entry",
} as const;

const BASE: Record<PartyId, Identity> = {
  fi: { name: "Forza Italia", short: "FI", color: "var(--party-fi)" },
  pds: { name: "Partito Democratico della Sinistra", short: "PDS", color: "var(--party-pds)" },
  lega: { name: "Lega Nord", short: "LN", color: "var(--party-lega)" },
  an: { name: "Movimento Sociale Italiano", short: "MSI", color: "var(--party-msi)" },
  ppi: { name: "Democrazia Cristiana", short: "DC", color: "var(--party-ppi)" },
  prc: { name: "Rifondazione Comunista", short: "PRC", color: "var(--party-prc)" },
};

export interface IdentityCtx {
  /** the party the player leads */
  player: PartyId;
  /** current month index */
  month: number;
  /** flags raised by the player's choices */
  flags: string[];
}

export function identityOf(id: PartyId, ctx: IdentityCtx): Identity {
  const base = BASE[id];
  if (id === "an") {
    const renamed = ctx.player === "an"
      ? ctx.flags.includes(FLAGS.fiuggi)
      : ctx.month >= MOMENTS.fiuggi;
    if (renamed) {
      return { name: "Alleanza Nazionale", short: "AN", color: "var(--party-an)" };
    }
    return base;
  }
  if (id === "ppi") {
    if (ctx.player === "ppi") {
      if (ctx.flags.includes(FLAGS.becomePpi)) {
        return { name: "Partito Popolare Italiano", short: "PPI", color: "var(--party-ppi)" };
      }
      if (ctx.flags.includes(FLAGS.pattoSegni)) {
        return { name: "Patto Segni", short: "Patto", color: "var(--party-segni)" };
      }
      return base; // the shield is kept
    }
    return ctx.month >= MOMENTS.ppiCongress
      ? { name: "Partito Popolare Italiano", short: "PPI", color: "var(--party-ppi)" }
      : base;
  }
  return base;
}

/** Identity as it stands at the end of the campaign — used in government. */
export function finalIdentity(id: string, player: PartyId, flags: string[]): Identity {
  const minor = MINOR_MAP[id];
  if (minor && id !== "psi") {
    return { name: minor.name, short: minor.short, color: minor.color };
  }
  if (id === "psi") {
    return { name: "Partito Socialista Italiano", short: "PSI", color: "var(--party-psi)" };
  }
  return identityOf(id as PartyId, { player, flags, month: MOMENTS.election });
}
