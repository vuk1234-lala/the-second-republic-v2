import { PARTIES, type Party, type PartyId } from "@/lib/game/data";
import { POLL_META } from "@/lib/game/polling";

function Difficulty({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="label-caps text-muted-foreground">
      {["Favoured", "Contested", "Uphill"][level - 1]}
    </span>
  );
}

function PartyCard({ party, onPick }: { party: Party; onPick: (id: PartyId) => void }) {
  return (
    <button
      onClick={() => onPick(party.id)}
      className="card-paper group relative flex w-full flex-col gap-3 p-5 text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: party.color }}
        aria-hidden
      />
      <div className="flex items-baseline justify-between gap-3 pt-1">
        <div>
          <h3 className="text-xl leading-tight">{party.name}</h3>
          <p className="label-caps mt-1 text-muted-foreground">
            {party.short} · {party.leader}
          </p>
        </div>
        <span className="font-display text-right text-2xl tabular-nums">
        {POLL_META[party.id].r1992 > 0 ? `${POLL_META[party.id].r1992}%` : "new"}
        <span className="label-caps block text-muted-foreground">in 1992</span>
      </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/85">{party.blurb}</p>
      <dl className="mt-1 space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="label-caps w-20 shrink-0 text-accent">Strength</dt>
          <dd>{party.strengths}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="label-caps w-20 shrink-0 text-primary">Weakness</dt>
          <dd>{party.weakness}</dd>
        </div>
      </dl>
      <div className="rule-top flex items-center justify-between pt-2">
        <Difficulty level={party.difficulty} />
        <span className="label-caps text-foreground group-hover:text-primary">Take the leadership →</span>
      </div>
    </button>
  );
}

export function PartySelect({ onPick }: { onPick: (id: PartyId) => void }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="text-center">
        <div className="masthead-rule mx-auto h-1.5 w-40" aria-hidden />
        <p className="label-caps mt-4 text-muted-foreground">Italy · 1992–1994</p>
        <h1 className="mt-2 text-4xl leading-[0.95] sm:text-6xl">The Second Republic</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
          The First Republic is collapsing under Tangentopoli. Parties that ruled for fifty years
          are dissolving, the lira is falling, and a new electoral law will decide everything.
          Choose whose hands you take, then govern twelve months to the vote of 27 March 1994.
        </p>
      </header>

      <h2 className="rule-top label-caps mt-10 pt-3 text-muted-foreground">Choose your party</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {PARTIES.map((party) => (
          <PartyCard key={party.id} party={party} onPick={onPick} />
        ))}
      </div>
    </section>
  );
}
