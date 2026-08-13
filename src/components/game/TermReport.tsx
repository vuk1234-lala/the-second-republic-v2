import { CountryTab } from "@/components/game/CountryTab";
import { START_COUNTRY } from "@/lib/game/country";
import { PARTY_MAP } from "@/lib/game/data";
import { MINISTRIES } from "@/lib/game/government";
import { termVerdict, type GovState } from "@/lib/game/governing";

export function TermReport({ gov, onRestart }: { gov: GovState; onRestart: () => void }) {
  const party = PARTY_MAP[gov.party];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="text-center">
        <div className="masthead-rule mx-auto h-1.5 w-40" aria-hidden />
        <p className="label-caps mt-4 text-muted-foreground">June 1994 – May 1999 · End of the legislature</p>
        <h1 className="mt-2 text-4xl leading-[0.95] sm:text-5xl">Five years of {party.short}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed">{termVerdict(gov.stats)}</p>
      </header>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <CountryTab stats={gov.stats} previous={START_COUNTRY} />
        <section className="card-paper p-4">
          <h3 className="rule-top label-caps pt-2 text-muted-foreground">The cabinet that governed</h3>
          <ul className="mt-3 divide-y divide-border text-sm">
            {MINISTRIES.map((m) => {
              const holder = PARTY_MAP[gov.cabinet[m.key] ?? gov.party];
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
      </div>

      <section className="card-paper mt-6 p-5">
        <h2 className="rule-top label-caps pt-2 text-muted-foreground">Acts of the legislature</h2>
        <ol className="mt-3 divide-y divide-border text-sm">
          {gov.log
            .slice()
            .reverse()
            .map((d, i) => (
              <li key={`${d.date}-${i}`} className="py-2">
                <p className="label-caps text-primary">{d.date}</p>
                <p className="font-display leading-snug font-semibold">{d.headline}</p>
                <p className="text-foreground/80">{d.decision}</p>
              </li>
            ))}
        </ol>
      </section>

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
