import {
  axisLabel,
  axisMultiplier,
  campaignMultiplier,
  dinosaurLabel,
  freshnessMultiplier,
  internalPoll,
  mediasetLabel,
  mediasetMultiplier,
  type HqState,
} from "@/lib/game/hq";
import type { GameState } from "@/lib/game/engine";

function Bar({ value, label, note }: { value: number; label: string; note: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="label-caps text-muted-foreground">{label}</span>
        <span className="font-display text-sm font-semibold">{note}</span>
      </div>
      <div className="mt-1 h-2 w-full border border-border bg-secondary">
        <div
          className="h-full bg-ink transition-[width] duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function pct(mult: number) {
  return `x${mult.toFixed(2)}`;
}

export function HeadquartersTab({ state }: { state: GameState }) {
  const hq: HqState = state.hq;
  const poll = internalPoll(hq, state.turn);
  const axisPos = (hq.axis + 100) / 2;

  return (
    <div className="space-y-6">
      <section className="card-paper p-5">
        <h3 className="rule-top label-caps pt-2 text-muted-foreground">Milano 2 · Headquarters</h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          Nothing here is published. It is the state of the machine that will fight the campaign
          once — and if — you decide to enter the field.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <Bar
              value={hq.mediaset}
              label="Mediaset wealth"
              note={`${mediasetLabel(hq.mediaset)} · ${pct(mediasetMultiplier(hq))}`}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              The reach and the cash of the empire. It multiplies everything a campaign choice can
              win you, from x1.00 to x3.00.
            </p>
          </div>

          <div>
            <Bar
              value={hq.dinosaurs}
              label="Relations with the dinosaurs"
              note={`${dinosaurLabel(hq.dinosaurs)} · freshness ${pct(freshnessMultiplier(hq))}`}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              The notables of the old republic open doors and licences — but past “Warm” the fresh
              face starts to look like an old one.
            </p>
          </div>

          <div>
            <Bar
              value={axisPos}
              label="Liberalism ↔ Conservatism"
              note={`${axisLabel(hq.axis)} · ${pct(axisMultiplier(hq))}`}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Liberalism warms the moderates and the old guard and keeps the donors writing cheques,
              but costs up to 30% of your campaigning bite. Conservatism eats into the MSI and the
              Lega and adds 10% of populist lift, and frightens the money away.
            </p>
          </div>
        </div>
      </section>

      <section className="card-paper p-5">
        <h3 className="rule-top label-caps pt-2 text-muted-foreground">
          Support for “an alternative”
        </h3>
        <p className="font-display mt-3 text-5xl leading-none tabular-nums">
          {poll.value.toFixed(1)}%
        </p>
        <p className="label-caps mt-2 text-muted-foreground">
          {poll.house} · ±{poll.margin.toFixed(1)} points
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          {poll.tight
            ? "A proper sample, properly weighted. This one you can believe."
            : "Six hundred telephone calls in two evenings. Treat the figure as a mood, not a number."}
        </p>
        <p className="mt-3 border-l-2 border-border pl-4 text-sm text-muted-foreground">
          Campaign multiplier if you go tomorrow: {pct(campaignMultiplier(hq))}.
        </p>
      </section>
    </div>
  );
}
