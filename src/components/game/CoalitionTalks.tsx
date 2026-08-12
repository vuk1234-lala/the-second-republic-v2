import { PARTY_MAP } from "@/lib/game/data";
import type { PartyId } from "@/lib/game/data";
import type { ElectionResult, GameState } from "@/lib/game/engine";
import { partnerOffers } from "@/lib/game/government";

export function CoalitionTalks({
  state,
  projection,
  picked,
  onToggle,
  onConfirm,
}: {
  state: GameState;
  projection: ElectionResult;
  picked: PartyId[];
  onToggle: (id: PartyId) => void;
  onConfirm: () => void;
}) {
  const me = PARTY_MAP[state.party];
  const mySeats = projection.rows.find((r) => r.id === state.party)!.seats;
  const offers = partnerOffers(state, projection, picked);
  const seats = mySeats + picked.reduce((a, id) => a + (projection.rows.find((r) => r.id === id)?.seats ?? 0), 0);
  const majority = seats >= 316;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="text-center">
        <div className="masthead-rule mx-auto h-1.5 w-40" aria-hidden />
        <p className="label-caps mt-4 text-muted-foreground">
          29 March 1994 · Consultations at the Quirinale
        </p>
        <h1 className="mt-2 text-4xl leading-[0.95] sm:text-5xl">Who will you govern with?</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed">
          {me.short} returns {mySeats} deputies. A government needs 316 of 630. Each partner brings
          seats — and a bill to be paid in ministries.
        </p>
      </header>

      <section className="card-paper mt-8 p-5 sm:p-7">
        <h2 className="rule-top label-caps pt-2 text-muted-foreground">Possible partners</h2>
        <ul className="mt-4 space-y-3">
          {offers.map((o) => {
            const p = PARTY_MAP[o.id];
            const on = picked.includes(o.id);
            return (
              <li key={o.id}>
                <button
                  disabled={!o.available && !on}
                  onClick={() => onToggle(o.id)}
                  className={`flex w-full items-center justify-between gap-3 border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    on ? "border-ink bg-secondary" : "border-border bg-background hover:border-ink"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="inline-block h-6 w-1.5"
                      style={{ backgroundColor: p.color }}
                      aria-hidden
                    />
                    <span>
                      <span className="font-display block text-base font-semibold">
                        {p.short} — {p.name}
                      </span>
                      <span className="mt-0.5 block text-sm text-foreground/80">{o.reason}</span>
                    </span>
                  </span>
                  <span className="font-display shrink-0 text-right text-sm tabular-nums">
                    {o.seats} seats
                    <span className="label-caps block text-muted-foreground">
                      {on ? "In government" : "Out"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="rule-top mt-5 flex flex-wrap items-center justify-between gap-3 pt-3">
          <p className="text-sm">
            Bloc: <strong className="tabular-nums">{seats}</strong> of 630 ·{" "}
            {majority ? "majority secured" : `${316 - seats} short`} · {picked.length} partner
            {picked.length === 1 ? "" : "s"}
          </p>
          <button
            onClick={onConfirm}
            className="font-display border border-ink bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-ink"
          >
            Open cabinet talks
          </button>
        </div>
      </section>
    </div>
  );
}
