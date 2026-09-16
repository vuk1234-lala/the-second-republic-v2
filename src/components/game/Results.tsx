import { useState } from "react";
import { ElectionDiagram } from "@/components/game/ElectionDiagram";
import { ElectionNight } from "@/components/game/ElectionNight";
import { NewsFeed } from "@/components/game/NewsFeed";
import { MOMENTS } from "@/lib/game/identity";
import { metaFor, POLL_META, seatsFromShares, type DiagramRow } from "@/lib/game/polling";
import { METRICS, type ElectionResult, type GameState } from "@/lib/game/engine";
import { MINISTRIES, type Cabinet } from "@/lib/game/government";

export function Results({
  state,
  result,
  cabinet,
  onGovern,
  onRestart,
}: {
  state: GameState;
  result: ElectionResult;
  cabinet?: Cabinet;
  onGovern?: (() => void) | undefined;
  onRestart: () => void;
}) {
  const ctx = { player: state.party, flags: state.flags, month: MOMENTS.election };
  const party = metaFor(state.party, ctx);
  const diagram: DiagramRow[] = result.rows.map((row) => {
    const meta = metaFor(row.id, ctx);
    return {
      id: row.id,
      order: meta.order,
      name: meta.name,
      short: meta.short,
      color: meta.color,
      share: row.share,
      seats: row.seats,
      mine: row.id === state.party,
      ally: row.ally,
    };
  });

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
        <div className="mt-4">
          <ElectionDiagram rows={diagram} />
        </div>
        <p className="rule-top mt-5 pt-3 text-sm text-foreground/85">
          {party.short} took <strong>{result.playerShare.toFixed(1)}%</strong>. Your bloc holds{" "}
          <strong>{result.coalitionSeats}</strong> of 630 seats ({result.coalitionShare.toFixed(1)}%
          of the vote) — 316 are needed to govern.
        </p>
      </section>

      <section className="card-paper mt-6 p-5">
        <h2 className="rule-top label-caps pt-2 text-muted-foreground">Final standing</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.key}>
              <dt className="label-caps text-muted-foreground">{m.label}</dt>
              <dd className="font-display text-2xl tabular-nums">{state[m.key]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {cabinet && (
        <section className="card-paper mt-6 p-5">
          <h2 className="rule-top label-caps pt-2 text-muted-foreground">The cabinet</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {MINISTRIES.map((m) => {
              const holder = metaFor(cabinet[m.key]!, ctx);
              return (
                <li key={m.key} className="flex items-center justify-between gap-3 py-2">
                  <span>{m.label}</span>
                  <span className="label-caps flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3"
                      style={{ backgroundColor: holder.color }}
                      aria-hidden
                    />
                    {holder.short}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <NewsFeed state={state} className="mt-6" />


      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center">
        {result.government && onGovern && (
          <button
            onClick={onGovern}
            className="font-display border border-ink bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary"
          >
            Take office
          </button>
        )}
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
