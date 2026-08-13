import { useState } from "react";

import { CountryTab } from "@/components/game/CountryTab";
import { PARTY_MAP } from "@/lib/game/data";
import type { GovChoice } from "@/lib/game/govevents";
import { MINISTRIES } from "@/lib/game/government";
import { governEvent, monthLabel, TERM_MONTHS, type GovState } from "@/lib/game/governing";

type Tab = "desk" | "country";

export function GovernBoard({
  gov,
  onChoose,
}: {
  gov: GovState;
  onChoose: (choice: GovChoice) => void;
}) {
  const [tab, setTab] = useState<Tab>("desk");
  const [pending, setPending] = useState<GovChoice | null>(null);
  const party = PARTY_MAP[gov.party];
  const event = governEvent(gov)!;
  const ministry = MINISTRIES.find((m) => m.key === event.ministry)!;
  const holder = PARTY_MAP[gov.cabinet[event.ministry] ?? gov.party];

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
            <h1 className="text-2xl leading-none">{party.name} in government</h1>
            <p className="label-caps mt-1 text-muted-foreground">{party.leader}</p>
          </div>
        </div>
        <p className="label-caps text-muted-foreground">
          Month {gov.turn + 1} of {TERM_MONTHS} · {monthLabel(gov.turn)}
        </p>
      </header>

      <div className="mt-4 flex gap-2 lg:hidden">
        {(["desk", "country"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-display border border-ink px-4 py-2 text-xs font-semibold uppercase tracking-widest ${
              tab === t ? "bg-ink text-primary-foreground" : "bg-background"
            }`}
          >
            {t === "desk" ? "The desk" : "The country"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <article className={`card-paper p-5 sm:p-7 ${tab === "desk" ? "" : "hidden lg:block"}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="label-caps text-primary">{ministry.label}</p>
            <p className="label-caps flex items-center gap-2 text-muted-foreground">
              held by
              <span
                className="inline-block h-3 w-3"
                style={{ backgroundColor: holder.color }}
                aria-hidden
              />
              {holder.short}
            </p>
          </div>
          <h2 className="mt-2 text-3xl leading-[1.05] sm:text-4xl">{event.headline}</h2>
          <p className="mt-4 border-l-2 border-border pl-4 text-base leading-relaxed text-foreground/85">
            {event.body}
          </p>

          {pending ? (
            <div className="mt-6">
              <div className="border border-ink bg-secondary p-4">
                <p className="label-caps text-muted-foreground">The council decided</p>
                <p className="font-display mt-1 text-base font-semibold">{pending.label}</p>
                <p className="mt-3 border-l-2 border-ink pl-4 text-base leading-relaxed">
                  {pending.feedback}
                </p>
              </div>
              <button
                onClick={confirm}
                className="font-display mt-4 border border-ink bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-ink"
              >
                Next month
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {event.choices.map((choice) => (
                <button
                  key={choice.label}
                  onClick={() => setPending(choice)}
                  className="w-full border border-border bg-background p-4 text-left transition-colors hover:border-ink hover:bg-secondary"
                >
                  <span className="font-display block text-base font-semibold">{choice.label}</span>
                  <span className="mt-0.5 block text-sm text-foreground/80">{choice.detail}</span>
                </button>
              ))}
            </div>
          )}
        </article>

        <aside className={`space-y-6 ${tab === "country" ? "" : "hidden lg:block"}`}>
          <CountryTab stats={gov.stats} previous={gov.previous} />

          {gov.log.length > 0 && (
            <section className="card-paper p-4">
              <h3 className="rule-top label-caps pt-2 text-muted-foreground">Recent measures</h3>
              <ol className="mt-3 divide-y divide-border text-sm">
                {gov.log
                  .slice(-4)
                  .reverse()
                  .map((d, i) => (
                    <li key={`${d.date}-${i}`} className="py-2">
                      <p className="label-caps text-muted-foreground">{d.date}</p>
                      <p className="font-display leading-snug font-semibold">{d.decision}</p>
                    </li>
                  ))}
              </ol>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
