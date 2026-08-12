import { useState } from "react";

import { NewsFeed } from "@/components/game/NewsFeed";
import { PARTIES, PARTY_MAP, type Choice } from "@/lib/game/data";
import { METRICS, eventsFor, type GameState } from "@/lib/game/engine";

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="label-caps text-muted-foreground">{label}</span>
        <span className="font-display text-sm tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full border border-border bg-secondary">
        <div
          className="h-full bg-ink transition-[width] duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function relationLabel(v: number) {
  if (v >= 45) return "Allied";
  if (v >= 20) return "Friendly";
  if (v > -25) return "Neutral";
  if (v > -60) return "Cold";
  return "Hostile";
}

export function GameBoard({
  state,
  onChoose,
}: {
  state: GameState;
  onChoose: (choice: Choice) => void;
}) {
  const [pending, setPending] = useState<Choice | null>(null);
  const party = PARTY_MAP[state.party];
  const events = eventsFor(state.party);
  const event = events[state.turn]!;

  const confirm = () => {
    if (!pending) return;
    const choice = pending;
    setPending(null);
    onChoose(choice);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="rule-top flex flex-wrap items-end justify-between gap-3 pt-3">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1.5" style={{ backgroundColor: party.color }} aria-hidden />
          <div>
            <h1 className="text-2xl leading-none">{party.name}</h1>
            <p className="label-caps mt-1 text-muted-foreground">{party.leader}</p>
          </div>
        </div>
        <p className="label-caps text-muted-foreground">
          Turn {state.turn + 1} of {events.length} · {event.date}
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
        <article className="card-paper p-5 sm:p-7">
          <p className="label-caps text-primary">{event.date}</p>
          <h2 className="mt-2 text-3xl leading-[1.05] sm:text-4xl">{event.headline}</h2>
          <p className="mt-4 border-l-2 border-border pl-4 text-base leading-relaxed text-foreground/85">
            {event.body}
          </p>

          {pending ? (
            <div className="mt-6">
              <div className="border border-ink bg-secondary p-4">
                <p className="label-caps text-muted-foreground">You decided</p>
                <p className="font-display mt-1 text-base font-semibold">{pending.label}</p>
                <p className="mt-3 border-l-2 border-ink pl-4 text-base leading-relaxed">
                  {pending.feedback}
                </p>
              </div>
              <button
                onClick={confirm}
                className="font-display mt-4 border border-ink bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {event.choices.map((choice) => (
                <button
                  key={choice.label}
                  onClick={() => setPending(choice)}
                  className="group w-full border border-border bg-background p-4 text-left transition-colors hover:border-ink hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-display block text-base font-semibold">{choice.label}</span>
                  <span className="mt-0.5 block text-sm text-foreground/80">{choice.detail}</span>
                </button>
              ))}
            </div>
          )}
        </article>

        <aside className="space-y-6">
          <section className="card-paper p-4">
            <h3 className="rule-top label-caps pt-2 text-muted-foreground">The state of play</h3>
            <div className="mt-3 space-y-3">
              {METRICS.map((m) => (
                <Meter key={m.key} label={m.label} value={state[m.key]} />
              ))}
            </div>
          </section>

          <section className="card-paper p-4">
            <h3 className="rule-top label-caps pt-2 text-muted-foreground">Other parties</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {PARTIES.filter((p) => p.id !== state.party).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3"
                      style={{ backgroundColor: p.color }}
                      aria-hidden
                    />
                    {p.short}
                  </span>
                  <span className="label-caps text-muted-foreground">
                    {relationLabel(state.relations[p.id])}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <NewsFeed state={state} limit={4} />
        </aside>
      </div>
    </div>
  );
}
