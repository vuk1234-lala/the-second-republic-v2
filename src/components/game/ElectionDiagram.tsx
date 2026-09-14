import type { DiagramRow } from "@/lib/game/polling";

interface Dot {
  x: number;
  y: number;
  theta: number;
}

/** One dot per seat, arranged in a hemicycle. */
function hemicycle(total: number): Dot[] {
  const ranks = 13;
  const radii = Array.from({ length: ranks }, (_, i) => 0.42 + (i * (1 - 0.42)) / (ranks - 1));
  const sum = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.max(1, Math.round((total * r) / sum)));
  let diff = total - counts.reduce((a, b) => a + b, 0);
  for (let i = ranks - 1; diff !== 0 && i >= 0; i--) {
    const step = diff > 0 ? 1 : -1;
    counts[i] = Math.max(1, counts[i]! + step);
    diff -= step;
  }
  const dots: Dot[] = [];
  counts.forEach((count, rank) => {
    for (let i = 0; i < count; i++) {
      const theta = Math.PI * ((i + 0.5) / count);
      const r = radii[rank]! * 180;
      dots.push({ x: 200 - Math.cos(theta) * r, y: 196 - Math.sin(theta) * r, theta });
    }
  });
  return dots.sort((a, b) => a.theta - b.theta || a.y - b.y);
}

export function ElectionDiagram({ rows }: { rows: DiagramRow[] }) {
  const seated = rows.slice().sort((a, b) => a.order - b.order);
  const dotsPer = 3;
  const buckets = seated.map((r) => Math.max(1, Math.round(r.seats / dotsPer)));
  const total = buckets.reduce((a, b) => a + b, 0);
  const dots = hemicycle(total);

  const coloured: { dot: Dot; row: DiagramRow }[] = [];
  let cursor = 0;
  seated.forEach((row, i) => {
    for (let k = 0; k < buckets[i]!; k++) {
      const dot = dots[cursor++];
      if (dot) coloured.push({ dot, row });
    }
  });

  return (
    <div>
      <svg viewBox="0 0 400 210" className="w-full" role="img" aria-label="Seats in the Chamber of Deputies">
        {coloured.map(({ dot, row }, i) => (
          <circle key={i} cx={dot.x} cy={dot.y} r={4.2} fill={row.color} stroke="var(--ink)" strokeWidth={0.5} />
        ))}
        <line x1={200} y1={40} x2={200} y2={196} stroke="var(--ink)" strokeWidth={1} strokeDasharray="4 4" />
        <text x={200} y={206} textAnchor="middle" className="font-display" fontSize={11} fill="var(--ink)">
          630 SEATS · 316 TO GOVERN
        </text>
      </svg>

      <ul className="mt-4 space-y-2">
        {rows
          .slice()
          .sort((a, b) => b.share - a.share)
          .map((row) => (
            <li key={row.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={row.mine ? "font-display font-semibold" : ""}>
                  {row.short} — {row.name}
                  {row.ally && !row.mine && (
                    <span className="label-caps ml-2 text-accent">coalition</span>
                  )}
                </span>
                <span className="font-display tabular-nums">
                  {row.share.toFixed(1)}% · {row.seats} seats
                </span>
              </div>
              <div className="mt-1 h-3 w-full border border-border bg-secondary">
                <div
                  className="h-full transition-[width] duration-700"
                  style={{ width: `${(row.share / 32) * 100}%`, backgroundColor: row.color }}
                />
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
