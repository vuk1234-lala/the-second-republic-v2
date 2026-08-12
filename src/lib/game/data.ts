export type PartyId =
  | "fi"
  | "pds"
  | "lega"
  | "an"
  | "ppi"
  | "prc";

export interface Party {
  id: PartyId;
  name: string;
  short: string;
  leader: string;
  founded: string;
  color: string;
  base: number; // starting vote share %
  blurb: string;
  strengths: string;
  weakness: string;
  difficulty: 1 | 2 | 3;
  /** starting relations with the other parties, -100..100 */
  relations: Partial<Record<PartyId, number>>;
  start: { popularity: number; economy: number; order: number; integrity: number; treasury: number };
}

export const PARTIES: Party[] = [
  {
    id: "fi",
    name: "Forza Italia",
    short: "FI",
    leader: "Silvio Berlusconi",
    founded: "Founded January 1994",
    color: "var(--party-fi)",
    base: 21,
    blurb:
      "A television empire turned political movement. Promise a million jobs, a new Italian miracle, and a wall against the ex-communists.",
    strengths: "Media reach, money, fresh face",
    weakness: "Conflict of interest, magistrates",
    difficulty: 1,
    relations: { lega: 25, an: 25, ppi: -10, pds: -60, prc: -80 },
    start: { popularity: 48, economy: 44, order: 50, integrity: 40, treasury: 70 },
  },
  {
    id: "pds",
    name: "Partito Democratico della Sinistra",
    short: "PDS",
    leader: "Achille Occhetto",
    founded: "Heir of the PCI, 1991",
    color: "var(--party-pds)",
    base: 20,
    blurb:
      "The oak tree replaced the hammer and sickle. Clean hands, European credentials, and the burden of a past you must keep explaining.",
    strengths: "Organisation, clean record, unions",
    weakness: "The C-word still frightens the middle",
    difficulty: 2,
    relations: { prc: 40, ppi: 15, lega: -30, an: -70, fi: -60 },
    start: { popularity: 45, economy: 42, order: 52, integrity: 68, treasury: 45 },
  },
  {
    id: "lega",
    name: "Lega Nord",
    short: "LN",
    leader: "Umberto Bossi",
    founded: "Federalist revolt, 1991",
    color: "var(--party-lega)",
    base: 9,
    blurb:
      "Rome is a thief. Federalism, small business, and a northern parliament — govern without being swallowed by your allies.",
    strengths: "Militant base, north-east dominance",
    weakness: "No presence south of Bologna",
    difficulty: 3,
    relations: { fi: 25, an: -25, ppi: 0, pds: -30, prc: -35 },
    start: { popularity: 42, economy: 46, order: 46, integrity: 60, treasury: 35 },
  },
  {
    id: "an",
    name: "Alleanza Nazionale",
    short: "AN",
    leader: "Gianfranco Fini",
    founded: "MSI in transition, 1994",
    color: "var(--party-an)",
    base: 13,
    blurb:
      "Lead the post-fascist right out of the ghetto. Respectability in Rome and the south — without losing the faithful.",
    strengths: "Loyal militants, strong in the south",
    weakness: "The past, and everyone's memory of it",
    difficulty: 2,
    relations: { fi: 25, lega: -25, ppi: -20, pds: -70, prc: -85 },
    start: { popularity: 40, economy: 40, order: 62, integrity: 52, treasury: 30 },
  },
  {
    id: "ppi",
    name: "Partito Popolare Italiano",
    short: "PPI",
    leader: "Mino Martinazzoli",
    founded: "Successor of the DC, 1994",
    color: "var(--party-ppi)",
    base: 11,
    blurb:
      "Fifty years of power reduced to ashes by Tangentopoli. Save the Catholic centre from being crushed between two blocs.",
    strengths: "Parishes, institutions, moderates",
    weakness: "Tainted by the old regime",
    difficulty: 3,
    relations: { pds: 15, fi: -10, an: -20, lega: 0, prc: -25 },
    start: { popularity: 34, economy: 44, order: 55, integrity: 30, treasury: 40 },
  },
  {
    id: "prc",
    name: "Rifondazione Comunista",
    short: "PRC",
    leader: "Fausto Bertinotti",
    founded: "The refusal, 1991",
    color: "var(--party-prc)",
    base: 6,
    blurb:
      "No austerity, no concertation, no compromise. Grow from a protest into a force the left cannot govern without.",
    strengths: "Street mobilisation, ideological clarity",
    weakness: "Tiny, and allergic to power",
    difficulty: 3,
    relations: { pds: 40, ppi: -25, lega: -35, fi: -80, an: -85 },
    start: { popularity: 30, economy: 38, order: 44, integrity: 74, treasury: 20 },
  },
];

export const PARTY_MAP: Record<PartyId, Party> = Object.fromEntries(
  PARTIES.map((p) => [p.id, p]),
) as Record<PartyId, Party>;

export interface Effect {
  popularity?: number;
  economy?: number;
  order?: number;
  integrity?: number;
  treasury?: number;
  relations?: Partial<Record<PartyId, number>>;
}

export interface Choice {
  label: string;
  detail: string;
  effect: Effect;
  /** parties for whom this choice reads differently */
  only?: PartyId[];
}

export interface GameEvent {
  id: string;
  date: string;
  headline: string
  body: string;
  choices: Choice[];
}

export const EVENTS: GameEvent[] = [
  {
    id: "tangentopoli",
    date: "March 1993",
    headline: "Mani Pulite reaches your headquarters",
    body: "Milan magistrates request authorisation to search your party's accounts. The evening news is already parked outside the door.",
    choices: [
      {
        label: "Open every ledger",
        detail: "Full cooperation, cameras invited inside.",
        effect: { integrity: 12, popularity: 4, order: -3, relations: { ppi: -10, fi: -8 } },
      },
      {
        label: "Invoke parliamentary immunity",
        detail: "Let the Chamber decide. Buy time.",
        effect: { integrity: -14, popularity: -8, order: 4, relations: { ppi: 12, fi: 6 } },
      },
      {
        label: "Attack the judges publicly",
        detail: "Call it a coup by prosecutors.",
        effect: { integrity: -8, popularity: 3, order: -6, relations: { an: 10, pds: -12 } },
      },
    ],
  },
  {
    id: "lira",
    date: "May 1993",
    headline: "The lira is bleeding again",
    body: "Out of the ERM and falling. The Bank of Italy wants a signal from politics before it burns more reserves.",
    choices: [
      {
        label: "Back a harsh budget",
        detail: "Pension freeze, 40,000 billion lire in cuts.",
        effect: { economy: 12, treasury: 10, popularity: -11, relations: { prc: -15, pds: -6 } },
      },
      {
        label: "Devalue and export",
        detail: "Let the lira slide, cheer the industrial districts.",
        effect: { economy: 6, treasury: -4, popularity: 5, relations: { lega: 10 } },
      },
      {
        label: "Refuse austerity outright",
        detail: "Defend wages first, markets second.",
        effect: { economy: -9, treasury: -8, popularity: 8, relations: { prc: 18, fi: -10 } },
      },
    ],
  },
  {
    id: "referendum",
    date: "April 1993",
    headline: "Referendum on the electoral law",
    body: "Segni's campaign to bury proportional representation is polling at over eighty per cent. Where do you stand?",
    choices: [
      {
        label: "Campaign for Yes",
        detail: "Majoritarian voting, two blocs, clarity.",
        effect: { popularity: 9, order: 4, relations: { ppi: -8, prc: -12, fi: 8 } },
      },
      {
        label: "Defend proportional",
        detail: "Small parties deserve a voice.",
        effect: { popularity: -7, relations: { ppi: 12, prc: 12, lega: -8 } },
      },
      {
        label: "Stay deliberately vague",
        detail: "Free vote, no party line.",
        effect: { popularity: -2, integrity: -4, order: 2 },
      },
    ],
  },
  {
    id: "bombs",
    date: "July 1993",
    headline: "Bombs in Milan, Florence and Rome",
    body: "Mafia explosives hit museums and churches. The state looks fragile and the country wants an answer tonight.",
    choices: [
      {
        label: "Emergency anti-mafia powers",
        detail: "Army in Sicily, hard prison regime extended.",
        effect: { order: 14, popularity: 7, integrity: -4, treasury: -6 },
      },
      {
        label: "Fund magistrates and police",
        detail: "Money and men, no emergency decrees.",
        effect: { order: 8, integrity: 8, treasury: -10, popularity: 4 },
      },
      {
        label: "Blame the political vacuum",
        detail: "Demand immediate elections.",
        effect: { order: -8, popularity: 5, relations: { lega: 8, ppi: -12 } },
      },
    ],
  },
  {
    id: "north",
    date: "September 1993",
    headline: "Northern mayors demand fiscal autonomy",
    body: "Milan and Venice want to keep a share of local taxes. The south warns it would be abandoned.",
    choices: [
      {
        label: "Grant federal reform",
        detail: "Taxes stay closer to where they are paid.",
        effect: { economy: 8, popularity: 2, relations: { lega: 20, an: -14, ppi: -8 } },
      },
      {
        label: "Defend national solidarity",
        detail: "One Italy, one treasury.",
        effect: { popularity: 3, order: 6, relations: { an: 14, ppi: 10, lega: -20 } },
      },
      {
        label: "Commission a study",
        detail: "Promise everything to everyone, later.",
        effect: { popularity: -4, integrity: -5, order: 2 },
      },
    ],
  },
  {
    id: "privatisation",
    date: "November 1993",
    headline: "Selling the state",
    body: "IRI wants to unload banks, steel and telecoms. Brussels approves; the unions do not.",
    choices: [
      {
        label: "Sell fast and wide",
        detail: "Bring in foreign capital, cut the debt.",
        effect: { economy: 11, treasury: 14, popularity: -6, relations: { fi: 10, prc: -18 } },
      },
      {
        label: "Sell slowly, keep golden shares",
        detail: "State keeps a hand on strategic firms.",
        effect: { economy: 4, treasury: 5, order: 3, relations: { ppi: 10 } },
      },
      {
        label: "Block the sales",
        detail: "Public industry is not for auction.",
        effect: { economy: -8, treasury: -6, popularity: 6, relations: { prc: 18, fi: -12 } },
      },
    ],
  },
  {
    id: "tv",
    date: "December 1993",
    headline: "Who controls television?",
    body: "A law on media ownership is on the table. Three private networks, one owner, and an electorate that watches five hours a day.",
    choices: [
      {
        label: "Break up media concentration",
        detail: "Ownership caps, real antitrust teeth.",
        effect: { integrity: 12, popularity: 4, relations: { fi: -25, pds: 12, prc: 10 } },
      },
      {
        label: "Leave the market alone",
        detail: "Viewers decide, not the state.",
        effect: { integrity: -8, popularity: 3, relations: { fi: 22, pds: -14 } },
      },
      {
        label: "Reform public RAI instead",
        detail: "Depoliticise the board, ignore the private side.",
        effect: { integrity: 5, order: 4, popularity: 1, relations: { ppi: 8 } },
      },
    ],
  },
  {
    id: "coalition",
    date: "January 1994",
    headline: "Parliament dissolved — the alliances open",
    body: "Elections are called for 27 March under the new majoritarian law. Single-member seats reward whoever can stand together.",
    choices: [
      {
        label: "Build the widest coalition possible",
        detail: "Swallow your pride, sign with the awkward ones.",
        effect: { popularity: 6, integrity: -6, relations: { fi: 12, lega: 12, an: 12, ppi: 12, pds: 12, prc: 12 } },
      },
      {
        label: "Ally only with the ideologically close",
        detail: "A clean, coherent ticket.",
        effect: { integrity: 8, popularity: 2 },
      },
      {
        label: "Run alone",
        detail: "Nobody dilutes the message.",
        effect: { integrity: 10, popularity: -10, relations: { fi: -15, lega: -15, an: -15, ppi: -15, pds: -15, prc: -15 } },
      },
    ],
  },
  {
    id: "jobs",
    date: "February 1994",
    headline: "Unemployment passes eleven per cent",
    body: "Factory closures in Turin, youth joblessness at thirty per cent in the south. Your economic pledge will be quoted for years.",
    choices: [
      {
        label: "Promise a million jobs",
        detail: "Tax cuts, deregulation, sheer confidence.",
        effect: { popularity: 12, economy: 3, integrity: -7, treasury: -8 },
      },
      {
        label: "Public works and training",
        detail: "Slow, costly, credible.",
        effect: { economy: 7, treasury: -12, popularity: 4, relations: { pds: 10, prc: 8 } },
      },
      {
        label: "Tell the truth: it will take years",
        detail: "No miracles on offer.",
        effect: { integrity: 14, popularity: -8, economy: 4 },
      },
    ],
  },
  {
    id: "scandal",
    date: "February 1994",
    headline: "A financier in your circle is arrested",
    body: "He funded your campaign and has a lot to say to prosecutors. Journalists are outside your house by dawn.",
    choices: [
      {
        label: "Expel him and publish the accounts",
        detail: "Cut the limb to save the body.",
        effect: { integrity: 14, popularity: -3, treasury: -8 },
      },
      {
        label: "Say nothing and wait",
        detail: "Trust the news cycle to move on.",
        effect: { integrity: -10, popularity: -6, order: 2 },
      },
      {
        label: "Claim political persecution",
        detail: "Turn the accused into a martyr.",
        effect: { integrity: -12, popularity: 6, order: -4, relations: { pds: -10, an: 8 } },
      },
    ],
  },
  {
    id: "maastricht",
    date: "March 1994",
    headline: "Brussels wants a debt plan",
    body: "Public debt is above 120 per cent of GDP. Maastricht membership is at stake and voters are told Europe is destiny.",
    choices: [
      {
        label: "Commit to the convergence criteria",
        detail: "Whatever it takes to be in the first group.",
        effect: { economy: 10, treasury: 12, popularity: -7, relations: { ppi: 12, pds: 8, prc: -16 } },
      },
      {
        label: "Ask for flexibility",
        detail: "Growth before deficits.",
        effect: { economy: 2, popularity: 5, treasury: -4, relations: { lega: 6, prc: 8 } },
      },
      {
        label: "Question the euro project",
        detail: "Sovereignty over the exchange rate.",
        effect: { economy: -8, popularity: 4, relations: { ppi: -14, pds: -10, lega: 10 } },
      },
    ],
  },
  {
    id: "final",
    date: "March 1994",
    headline: "The last televised debate",
    body: "Twelve million viewers. One closing message before the country votes.",
    choices: [
      {
        label: "Hope and prosperity",
        detail: "A new Italian miracle, told with a smile.",
        effect: { popularity: 10, integrity: -4 },
      },
      {
        label: "Legality and clean hands",
        detail: "Never again the First Republic.",
        effect: { popularity: 6, integrity: 10 },
      },
      {
        label: "Order and the nation",
        detail: "Security, borders, authority restored.",
        effect: { popularity: 7, order: 10, relations: { pds: -8, prc: -10 } },
      },
    ],
  },
];
