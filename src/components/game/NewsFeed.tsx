import { PARTY_MAP } from "@/lib/game/data";
import { eventsFor, type GameState } from "@/lib/game/engine";

export interface Dispatch {
  date: string;
  headline: string;
  decision: string;
}

/** Turns the player's record of choices into dated press dispatches. */
export function dispatchesFor(state: GameState): Dispatch[] {
  const events = eventsFor(state.party);
  return state.log.map((decision, i) => ({
    date: events[i]?.date ?? "",
    headline: events[i]?.headline ?? "",
    decision,
  }));
}

function edition(date: string, index: number) {
  return `${date} · Edition ${index + 1}`;
}

export function NewsFeed({
  state,
  limit,
  className = "",
}: {
  state: GameState;
  limit?: number;
  className?: string;
}) {
  const party = PARTY_MAP[state.party];
  const all = dispatchesFor(state);
  if (all.length === 0) return null;

  const items = (limit ? all.slice(-limit) : all).slice().reverse();

  return (
    <section className={`card-paper p-4 sm:p-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="rule-top label-caps pt-2 text-muted-foreground">Il Corriere della Sera</h3>
        <span className="label-caps text-muted-foreground">{all.length} dispatches</span>
      </div>
      <div className="masthead-rule mt-2 h-1 w-full" aria-hidden />

      <ol className="mt-4 divide-y divide-border">
        {items.map((d, i) => {
          const number = all.length - 1 - i;
          return (
            <li key={`${d.decision}-${number}`} className="py-3 first:pt-0 last:pb-0">
              <p className="label-caps text-primary">{edition(d.date, number)}</p>
              <p className="font-display mt-1 text-base leading-snug font-semibold">{d.headline}</p>
              <p className="mt-1 flex gap-2 text-sm leading-snug text-foreground/80">
                <span
                  className="mt-1.5 inline-block h-2 w-2 shrink-0"
                  style={{ backgroundColor: party.color }}
                  aria-hidden
                />
                <span>
                  <span className="label-caps mr-1 text-muted-foreground">{party.short}:</span>
                  {d.decision}
                </span>
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
