import { PARTY_MAP } from "@/lib/game/data";
import type { ElectionResult, GameState } from "@/lib/game/engine";
import { MINISTRIES, fillCabinet, leverage } from "@/lib/game/government";

export function CabinetTalks({
  state,
  result,
  claimed,
  onToggle,
  onConfirm,
}: {
  state: GameState;
  result: ElectionResult;
  claimed: string[];
  onToggle: (key: string) => void;
  onConfirm: () => void;
}) {
  const me = PARTY_MAP[state.party];
  const lev = leverage(state, result);
  const spent = MINISTRIES.filter((m) => claimed.includes(m.key)).reduce((a, m) => a + m.cost, 0);
  const left = lev.points - spent;
  const cabinet = fillCabinet(state, result, claimed);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="text-center">
        <div className="masthead-rule mx-auto h-1.5 w-40" aria-hidden />
        <p className="label-caps mt-4 text-muted-foreground">Forming the cabinet</p>
        <h1 className="mt-2 text-4xl leading-[0.95] sm:text-5xl">The share-out of offices</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed">
          {me.short} bargains from a position worth{" "}
          <strong className="tabular-nums">{lev.points}</strong> in political weight. Claim the
          ministries you can carry; the rest go to your partners.
        </p>
      </header>

      <section className="card-paper mt-8 p-5 sm:p-7">
        <div className="rule-top flex items-baseline justify-between pt-2">
          <h2 className="label-caps text-muted-foreground">The nine offices</h2>
          <p className="font-display text-sm tabular-nums">{left} weight remaining</p>
        </div>
        <ul className="mt-4 space-y-3">
          {MINISTRIES.map((m) => {
            const mine = claimed.includes(m.key);
            const holder = finalIdentity(cabinet[m.key]!, state.party, state.flags);
            const affordable = mine || m.cost <= left;
            return (
              <li key={m.key}>
                <button
                  disabled={!affordable}
                  onClick={() => onToggle(m.key)}
                  className={`flex w-full items-center justify-between gap-3 border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    mine ? "border-ink bg-secondary" : "border-border bg-background hover:border-ink"
                  }`}
                >
                  <span>
                    <span className="font-display block text-base font-semibold">{m.label}</span>
                    <span className="mt-0.5 block text-sm text-foreground/80">{m.note}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="font-display block text-sm tabular-nums">
                      cost {m.cost}
                    </span>
                    <span className="label-caps block" style={{ color: holder.color }}>
                      {holder.short}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="rule-top mt-5 pt-3 text-sm text-foreground/85">
          Weight comes from your share of the bloc ({lev.seatWeight}), warmth towards partners (
          {lev.relationBonus >= 0 ? "+" : ""}
          {lev.relationBonus}), the number of partners (−{lev.partnerPenalty})
          {lev.majorityBonus ? ` and a working majority (+${lev.majorityBonus})` : ""}.
        </p>

        <button
          onClick={onConfirm}
          className="font-display mt-5 border border-ink bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-ink"
        >
          Present the government
        </button>
      </section>
    </div>
  );
}
