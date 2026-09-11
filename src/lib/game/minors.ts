import type { PartyId } from "./data";

/**
 * The small lists that fill out the Chamber. They change from election to
 * election: the lay parties of 1992 are not the lists of 1994, and neither are
 * those of 1999. Each carries a private bloc tag which decides, without the
 * player ever negotiating with them, whose majority they will prop up.
 */
export type MinorBloc = "left" | "centrist" | "conservative";

export interface Minor {
  id: string;
  name: string;
  short: string;
  color: string;
  /** left-to-right seating order in the Chamber */
  order: number;
  /** the secret tag: who these deputies will vote a government in with */
  bloc: MinorBloc;
  /** share at each general election, where the list stood */
  s1992?: number;
  s1994?: number;
  s1999?: number;
  /** month index (Jan 1992 = 0) from which the list shows up in polls */
  from?: number;
  /** polled separately elsewhere (the PSI) */
  skipPoll?: boolean;
}

export const MINORS: Minor[] = [
  // ---- the left flank ----
  { id: "pdci", name: "Comunisti Italiani", short: "PdCI", color: "var(--party-pdci)", order: 0.3, bloc: "left", s1999: 2.0 },
  { id: "verdi", name: "Federazione dei Verdi", short: "Verdi", color: "var(--party-verdi)", order: 0.6, bloc: "left", s1992: 2.8, s1994: 2.7, s1999: 1.8 },
  { id: "rete", name: "La Rete", short: "Rete", color: "var(--party-rete)", order: 0.8, bloc: "left", s1992: 1.9, s1994: 1.9 },
  { id: "psi", name: "Partito Socialista Italiano", short: "PSI", color: "var(--party-psi)", order: 2, bloc: "left", s1994: 2.2, skipPoll: true },
  { id: "sdi", name: "Socialisti Democratici Italiani", short: "SDI", color: "var(--party-sdi)", order: 2.2, bloc: "left", s1999: 2.2 },
  // ---- the lay and Catholic centre ----
  { id: "psdi", name: "Partito Socialista Democratico", short: "PSDI", color: "var(--party-psdi)", order: 2.5, bloc: "centrist", s1992: 2.7 },
  { id: "ad", name: "Alleanza Democratica", short: "AD", color: "var(--party-ad)", order: 2.7, bloc: "centrist", s1994: 1.2, from: 18 },
  { id: "pri", name: "Partito Repubblicano Italiano", short: "PRI", color: "var(--party-pri)", order: 3, bloc: "centrist", s1992: 4.4, s1994: 1.0 },
  { id: "pannella", name: "Lista Pannella", short: "Pannella", color: "var(--party-pannella)", order: 3.2, bloc: "centrist", s1992: 1.2, s1994: 3.5 },
  { id: "bonino", name: "Lista Bonino", short: "Bonino", color: "var(--party-pannella)", order: 3.2, bloc: "centrist", s1999: 6.0 },
  { id: "asinello", name: "I Democratici — l'Asinello", short: "Democratici", color: "var(--party-asinello)", order: 3.6, bloc: "centrist", s1999: 6.0 },
  { id: "svp", name: "Südtiroler Volkspartei", short: "SVP", color: "var(--party-svp)", order: 3.8, bloc: "centrist", s1992: 0.5, s1994: 0.6, s1999: 0.5 },
  { id: "altri", name: "Other lists and local slates", short: "Other lists", color: "var(--party-minor)", order: 4.2, bloc: "centrist", s1992: 4.6, s1994: 1.4, s1999: 1.5 },
  // ---- the right flank ----
  { id: "pli", name: "Partito Liberale Italiano", short: "PLI", color: "var(--party-pli)", order: 4.6, bloc: "conservative", s1992: 2.8 },
  { id: "ccd", name: "Centro Cristiano Democratico", short: "CCD", color: "var(--party-ccd)", order: 4.7, bloc: "conservative", s1994: 3.0, from: 23 },
  { id: "ccdu", name: "CCD–CDU, il Biancofiore", short: "Biancofiore", color: "var(--party-ccd)", order: 4.7, bloc: "conservative", s1999: 3.0 },
  { id: "fiamma", name: "Movimento Sociale — Fiamma Tricolore", short: "Fiamma", color: "var(--party-fiamma)", order: 7.6, bloc: "conservative", s1999: 1.0 },
];

export const MINOR_MAP: Record<string, Minor> = Object.fromEntries(
  MINORS.map((m) => [m.id, m]),
);

export function isMinor(id: string): boolean {
  return id in MINOR_MAP && id !== "psi";
}

export type Era = 1992 | 1994 | 1999;

function eraShare(m: Minor, era: Era): number {
  return (era === 1992 ? m.s1992 : era === 1994 ? m.s1994 : m.s1999) ?? 0;
}

export interface MinorStanding extends Minor {
  share: number;
}

/**
 * The lists that stood at a given election, with the share each took. The PSI
 * of 1994 depends on whether Craxi was shielded from the outcry.
 */
export function minorsAt(era: Era, flags: string[] = []): MinorStanding[] {
  return MINORS.filter((m) => eraShare(m, era) > 0)
    .map((m) => {
      let share = eraShare(m, era);
      if (m.id === "psi" && era === 1994 && flags.includes("psi:saved")) share = 6.5;
      if (m.id === "sdi" && era === 1999 && flags.includes("psi:saved")) share = 4.5;
      return { ...m, share };
    })
    .filter((m) => m.share > 0);
}

/** Lists visible in the published campaign polls of 1992–94. */
export function minorsInCampaign(): Minor[] {
  return MINORS.filter((m) => !m.skipPoll && ((m.s1992 ?? 0) > 0 || (m.s1994 ?? 0) > 0));
}

/** A campaign list's polled share in a given month, sliding from 1992 to 1994. */
export function campaignShare(m: Minor, month: number): number {
  if (m.from !== undefined && month < m.from) return 0;
  const a = m.s1992 ?? 0;
  const b = m.s1994 ?? 0;
  if (a === 0) return b;
  if (b === 0) return Math.max(0.2, a * Math.exp(-(month - 5) / 14));
  const t = Math.max(0, Math.min(1, (month - 5) / 21));
  return a + (b - a) * t;
}

const LEFT_PARTIES: PartyId[] = ["pds", "prc"];
const CENTRE_PARTIES: PartyId[] = ["ppi"];

/** Where a playable party sits, for the purposes of minor-list arithmetic. */
export function blocOfParty(id: PartyId, flags: string[] = []): MinorBloc {
  if (LEFT_PARTIES.includes(id)) return "left";
  if (CENTRE_PARTIES.includes(id)) return "centrist";
  if (id === "lega" && flags.includes("lega:centre")) return "centrist";
  return "conservative";
}

/** 2 = natural home, 1 = reachable across the centre, 0 = never. */
export function affinity(a: MinorBloc, b: MinorBloc): number {
  if (a === b) return 2;
  if (a === "centrist" || b === "centrist") return 1;
  return 0;
}
