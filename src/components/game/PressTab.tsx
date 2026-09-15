import type { Front } from "@/lib/game/press";
import type { GovState } from "@/lib/game/governing";

function mastheadClass(face: Front["face"]) {
  if (face === "block") return "font-display text-3xl font-extrabold uppercase tracking-tight";
  if (face === "roman") return "font-serif text-3xl font-semibold italic tracking-tight";
  return "font-serif text-3xl font-semibold tracking-[0.02em]";
}

function toneNote(tone: Front["tone"]) {
  if (tone === "praise") return "In praise";
  if (tone === "attack") return "Against";
  return "Reported";
}

function FrontPage({ front }: { front: Front }) {
  return (
    <article
      className="card-paper relative overflow-hidden p-4 sm:p-5"
      style={{ borderTopWidth: 4, borderTopColor: front.tint }}
    >
      <header className="border-b-2 border-ink pb-2 text-center">
        <h4 className={mastheadClass(front.face)} style={{ color: front.tint }}>
          {front.name}
        </h4>
        <p className="label-caps mt-1 text-[0.6rem] text-muted-foreground">{front.motto}</p>
      </header>

      <div className="mt-2 flex items-baseline justify-between gap-2 border-b border-border pb-2">
        <span className="label-caps text-[0.6rem] text-muted-foreground">{front.kicker}</span>
        <span className="label-caps text-[0.6rem] text-primary">{toneNote(front.tone)}</span>
      </div>

      <h5 className="font-display mt-3 text-xl leading-[1.1] font-bold">{front.headline}</h5>
      <p className="mt-2 border-l-2 pl-3 text-sm leading-relaxed text-foreground/85" style={{ borderColor: front.tint }}>
        {front.standfirst}
      </p>
      <p className="label-caps mt-3 text-[0.6rem] text-muted-foreground">{front.byline}</p>
    </article>
  );
}

export function PressTab({ gov, limit = 4 }: { gov: GovState; limit?: number }) {
  const editions = gov.log.slice(-limit).reverse();

  return (
    <div className="space-y-6">
      <section className="card-paper p-5">
        <h2 className="rule-top label-caps pt-2 text-muted-foreground">The morning papers</h2>
        <div className="masthead-rule mt-2 h-1 w-full" aria-hidden />
        <p className="mt-3 text-sm leading-relaxed text-foreground/85">
          Three front pages read every measure of your government differently: l'Unità from the
          left, the Corriere from the centre of the old republic, il Giornale from the right.
        </p>
      </section>

      {editions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          The presses are quiet. Take your first decision and the papers will have their say.
        </p>
      ) : (
        editions.map((d, i) => (
          <section key={`${d.date}-${i}`} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="rule-top label-caps pt-2 text-muted-foreground">{d.date}</h3>
              <p className="label-caps text-muted-foreground">{d.decision}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {d.fronts.map((f) => (
                <FrontPage key={f.paper} front={f} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
