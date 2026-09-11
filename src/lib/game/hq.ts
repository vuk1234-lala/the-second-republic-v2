import type { PartyId } from "./data";
import { FLAGS } from "./identity";

/**
 * A party headquarters: the media it can reach, the notables of the old
 * republic it depends on, the ideological balance of its programme, and the
 * secret internal polling nobody publishes.
 *
 * Forza Italia has Milano 2, the DC has Piazza del Gesù, the MSI has via
 * della Scrofa — the machinery is the same, the flavour is not.
 */
export interface HqState {
  /** wealth and reach of the party's media, 0..100 */
  mediaset: number;
  /** closeness to the notables of the old republic, 0..100 */
  dinosaurs: number;
  /** -100 fully liberal … +100 fully conservative */
  axis: number;
  /** secret internal support, in points of the vote */
  alt: number;
}

export interface HqDelta {
  mediaset?: number;
  dinosaurs?: number;
  axis?: number;
  alt?: number;
}

export type HqParty = "fi" | "ppi" | "an";

const HQ_PARTIES: PartyId[] = ["fi", "ppi", "an"];

export function hasHq(party: PartyId): party is HqParty {
  return HQ_PARTIES.includes(party);
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ profiles */

export interface HqProfile {
  /** the room the player is standing in */
  title: string;
  blurb: string;
  media: { label: string; note: string; labels: string[] };
  dino: { label: string; note: string; labels: string[] };
  axis: { label: string; note: string; labels: string[] };
  internal: { title: string; note: string; houses: string[] };
}

const MEDIA_FI = ["Overdrawn", "Leveraged", "Solid", "Wealthy", "Formidable", "Untouchable"];
const MEDIA_PRESS = ["Silent", "Thin", "Steady", "Loud", "Commanding", "Everywhere"];

const DINO_FI = ["Estranged", "Distant", "Cordial", "Warm", "Entangled", "In their pocket"];
const DINO_DC = ["Abandoned", "Restless", "Cordial", "Loyal", "Owned by them", "Their hostage"];
const DINO_AN = ["Purged", "Cool", "Cordial", "Respectful", "Reverent", "Prisoners of nostalgia"];

const AXIS_FI = [
  "Doctrinaire liberal", "Liberal", "Liberal-leaning", "Balanced",
  "Conservative-leaning", "Conservative", "Frankly populist",
];
const AXIS_DC = [
  "Left Catholic", "Social Catholic", "Centre-left", "The old centre",
  "Centre-right", "Conservative Catholic", "Clerical right",
];
const AXIS_AN = [
  "Frankly liberal", "Liberal-national", "Moderate", "National right",
  "Hard right", "Movement nostalgia", "Unreconstructed",
];

function fiProfile(): HqProfile {
  return {
    title: "Milano 2 · Headquarters",
    blurb:
      "Nothing here is published. It is the state of the machine that will fight the campaign once — and if — you decide to enter the field.",
    media: {
      label: "Mediaset wealth",
      note: "The reach and the cash of the empire. It multiplies everything a campaign choice can win you, from x1.00 to x3.00.",
      labels: MEDIA_FI,
    },
    dino: {
      label: "Relations with the dinosaurs",
      note: "The notables of the old republic open doors and licences — but past “Warm” the fresh face starts to look like an old one.",
      labels: DINO_FI,
    },
    axis: {
      label: "Liberalism ↔ Conservatism",
      note: "Liberalism warms the moderates and the old guard and keeps the donors writing cheques, but costs up to 30% of your campaigning bite. Conservatism eats into the MSI and the Lega and adds 10% of populist lift, and frightens the money away.",
      labels: AXIS_FI,
    },
    internal: {
      title: "Support for “an alternative”",
      note: "the secret figure for a party that does not exist yet",
      houses: ["Diakron", "Publitalia research", "Doxa (private)", "Diakron", "Makno (private)"],
    },
  };
}

function dcProfile(kind: "dc" | "ppi" | "segni"): HqProfile {
  const media = {
    dc: {
      label: "Il Popolo and the parish press",
      note: "The party paper, the diocesan weeklies and a friendly hand at RAI. It multiplies everything a campaign choice can win you, from x1.00 to x3.00.",
    },
    ppi: {
      label: "The Catholic press",
      note: "Avvenire, the diocesan weeklies, the goodwill of the bishops. Thinner than the shield's old machine, and cleaner. x1.00 to x3.00 on everything you win.",
    },
    segni: {
      label: "The referendum press",
      note: "Friendly columnists, the reformist papers, the television studios that love a crusade. x1.00 to x3.00 on everything you win.",
    },
  }[kind];

  const dino = {
    dc: {
      label: "Relations with the notables",
      note: "Andreotti, Forlani, the men with the preference votes. They deliver the south and the machine — and every warrant served on them is served on you.",
    },
    ppi: {
      label: "Relations with the old current bosses",
      note: "The men of the currents still hold the local federations. Useful, and the reason nobody believes the party has changed.",
    },
    segni: {
      label: "Relations with the notables you left",
      note: "You walked out on them. Every favour you take back costs you the only thing the Patto sells: the clean break.",
    },
  }[kind];

  const axisNote = {
    dc: "Leftwards keeps the unions and the social wing on board and reassures the PDS, but costs up to 30% of your campaigning bite. Rightwards holds the frightened middle class and takes votes back from the MSI and the Lega, worth 10% of lift, and splits the party.",
    ppi: "The Popolari live on the centre-left: it warms the Progressives and the social wing but is a quiet, dull campaign. Rightwards fights the Pole for the same voters and adds populist lift, at the price of the party's soul.",
    segni: "Leftwards makes the Patto a hinge the Progressives can use; rightwards makes it a junior partner of the Pole. The first is duller, the second sells you.",
  }[kind];

  const internal = {
    dc: {
      title: "Support for “the shield” in private",
      note: "the figure Piazza del Gesù does not send to the newspapers",
      houses: ["Doxa (private)", "Istituto Cattaneo", "SWG (private)", "Doxa (private)", "Diakron"],
    },
    ppi: {
      title: "Support for “a new Catholic party”",
      note: "the figure the congress will not hear",
      houses: ["Doxa (private)", "Istituto Cattaneo", "CENSIS", "SWG (private)", "Doxa (private)"],
    },
    segni: {
      title: "Support for “a reformist pact”",
      note: "the figure the referendum committee keeps to itself",
      houses: ["Makno (private)", "Doxa (private)", "SWG (private)", "Diakron", "Makno (private)"],
    },
  }[kind];

  return {
    title:
      kind === "segni" ? "The Pact · Headquarters" : "Piazza del Gesù · Headquarters",
    blurb:
      kind === "dc"
        ? "Forty-seven years of government are stacked in these rooms, along with the files. None of it is published; all of it decides the campaign."
        : kind === "ppi"
          ? "A new name on an old door. What is behind it is still the machine, and the machine is what fights the campaign."
          : "Three rooms, a fax and a mailing list of referendum committees. It is not much, and none of it is published.",
    media: { ...media, labels: MEDIA_PRESS },
    dino: { ...dino, labels: DINO_DC },
    axis: { label: "Left Catholic ↔ Conservative", note: axisNote, labels: AXIS_DC },
    internal,
  };
}

function anProfile(renamed: boolean): HqProfile {
  return {
    title: renamed ? "Via della Scrofa · Headquarters" : "Via della Scrofa · MSI",
    blurb: renamed
      ? "The name on the door has changed. Whether the country believes it is decided in these rooms, and none of it is published."
      : "Fifty years in opposition have left a party of militants, a printing press and a great many memories. None of it is published.",
    media: {
      label: renamed ? "Il Secolo and the friendly studios" : "Il Secolo d'Italia and the sections",
      note: renamed
        ? "A party paper with advertisers at last, and studios that will now take your calls. x1.00 to x3.00 on everything a choice can win you."
        : "A paper nobody quotes and a thousand sections that shout. It still multiplies everything a choice wins you, from x1.00 to x3.00.",
      labels: MEDIA_PRESS,
    },
    dino: {
      label: renamed ? "Relations with the old comrades" : "Relations with the old guard",
      note: renamed
        ? "The men of Salò and the flame keep the sections working — and keep every studio asking about 1943 instead of 1994."
        : "Almirante's men hold the sections and the discipline. Lean on them and the party runs; lean too far and the respectable vote stays home.",
      labels: DINO_AN,
    },
    axis: {
      label: "Liberal-national ↔ Movement right",
      note: "Moving towards the liberals opens the Pole, the moderates and the donors, and costs up to 30% of your campaigning bite. Staying with the movement holds the militants and adds 10% of hard-right lift, and keeps you a pariah.",
      labels: AXIS_AN,
    },
    internal: {
      title: renamed ? "Support for “a party of government”" : "Support for “a national right”",
      note: "the figure via della Scrofa keeps in the drawer",
      houses: ["Doxa (private)", "Section canvass", "SWG (private)", "Doxa (private)", "Makno (private)"],
    },
  };
}

export function hqProfile(party: PartyId, flags: string[] = []): HqProfile {
  if (party === "ppi") {
    if (flags.includes(FLAGS.becomePpi)) return dcProfile("ppi");
    if (flags.includes(FLAGS.pattoSegni)) return dcProfile("segni");
    return dcProfile("dc");
  }
  if (party === "an") return anProfile(flags.includes(FLAGS.fiuggi));
  return fiProfile();
}

/* -------------------------------------------------------------------- state */

const STARTS: Record<HqParty, HqState> = {
  // a leveraged empire, cordial with everyone, nothing to poll yet
  fi: { mediaset: 26, dinosaurs: 50, axis: 0, alt: 0.3 },
  // forty-seven years of press and notables, and a party already bleeding
  ppi: { mediaset: 62, dinosaurs: 74, axis: -4, alt: 12 },
  // a printing press, a very loyal old guard, and the pariah's polling
  an: { mediaset: 22, dinosaurs: 78, axis: 46, alt: 4 },
};

export function createHq(party: PartyId = "fi"): HqState {
  return { ...(hasHq(party) ? STARTS[party] : STARTS.fi) };
}

/** x1.0 with nothing to speak through, x3.0 with an untouchable machine. */
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

function band(v: number, labels: string[]): string {
  const cuts = labels.length;
  const i = Math.min(cuts - 1, Math.max(0, Math.floor((v / 100) * cuts)));
  return labels[i]!;
}

export function mediasetLabel(v: number, labels: string[] = MEDIA_FI): string {
  return band(v, labels);
}

export function dinosaurLabel(v: number, labels: string[] = DINO_FI): string {
  return band(v, labels);
}

export function axisLabel(v: number, labels: string[] = AXIS_FI): string {
  return band(((v + 100) / 200) * 100, labels.length === 7 ? labels : AXIS_FI);
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

/**
 * Internal surveys: sometimes uncannily precise, more often a sample of six
 * hundred people in a hurry.
 */
export function internalPoll(hq: HqState, turn: number, houses?: string[]): InternalPoll {
  const list = houses && houses.length ? houses : hqProfile("fi").internal.houses;
  const n = noise(`alt-${turn}`);
  const tight = noise(`house-${turn}`) > 0.45;
  const margin = tight ? 1.2 : 4 + Math.abs(noise(`w-${turn}`)) * 4;
  const value = Math.max(0.1, hq.alt + n * margin * 0.7);
  return {
    value: round1(value),
    margin: round1(margin),
    tight,
    house: list[turn % list.length]!,
  };
}
