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
    founded: "A movement in gestation, 1992–94",
    color: "var(--party-fi)",
    base: 21,
    blurb:
      "A television empire turned political movement. Promise a million jobs, a new Italian miracle, and a wall against the ex-communists.",
    strengths: "Media reach, money, fresh face",
    weakness: "Conflict of interest, magistrates",
    difficulty: 1,
    relations: { lega: 25, an: 25, ppi: -10, pds: -60, prc: -80 },
    start: { popularity: 34, economy: 44, order: 50, integrity: 44, treasury: 74 },
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
    name: "Movimento Sociale Italiano",
    short: "MSI",
    leader: "Gianfranco Fini",
    founded: "The flame, waiting for Fiuggi",
    color: "var(--party-msi)",
    base: 13,
    blurb:
      "Lead the post-fascist right out of the ghetto. Respectability in Rome and the south — without losing the faithful.",
    strengths: "Loyal militants, strong in the south",
    weakness: "The past, and everyone's memory of it",
    difficulty: 2,
    relations: { fi: 25, lega: -25, ppi: -20, pds: -70, prc: -85 },
    start: { popularity: 38, economy: 40, order: 62, integrity: 52, treasury: 30 },
  },
  {
    id: "ppi",
    name: "Democrazia Cristiana",
    short: "DC",
    leader: "Mino Martinazzoli",
    founded: "The DC and its successor, 1992–94",
    color: "var(--party-ppi)",
    base: 11,
    blurb:
      "Fifty years of power reduced to ashes by Tangentopoli. Save the Catholic centre from being crushed between two blocs.",
    strengths: "Parishes, institutions, moderates",
    weakness: "Tainted by the old regime",
    difficulty: 3,
    relations: { pds: 15, fi: -10, an: -20, lega: 0, prc: -25 },
    start: { popularity: 40, economy: 44, order: 55, integrity: 30, treasury: 46 },
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
  /** a marker recorded on the game state (name changes, the announcement…) */
  flag?: string;
  /** what the papers, the party and the country make of it — shown after choosing */
  feedback: string;
}

export interface GameEvent {
  id: string;
  date: string;
  headline: string;
  body: string;
  /** if set, the event only appears for these parties */
  only?: PartyId[];
  choices: Choice[];
}

/**
 * The campaign runs from the summer of 1992 to the vote of 27 March 1994.
 * Shared events are interleaved with party-specific ones; each party plays
 * roughly two dozen turns, and single decisions move the needle only slightly.
 */
export const EVENTS: GameEvent[] = [
  {
    id: "amato",
    date: "June 1992",
    headline: "Amato takes office over a country in shock",
    body: "The election is behind you, Cossiga has gone, and a Socialist economist inherits a debt of two thousand trillion lire. Every party is asked for a position on the new government.",
    choices: [
      {
        label: "Offer conditional support",
        detail: "Vote confidence, keep a free hand on the detail.",
        effect: { order: 3, economy: 2, integrity: -2, relations: { ppi: 5, pds: 3 } },
        feedback:
          "The wire services file you under 'responsible'. Palazzo Chigi is relieved; your own militants grumble that responsibility is what got Italy here.",
      },
      {
        label: "Vote against",
        detail: "Let the old parties own their own emergency.",
        effect: { popularity: 3, order: -2, relations: { ppi: -6, pds: -3 } },
        feedback:
          "Opposition benches applaud. You are described in the morning papers as intransigent, which some voters read as a compliment.",
      },
      {
        label: "Abstain and say nothing",
        detail: "Neither hostage nor accomplice.",
        effect: { integrity: -2, popularity: -1, order: 1 },
        feedback:
          "Nobody attacks you, nobody notices you. The evening bulletins mention your name for four seconds.",
      },
    ],
  },
  {
    id: "capaci-aftermath",
    date: "June 1992",
    headline: "After Capaci, the country buries Falcone",
    body: "Palermo is covered in bedsheets hung from balconies. The crowd whistles at politicians entering the cathedral.",
    choices: [
      {
        label: "Attend, and take the whistles",
        detail: "Stand there and hear it.",
        effect: { integrity: 4, popularity: 2, order: 1 },
        feedback:
          "Cameras hold on your face for a long, unpleasant ten seconds. Commentators call it dignified; the footage is replayed for weeks.",
      },
      {
        label: "Stay away, send a statement",
        detail: "Do not turn a funeral into politics.",
        effect: { popularity: -2, order: 1, integrity: -1 },
        feedback:
          "A columnist notes your absence in a single cruel line. The party organisation, quietly, thinks you were right.",
      },
      {
        label: "Demand the army in Sicily now",
        detail: "Make the state visible tomorrow morning.",
        effect: { order: 5, popularity: 3, integrity: -2, relations: { prc: -6, pds: -3 } },
        feedback:
          "Southern prefects welcome it, jurists warn about militarising public order. Your switchboard is jammed with approving calls.",
      },
    ],
  },
  {
    id: "ppi-dc-collapse",
    date: "July 1992",
    headline: "The DC loses a deputy a week to the prosecutors",
    body: "Party headquarters in Piazza del Gesù works like a field hospital. The old current bosses still expect their share of everything.",
    only: ["ppi"],
    choices: [
      {
        label: "Suspend anyone under investigation",
        detail: "A rule, applied without exceptions.",
        effect: { integrity: 6, popularity: 2, treasury: -3, order: -2 },
        feedback:
          "Three regional barons threaten to take their votes elsewhere. The bishops' newspaper prints a cautiously warm editorial.",
      },
      {
        label: "Protect the accused for now",
        detail: "Presumption of innocence, and loyalty.",
        effect: { integrity: -5, popularity: -3, treasury: 4, order: 2 },
        feedback:
          "The machine holds together, which is not nothing. Every talk show now introduces you as the party of the investigated.",
      },
      {
        label: "Announce a refoundation of the party",
        detail: "A new name, a new symbol, the shield stays.",
        effect: { popularity: 3, integrity: 3, treasury: -4, order: -3 },
        feedback:
          "Younger sections are energised. The old guard mutters that you are burning fifty years of history for a press conference.",
      },
    ],
  },
  {
    id: "prc-birth-pains",
    date: "July 1992",
    headline: "Rifondazione argues with itself in public",
    body: "Cossutta's people want the party of the working class; the movementists want the party of the squares. Both have a congress motion ready.",
    only: ["prc"],
    choices: [
      {
        label: "Hold the party together",
        detail: "A compromise motion nobody loves.",
        effect: { order: 3, integrity: 1, popularity: -1 },
        feedback:
          "The split is postponed. Il Manifesto calls the text 'a masterpiece of ambiguity', and means it about half kindly.",
      },
      {
        label: "Side with the movements",
        detail: "The future is outside the factory gates.",
        effect: { popularity: 3, integrity: 3, order: -3, relations: { pds: -5 } },
        feedback:
          "Students and social centres take notice. Two federation secretaries resign the same evening.",
      },
      {
        label: "Side with the orthodox",
        detail: "Class, party, discipline.",
        effect: { order: 4, treasury: 2, popularity: -2, integrity: -1 },
        feedback:
          "The apparatus stiffens and the membership cards get paid on time. The papers write your obituary as a 1970s relic.",
      },
    ],
  },
  {
    id: "pds-past",
    date: "July 1992",
    headline: "'You were financed by Moscow', says a talk show host",
    body: "The archives are opening in Moscow. Every week a new document tour of the PCI's old accounts.",
    only: ["pds"],
    choices: [
      {
        label: "Open your own archives first",
        detail: "Publish before anyone can leak.",
        effect: { integrity: 6, popularity: 1, order: -2 },
        feedback:
          "Historians are delighted, the old comrades are furious. The story dies faster than anyone expected.",
      },
      {
        label: "Refuse to relitigate the Cold War",
        detail: "Talk about pensions instead.",
        effect: { popularity: -2, integrity: -2, order: 2 },
        feedback:
          "The host repeats the question four times. The clip circulates for a fortnight without you in control of it.",
      },
      {
        label: "Counter-attack on Tangentopoli",
        detail: "Ask who took the bribes last month, not the roubles in 1974.",
        effect: { popularity: 4, integrity: 1, relations: { ppi: -8, fi: -6 } },
        feedback:
          "A good line, widely quoted. The centre parties decide you are not a possible partner but an enemy.",
      },
    ],
  },
  {
    id: "an-msi-question",
    date: "July 1992",
    headline: "The MSI is asked, again, about the flame",
    body: "Half the party wants to keep the tricolour flame exactly as it is. The other half wants a suit, a tie, and a seat at the table.",
    only: ["an"],
    choices: [
      {
        label: "Begin the journey to respectability",
        detail: "Fewer salutes, more press conferences.",
        effect: { integrity: 4, popularity: 3, order: -2, relations: { fi: 8, ppi: 5 } },
        feedback:
          "A national daily runs a curious, almost polite profile of you. In Rome's periphery some sections cover the article with graffiti.",
      },
      {
        label: "Reassure the faithful",
        detail: "Nothing of our history is up for negotiation.",
        effect: { order: 4, treasury: 2, popularity: -3, relations: { ppi: -6, pds: -4 } },
        feedback:
          "The sections are jubilant, the collections rise. You are still not invited on the main evening programmes.",
      },
      {
        label: "Say both things at once",
        detail: "Continuity in values, novelty in method.",
        effect: { popularity: 1, integrity: -2, order: 1 },
        feedback:
          "Everyone hears what they want to hear. It buys six months, and no more than that.",
      },
    ],
  },
  {
    id: "lega-secession",
    date: "August 1992",
    headline: "The base wants secession, not federalism",
    body: "At Pontida the crowd shouts for a Republic of the North. Your industrialists in Brescia want tax reform and a bit of quiet.",
    only: ["lega"],
    choices: [
      {
        label: "Promise the Republic of the North",
        detail: "Give the square exactly what it came for.",
        effect: { popularity: 5, order: -4, economy: -2, relations: { an: -10, ppi: -6 } },
        feedback:
          "Delirious scenes on the field, alarm in the Rome press. Two northern industrial associations distance themselves the next day.",
      },
      {
        label: "Federalism, hard and constitutional",
        detail: "Three macro-regions, one currency, no barricades.",
        effect: { economy: 3, order: 2, integrity: 2, popularity: 1 },
        feedback:
          "Sober, and reported as such. A few thousand militants go home feeling short-changed.",
      },
      {
        label: "Attack Rome without a programme",
        detail: "Roma ladrona, and let the details wait.",
        effect: { popularity: 4, integrity: -3, economy: -1 },
        feedback:
          "The chant does the work. Interviewers keep asking what you would actually do, and the answers do not land.",
      },
    ],
  },
  {
    id: "fi-decision",
    date: "August 1992",
    headline: "Your managers present a survey nobody was supposed to see",
    body: "A moderate electorate of ten million is homeless. The question is whether a businessman should be the one to house it.",
    only: ["fi"],
    choices: [
      {
        label: "Quietly build the clubs",
        detail: "Publitalia's men, a network, no announcement yet.",
        effect: { treasury: 4, order: 3, popularity: 2, integrity: -2 },
        feedback:
          "Within weeks there are hundreds of clubs and no press coverage at all. Exactly as planned.",
      },
      {
        label: "Fund existing centre parties instead",
        detail: "Back others, stay behind the camera.",
        effect: { treasury: -4, popularity: -2, relations: { ppi: 10, an: 4 } },
        feedback:
          "Grateful politicians, no movement in the polls. Your own executives think you have wasted a historic opening.",
      },
      {
        label: "Hint publicly that you may 'take the field'",
        detail: "One sentence to a friendly interviewer.",
        effect: { popularity: 4, integrity: -3, relations: { pds: -10, prc: -8 } },
        feedback:
          "The sentence leads every bulletin. The left announces a conflict-of-interest law before you have even founded a party.",
      },
    ],
  },
  {
    id: "wage-deal",
    date: "September 1992",
    headline: "The end of the scala mobile",
    body: "Government, employers and unions abolish wage indexation. Sixty thousand people protest in Florence and throw coins at union leaders.",
    choices: [
      {
        label: "Back the agreement",
        detail: "Inflation first, everything else follows.",
        effect: { economy: 4, treasury: 2, popularity: -3, relations: { prc: -8, pds: -3 } },
        feedback:
          "Confindustria sends warm private messages. Outside a factory in Sesto San Giovanni you are booed on camera.",
      },
      {
        label: "Support it, demand compensation",
        detail: "Yes, but with tax relief for low wages.",
        effect: { economy: 2, popularity: 1, treasury: -2, relations: { ppi: 5 } },
        feedback:
          "The classic Italian middle position. Nobody is angry, nobody is grateful.",
      },
      {
        label: "Denounce it as a defeat for workers",
        detail: "Stand with the coins, not the platform.",
        effect: { popularity: 4, economy: -3, relations: { prc: 10, fi: -8 } },
        feedback:
          "Shop stewards adopt you as their own. Financial pages describe your economics as 'nostalgic'.",
      },
    ],
  },
  {
    id: "black-september",
    date: "September 1992",
    headline: "The lira leaves the exchange rate mechanism",
    body: "Fifty billion marks burned, devaluation of thirty per cent, an emergency budget of ninety trillion lire. Amato asks for national unity.",
    choices: [
      {
        label: "Support the emergency budget",
        detail: "New taxes on houses and health tickets.",
        effect: { economy: 5, treasury: 3, popularity: -5, integrity: 2 },
        feedback:
          "Markets calm slightly and Brussels nods. Your local sections report that the minimum tax on property is all anyone mentions.",
      },
      {
        label: "Accept cuts, refuse new taxes",
        detail: "Spending, not pockets.",
        effect: { economy: 2, treasury: -1, popularity: 2 },
        feedback:
          "Popular and arithmetically thin. The Bank of Italy's briefing to journalists is unimpressed.",
      },
      {
        label: "Blame the speculators",
        detail: "Soros and the Bundesbank did this.",
        effect: { popularity: 3, economy: -3, integrity: -2, relations: { lega: 4 } },
        feedback:
          "Excellent television. The next morning the spread widens again and nobody asks Soros about it.",
      },
    ],
  },
  {
    id: "craxi-avviso",
    date: "December 1992",
    headline: "An avviso di garanzia for Bettino Craxi",
    body: "The Socialist leader is formally under investigation. The whole system of party financing is now on trial in public.",
    choices: [
      {
        label: "Demand he resign everything",
        detail: "No immunity, no delay.",
        effect: { integrity: 5, popularity: 3, relations: { ppi: -6 } },
        feedback:
          "The Milan pool is pleased. Several parliamentary colleagues stop returning your calls.",
      },
      {
        label: "Call for due process and calm",
        detail: "Trials belong in courtrooms.",
        effect: { integrity: -3, order: 3, popularity: -3, relations: { ppi: 6 } },
        feedback:
          "Serious commentators agree with you and voters do not. The word 'caste' begins to appear in letters to the editor.",
      },
      {
        label: "Say nothing at all this week",
        detail: "It is not your funeral.",
        effect: { popularity: -1, integrity: -1, order: 1 },
        feedback:
          "You survive the week unmentioned. In a season like this, that is a small kind of victory.",
      },
    ],
  },
  {
    id: "ppi-scalfaro",
    date: "February 1993",
    headline: "The decree that would have ended Mani Pulite",
    body: "A government decree decriminalising illicit party financing lands on the President's desk. Scalfaro refuses to sign.",
    choices: [
      {
        label: "Applaud the President",
        detail: "Say the decree was a disgrace.",
        effect: { integrity: 5, popularity: 4, relations: { ppi: -5, fi: -3 } },
        feedback:
          "The Quirinale notices. Two former ministers accuse you in print of feeding the crowd.",
      },
      {
        label: "Defend a political solution",
        detail: "The whole system was financed this way; deal with it politically.",
        effect: { integrity: -6, order: 3, popularity: -5, relations: { ppi: 8 } },
        feedback:
          "It is, arguably, the honest position. It is reported as a plea for an amnesty for thieves.",
      },
      {
        label: "Propose an amnesty with full disclosure",
        detail: "Confess everything, keep your freedom.",
        effect: { integrity: 1, popularity: -2, order: 2, relations: { ppi: 4, pds: -3 } },
        feedback:
          "Jurists take it seriously, the public does not. Editorials call it a lawyer's answer to a moral question.",
      },
    ],
  },
  {
    id: "referendum",
    date: "April 1993",
    headline: "Referendum on the electoral law",
    body: "Segni's campaign to bury proportional representation polls above eighty per cent. Where do you stand?",
    choices: [
      {
        label: "Campaign for Yes",
        detail: "Majoritarian voting, two blocs, clarity.",
        effect: { popularity: 4, order: 2, relations: { ppi: -4, prc: -6, fi: 4 } },
        feedback:
          "You are on the winning side of an avalanche. Your own smaller allies begin counting how many seats this will cost them.",
      },
      {
        label: "Defend proportional",
        detail: "Small parties deserve a voice.",
        effect: { popularity: -4, integrity: 2, relations: { ppi: 6, prc: 6, lega: -5 } },
        feedback:
          "Principled and deeply unfashionable. The result is 82 per cent against you and it is filmed.",
      },
      {
        label: "Stay deliberately vague",
        detail: "Free vote, no party line.",
        effect: { popularity: -2, integrity: -3, order: 1 },
        feedback:
          "The papers note that you had no position on the most important vote of the year.",
      },
    ],
  },
  {
    id: "ciampi",
    date: "April 1993",
    headline: "A banker at Palazzo Chigi",
    body: "Ciampi forms the first non-parliamentary government of the Republic. Three ministers resign within a day over the immunity vote on Craxi.",
    choices: [
      {
        label: "Enter the government",
        detail: "Take responsibility in the emergency.",
        effect: { order: 4, economy: 3, integrity: -1, popularity: -2, relations: { ppi: 6, pds: 4 } },
        feedback:
          "You get a ministry and a great deal of paperwork. Your opponents will spend a year calling you a party of the system.",
      },
      {
        label: "Support from outside",
        detail: "Votes yes, hands clean.",
        effect: { order: 2, economy: 1, popularity: 1 },
        feedback:
          "A comfortable position, and everyone recognises it as such.",
      },
      {
        label: "Go into opposition",
        detail: "Technocrats are not a substitute for a vote.",
        effect: { popularity: 3, order: -2, relations: { ppi: -6, pds: -4 } },
        feedback:
          "You are free to attack everything. The financial press files you under 'irresponsible'.",
      },
    ],
  },
  {
    id: "local-1993",
    date: "June 1993",
    headline: "Local elections: the first test of the new law",
    body: "Mayors are now elected directly. Milan, Turin, Catania and hundreds of towns vote, and the old parties are being wiped out.",
    choices: [
      {
        label: "Run candidates everywhere",
        detail: "Even where you will lose badly.",
        effect: { popularity: 2, treasury: -5, order: 2, integrity: 2 },
        feedback:
          "Some heroic defeats and two unexpected run-offs. The treasurer looks at the printing bills and sighs.",
      },
      {
        label: "Concentrate on winnable cities",
        detail: "Everything into a dozen towns.",
        effect: { popularity: 3, treasury: -2, order: 1 },
        feedback:
          "Two mayoral victories give you a night of good coverage and a bench of real administrators.",
      },
      {
        label: "Back others' candidates for favours",
        detail: "Trade support for future seats.",
        effect: { popularity: -1, treasury: 2, integrity: -3, relations: { ppi: 6, pds: 5 } },
        feedback:
          "Useful phone numbers acquired. A local paper prints the deal in detail and calls it the old politics.",
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
        effect: { order: 6, popularity: 3, integrity: -2, treasury: -2 },
        feedback:
          "Soldiers on street corners within a week. Civil liberties lawyers write long, unread articles.",
      },
      {
        label: "Fund magistrates and police",
        detail: "Money and men, no emergency decrees.",
        effect: { order: 4, integrity: 4, treasury: -4, popularity: 2 },
        feedback:
          "Investigators say publicly that it is the first serious proposal in months. It makes page nine.",
      },
      {
        label: "Blame the political vacuum",
        detail: "Demand immediate elections.",
        effect: { order: -4, popularity: 2, relations: { lega: 4, ppi: -6 } },
        feedback:
          "You are accused of using dead bodies as an argument, and your polling in the north ticks up anyway.",
      },
    ],
  },
  {
    id: "prc-social-centres",
    date: "September 1993",
    headline: "An occupied social centre is cleared at dawn",
    body: "Police empty a squatted building in a northern city. Twelve arrests, and your local federation was inside.",
    only: ["prc"],
    choices: [
      {
        label: "Stand with the occupiers",
        detail: "Go to the police station yourself.",
        effect: { popularity: 3, order: -4, integrity: 3, relations: { pds: -5, an: -6 } },
        feedback:
          "Photographs of you outside the questura at three in the morning. The movement decides you are serious.",
      },
      {
        label: "Criticise the eviction, not the law",
        detail: "Method, not principle.",
        effect: { order: 1, popularity: -1, integrity: -1, relations: { pds: 4 } },
        feedback:
          "A statement so balanced it is quoted by nobody.",
      },
      {
        label: "Turn it into a housing campaign",
        detail: "Empty buildings, families on waiting lists.",
        effect: { popularity: 4, integrity: 2, order: -1, treasury: -2 },
        feedback:
          "Local council tenants' associations invite you to speak. For once you are discussed as a party with a policy.",
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
        effect: { economy: 4, popularity: 1, relations: { lega: 10, an: -7, ppi: -4 } },
        feedback:
          "Northern chambers of commerce are enthusiastic. Southern mayors of every party sign a joint protest.",
      },
      {
        label: "Defend national solidarity",
        detail: "One Italy, one treasury.",
        effect: { popularity: 2, order: 3, relations: { an: 7, ppi: 5, lega: -10 } },
        feedback:
          "Applause from Naples to Palermo. In Bergamo your speech is described as 'Rome talking'.",
      },
      {
        label: "Commission a study",
        detail: "Promise everything to everyone, later.",
        effect: { popularity: -2, integrity: -3, order: 1 },
        feedback:
          "A committee is formed. Its first meeting is scheduled for after the election.",
      },
    ],
  },
  {
    id: "fi-conflict",
    date: "October 1993",
    headline: "Three networks, one owner",
    body: "Your critics say a man who owns half of Italian television cannot be a candidate. Your lawyers say there is no law that says so.",
    only: ["fi"],
    choices: [
      {
        label: "Promise a blind trust",
        detail: "Hand the companies to managers if you win.",
        effect: { integrity: 5, popularity: 2, treasury: -3 },
        feedback:
          "The promise is welcomed and immediately doubted. Journalists start asking who exactly the trustees would be.",
      },
      {
        label: "Refuse to discuss it",
        detail: "Success is not a crime.",
        effect: { popularity: 2, integrity: -4, relations: { pds: -8, prc: -6 } },
        feedback:
          "Your supporters love the line. The conflict of interest becomes the left's entire campaign.",
      },
      {
        label: "Put a journalist in charge of the news",
        detail: "A visible guarantee of independence.",
        effect: { integrity: 3, popularity: 1, order: 2, treasury: -2 },
        feedback:
          "The appointment gets respectful coverage. Inside the networks, everyone knows who still signs the cheques.",
      },
    ],
  },
  {
    id: "lega-bossi-fini",
    date: "October 1993",
    headline: "Fini nearly takes Rome",
    body: "The MSI leader reaches the run-off in the capital and Berlusconi says he would vote for him. Your militants are asking what you are supposed to say.",
    only: ["lega"],
    choices: [
      {
        label: "Refuse any pact with the post-fascists",
        detail: "The north does not need Rome's nostalgia.",
        effect: { integrity: 3, popularity: -2, relations: { an: -14, fi: -6 } },
        feedback:
          "Your base approves and the arithmetic of the new electoral law gets much harder.",
      },
      {
        label: "Stay silent and count seats",
        detail: "Do not answer the question at all.",
        effect: { popularity: 1, integrity: -2, order: 1 },
        feedback:
          "Interviewers try nine times. The non-answer is itself the story for two days.",
      },
      {
        label: "Open a channel to the right",
        detail: "Separate tickets, north and south.",
        effect: { popularity: 2, order: 2, integrity: -3, relations: { fi: 10, an: 6 } },
        feedback:
          "Quiet dinners in Milan produce a workable formula. A section secretary in Varese tears up his card in front of a camera.",
      },
    ],
  },
  {
    id: "an-rome",
    date: "November 1993",
    headline: "The run-off in Rome",
    body: "Your candidate is within a few points of the mayoralty of the capital, in a city where your party has never been allowed near power.",
    only: ["an"],
    choices: [
      {
        label: "Run a moderate, institutional campaign",
        detail: "Traffic, refuse collection, the periphery.",
        effect: { popularity: 4, integrity: 3, order: 1, relations: { fi: 8, ppi: 4 } },
        feedback:
          "You lose narrowly and win the argument. National commentators write that the ghetto has a door in it now.",
      },
      {
        label: "Mobilise the militants hard",
        detail: "Flags, squares, the old repertoire.",
        effect: { popularity: 2, order: 3, integrity: -3, relations: { ppi: -8, pds: -6 } },
        feedback:
          "The squares are full and the swing voters are not in them. The final gap is wider than it needed to be.",
      },
      {
        label: "Lean on Berlusconi's endorsement",
        detail: "Amplify it everywhere.",
        effect: { popularity: 3, relations: { fi: 12, lega: -8 } },
        feedback:
          "It legitimises you overnight and makes you look like somebody's junior partner. Both things are now true.",
      },
    ],
  },
  {
    id: "pds-alliance",
    date: "November 1993",
    headline: "Building the Progressives",
    body: "Eight parties, from Rifondazione to the Greens to Segni's moderates, want a common ticket — and each wants a veto.",
    only: ["pds"],
    choices: [
      {
        label: "Include Rifondazione at any cost",
        detail: "No seats lost on the left.",
        effect: { popularity: 1, order: -2, relations: { prc: 15, ppi: -8 } },
        feedback:
          "The arithmetic in the northern colleges improves. Every centrist you were courting reads it as proof of your intentions.",
      },
      {
        label: "Court the Catholic centre instead",
        detail: "Moderation wins the middle seats.",
        effect: { popularity: 3, integrity: 1, relations: { ppi: 12, prc: -14 } },
        feedback:
          "Martinazzoli's people are cautiously interested. Bertinotti announces he will run candidates against you.",
      },
      {
        label: "Impose PDS leadership on everyone",
        detail: "The largest party writes the lists.",
        effect: { order: 4, popularity: -3, relations: { prc: -8, ppi: -6 } },
        feedback:
          "Efficient list-making, resentful allies. 'Occhetto's ultimatum' is the headline you did not want.",
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
        effect: { economy: 5, treasury: 6, popularity: -3, relations: { fi: 6, prc: -9 } },
        feedback:
          "The Credito Italiano placement is oversubscribed. Metalworkers in Taranto strike for a day with your name on the placards.",
      },
      {
        label: "Sell slowly, keep golden shares",
        detail: "State keeps a hand on strategic firms.",
        effect: { economy: 2, treasury: 2, order: 2, relations: { ppi: 5 } },
        feedback:
          "The compromise passes without drama and satisfies nobody's ideology, which is roughly the point.",
      },
      {
        label: "Block the sales",
        detail: "Public industry is not for auction.",
        effect: { economy: -4, treasury: -3, popularity: 3, relations: { prc: 9, fi: -6 } },
        feedback:
          "Union delegations arrive with flowers. Foreign investors quietly move a fund elsewhere.",
      },
    ],
  },
  {
    id: "ppi-symbol",
    date: "December 1993",
    headline: "The shield and the name",
    body: "The congress must decide what this party is called. Keep the shield of Democrazia Cristiana, refound it as Sturzo's Partito Popolare, or fold it into a centre pact around the referendum hero Mario Segni.",
    only: ["ppi"],
    choices: [
      {
        label: "Keep the name Democrazia Cristiana",
        detail: "Fifty years of governing are not an embarrassment.",
        effect: { order: 4, treasury: 5, integrity: -3, popularity: -3 },
        flag: "dc:dc",
        feedback:
          "The apparatus, the parishes and the funds stay exactly where they are — around a name that half the country now uses as an insult. Polling holds in the south and collapses in Lombardy.",
      },
      {
        label: "Refound as the Partito Popolare",
        detail: "A new name, a smaller and visibly cleaner party.",
        effect: { integrity: 6, popularity: 2, treasury: -4, order: -2, relations: { pds: 4 } },
        flag: "dc:ppi",
        feedback:
          "The break is real: some notables walk out with their clienteles, but Catholic associations return your calls and the word 'Tangentopoli' stops appearing in the same paragraph as your name.",
      },
      {
        label: "Become the Patto Segni",
        detail: "A centre pole built on the referendum victory.",
        effect: { popularity: 5, integrity: 4, treasury: -6, order: -4, relations: { pds: 5, fi: -8 } },
        flag: "dc:segni",
        feedback:
          "For a fortnight you are the novelty of the campaign, courted by both blocs at once. The old machine, however, is gone: what you have now is a name, a face and very little else.",
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
        effect: { integrity: 6, popularity: 2, relations: { fi: -14, pds: 7, prc: 5 } },
        feedback:
          "Constitutionalists approve. Three networks discover a sudden editorial interest in your weaknesses.",
      },
      {
        label: "Leave the market alone",
        detail: "Viewers decide, not the state.",
        effect: { integrity: -4, popularity: 2, relations: { fi: 12, pds: -8 } },
        feedback:
          "Your interviews get longer and friendlier. The left has a new count against you.",
      },
      {
        label: "Reform public RAI instead",
        detail: "Depoliticise the board, ignore the private side.",
        effect: { integrity: 3, order: 2, popularity: 1, relations: { ppi: 5 } },
        feedback:
          "A worthy reform that avoids the actual question, as several editorials point out.",
      },
    ],
  },
  {
    id: "fi-launch",
    date: "January 1994",
    headline: "The announcement",
    body: "Nine minutes of videotape are delivered to every newsroom in Italy. The tone of it will define the campaign.",
    only: ["fi"],
    choices: [
      {
        label: "'Italy is the country I love'",
        detail: "Warm, personal, above the parties.",
        effect: { popularity: 6, integrity: -1, order: 1 },
        flag: "fi:entry",
        feedback:
          "It is parodied within hours and imitated within weeks. Twelve million people watch it and most of them remember it.",
      },
      {
        label: "A hard anti-communist message",
        detail: "Name the enemy in the first sentence.",
        effect: { popularity: 4, order: 2, integrity: -3, relations: { pds: -12, prc: -10, an: 6 } },
        flag: "fi:entry",
        feedback:
          "It mobilises the frightened middle and hands the left an easy caricature of you.",
      },
      {
        label: "A technical programme speech",
        detail: "Numbers, tables, a plan for jobs.",
        effect: { economy: 3, integrity: 3, popularity: -2 },
        flag: "fi:entry",
        feedback:
          "Economists rate it seriously. Audience research shows viewers switched over after four minutes.",
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
        effect: { popularity: 3, integrity: -4, relations: { fi: 8, lega: 8, an: 8, ppi: 8, pds: 8, prc: 8 } },
        feedback:
          "The seat projections improve immediately. Commentators ask what the coalition actually agrees on, and you do not have a page to hand them.",
      },
      {
        label: "Ally only with the ideologically close",
        detail: "A clean, coherent ticket.",
        effect: { integrity: 5, popularity: 1 },
        feedback:
          "The manifesto writes itself. In two dozen marginal colleges the arithmetic simply does not work.",
      },
      {
        label: "Run alone",
        detail: "Nobody dilutes the message.",
        effect: { integrity: 6, popularity: -6, relations: { fi: -10, lega: -10, an: -10, ppi: -10, pds: -10, prc: -10 } },
        feedback:
          "Total control of your own lists. Under a majoritarian law that is an expensive luxury and your treasurer knows it.",
      },
    ],
  },
  {
    id: "lega-pact",
    date: "February 1994",
    headline: "Two pacts, one party",
    body: "Berlusconi wants you in the Pole of Freedoms in the north and a separate deal with the post-fascists in the south. Your people call it a trap.",
    only: ["lega"],
    choices: [
      {
        label: "Sign the northern pact",
        detail: "Take the seats, keep the distinction.",
        effect: { popularity: 3, order: 1, integrity: -2, relations: { fi: 14, an: -6 } },
        feedback:
          "Dozens of safe northern colleges become winnable. Your candidates start being introduced as Berlusconi's allies.",
      },
      {
        label: "Refuse and run alone",
        detail: "The Lega is not anybody's northern branch.",
        effect: { integrity: 5, popularity: -5, relations: { fi: -16 } },
        feedback:
          "Ideologically clean, electorally brutal. Internal polling shows you losing half your colleges to three-way splits.",
      },
      {
        label: "Sign, and attack him weekly",
        detail: "Allies on the ballot, enemies on television.",
        effect: { popularity: 2, order: -3, integrity: 1, relations: { fi: 5 } },
        feedback:
          "You keep the seats and your identity, at the price of a coalition that visibly hates itself.",
      },
    ],
  },
  {
    id: "an-congress",
    date: "February 1994",
    headline: "The turn at Fiuggi",
    body: "In the halls at Fiuggi the MSI is asked to dissolve itself into Alleanza Nazionale: a new name, a new tricolour badge, lists open to conservatives who never carried a party card. Almirante's widow is in the front row.",
    only: ["an"],
    choices: [
      {
        label: "Proclaim Alleanza Nazionale",
        detail: "Dissolve the MSI, take the new name and the new badge.",
        effect: { popularity: 6, integrity: 4, order: -2, relations: { fi: 8, ppi: 4 } },
        flag: "an:fiuggi",
        feedback:
          "The flame survives in the corner of the badge and nowhere else. Overnight you are a party of government in the bulletins, and the next poll is the best figure the Italian right has seen since the war.",
      },
      {
        label: "Alleanza Nazionale, and condemn fascism outright",
        detail: "Say the word on camera, in the hall, now.",
        effect: { integrity: 7, popularity: 4, order: -4, relations: { ppi: 8, pds: 5, fi: 6 } },
        flag: "an:fiuggi",
        feedback:
          "Front pages everywhere and a standing ovation from about half the room. Moderate voters move to you in numbers; some historic sections in Rome and Naples do not applaud at all.",
      },
      {
        label: "Refuse — the MSI keeps its name",
        detail: "Nothing of our history is up for negotiation.",
        effect: { order: 5, treasury: 3, popularity: -4, relations: { fi: -6, ppi: -6 } },
        flag: "an:flame",
        feedback:
          "The federations are loyal and delighted. You remain the MSI, the ghetto stays shut, and the evening programmes go on inviting somebody else.",
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
        effect: { popularity: 6, economy: 1, integrity: -4, treasury: -3 },
        feedback:
          "The number is repeated in every bulletin for a week. Economists call it arithmetically impossible, which does not seem to matter.",
      },
      {
        label: "Public works and training",
        detail: "Slow, costly, credible.",
        effect: { economy: 4, treasury: -5, popularity: 2, relations: { pds: 5, prc: 4 } },
        feedback:
          "Trade unions and the Bank of Italy both call it sensible. Voters find it hard to remember.",
      },
      {
        label: "Tell the truth: it will take years",
        detail: "No miracles on offer.",
        effect: { integrity: 7, popularity: -5, economy: 2 },
        feedback:
          "Rare, and respected in the commentary pages. In focus groups, people say they prefer the man promising the million.",
      },
    ],
  },
  {
    id: "scandal",
    date: "March 1994",
    headline: "A financier in your circle is arrested",
    body: "He funded your campaign and has a lot to say to prosecutors. Journalists are outside your house by dawn.",
    choices: [
      {
        label: "Expel him and publish the accounts",
        detail: "Cut the limb to save the body.",
        effect: { integrity: 7, popularity: -1, treasury: -4 },
        feedback:
          "Decisive, and the story lasts three days instead of three weeks. The campaign account is visibly thinner.",
      },
      {
        label: "Say nothing and wait",
        detail: "Trust the news cycle to move on.",
        effect: { integrity: -5, popularity: -3, order: 1 },
        feedback:
          "It does not move on. Every interview for a fortnight opens with the same question.",
      },
      {
        label: "Claim political persecution",
        detail: "Turn the accused into a martyr.",
        effect: { integrity: -6, popularity: 3, order: -2, relations: { pds: -6, an: 4 } },
        feedback:
          "Your base is energised and the undecided are not. The Milan pool responds with a leak the following Sunday.",
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
        effect: { economy: 5, treasury: 5, popularity: -4, relations: { ppi: 6, pds: 4, prc: -8 } },
        feedback:
          "The lira firms slightly on the announcement. Pensioners' associations issue an anxious communiqué.",
      },
      {
        label: "Ask for flexibility",
        detail: "Growth before deficits.",
        effect: { economy: 1, popularity: 3, treasury: -2, relations: { lega: 3, prc: 4 } },
        feedback:
          "Popular at home, met with silence in Bonn. The Financial Times uses the word 'vague'.",
      },
      {
        label: "Question the whole project",
        detail: "Sovereignty over the exchange rate.",
        effect: { economy: -4, popularity: 2, relations: { ppi: -7, pds: -5, lega: 5 } },
        feedback:
          "A genuine constituency exists for this and it cheers. The business federations put out a statement against you the same afternoon.",
      },
    ],
  },
  {
    id: "closing-tour",
    date: "March 1994",
    headline: "The last two weeks",
    body: "Money, time and voice are finite. Your organisers want to know where the final effort goes.",
    choices: [
      {
        label: "Blanket the television",
        detail: "Spots, interviews, everything money can buy.",
        effect: { popularity: 5, treasury: -8, integrity: -2 },
        feedback:
          "Your face is unavoidable for a fortnight. Two newspapers publish the size of your advertising bill.",
      },
      {
        label: "Tour the marginal colleges",
        detail: "Forty towns in fourteen days.",
        effect: { popularity: 3, order: 2, treasury: -3, integrity: 2 },
        feedback:
          "Small halls, real applause, exhausted candidates. Local papers give you the front page forty times.",
      },
      {
        label: "Protect the base",
        detail: "Rallies in your strongholds, no risks.",
        effect: { order: 4, popularity: 1, treasury: -2 },
        feedback:
          "Turnout in your heartlands will be excellent. The colleges that decide the majority never see you.",
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
        effect: { popularity: 5, integrity: -2 },
        feedback:
          "The instant polls give it to you on likeability and to your opponent on credibility.",
      },
      {
        label: "Legality and clean hands",
        detail: "Never again the First Republic.",
        effect: { popularity: 3, integrity: 5 },
        feedback:
          "A strong, sober closing. Whether the country wants three more years of prosecutors is the question the vote will answer.",
      },
      {
        label: "Order and the nation",
        detail: "Security, borders, authority restored.",
        effect: { popularity: 4, order: 5, relations: { pds: -5, prc: -6 } },
        feedback:
          "You dominate the studio and the switchboard. Moderate viewers tell pollsters you frightened them slightly.",
      },
    ],
  },
];
