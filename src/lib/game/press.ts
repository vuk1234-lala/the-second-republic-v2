import type { CountryStats } from "./country";
import type { GovChoice, GovEvent } from "./govevents";
import { MINISTRIES } from "./government";

export type Slant = "left" | "centre" | "right";
export type Tone = "praise" | "neutral" | "attack";

export interface Paper {
  id: string;
  name: string;
  motto: string;
  slant: Slant;
  tint: string;
  /** masthead treatment */
  face: "gothic" | "roman" | "block";
}

/** The three front pages of the Second Republic's first months. */
export const PAPERS: Paper[] = [
  {
    id: "unita",
    name: "l'Unità",
    motto: "Giornale fondato da Antonio Gramsci",
    slant: "left",
    tint: "var(--party-pds)",
    face: "block",
  },
  {
    id: "corriere",
    name: "Corriere della Sera",
    motto: "Fondato nel 1876 · Milano",
    slant: "centre",
    tint: "var(--ink)",
    face: "gothic",
  },
  {
    id: "giornale",
    name: "il Giornale",
    motto: "Quotidiano d'opinione · Milano",
    slant: "right",
    tint: "var(--party-fi)",
    face: "roman",
  },
];

export interface Front {
  paper: string;
  name: string;
  motto: string;
  slant: Slant;
  tint: string;
  face: Paper["face"];
  kicker: string;
  headline: string;
  standfirst: string;
  byline: string;
  tone: Tone;
}

// ── Subject of the piece ─────────────────────────────────────────────────
interface Topic {
  id: string;
  subject: string;
  words: string[];
  /** touches the magistrates' war on mafia, bribery or tax evasion */
  integrity?: boolean;
}

const TOPICS: Topic[] = [
  { id: "privatisation", subject: "the sale of the state's companies", words: ["privatis", "iri", "eni", "sell", "shares", "stake", "float", "concession"] },
  { id: "mafia", subject: "the war on the mafia", words: ["mafia", "cosa nostra", "camorra", "'ndrangheta", "maxi-trial", "pentiti", "witness"], integrity: true },
  { id: "corruption", subject: "the bribery inquiries", words: ["tangent", "corrupt", "bribe", "kickback", "mani pulite", "prosecut", "magistrat", "immunity", "judge"], integrity: true },
  { id: "evasion", subject: "the pursuit of tax evasion", words: ["evasion", "evader", "audit", "guardia di finanza", "receipts", "amnesty", "condono"], integrity: true },
  { id: "tax", subject: "the tax bill", words: ["tax", "vat", "levy", "duty", "fiscal", "treasury", "revenue"] },
  { id: "health", subject: "the hospitals", words: ["hospital", "health", "usl", "doctor", "ward", "ticket", "medicine"] },
  { id: "welfare", subject: "pensions and welfare", words: ["pension", "welfare", "benefit", "unemploy", "family allowance", "invalid"] },
  { id: "school", subject: "the schools", words: ["school", "teacher", "universit", "student", "exam", "curricul"] },
  { id: "order", subject: "public order", words: ["police", "carabinier", "prison", "custody", "sentence", "crime", "patrol"] },
  { id: "immigration", subject: "the arrivals on the coasts", words: ["immigrat", "migrant", "albania", "landing", "port", "asylum", "refugee"] },
  { id: "works", subject: "the public works programme", words: ["motorway", "railway", "contract", "tender", "bridge", "concrete", "works", "infrastructur"] },
  { id: "defence", subject: "the armed forces", words: ["army", "defence", "conscript", "nato", "soldier", "mission", "arms"] },
  { id: "farm", subject: "the countryside", words: ["farm", "agricultur", "harvest", "quota", "milk", "vine", "olive", "rural"] },
  { id: "europe", subject: "the road to Maastricht", words: ["maastricht", "europe", "brussels", "lira", "convergence", "ecu", "exchange rate"] },
  { id: "labour", subject: "the labour question", words: ["union", "strike", "wage", "hiring", "contract of employment", "confindustria", "layoff", "redundan"] },
  { id: "media", subject: "the television question", words: ["television", "broadcast", "rai", "channel", "advertis", "media"] },
];

function topicOf(event: GovEvent, choice: GovChoice): Topic {
  const hay = `${event.headline} ${event.body} ${choice.label} ${choice.detail}`.toLowerCase();
  let best: { t: Topic; hits: number } | null = null;
  for (const t of TOPICS) {
    const hits = t.words.filter((w) => hay.includes(w)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { t, hits };
  }
  if (best) return best.t;
  const ministry = MINISTRIES.find((m) => m.key === event.ministry);
  return { id: "generic", subject: (ministry?.label ?? "the government's business").toLowerCase(), words: [] };
}

// ── Reading the decision ─────────────────────────────────────────────────
function aggregate(choice: GovChoice): Partial<Record<keyof CountryStats, number>> {
  const out: Partial<Record<keyof CountryStats, number>> = {};
  for (const pulse of choice.pulses) {
    for (const [k, v] of Object.entries(pulse.effect)) {
      const key = k as keyof CountryStats;
      out[key] = (out[key] ?? 0) + (v as number);
    }
  }
  return out;
}

const RETREAT = [
  "withdraw", "limit", "restrict", "shelve", "committee", "amnesty", "immunity",
  "drop", "delay", "postpone", "stays", "quietly", "block", "veto", "pardon",
  "half", "nothing", "study", "wait",
];

function hash(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(list: T[], seed: string): T {
  return list[hash(seed) % list.length]!;
}

// ── Headline stock ───────────────────────────────────────────────────────
const HEADS: Record<Slant, Record<Tone, ((s: string) => string)[]>> = {
  left: {
    praise: [
      (s) => `A victory won on ${s}`,
      (s) => `At last the government listens on ${s}`,
      (s) => `${cap(s)}: the country before the balance sheet`,
    ],
    neutral: [
      (s) => `${cap(s)}: the Council decides, the workers wait`,
      (s) => `On ${s}, promises still awaiting proof`,
      (s) => `${cap(s)}: words from Palazzo Chigi`,
    ],
    attack: [
      (s) => `${cap(s)}: a sell-out of strategic assets`,
      (s) => `The bill for ${s} lands on the kitchen table`,
      (s) => `${cap(s)}: sacrifices for the many, profits for the few`,
      (s) => `Palazzo Chigi abandons the country on ${s}`,
    ],
  },
  centre: {
    praise: [
      (s) => `${cap(s)}: the institutions hold`,
      (s) => `A measured step on ${s}`,
    ],
    neutral: [
      (s) => `${cap(s)}: what the government has decided`,
      (s) => `The Council fixes its line on ${s}`,
      (s) => `${cap(s)}: the measure, and the reactions`,
      (s) => `Palazzo Chigi legislates on ${s}`,
    ],
    attack: [
      (s) => `${cap(s)}: a foolish witch hunt`,
      (s) => `The hunt for scapegoats resumes over ${s}`,
      (s) => `${cap(s)}: justice, or a public spectacle?`,
      (s) => `Rome settles scores in the name of ${s}`,
    ],
  },
  right: {
    praise: [
      (s) => `Fiscal rigour at last on ${s}`,
      (s) => `${cap(s)}: the state steps back`,
      (s) => `A government that governs: ${s}`,
      (s) => `${cap(s)}: courage in the face of the usual vetoes`,
    ],
    neutral: [
      (s) => `${cap(s)}: Palazzo Chigi acts`,
      (s) => `${cap(s)}: neither triumph nor disaster`,
      (s) => `The government's line on ${s}`,
    ],
    attack: [
      (s) => `${cap(s)}: the old spending returns`,
      (s) => `${cap(s)}: the taxpayer pays again`,
      (s) => `Surrender on ${s}`,
      (s) => `${cap(s)}: assistance dressed as reform`,
    ],
  },
};

const COMMENT: Record<Slant, Record<Tone, string[]>> = {
  left: {
    praise: [
      "For once the confederations were heard before the accountants.",
      "A measure that will be felt in the wage packet, not only in the markets.",
    ],
    neutral: [
      "We shall judge it by what reaches the provinces, not by the communiqué.",
      "The intention is announced; the resources remain to be seen.",
    ],
    attack: [
      "What is called modernisation is paid for by those who have least.",
      "Assets built with public money are handed to whoever can pay for them.",
      "The account will be settled by pensioners, patients and the unemployed.",
    ],
  },
  centre: {
    praise: [
      "The procedure was respected, which in Rome is itself news.",
      "A decision taken in the proper forms and within the proper limits.",
    ],
    neutral: [
      "The text now goes to the chambers; opposition and majority reacted as expected.",
      "The measure is described here without adjectives; time will provide those.",
      "Officials expect the effects to be visible within the year.",
    ],
    attack: [
      "Institutions are not repaired by exemplary punishments and televised arrests.",
      "A republic cannot be governed by the permanent suspicion of its own class.",
      "There is a difference between legality and a season of denunciations.",
    ],
  },
  right: {
    praise: [
      "Someone in Rome has finally read a balance sheet.",
      "The productive country will notice this before the trade unions do.",
    ],
    neutral: [
      "Half a step, taken in the right direction, is still half a step.",
      "The announcement is welcome; the decree will have to be read closely.",
    ],
    attack: [
      "The bill goes, as always, to those who work and pay.",
      "Public money is again the answer to every question.",
      "Rome retreats before the first noisy demonstration.",
    ],
  },
};

const BYLINES: Record<Slant, string[]> = {
  left: ["Our political correspondent", "From our Rome office", "Editorial"],
  centre: ["Political desk, Rome", "Our correspondent at Palazzo Chigi", "Parliamentary service"],
  right: ["Comment", "Our economics correspondent", "From Milan"],
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toneFor(slant: Slant, choice: GovChoice, topic: Topic): Tone {
  const a = aggregate(choice);
  const g = a.growth ?? 0;
  const budget = a.budget ?? 0;
  const debt = a.debt ?? 0;
  const welfare = a.welfare ?? 0;
  const crime = a.crime ?? 0;
  const retreat = RETREAT.some((w) => choice.label.toLowerCase().includes(w));

  if (slant === "centre") {
    // The paper of the old republic only turns partisan when the magistrates,
    // the anti-mafia or the tax inspectors are the story.
    if (!topic.integrity) return "neutral";
    if (crime > 0.2 || retreat) return "neutral"; // the hunt is being called off: fine by us
    if (crime < -0.2) return "attack"; // a new season of inquiries: a witch hunt
    return "neutral";
  }
  const score =
    slant === "right"
      ? 8 * g + 1.0 * budget - 1.0 * debt - 0.6 * welfare - 0.5 * crime
      : 1.4 * welfare + 3 * g - 0.9 * budget - 0.5 * crime;
  if (score >= 2.2) return "praise";
  if (score <= -2.2) return "attack";
  return "neutral";
}

/** Three front pages written about one decision of the Council. */
export function pressFor(event: GovEvent, choice: GovChoice, date: string): Front[] {
  const topic = topicOf(event, choice);
  const ministry = MINISTRIES.find((m) => m.key === event.ministry);
  return PAPERS.map((paper) => {
    const tone = toneFor(paper.slant, choice, topic);
    const seed = `${paper.id}|${event.id}|${choice.label}|${tone}`;
    return {
      paper: paper.id,
      name: paper.name,
      motto: paper.motto,
      slant: paper.slant,
      tint: paper.tint,
      face: paper.face,
      kicker: `${ministry?.label ?? "Government"} · ${date}`,
      headline: pick(HEADS[paper.slant][tone], seed)(topic.subject),
      standfirst: `${choice.label}. ${pick(COMMENT[paper.slant][tone], seed + "c")}`,
      byline: pick(BYLINES[paper.slant], seed + "b"),
      tone,
    };
  });
}
