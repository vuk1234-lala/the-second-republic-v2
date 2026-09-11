import {
  axisLabel,
  axisMultiplier,
  campaignMultiplier,
  dinosaurLabel,
  freshnessMultiplier,
  hqProfile,
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
  const profile = hqProfile(state.party, state.flags);
  const poll = internalPoll(hq, state.turn, profile.internal.houses);
  const axisPos = (hq.axis + 100) / 2;

  return (
    <div className="space-y-6">
      <section className="card-paper p-5">
        <h3 className="rule-top label-caps pt-2 text-muted-foreground">{profile.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">{profile.blurb}</p>

        <div className="mt-5 space-y-5">
          <div>
            <Bar
              value={hq.mediaset}
              label={profile.media.label}
              note={`${mediasetLabel(hq.mediaset, profile.media.labels)} · ${pct(mediasetMultiplier(hq))}`}
            />
            <p className="mt-1 text-sm text-muted-foreground">{profile.media.note}</p>
          </div>

          <div>
            <Bar
              value={hq.dinosaurs}
              label={profile.dino.label}
              note={`${dinosaurLabel(hq.dinosaurs, profile.dino.labels)} · freshness ${pct(freshnessMultiplier(hq))}`}
            />
            <p className="mt-1 text-sm text-muted-foreground">{profile.dino.note}</p>
          </div>

          <div>
            <Bar
              value={axisPos}
              label={profile.axis.label}
              note={`${axisLabel(hq.axis, profile.axis.labels)} · ${pct(axisMultiplier(hq))}`}
            />
            <p className="mt-1 text-sm text-muted-foreground">{profile.axis.note}</p>
          </div>
        </div>
      </section>

      <section className="card-paper p-5">
        <h3 className="rule-top label-caps pt-2 text-muted-foreground">
          {profile.internal.title}
        </h3>
        <p className="font-display mt-3 text-5xl leading-none tabular-nums">
          {poll.value.toFixed(1)}%
        </p>
        <p className="label-caps mt-2 text-muted-foreground">
          {poll.house} · ±{poll.margin.toFixed(1)} points
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{profile.internal.note}</p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          {poll.tight
            ? "A proper sample, properly weighted. This one you can believe."
            : "Six hundred telephone calls in two evenings. Treat the figure as a mood, not a number."}
        </p>
        <p className="mt-3 border-l-2 border-border pl-4 text-sm text-muted-foreground">
          Campaign multiplier as things stand: {pct(campaignMultiplier(hq))}.
        </p>
      </section>
    </div>
  );
}
