import type { CountryStats } from "./country";

export type Bloc = "left" | "right";

/** A delayed consequence: applied `after` months, so decisions ripple. */
export interface Pulse {
  after: number;
  effect: Partial<Record<keyof CountryStats, number>>;
}

export interface GovChoice {
  label: string;
  detail: string;
  feedback: string;
  pulses: Pulse[];
}

export interface GovEvent {
  id: string;
  ministry: string;
  bloc?: Bloc | undefined;
  headline: string;
  body: string;
  choices: [GovChoice, GovChoice];
}

const p = (after: number, effect: Pulse["effect"]): Pulse => ({ after, effect });

const ev = (
  id: string,
  ministry: string,
  headline: string,
  body: string,
  choices: [GovChoice, GovChoice],
  bloc?: Bloc,
): GovEvent => ({ id, ministry, bloc, headline, body, choices });

const c = (
  label: string,
  detail: string,
  feedback: string,
  pulses: Pulse[],
): GovChoice => ({ label, detail, feedback, pulses });

export const GOV_EVENTS: GovEvent[] = [
  // ── President of the Council ────────────────────────────────────────────
  ev("pcm-1", "pcm", "The confidence vote", "Palazzo Chigi must present its programme to both chambers within ten days.", [
    c("A programme of reform", "Pensions, jobs, justice — all at once.", "The chambers grant confidence. Markets read ambition; the unions read a threat.", [p(0, { approval: 3 }), p(2, { growth: 0.2 }), p(4, { welfare: -1.5 })]),
    c("A programme of continuity", "Promise little, break little.", "A quiet vote. Nobody is thrilled, nobody is alarmed.", [p(0, { approval: 1 }), p(3, { budget: 1 })]),
  ]),
  ev("pcm-2", "pcm", "A minister under investigation", "A prosecutor in Milan has opened a file on one of your own ministers.", [
    c("He resigns tonight", "Cut it out before it spreads.", "The press calls it decisive; your ally calls it betrayal.", [p(0, { approval: 4 }), p(1, { crime: -1 })]),
    c("He stays until the trial", "Presumption of innocence.", "Editorials run for weeks. The word 'immunity' returns to the front pages.", [p(1, { approval: -4 }), p(3, { crime: 1.5 })]),
  ]),
  ev("pcm-3", "pcm", "The Quirinale calls", "The President wants reassurance that the coalition will last the year.", [
    c("Offer a written pact", "Bind the partners in public.", "The pact holds — for now. Discipline improves.", [p(0, { approval: 2 }), p(2, { growth: 0.1 })]),
    c("Govern month by month", "Keep your hands free.", "Freedom bought at the price of confidence in the corridors.", [p(2, { approval: -2 }), p(4, { budget: -1 })]),
  ]),
  ev("pcm-4", "pcm", "Referendum season", "Committees have gathered signatures on electoral law again.", [
    c("Back the referendum", "Ride the reforming mood.", "You are on the winning side of a public argument.", [p(0, { approval: 3 }), p(5, { approval: -1 })]),
    c("Campaign against it", "Stability first.", "The base grumbles; the machine survives intact.", [p(0, { approval: -2 }), p(3, { budget: 1 })]),
  ]),
  ev("pcm-l1", "pcm", "A pact with the unions", "The three confederations want a seat at the table on every economic bill.", [
    c("Sign the concertation pact", "Wages and prices agreed in Rome.", "Strikes vanish; so does some of your room to manoeuvre.", [p(0, { approval: 4 }), p(2, { welfare: 3 }), p(5, { growth: -0.2 })]),
    c("Consult, don't concede", "Listen, then legislate.", "The confederations warn you once. You will hear it again.", [p(1, { approval: -2 }), p(3, { growth: 0.2 })]),
  ], "left"),
  ev("pcm-l2", "pcm", "The southern question", "Cassa per il Mezzogiorno is dead; the South wants an heir.", [
    c("A new development agency", "Public money, public plans.", "Cranes appear in Bari and Catanzaro. So do the accountants.", [p(0, { budget: -5 }), p(3, { debt: 3 }), p(6, { growth: 0.6 }), p(8, { crime: -2 })]),
    c("Tax relief instead", "Let firms decide where to build.", "Cheaper for the treasury, slower on the ground.", [p(1, { budget: -2 }), p(6, { growth: 0.3 })]),
  ], "left"),
  ev("pcm-l3", "pcm", "Conflict of interest law", "The left demands a statute on media ownership and office.", [
    c("Pass the law", "No broadcaster may govern.", "A constitutional row, and a reputation for nerve.", [p(0, { approval: 3 }), p(2, { crime: -1.5 }), p(4, { growth: -0.1 })]),
    c("Send it to committee", "Study it thoroughly.", "The file grows thicker and nothing changes.", [p(1, { approval: -3 })]),
  ], "left"),
  ev("pcm-r1", "pcm", "A million jobs", "You promised them. The Confindustria wants the labour code opened.", [
    c("Liberalise hiring", "Fixed-term contracts, freely.", "Employment offices fill up; so do the union halls with anger.", [p(1, { growth: 0.5 }), p(3, { welfare: -3 }), p(4, { approval: -2 })]),
    c("Subsidise apprenticeships", "Pay firms to train the young.", "Slower, dearer, calmer.", [p(0, { budget: -4 }), p(4, { growth: 0.3 }), p(5, { welfare: 1 })]),
  ], "right"),
  ev("pcm-r2", "pcm", "The judges answer back", "Magistrates march against a decree limiting preventive custody.", [
    c("Withdraw the decree", "Retreat under fire.", "Humiliating, but the storm passes.", [p(0, { approval: -2 }), p(2, { crime: -1 })]),
    c("Defend it to the end", "Nobody rots in a cell untried.", "A constitutional confrontation and a long winter of headlines.", [p(1, { approval: -4 }), p(3, { crime: 2.5 })]),
  ], "right"),
  ev("pcm-r3", "pcm", "Federalism on the table", "The northern partner wants regional tax powers written into law.", [
    c("Grant fiscal autonomy", "Regions raise and spend.", "The North cheers, the South counts what it lost.", [p(1, { growth: 0.3 }), p(2, { budget: -3 }), p(5, { welfare: -2 })]),
    c("Only administrative devolution", "Powers without purses.", "The partner accepts, resentfully.", [p(0, { approval: -1 }), p(3, { budget: 1 })]),
  ], "right"),

  // ── Economy & Finance ──────────────────────────────────────────────────
  ev("eco-1", "economy", "The autumn budget", "The Treasury needs a figure by the end of the month.", [
    c("A corrective package", "Cuts and new levies worth 30,000 billion lire.", "The bond market exhales. Households do not.", [p(0, { budget: 8 }), p(2, { debt: -3 }), p(3, { growth: -0.4 }), p(3, { approval: -3 })]),
    c("A gentle budget", "Borrow through the cycle.", "Applause in the piazza, frowns in Frankfurt.", [p(0, { budget: -6 }), p(2, { debt: 4 }), p(3, { growth: 0.3 })]),
  ]),
  ev("eco-2", "economy", "The lira under attack", "Speculators are testing the currency again.", [
    c("Defend with rates", "Let the Bank raise sharply.", "The lira steadies; credit dries up for a season.", [p(1, { growth: -0.5 }), p(2, { budget: -2 }), p(4, { debt: -1 })]),
    c("Let it float down", "A weak lira sells Italian goods.", "Exporters celebrate; imported oil and drugs cost more.", [p(1, { growth: 0.5 }), p(3, { welfare: -1.5 }), p(4, { debt: 2 })]),
  ]),
  ev("eco-3", "economy", "Privatisation list", "IRI, ENI, the banks — the queue at the window is long.", [
    c("Sell aggressively", "Cash now, ownership later.", "Receipts flood in; whole towns learn a new owner's name.", [p(0, { budget: 9 }), p(2, { debt: -4 }), p(4, { welfare: -2 }), p(5, { growth: 0.3 })]),
    c("Sell slowly, keep golden shares", "Strategic control retained.", "Less money, fewer enemies.", [p(0, { budget: 3 }), p(3, { debt: -1 })]),
  ]),
  ev("eco-4", "economy", "Maastricht arithmetic", "Brussels wants a credible path to the single currency.", [
    c("Commit to the criteria", "Deficit under three per cent.", "Credibility earned in blood and spending reviews.", [p(1, { budget: 6 }), p(3, { debt: -4 }), p(3, { growth: -0.3 }), p(6, { growth: 0.4 })]),
    c("Ask for more time", "Italy is a special case.", "Spreads widen politely.", [p(1, { debt: 3 }), p(4, { growth: -0.2 })]),
  ]),
  ev("eco-l1", "economy", "A tax on great fortunes", "The left wants a one-off levy on capital and property.", [
    c("Impose the levy", "The rich pay for the transition.", "The Treasury smiles; capital packs a suitcase.", [p(0, { budget: 7 }), p(2, { growth: -0.3 }), p(3, { welfare: 3 })]),
    c("Fight evasion instead", "Hire inspectors, not slogans.", "Slow, dull, surprisingly effective.", [p(2, { budget: 4 }), p(4, { crime: -2 })]),
  ], "left"),
  ev("eco-l2", "economy", "Public investment plan", "Schools, sewers, railways: the backlog is decades deep.", [
    c("Fund the plan by debt", "Build now, pay later.", "Concrete moves; the debt column moves too.", [p(0, { budget: -8 }), p(2, { debt: 5 }), p(5, { growth: 0.7 }), p(8, { budget: 4 })]),
    c("Only what the budget allows", "Prudence as policy.", "Modest works, modest gratitude.", [p(0, { budget: -2 }), p(5, { growth: 0.2 })]),
  ], "left"),
  ev("eco-l3", "economy", "Minimum wage debate", "The confederations want a legal floor for the unorganised.", [
    c("Legislate a floor", "Dignity by statute.", "The poorest gain; the smallest firms complain loudest.", [p(1, { welfare: 4 }), p(3, { growth: -0.2 }), p(2, { approval: 3 })]),
    c("Leave it to contracts", "Bargaining, not law.", "Nothing changes in the grey economy.", [p(1, { approval: -2 })]),
  ], "left"),
  ev("eco-r1", "economy", "Flat tax proposal", "Advisers bring a two-rate income tax to the table.", [
    c("Cut rates boldly", "Lower taxes, higher revenue — eventually.", "Take-home pay rises; the deficit rises first.", [p(0, { budget: -9 }), p(2, { debt: 4 }), p(4, { growth: 0.8 }), p(7, { budget: 5 })]),
    c("Trim the top bracket only", "A gesture the books can bear.", "A modest cheer from the shopkeepers.", [p(0, { budget: -3 }), p(4, { growth: 0.3 })]),
  ], "right"),
  ev("eco-r2", "economy", "Tax amnesty", "A condono would bring hidden money home this quarter.", [
    c("Declare the amnesty", "Pay a fee, sleep soundly.", "The Treasury fills; so does the belief that cheating pays.", [p(0, { budget: 8 }), p(2, { crime: 3 }), p(4, { budget: -3 })]),
    c("Refuse it", "No pardon for evasion.", "Harder now, cleaner later.", [p(2, { crime: -2 }), p(3, { budget: 2 })]),
  ], "right"),
  ev("eco-r3", "economy", "Cut the public payroll", "The state employs too many for what it delivers, say your economists.", [
    c("Freeze hiring and retire early", "Shrink by attrition.", "Ministries thin out; queues at the counters lengthen.", [p(1, { budget: 6 }), p(3, { welfare: -3 }), p(4, { debt: -3 })]),
    c("Reform procedures, not numbers", "Efficiency without redundancies.", "Committees are appointed. Savings are theoretical.", [p(3, { budget: 1 })]),
  ], "right"),

  // ── Interior ───────────────────────────────────────────────────────────
  ev("int-1", "interior", "After the bombings", "The mafia's season of dynamite has left the state's authority in question.", [
    c("Send troops to Sicily", "Operation Vespri Siciliani, extended.", "Checkpoints everywhere. Extortion recedes and so do tourists' nerves.", [p(0, { budget: -4 }), p(1, { crime: -5 }), p(4, { crime: -2 })]),
    c("Fund the prosecutors instead", "Investigators, wiretaps, protected witnesses.", "Quieter, slower, and it reaches the accountants.", [p(0, { budget: -2 }), p(3, { crime: -4 }), p(6, { crime: -3 })]),
  ]),
  ev("int-2", "interior", "Prisons at breaking point", "Occupancy is at 140 per cent and the guards are striking.", [
    c("Build and hire", "Three new facilities.", "Expensive relief that arrives in eighteen months.", [p(0, { budget: -5 }), p(5, { crime: -3 })]),
    c("Alternative sentences", "House arrest for minor crimes.", "Cells empty; the evening news finds a recidivist.", [p(1, { budget: 2 }), p(2, { crime: 2 })]),
  ]),
  ev("int-3", "interior", "Police pay", "The forces have not had a real rise since 1990.", [
    c("Grant the increase", "Pay them properly.", "Morale up, patrols up, the budget line down.", [p(0, { budget: -4 }), p(2, { crime: -3 })]),
    c("Offer overtime funds", "Pay for hours, not grades.", "A cheaper bargain the unions accept sourly.", [p(0, { budget: -1 }), p(2, { crime: -1 })]),
  ]),
  ev("int-4", "interior", "Football and the ultras", "Stadium violence has killed a supporter in Genoa.", [
    c("Stadium bans and ID cards", "Names on every ticket.", "Terraces calm; civil libertarians object.", [p(1, { crime: -2 }), p(2, { approval: 1 })]),
    c("Work through the clubs", "Let supporters police themselves.", "Cheap, and only partly effective.", [p(2, { crime: -0.5 })]),
  ]),
  ev("int-l1", "interior", "Anti-mafia asset seizures", "Confiscated estates could be handed to cooperatives.", [
    c("Give the land to co-ops", "Farms run by the sons of victims.", "Powerful symbolism that also produces olive oil.", [p(1, { crime: -3 }), p(3, { welfare: 2 }), p(5, { growth: 0.2 })]),
    c("Auction the assets", "Cash for the treasury.", "Money now; some buyers look familiar.", [p(0, { budget: 4 }), p(3, { crime: 2 })]),
  ], "left"),
  ev("int-l2", "interior", "Immigration decree", "Landings on the Adriatic coast are rising.", [
    c("Regularise and integrate", "Permits, language courses, work.", "Employers are pleased; the tabloids are not.", [p(1, { growth: 0.3 }), p(2, { welfare: -1 }), p(3, { crime: -1.5 })]),
    c("Emergency reception centres", "Manage arrivals administratively.", "Order restored at the port, costs at the ministry.", [p(0, { budget: -3 }), p(2, { crime: -1 })]),
  ], "left"),
  ev("int-l3", "interior", "Neighbourhood policing", "A pilot scheme in Naples wants officers on foot, in the quarter.", [
    c("Roll it out nationally", "Police as neighbours.", "Trust grows slowly and then all at once.", [p(0, { budget: -3 }), p(4, { crime: -4 }), p(6, { approval: 2 })]),
    c("Keep it as a pilot", "Evaluate for two years.", "A good report and little else.", [p(4, { crime: -1 })]),
  ], "left"),
  ev("int-r1", "interior", "Zero tolerance", "The Interior Ministry proposes mass sweeps of the city outskirts.", [
    c("Order the sweeps", "Visible, immediate, hard.", "Arrest figures soar; so do complaints of heavy hands.", [p(0, { crime: -4 }), p(3, { crime: 2 }), p(1, { approval: 3 })]),
    c("Target known networks", "Intelligence-led, not headline-led.", "Fewer photographs, better convictions.", [p(2, { crime: -3 }), p(5, { crime: -2 })]),
  ], "right"),
  ev("int-r2", "interior", "Expulsion decree", "The partner demands immediate deportation for illegal entry.", [
    c("Sign the decree", "Escorted to the border.", "The base is satisfied; the courts are busy.", [p(1, { crime: -2 }), p(2, { approval: 2 }), p(4, { growth: -0.2 })]),
    c("Case-by-case review", "Judges decide, not prefects.", "Slower, and the partner sulks.", [p(1, { approval: -2 })]),
  ], "right"),
  ev("int-r3", "interior", "Private security", "Firms want licences to guard their own districts.", [
    c("Licence them widely", "Uniforms the state does not pay for.", "Cheap coverage where money lives; nothing changes elsewhere.", [p(0, { budget: 2 }), p(2, { crime: -1.5 }), p(5, { welfare: -1 })]),
    c("Strict limits", "Public order stays public.", "Costlier, and constitutionally tidier.", [p(0, { budget: -2 }), p(3, { crime: -1 })]),
  ], "right"),

  // ── Foreign Affairs ────────────────────────────────────────────────────
  ev("for-1", "foreign", "War across the Adriatic", "Bosnia burns and Italy is the nearest western port.", [
    c("Join the humanitarian mission", "Ships, field hospitals, corridors.", "Italy is thanked in Sarajevo and billed in Rome.", [p(0, { budget: -4 }), p(2, { approval: 2 })]),
    c("Logistics only", "Bases yes, boots no.", "Allies note the caution.", [p(0, { budget: -1 })]),
  ]),
  ev("for-2", "foreign", "The European Council", "Partners want a signature on the stability pact language.", [
    c("Sign without reservations", "Italy at the core of Europe.", "Credibility bought with future constraint.", [p(1, { debt: -2 }), p(3, { growth: 0.3 }), p(4, { budget: -1 })]),
    c("Negotiate exemptions", "Protect the national accounts.", "A footnote in the communiqué and a colder reception.", [p(2, { growth: -0.2 })]),
  ]),
  ev("for-3", "foreign", "Albanian crisis", "Tirana is unravelling and the boats are already sailing.", [
    c("Aid and a naval mission", "Stabilise the far shore.", "Costly abroad, calmer at home.", [p(0, { budget: -3 }), p(2, { crime: -2 })]),
    c("Close the ports", "A matter for Albania.", "Cheap, and the images are ugly.", [p(1, { approval: -1 }), p(2, { crime: 1 })]),
  ]),
  ev("for-4", "foreign", "Trade mission to Asia", "Industrialists want the flag behind them in Beijing and Seoul.", [
    c("Lead the mission personally", "Contracts signed under lights.", "Orders for machine tools and a fortnight of good press.", [p(0, { budget: -1 }), p(3, { growth: 0.4 })]),
    c("Send the deputy", "Business as usual.", "A few contracts, no photographs.", [p(3, { growth: 0.1 })]),
  ]),
  ev("for-l1", "foreign", "Development aid", "Italy's aid budget is among the meanest in the OECD.", [
    c("Raise aid to 0.4 per cent", "Wells, clinics, schools abroad.", "Applause at the UN, questions at home.", [p(0, { budget: -4 }), p(3, { approval: -1 }), p(6, { crime: -1 })]),
    c("Hold it steady", "Charity begins in the Mezzogiorno.", "No headlines either way.", [p(2, { budget: 1 })]),
  ], "left"),
  ev("for-l2", "foreign", "Arms export controls", "A shipment to a dictatorship awaits a licence.", [
    c("Refuse the licence", "Principles over payrolls.", "Brescia's factories send a delegation to protest.", [p(1, { growth: -0.3 }), p(2, { approval: 2 })]),
    c("Approve with conditions", "Jobs are also a value.", "The shipment sails and a committee is formed.", [p(1, { growth: 0.2 }), p(2, { approval: -1 })]),
  ], "left"),
  ev("for-l3", "foreign", "Mediterranean conference", "A Barcelona-style forum could be hosted in Naples.", [
    c("Host it", "Italy as bridge to the south shore.", "Prestige, and a genuinely useful agenda.", [p(0, { budget: -2 }), p(4, { growth: 0.3 }), p(4, { crime: -1 })]),
    c("Attend, don't host", "Save the money.", "A seat at someone else's table.", []),
  ], "left"),
  ev("for-r1", "foreign", "Atlantic first", "Washington asks for a firmer commitment on NATO's southern flank.", [
    c("Pledge fully", "Bases, budgets, loyalty.", "Warm words from Washington, a bill from Defence.", [p(0, { budget: -3 }), p(3, { growth: 0.2 }), p(2, { approval: 1 })]),
    c("Balance with Europe", "Two friendships, half the cost.", "Ambiguity, cheaply purchased.", [p(2, { budget: 1 })]),
  ], "right"),
  ev("for-r2", "foreign", "Export credits", "SACE could underwrite risky but lucrative contracts.", [
    c("Expand the guarantees", "The state stands behind the exporters.", "Order books swell; the contingent liabilities do too.", [p(1, { growth: 0.5 }), p(3, { debt: 2 })]),
    c("Keep the exposure low", "No hidden debts.", "Prudence the treasury appreciates.", [p(2, { debt: -1 })]),
  ], "right"),
  ev("for-r3", "foreign", "Trieste and the eastern border", "Slovenian property claims are blocking an association treaty.", [
    c("Hold the veto", "No treaty without restitution.", "Applause in Trieste, irritation in Brussels.", [p(1, { approval: 2 }), p(3, { growth: -0.2 })]),
    c("Lift the veto for trade", "Business heals borders.", "Freight moves east and the exiles feel sold.", [p(1, { approval: -2 }), p(3, { growth: 0.3 })]),
  ], "right"),

  // ── Defence ────────────────────────────────────────────────────────────
  ev("def-1", "defence", "The conscription question", "The general staff want a smaller, professional army.", [
    c("Begin professionalisation", "Volunteers, better trained.", "Young men are relieved; the budget line grows.", [p(0, { budget: -5 }), p(4, { approval: 2 }), p(6, { growth: 0.2 })]),
    c("Keep the draft", "Cheap manpower and a civic school.", "Savings now, complaints forever.", [p(0, { budget: 2 }), p(3, { approval: -1 })]),
  ]),
  ev("def-2", "defence", "Procurement scandal", "An audit finds inflated prices on helicopter contracts.", [
    c("Cancel and re-tender", "Publicly, painfully.", "Industry howls; the auditors write a kind report.", [p(0, { budget: 3 }), p(2, { crime: -2 }), p(3, { growth: -0.2 })]),
    c("Renegotiate quietly", "Keep the jobs, cut the price.", "Savings without a scandal, and without a lesson.", [p(1, { budget: 1 })]),
  ]),
  ev("def-3", "defence", "Barracks and floods", "The army is once more the only functioning civil protection.", [
    c("Fund a civil protection corps", "Permanent, trained, civilian.", "Slow to build, indispensable once built.", [p(0, { budget: -3 }), p(4, { welfare: 3 }), p(5, { approval: 2 })]),
    c("Keep relying on the army", "It already exists.", "Nothing changes until the next flood.", [p(3, { welfare: -1 })]),
  ]),
  ev("def-4", "defence", "Peacekeeping in Lebanon", "The UN asks Italy for a contingent again.", [
    c("Send the brigade", "The flag under blue helmets.", "Respect abroad, costs at home, risk in the field.", [p(0, { budget: -3 }), p(2, { approval: 2 })]),
    c("Decline politely", "Overstretched already.", "Nobody notices except the Secretary-General.", []),
  ]),
  ev("def-l1", "defence", "Conscientious objection", "Civil service as an alternative to arms is oversubscribed.", [
    c("Expand civil service", "Hospitals and libraries staffed by objectors.", "Cheap labour for welfare and a happier generation.", [p(0, { budget: -1 }), p(2, { welfare: 3 })]),
    c("Cap the numbers", "The army needs bodies.", "Queues at the tribunals instead.", [p(2, { approval: -2 })]),
  ], "left"),
  ev("def-l2", "defence", "Cut the arms budget", "The peace movement wants a dividend from the end of the Cold War.", [
    c("Cut ten per cent", "Redirect to schools and clinics.", "Generals furious, teachers delighted.", [p(0, { budget: 5 }), p(2, { welfare: 3 }), p(4, { growth: -0.2 })]),
    c("Freeze, don't cut", "No new programmes.", "A compromise nobody celebrates.", [p(1, { budget: 2 })]),
  ], "left"),
  ev("def-l3", "defence", "Landmine ban", "Italy is a leading producer; campaigners want it stopped.", [
    c("Ban production", "Sign the moral high ground.", "A famous first, and a closed factory in Brescia.", [p(1, { approval: 3 }), p(2, { growth: -0.2 })]),
    c("Restrict exports only", "Half a measure.", "The campaign continues outside the ministry.", [p(1, { approval: -1 })]),
  ], "left"),
  ev("def-r1", "defence", "Rearm the air force", "The Eurofighter programme wants Italian money and Italian factories.", [
    c("Commit to the programme", "Sovereignty and skilled jobs.", "Turin and Varese hire; the deficit notices.", [p(0, { budget: -7 }), p(2, { debt: 3 }), p(4, { growth: 0.5 })]),
    c("Buy off the shelf", "Cheaper aircraft, foreign jobs.", "The treasury is pleased and the unions are not.", [p(0, { budget: -3 }), p(3, { growth: 0.1 })]),
  ], "right"),
  ev("def-r2", "defence", "Army in the streets", "Deploy soldiers to guard sensitive sites and free police for patrols.", [
    c("Deploy nationwide", "Uniforms at every station.", "Reassuring photographs and real deterrence, at a price.", [p(0, { budget: -3 }), p(1, { crime: -3 }), p(4, { crime: 1 })]),
    c("Only in the South", "Concentrate the force.", "Focused effect, focused resentment.", [p(0, { budget: -1 }), p(1, { crime: -2 })]),
  ], "right"),
  ev("def-r3", "defence", "Military service reform for the North", "The partner wants regional garrisons manned locally.", [
    c("Concede regional garrisons", "Soldiers serve near home.", "Popular in Bergamo, incoherent as doctrine.", [p(1, { approval: 1 }), p(3, { crime: 0.5 })]),
    c("Refuse — one national army", "Unity is not negotiable.", "The partner threatens; the generals sigh with relief.", [p(1, { approval: -1 })]),
  ], "right"),

  // ── Education ──────────────────────────────────────────────────────────
  ev("edu-1", "education", "Crumbling schools", "A survey finds a third of buildings out of code.", [
    c("A national building plan", "Borrow and rebuild.", "Scaffolding everywhere and a heavier debt column.", [p(0, { budget: -6 }), p(2, { debt: 3 }), p(4, { welfare: 4 }), p(7, { growth: 0.3 })]),
    c("Emergency repairs only", "Fix the worst.", "The list of the worst gets longer each year.", [p(0, { budget: -2 }), p(3, { welfare: 1 })]),
  ]),
  ev("edu-2", "education", "Teacher recruitment", "Precarious teachers have been waiting a decade for tenure.", [
    c("Mass tenure competition", "Regularise 60,000 posts.", "Classrooms stabilise; the payroll swells permanently.", [p(0, { budget: -5 }), p(2, { welfare: 4 }), p(3, { approval: 2 })]),
    c("Merit-based competition", "Fewer posts, higher bar.", "Better teachers, angrier queues.", [p(0, { budget: -2 }), p(4, { growth: 0.2 }), p(2, { approval: -2 })]),
  ]),
  ev("edu-3", "education", "University reform", "Rectors want autonomy over courses and fees.", [
    c("Grant autonomy", "Universities compete.", "Some flourish, some fold, all complain.", [p(1, { budget: 2 }), p(5, { growth: 0.4 }), p(3, { welfare: -1 })]),
    c("Keep central control", "Uniform standards.", "Predictable, and slower to improve.", [p(0, { budget: -1 })]),
  ]),
  ev("edu-4", "education", "Vocational training", "Industry says school-leavers cannot use a lathe or a spreadsheet.", [
    c("Build technical institutes", "Workshops in every province.", "Costly now, employable later.", [p(0, { budget: -4 }), p(5, { growth: 0.6 }), p(6, { crime: -2 })]),
    c("Subsidise firm training", "Let employers teach.", "Cheaper and unevenly delivered.", [p(0, { budget: -2 }), p(5, { growth: 0.3 })]),
  ]),
  ev("edu-l1", "education", "Free textbooks", "Families in the South cannot meet September's bill.", [
    c("Free books to age 16", "Universal, no means test.", "Grateful parents, a permanent line in the budget.", [p(0, { budget: -3 }), p(1, { welfare: 3 }), p(2, { approval: 3 })]),
    c("Means-tested vouchers", "Target the poorest.", "Efficient, and lost in the paperwork.", [p(0, { budget: -1 }), p(2, { welfare: 1 })]),
  ], "left"),
  ev("edu-l2", "education", "Full-time primary school", "Working mothers need the school day to match the working day.", [
    c("Extend the school day", "Lunch and afternoon classes.", "Employment among women rises with the lunch bill.", [p(0, { budget: -5 }), p(3, { welfare: 4 }), p(5, { growth: 0.4 })]),
    c("Fund after-school clubs", "Voluntary sector, public grant.", "Patchy provision at a third of the cost.", [p(0, { budget: -2 }), p(3, { welfare: 2 })]),
  ], "left"),
  ev("edu-l3", "education", "Adult literacy in the South", "Functional illiteracy is above twenty per cent in some provinces.", [
    c("A national literacy campaign", "Evening schools, television courses.", "A quiet triumph that pays off in a decade.", [p(0, { budget: -3 }), p(4, { welfare: 3 }), p(8, { growth: 0.4 }), p(8, { crime: -2 })]),
    c("Leave it to the regions", "Local problems, local answers.", "Some regions act. Most do not.", [p(4, { welfare: 0.5 })]),
  ], "left"),
  ev("edu-r1", "education", "Parity for private schools", "Catholic schools want public funding per pupil.", [
    c("Fund parity", "Parents choose, state pays.", "The Church is grateful; the state schools feel robbed.", [p(0, { budget: -4 }), p(2, { approval: 2 }), p(4, { welfare: -1 })]),
    c("Tax deductions only", "A smaller gesture.", "Half-satisfaction all round.", [p(0, { budget: -1 })]),
  ], "right"),
  ev("edu-r2", "education", "Discipline and standards", "Restore the failing grade and the state examination's rigour.", [
    c("Restore rigour", "Fail those who fail.", "Standards rise, dropouts rise with them.", [p(2, { growth: 0.2 }), p(3, { crime: 1 }), p(2, { approval: 1 })]),
    c("Support, don't fail", "Recovery courses instead.", "Costlier and kinder.", [p(0, { budget: -2 }), p(3, { welfare: 1 })]),
  ], "right"),
  ev("edu-r3", "education", "Trim the ministry", "Thousands of administrative staff sit between school and state.", [
    c("Cut the bureaucracy", "Devolve to head teachers.", "Savings, and a year of administrative chaos.", [p(1, { budget: 4 }), p(2, { welfare: -2 }), p(5, { growth: 0.2 })]),
    c("Reorganise, keep staff", "No redundancies.", "New flowcharts, same corridors.", []),
  ], "right"),

  // ── Health ─────────────────────────────────────────────────────────────
  ev("hea-1", "health", "The USL deficits", "Local health units are billions in the red and paying suppliers late.", [
    c("Convert them into managed agencies", "Directors accountable for budgets.", "Accounts improve; waiting lists are triaged harder.", [p(1, { budget: 5 }), p(2, { welfare: -2 }), p(5, { welfare: 2 })]),
    c("Settle the debts centrally", "Pay the suppliers now.", "Hospitals breathe; the debt column inhales.", [p(0, { budget: -7 }), p(2, { debt: 3 }), p(1, { welfare: 3 })]),
  ]),
  ev("hea-2", "health", "Prescription charges", "The ticket on medicines is unpopular and lucrative.", [
    c("Abolish the ticket for the poor", "Exemptions by income.", "Pharmacies busier, treasury lighter.", [p(0, { budget: -3 }), p(1, { welfare: 3 })]),
    c("Raise it across the board", "Everyone contributes.", "Revenue found; grumbling universal.", [p(0, { budget: 4 }), p(1, { welfare: -3 }), p(2, { approval: -2 })]),
  ]),
  ev("hea-3", "health", "Waiting lists", "Some diagnostic queues run to eleven months.", [
    c("Open evening clinics", "Pay staff for extra sessions.", "Queues shorten visibly within a year.", [p(0, { budget: -4 }), p(2, { welfare: 4 }), p(3, { approval: 2 })]),
    c("Buy capacity from private clinics", "Contract it out.", "Fast relief, and a lobby you now depend on.", [p(0, { budget: -3 }), p(1, { welfare: 3 }), p(5, { budget: -2 })]),
  ]),
  ev("hea-4", "health", "A hospital scandal", "Instruments reused, deaths unrecorded, a director arrested.", [
    c("National inspection programme", "Audit every hospital.", "Painful revelations and a genuinely safer system.", [p(0, { budget: -2 }), p(2, { crime: -2 }), p(4, { welfare: 3 })]),
    c("Handle it locally", "One bad apple.", "The story dies. The practice does not.", [p(1, { approval: -2 }), p(3, { welfare: -1 })]),
  ]),
  ev("hea-l1", "health", "Universal dental and mental care", "Two services excluded from the national system since its birth.", [
    c("Include them", "Full coverage, phased in.", "A landmark expansion with a landmark cost.", [p(0, { budget: -8 }), p(2, { debt: 3 }), p(2, { welfare: 6 }), p(3, { approval: 3 })]),
    c("Pilot in three regions", "Prove it first.", "Modest gains, modest bills.", [p(0, { budget: -2 }), p(3, { welfare: 2 })]),
  ], "left"),
  ev("hea-l2", "health", "Drug addiction policy", "Overdose deaths are at a record.", [
    c("Harm reduction and treatment", "Clinics, substitution, outreach.", "Deaths fall; the tabloids call it surrender.", [p(0, { budget: -3 }), p(2, { welfare: 3 }), p(3, { crime: -4 })]),
    c("Compulsory rehabilitation", "Treatment by court order.", "Beds fill; results are mixed.", [p(0, { budget: -2 }), p(3, { crime: -1 })]),
  ], "left"),
  ev("hea-l3", "health", "Family clinics", "Consultori familiari are understaffed and closing.", [
    c("Refund and expand them", "One per district.", "Preventive care that pays for itself, eventually.", [p(0, { budget: -3 }), p(2, { welfare: 4 }), p(6, { budget: 2 })]),
    c("Merge into hospitals", "Save on premises.", "Cheaper, further away, less used.", [p(0, { budget: 2 }), p(3, { welfare: -2 })]),
  ], "left"),
  ev("hea-r1", "health", "Private insurance incentives", "Tax relief for supplementary health cover.", [
    c("Grant the relief", "Take pressure off the public wards.", "The insured are content; the public system loses its middle-class defenders.", [p(0, { budget: -3 }), p(2, { welfare: -1 }), p(5, { welfare: -2 }), p(3, { growth: 0.3 })]),
    c("No relief", "One system for all.", "Insurers lobby on.", [p(1, { welfare: 1 })]),
  ], "right"),
  ev("hea-r2", "health", "Regionalise the service", "Let regions run and fund their own health systems.", [
    c("Devolve health", "Regional taxes, regional hospitals.", "The North improves, the South falls further behind.", [p(1, { budget: 4 }), p(3, { welfare: -3 }), p(5, { growth: 0.3 })]),
    c("Keep national standards", "Devolve management only.", "A compromise that satisfies the accountants alone.", [p(2, { budget: 1 })]),
  ], "right"),
  ev("hea-r3", "health", "Pharmaceutical prices", "The industry offers investment in exchange for higher reimbursement prices.", [
    c("Accept the deal", "Plants in Latina and Pomezia.", "Jobs arrive; the drugs bill grows every year.", [p(0, { budget: -4 }), p(3, { growth: 0.4 }), p(6, { budget: -2 })]),
    c("Force generic substitution", "Cheapest equivalent by law.", "Savings for the service, war with the industry.", [p(1, { budget: 5 }), p(3, { growth: -0.2 }), p(2, { welfare: 1 })]),
  ], "right"),

  // ── Transport & Works ──────────────────────────────────────────────────
  ev("tra-1", "transport", "The high-speed line", "The Rome–Naples direttissima needs a financing decision.", [
    c("Build it publicly", "State money, state railway.", "Twelve billion committed and a country visibly modernising.", [p(0, { budget: -9 }), p(2, { debt: 5 }), p(6, { growth: 0.9 }), p(9, { budget: 4 })]),
    c("Project finance with banks", "Off the public books.", "Cheaper today; the guarantees mature later.", [p(0, { budget: -3 }), p(5, { growth: 0.5 }), p(8, { debt: 3 })]),
  ]),
  ev("tra-2", "transport", "Motorway concessions", "Autostrade's franchise is up for renegotiation.", [
    c("Tie tolls to investment", "No maintenance, no rise.", "Roads get resurfaced and the concessionaire litigates.", [p(1, { welfare: 2 }), p(3, { growth: 0.3 }), p(2, { budget: 1 })]),
    c("Raise tolls for revenue", "Cash for the treasury.", "Hauliers strike for a week.", [p(0, { budget: 4 }), p(2, { growth: -0.2 }), p(1, { approval: -2 })]),
  ]),
  ev("tra-3", "transport", "Public works and the clean-hands era", "Contractors say tenders have frozen since the arrests began.", [
    c("New procurement code", "Transparent tenders, published prices.", "Slow to write, and it restarts the sites honestly.", [p(2, { crime: -3 }), p(4, { growth: 0.4 }), p(0, { budget: -1 })]),
    c("Emergency powers to unblock sites", "Derogations to get moving.", "Cranes turn again; so do the old mechanisms.", [p(1, { growth: 0.5 }), p(3, { crime: 3 })]),
  ]),
  ev("tra-4", "transport", "Ferrovie dello Stato deficits", "The railway loses billions and employs a small city.", [
    c("Restructure and close branch lines", "Rationalise the network.", "Books improve; valleys lose their trains.", [p(1, { budget: 6 }), p(2, { welfare: -3 }), p(4, { approval: -2 })]),
    c("Invest in commuter services", "Move people, not accounts.", "Crowded platforms clear; the subsidy grows.", [p(0, { budget: -6 }), p(3, { welfare: 3 }), p(5, { growth: 0.4 })]),
  ]),
  ev("tra-l1", "transport", "Urban transit plan", "Milan, Naples and Turin all want metro extensions.", [
    c("Fund all three", "Public transport as a right.", "Tunnels dug, deficit deeper, cities better.", [p(0, { budget: -8 }), p(2, { debt: 4 }), p(6, { welfare: 4 }), p(7, { growth: 0.5 })]),
    c("Fund one, by merit", "Naples first.", "One city transformed, two councils furious.", [p(0, { budget: -3 }), p(6, { welfare: 2 })]),
  ], "left"),
  ev("tra-l2", "transport", "Social housing", "Waiting lists for public housing exceed 600,000 families.", [
    c("A building programme", "40,000 units in five years.", "Families housed; the debt column notes it.", [p(0, { budget: -7 }), p(3, { debt: 4 }), p(5, { welfare: 5 }), p(6, { crime: -3 })]),
    c("Rent subsidies", "Support tenants in the market.", "Faster relief, and rents drift upward.", [p(0, { budget: -4 }), p(2, { welfare: 3 }), p(5, { welfare: -1 })]),
  ], "left"),
  ev("tra-l3", "transport", "Hydro-geological plan", "After the Piedmont floods, the rivers need work.", [
    c("A ten-year river plan", "Embankments, reforestation, relocation.", "Unglamorous spending that saves lives and towns.", [p(0, { budget: -5 }), p(4, { welfare: 3 }), p(7, { growth: 0.3 })]),
    c("Emergency funds when needed", "Pay for damage, not prevention.", "Cheaper until the next November.", [p(3, { welfare: -2 }), p(6, { budget: -3 })]),
  ], "left"),
  ev("tra-r1", "transport", "Great works, privately built", "A consortium offers bridges and bypasses for tolls.", [
    c("Sign the concessions", "Private capital, public ribbon-cutting.", "Works begin fast; the tolls last thirty years.", [p(1, { growth: 0.6 }), p(0, { budget: -1 }), p(5, { welfare: -1 })]),
    c("Public tender instead", "The state builds and owns.", "Slower, dearer, and the asset stays Italian.", [p(0, { budget: -6 }), p(2, { debt: 3 }), p(6, { growth: 0.5 })]),
  ], "right"),
  ev("tra-r2", "transport", "Sell the airports", "Regional airports could be sold to local capital.", [
    c("Privatise them", "Cash and competition.", "Receipts booked; routes rationalised without mercy.", [p(0, { budget: 6 }), p(2, { debt: -3 }), p(4, { welfare: -1 }), p(4, { growth: 0.3 })]),
    c("Keep them public", "Territorial cohesion.", "Loss-making runways serve small provinces.", [p(1, { budget: -2 }), p(3, { welfare: 1 })]),
  ], "right"),
  ev("tra-r3", "transport", "Building amnesty", "Two hundred thousand illegal houses await a decision.", [
    c("Grant the amnesty", "Regularise for a fee.", "A wave of revenue and a wave of concrete on the coast.", [p(0, { budget: 7 }), p(2, { crime: 3 }), p(5, { welfare: -2 })]),
    c("Demolish the worst", "The law is the law.", "Bulldozers on television and a legal fight per house.", [p(0, { budget: -3 }), p(2, { crime: -2 }), p(1, { approval: -2 })]),
  ], "right"),

  // ── Agriculture ────────────────────────────────────────────────────────
  ev("agr-1", "agriculture", "New machinery for the co-ops", "Farms in the Po valley are working with equipment from the sixties.", [
    c("Subsidise modern equipment", "Grants for tractors and irrigation.", "The budget dips, the debt follows, then the harvests and the tax receipts come in.", [p(0, { budget: -5 }), p(2, { debt: 3 }), p(5, { growth: 0.5 }), p(8, { budget: 5 }), p(10, { debt: -3 })]),
    c("Cheap credit only", "Loans, not gifts.", "Modernisation at half speed and a fraction of the cost.", [p(0, { budget: -1 }), p(6, { growth: 0.2 })]),
  ]),
  ev("agr-2", "agriculture", "Brussels milk quotas", "Italian dairies have overshot the quota again and the fine is enormous.", [
    c("Pay the fine, enforce the quota", "Rules are rules.", "Farmers blockade the autostrada for three days.", [p(0, { budget: -4 }), p(1, { approval: -3 }), p(4, { growth: 0.1 })]),
    c("Negotiate and delay", "Fight it in Brussels.", "The fine grows while the lawyers argue.", [p(3, { budget: -3 }), p(1, { approval: 2 })]),
  ]),
  ev("agr-3", "agriculture", "Drought in the South", "Reservoirs are empty in Puglia and Basilicata.", [
    c("Emergency aqueduct works", "Fix the leaking network.", "Half the water was leaking; now it isn't.", [p(0, { budget: -4 }), p(4, { growth: 0.3 }), p(3, { welfare: 2 })]),
    c("Compensate the losses", "Cash for ruined crops.", "Farms survive the year unchanged.", [p(0, { budget: -3 }), p(2, { welfare: 1 })]),
  ]),
  ev("agr-4", "agriculture", "Food fraud", "Adulterated oil and wine are turning up in export markets.", [
    c("A protected-origin regime", "Inspectors, labels, prosecutions.", "Exports recover with a premium attached.", [p(0, { budget: -2 }), p(2, { crime: -2 }), p(5, { growth: 0.4 })]),
    c("Voluntary industry code", "Let producers self-certify.", "Cheap, and the next scandal arrives on schedule.", [p(3, { crime: 1 }), p(4, { growth: -0.2 })]),
  ]),
  ev("agr-l1", "agriculture", "Farm labour and the caporali", "Gangmasters control hiring in the tomato fields.", [
    c("Crack down and register labour", "Inspectors and legal contracts.", "Wages rise, the gangs shrink, some farms complain of costs.", [p(0, { budget: -2 }), p(2, { crime: -4 }), p(3, { welfare: 2 }), p(4, { growth: -0.1 })]),
    c("Leave it to the prefects", "A local matter.", "The system continues under a new name.", [p(3, { crime: 1.5 })]),
  ], "left"),
  ev("agr-l2", "agriculture", "Cooperative credit", "Small co-ops cannot borrow at reasonable rates.", [
    c("Public guarantee fund", "The state underwrites the co-ops.", "Credit flows to the fields; contingent risk to the treasury.", [p(0, { budget: -3 }), p(4, { growth: 0.4 }), p(6, { debt: 1 })]),
    c("Encourage bank mergers", "Bigger banks, better terms.", "Terms improve slightly and the branches close.", [p(4, { growth: 0.1 })]),
  ], "left"),
  ev("agr-l3", "agriculture", "Organic conversion", "Consumers abroad will pay more for certified produce.", [
    c("Fund conversion", "Five years of transition aid.", "Lean years followed by a premium market.", [p(0, { budget: -4 }), p(3, { growth: -0.1 }), p(7, { growth: 0.6 }), p(6, { welfare: 2 })]),
    c("Certification only", "Label what already exists.", "A cheap badge with a small effect.", [p(0, { budget: -1 }), p(5, { growth: 0.2 })]),
  ], "left"),
  ev("agr-r1", "agriculture", "Deregulate land sales", "Inheritance rules keep holdings uneconomically small.", [
    c("Liberalise the land market", "Let farms consolidate.", "Efficiency rises; villages empty.", [p(2, { growth: 0.5 }), p(4, { welfare: -2 }), p(3, { budget: 2 })]),
    c("Encourage voluntary pooling", "Consortia, not sales.", "Gentler and much slower.", [p(0, { budget: -1 }), p(5, { growth: 0.2 })]),
  ], "right"),
  ev("agr-r2", "agriculture", "Cut the fuel duty for farmers", "Agricultural diesel relief is the sector's oldest demand.", [
    c("Grant the relief", "Cheaper diesel for the fields.", "Costs fall on the farm and revenue falls in Rome.", [p(0, { budget: -5 }), p(3, { growth: 0.3 }), p(5, { debt: 2 })]),
    c("Offer machinery tax credits", "Relief tied to investment.", "Better targeted, less popular.", [p(0, { budget: -2 }), p(4, { growth: 0.4 })]),
  ], "right"),
  ev("agr-r3", "agriculture", "Hunting and the countryside", "A bill would extend the season and widen licences.", [
    c("Pass the hunters' bill", "A constituency repaid.", "Rural votes secured; environmentalists call a referendum.", [p(1, { approval: 2 }), p(3, { welfare: -1 })]),
    c("Tighten protection instead", "Fewer species, shorter season.", "Conservationists pleased, shotguns idle and vocal.", [p(1, { approval: -1 }), p(3, { welfare: 1 })]),
  ], "right"),
];
