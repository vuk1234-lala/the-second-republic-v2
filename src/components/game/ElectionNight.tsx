import { useEffect, useMemo, useRef, useState } from "react";
import { CHAMBER, exactSeats, hemicycle } from "@/components/game/ElectionDiagram";
import type { DiagramRow } from "@/lib/game/polling";

const REGIONS = [
  "Piemonte", "Lombardia", "Veneto", "Friuli-Venezia Giulia", "Liguria",
  "Emilia-Romagna", "Toscana", "Umbria", "Marche", "Lazio",
  "Abruzzo", "Molise", "Campania", "Puglia", "Basilicata",
  "Calabria", "Sicilia", "Sardegna", "Trentino-Alto Adige", "Valle d'Aosta",
];

/** Deterministic shuffle so a replay of the same night matches the first call. */
function shuffled(n: number, seed: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  let s = seed || 1;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    const t = idx[i]!;
    idx[i] = idx[j]!;
    idx[j] = t;
  }
  return idx;
}

function chime(kind: "tick" | "stinger") {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ac = new Ctx();
    const notes = kind === "stinger" ? [392, 523.25, 659.25] : [880];
    notes.forEach((f, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = kind === "stinger" ? "triangle" : "square";
      osc.frequency.value = f;
      const t0 = ac.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(kind === "stinger" ? 0.18 : 0.05, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (kind === "stinger" ? 0.9 : 0.09));
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + 1.1);
    });
    setTimeout(() => void ac.close(), 1600);
  } catch {
    /* audio is decoration only */
  }
}

export function ElectionNight({
  rows,
  date,
  coalitionSeats,
  onDone,
}: {
  rows: DiagramRow[];
  date: string;
  coalitionSeats?: number;
  onDone: () => void;
}) {
  const [revealed, setRevealed] = useState(0);
  const [ticker, setTicker] = useState<string[]>([]);
  const [sound, setSound] = useState(true);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const model = useMemo(() => {
    const seated = rows.slice().sort((a, b) => a.order - b.order);
    const counts = exactSeats(seated);
    const dots = hemicycle(CHAMBER);
    const seats: { x: number; y: number; row: DiagramRow }[] = [];
    let cursor = 0;
    seated.forEach((row, i) => {
      for (let k = 0; k < counts[i]!; k++) {
        const dot = dots[cursor++];
        if (dot) seats.push({ x: dot.x, y: dot.y, row });
      }
    });
    const seed = Math.round(rows.reduce((a, r) => a + r.share * 1000, 0)) + rows.length;
    const order = shuffled(seats.length, seed);
    const totals = new Map<string, number>();
    seated.forEach((row, i) => totals.set(row.id, counts[i]!));
    const strongest = seated.slice().sort((a, b) => b.share - a.share);
    const calls = shuffled(REGIONS.length, seed + 7).map((r, i) => {
      const pick = strongest[i % Math.min(4, strongest.length)]!;
      return `${REGIONS[r]} projected — ${pick.short} ahead`;
    });
    return { seats, order, totals, calls, strongest };
  }, [rows]);

  const done = revealed >= model.seats.length;

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      setRevealed((r) => Math.min(model.seats.length, r + 7));
    }, 55);
    return () => window.clearInterval(id);
  }, [done, model.seats.length]);

  useEffect(() => {
    if (done) return;
    let n = 0;
    const id = window.setInterval(() => {
      const line = model.calls[n % model.calls.length]!;
      n += 1;
      setTicker((t) => [line, ...t].slice(0, 6));
      if (soundRef.current) chime("tick");
    }, 700);
    return () => window.clearInterval(id);
  }, [done, model.calls]);

  useEffect(() => {
    if (done && soundRef.current) chime("stinger");
  }, [done]);

  // running counts for the scoreboard
  const running = new Map<string, number>();
  for (let i = 0; i < revealed; i++) {
    const seat = model.seats[model.order[i]!];
    if (!seat) continue;
    running.set(seat.row.id, (running.get(seat.row.id) ?? 0) + 1);
  }
  const lit = new Set(model.order.slice(0, revealed));

  const board = model.strongest
    .map((row) => ({ row, seats: running.get(row.id) ?? 0 }))
    .sort((a, b) => b.seats - a.seats)
    .slice(0, 6);

  const winner = coalitionSeats ?? Math.max(...model.strongest.map((r) => model.totals.get(r.id) ?? 0));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/95 px-3 py-6 text-primary-foreground backdrop-blur-sm sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="label-caps text-primary-foreground/70">Election night · {date}</p>
          <h2 className="font-display mt-1 text-3xl leading-none sm:text-4xl">
            {done ? "The chamber is called" : "Projections coming in…"}
          </h2>
        </header>

        <svg
          viewBox="0 0 400 210"
          className="mt-5 w-full"
          role="img"
          aria-label="Seats being projected"
        >
          {model.seats.map((seat, i) => (
            <circle
              key={i}
              cx={seat.x}
              cy={seat.y}
              r={lit.has(i) ? 4.2 : 3}
              fill={lit.has(i) ? seat.row.color : "rgba(255,255,255,0.12)"}
              stroke={lit.has(i) ? "rgba(0,0,0,0.5)" : "transparent"}
              strokeWidth={0.5}
            />
          ))}
          <line x1={200} y1={40} x2={200} y2={196} stroke="rgba(255,255,255,0.4)" strokeDasharray="4 4" />
        </svg>

        <p className="font-display text-center text-2xl tabular-nums">
          {revealed} / {CHAMBER} seats projected
        </p>

        <ul className="mx-auto mt-4 max-w-md space-y-1 text-sm">
          {board.map(({ row, seats }) => (
            <li key={row.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3" style={{ backgroundColor: row.color }} aria-hidden />
                {row.short}
              </span>
              <span className="font-display tabular-nums">{seats}</span>
            </li>
          ))}
        </ul>

        <div
          className="mt-5 min-h-24 border-y border-primary-foreground/25 py-3 text-sm"
          aria-live="polite"
        >
          {ticker.length === 0 ? (
            <p className="text-primary-foreground/60">Polls have closed. Waiting for the first projections…</p>
          ) : (
            ticker.map((line, i) => (
              <p key={`${line}-${i}`} style={{ opacity: 1 - i * 0.15 }} className="label-caps">
                {line}
              </p>
            ))
          )}
        </div>

        {done && (
          <div className="animate-fade-in mt-6 text-center">
            <p className="font-display text-3xl sm:text-4xl">
              {winner >= 316 ? "A MAJORITY" : "A HUNG CHAMBER"}
            </p>
            <p className="mt-1 text-primary-foreground/75">
              {winner} seats · 316 needed to govern
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setSound((s) => !s)}
            className="label-caps border border-primary-foreground/40 px-4 py-2 text-xs"
          >
            Sound {sound ? "on" : "off"}
          </button>
          <button
            onClick={() => (done ? onDone() : setRevealed(model.seats.length))}
            className="font-display border border-primary-foreground bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest"
          >
            {done ? "See the result" : "Skip to the call"}
          </button>
        </div>
      </div>
    </div>
  );
}
