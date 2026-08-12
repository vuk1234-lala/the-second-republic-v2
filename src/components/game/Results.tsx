import { NewsFeed } from "@/components/game/NewsFeed";
import { PARTY_MAP } from "@/lib/game/data";
import { METRICS, type ElectionResult, type GameState } from "@/lib/game/engine";
import { MINISTRIES, type Cabinet } from "@/lib/game/government";

export function Results({
  state,
  result,
  cabinet,
  onRestart,
}: {
  state: GameState;
  result: ElectionResult;
  cabinet?: Cabinet;
  onRestart: () => void;
}) {
  const party = PARTY_MAP[state.party];
  const max = Math.max(...result.rows.map((r) => r.share));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="text-center">
        <div className="masthead-rule mx-auto h-1.5 w-40" aria-hidden />
        <p className="label-caps mt-4 text-muted-foreground">27–28 March 1994 · Chamber of Deputies</p>
        <h1 className="mt-2 text-4xl leading-[0.95] sm:text-5xl">
          {result.government ? "A government is formed" : "No majority for you"}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed">{result.verdict}</p>
      </header>

      <section className="card-paper mt-8 p-5 sm:p-7">
        <h2 className="rule-top label-caps pt-2 text-muted-foreground">The result</h2>
        <ul className="mt-4 space-y-3">
          {result.rows.map((row) => {
            const p = PARTY_MAP[row.id];
            const mine = row.id === state.party;
            return (
              <li key={row.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className={mine ? "font-display font-semibold" : ""}>
                    {p.short} — {p.name}
                    {row.ally && !mine && (
                      <span className="label-caps ml-2 text-accent">coalition</span>
                    )}
                  </span>
                  <span className="font-display tabular-nums">
                    {row.share.toFixed(1)}% · {row.seats} seats
                  </span>
                </div>
                <div className="mt-1 h-3 w-full border border-border bg-secondary">
                  <div
                    className="h-full transition-[width] duration-700"
                    style={{ width: `${(row.share / max) * 100}%`, backgroundColor: p.color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="rule-top mt-5 pt-3 text-sm text-foreground/85">
          {party.short} took <strong>{result.playerShare.toFixed(1)}%</strong>. Your bloc holds{" "}
          <strong>{result.coalitionSeats}</strong> of 630 seats ({result.coalitionShare.toFixed(1)}%
          of the vote) — 316 are needed to govern.
        </p>
      </section>

      <section className="card-paper mt-6 p-5">
        <h2 className="rule-top label-caps pt-2 text-muted-foreground">Final standing</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {METRICS.map((m) => (
            <div key={m.key}>
              <dt className="label-caps text-muted-foreground">{m.label}</dt>
              <dd className="font-display text-2xl tabular-nums">{state[m.key]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <NewsFeed state={state} className="mt-6" />


      <div className="mt-8 text-center">
        <button
          onClick={onRestart}
          className="font-display border border-ink bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-ink"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
