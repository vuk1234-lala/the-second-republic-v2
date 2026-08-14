import { campaignMonth, type GameState } from "@/lib/game/engine";
import { MOMENTS, monthLabelFor } from "@/lib/game/identity";
import { MARGIN_OF_ERROR, metaFor, pollsFor, type Poll } from "@/lib/game/polling";

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="label-caps text-muted-foreground">new</span>;
  if (Math.abs(value) < 0.3) return <span className="label-caps text-muted-foreground">=</span>;
  const up = value > 0;
  return (
    <span className={`label-caps ${up ? "text-tricolor-green" : "text-tricolor-red"}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}
    </span>
  );
}

function PollCard({
  poll,
  state,
  latest,
}: {
  poll: Poll;
  state: GameState;
  latest: boolean;
}) {
  const max = Math.max(...poll.rows.map((r) => r.value));
  return (
    <section className="card-paper p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="rule-top label-caps pt-2 text-muted-foreground">
          {poll.pollster} · {poll.date}
        </h3>
        <span className="label-caps text-muted-foreground">
          {latest ? "Latest poll" : "Archive"} · ±{MARGIN_OF_ERROR}%
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {poll.rows.map((row) => {
          const meta = metaFor(row.id, {
            player: state.party,
            flags: state.flags,
            month: poll.month,
          });
          const mine = row.id === state.party;
          return (
            <li key={row.id}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className={`flex items-center gap-2 ${mine ? "font-display font-semibold" : ""}`}>
                  <span
                    className="inline-block h-3 w-3 shrink-0"
                    style={{ backgroundColor: meta.color }}
                    aria-hidden
                  />
                  {meta.short}
                </span>
                <span className="flex items-baseline gap-3">
                  <Delta value={row.delta} />
                  <span className="font-display tabular-nums">{row.value.toFixed(1)}%</span>
                </span>
              </div>
              <div className="mt-1 h-2 w-full border border-border bg-secondary">
                <div
                  className="h-full transition-[width] duration-500"
                  style={{ width: `${(row.value / max) * 100}%`, backgroundColor: meta.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PollsTab({ state }: { state: GameState }) {
  const month = campaignMonth(state);
  const polls = pollsFor(state, month).slice().reverse();
  const nextPoll = polls[0] ? polls[0].month + 3 : MOMENTS.start;

  return (
    <div className="space-y-5">
      <section className="card-paper p-5">
        <h2 className="rule-top label-caps pt-2 text-muted-foreground">Voting intention</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">
          National surveys are published every three months, with a stated margin of error of ±
          {MARGIN_OF_ERROR}%. They are an estimate of how Italians say they would vote today —
          nothing more.
        </p>
        {nextPoll <= MOMENTS.election && (
          <p className="label-caps mt-3 text-muted-foreground">
            Next survey in the field: {monthLabelFor(nextPoll)}
          </p>
        )}
      </section>

      {polls.map((poll, i) => (
        <PollCard key={poll.month} poll={poll} state={state} latest={i === 0} />
      ))}
    </div>
  );
}
