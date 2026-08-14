import { ElectionDiagram } from "@/components/game/ElectionDiagram";
import { PARTY_MAP, type PartyId } from "@/lib/game/data";
import { rows1992 } from "@/lib/game/polling";

export function Election1992({ party, onStart }: { party: PartyId; onStart: () => void }) {
  const p = PARTY_MAP[party];
  const rows = rows1992().map((r) => ({ ...r, mine: r.id === party }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="text-center">
        <div className="masthead-rule mx-auto h-1.5 w-40" aria-hidden />
        <p className="label-caps mt-4 text-muted-foreground">
          5–6 April 1992 · Chamber of Deputies
        </p>
        <h1 className="mt-2 text-4xl leading-[0.95] sm:text-5xl">The last First Republic vote</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
          Democrazia Cristiana falls under 30% for the first time in its history, the Lega arrives in
          Rome with fifty-five deputies, and the four-party coalition keeps its majority by eight
          seats. Two months later Falcone is killed and the arrests begin.
        </p>
      </header>

      <section className="card-paper mt-8 p-5 sm:p-7">
        <h2 className="rule-top label-caps pt-2 text-muted-foreground">The result</h2>
        <div className="mt-4">
          <ElectionDiagram rows={rows} />
        </div>
        {party === "fi" ? (
          <p className="rule-top mt-5 pt-3 text-sm text-foreground/85">
            Forza Italia does not exist. There is no list, no symbol and no poll figure — until you
            put your face on a videotape and deliver it to every newsroom in Italy.
          </p>
        ) : (
          <p className="rule-top mt-5 pt-3 text-sm text-foreground/85">
            You take over {p.name} on <strong>{rows.find((r) => r.mine)?.share.toFixed(1)}%</strong>{" "}
            and {rows.find((r) => r.mine)?.seats} seats. Where it goes from here is your business.
          </p>
        )}
      </section>

      <div className="mt-8 text-center">
        <button
          onClick={onStart}
          className="font-display border border-ink bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-ink"
        >
          Begin the campaign
        </button>
      </div>
    </div>
  );
}
