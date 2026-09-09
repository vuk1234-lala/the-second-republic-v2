import type { PartyId } from "./data";

/**
 * Forza Italia's headquarters at Milano 2: the media empire, the old regime's
 * survivors, the liberal/conservative balance of the programme, and the secret
 * internal polling on "an alternative" before the announcement.
 */
export interface HqState {
  /** wealth and reach of the media empire, 0..100 */
  mediaset: number;
  /** closeness to the notables of the old republic, 0..100 */
  dinosaurs: number;
  /** -100 fully liberal … +100 fully conservative */
  axis: number;
  /** secret support for an alternative list, in points of the vote */
  alt: number;
}

export interface HqDelta {
  mediaset?: number;
  dinosaurs?: number;
  axis?: number;
  alt?: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export function createHq(): HqState {
  return { mediaset: 26, dinosaurs: 50, axis: 0, alt: 0.3 };
}

/** x1.0 at an empty treasury, x3.0 with an untouchable empire. */
export function mediasetMultiplier(hq: HqState): number {
  return 1 + (hq.mediaset / 100) * 2;
}

/** Full liberalism costs up to 30% of your reach; populism adds up to 10%. */
export function axisMultiplier(hq: HqState): number {
  return hq.axis < 0 ? 1 - (-hq.axis / 100) * 0.3 : 1 + (hq.axis / 100) * 0.1;
}

/** Too many old friends and the "fresh face" stops being fresh. */
export function freshnessMultiplier(hq: HqState): number {
  return 1 - (Math.max(0, hq.dinosaurs - 55) / 100) * 0.8;
}

export function campaignMultiplier(hq: HqState): number {
  return Math.max(
    0.4,
    mediasetMultiplier(hq) * axisMultiplier(hq) * freshnessMultiplier(hq),
  );
}

/** Relations drift a little every turn with the programme's centre of gravity. */
export function axisRelationDrift(hq: HqState): Partial<Record<PartyId, number>> {
  const c = hq.axis / 100;
  if (c > 0) return { an: c * 3, lega: c * 1.5, ppi: -c * 1, pds: -c * 1 };
  return { ppi: -c * 2.5, pds: -c * 1, an: c * 2, lega: c * 1 };
}

/** One month at headquarters: explicit decisions first, then the machine's own logic. */
export function stepHq(hq: HqState, delta: HqDelta | undefined, popGain: number): HqState {
  const d = delta ?? {};
  let mediaset = hq.mediaset + (d.mediaset ?? 0);
  let dinosaurs = hq.dinosaurs + (d.dinosaurs ?? 0);
  const axis = clamp(hq.axis + (d.axis ?? 0), -100, 100);

  // favours curried with the notables turn into concessions, licences, contracts
  mediaset += (dinosaurs - 50) * 0.03;
  // liberal donors keep writing cheques; populism frightens them off
  mediaset += axis < 0 ? -axis * 0.01 : -axis * 0.022;
  // the old world is being arrested a deputy a week
  dinosaurs -= 0.6;

  const next: HqState = {
    mediaset: clamp(mediaset, 0, 100),
    dinosaurs: clamp(dinosaurs, 0, 100),
    axis,
    alt: hq.alt,
  };

  const growth = (0.24 + Math.max(0, popGain) * 0.3) * campaignMultiplier(next);
  next.alt = round1(clamp(hq.alt + (d.alt ?? 0) + growth, 0, 34));
  return next;
}

/** The share Forza Italia enters the published polls with, 18–22 per cent. */
export function entryShare(hq: HqState): number {
  return clamp(18 + (hq.alt - 14) * 0.35, 18, 22);
}

export function mediasetLabel(v: number): string {
  if (v < 15) return "Overdrawn";
  if (v < 30) return "Leveraged";
  if (v < 45) return "Solid";
  if (v < 60) return "Wealthy";
  if (v < 78) return "Formidable";
  return "Untouchable";
}

export function dinosaurLabel(v: number): string {
  if (v < 18) return "Estranged";
  if (v < 34) return "Distant";
  if (v < 52) return "Cordial";
  if (v < 68) return "Warm";
  if (v < 84) return "Entangled";
  return "In their pocket";
}

export function axisLabel(v: number): string {
  if (v <= -70) return "Doctrinaire liberal";
  if (v <= -30) return "Liberal";
  if (v < -8) return "Liberal-leaning";
  if (v <= 8) return "Balanced";
  if (v < 30) return "Conservative-leaning";
  if (v < 70) return "Conservative";
  return "Frankly populist";
}

/** Cheap deterministic noise in [-1, 1]. */
function noise(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) / 4294967295) * 2 - 1;
}

export interface InternalPoll {
  /** the figure the sample came back with */
  value: number;
  /** how wide the pollster admits the error is */
  margin: number;
  tight: boolean;
  house: string;
}

const HOUSES = ["Diakron", "Publitalia research", "Doxa (private)", "Diakron", "Makno (private)"];

/**
 * Internal surveys for a party that does not exist yet: sometimes uncannily
 * precise, more often a sample of six hundred people in a hurry.
 */
export function internalPoll(hq: HqState, turn: number): InternalPoll {
  const n = noise(`alt-${turn}`);
  const tight = noise(`house-${turn}`) > 0.45;
  const margin = tight ? 1.2 : 4 + Math.abs(noise(`w-${turn}`)) * 4;
  const value = Math.max(0.1, hq.alt + n * margin * 0.7);
  return {
    value: round1(value),
    margin: round1(margin),
    tight,
    house: HOUSES[turn % HOUSES.length]!,
  };
}
