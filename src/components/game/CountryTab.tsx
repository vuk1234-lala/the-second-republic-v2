import { ArrowDown, ArrowUp, Equal } from "lucide-react";

import {
  budgetLabel,
  crimeLabel,
  debtLabel,
  trendOf,
  welfareLabel,
  type CountryStats,
  type Trend,
} from "@/lib/game/country";

function TrendMark({ trend, good }: { trend: Trend; good: "up" | "down" }) {
  if (trend === "flat") {
    return (
      <span className="flex items-center gap-1 text-accent" title="Stable">
        <Equal className="h-4 w-4" aria-hidden />
        <span className="label-caps">stable</span>
      </span>
    );
  }
  const positive = trend === good;
  const Icon = trend === "up" ? ArrowUp : ArrowDown;
  return (
    <span
      className={`flex items-center gap-1 ${positive ? "text-emerald-700" : "text-destructive"}`}
      title={positive ? "Improving" : "Worsening"}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="label-caps">{positive ? "improving" : "worsening"}</span>
    </span>
  );
}

function Row({
  label,
  value,
  trend,
  good,
  bar,
}: {
  label: string;
  value: string;
  trend: Trend;
  good: "up" | "down";
  bar: number;
}) {
  return (
    <li className="py-3 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="label-caps text-muted-foreground">{label}</span>
        <TrendMark trend={trend} good={good} />
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <span className="font-display text-lg tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full border border-border bg-secondary">
        <div
          className="h-full bg-ink transition-[width] duration-500"
          style={{ width: `${Math.max(0, Math.min(100, bar))}%` }}
        />
      </div>
    </li>
  );
}

export function CountryTab({
  stats,
  previous,
  className = "",
}: {
  stats: CountryStats;
  previous: CountryStats;
  className?: string;
}) {
  return (
    <section className={`card-paper p-4 sm:p-5 ${className}`}>
      <h3 className="rule-top label-caps pt-2 text-muted-foreground">The country</h3>
      <ul className="mt-3 divide-y divide-border">
        <Row
          label="Economic growth"
          value={`${stats.growth > 0 ? "+" : ""}${stats.growth.toFixed(1)}%`}
          trend={trendOf(stats.growth, previous.growth, 0.05)}
          good="up"
          bar={((stats.growth + 4) / 10) * 100}
        />
        <Row
          label="Crime"
          value={crimeLabel(stats.crime)}
          trend={trendOf(stats.crime, previous.crime)}
          good="down"
          bar={stats.crime}
        />
        <Row
          label="Welfare quality"
          value={welfareLabel(stats.welfare)}
          trend={trendOf(stats.welfare, previous.welfare)}
          good="up"
          bar={stats.welfare}
        />
        <Row
          label="Budget"
          value={budgetLabel(stats.budget)}
          trend={trendOf(stats.budget, previous.budget)}
          good="up"
          bar={(stats.budget + 100) / 2}
        />
        <Row
          label="Public debt"
          value={debtLabel(stats.debt)}
          trend={trendOf(stats.debt, previous.debt)}
          good="down"
          bar={stats.debt}
        />
        <Row
          label="Approval"
          value={`${Math.round(stats.approval)}%`}
          trend={trendOf(stats.approval, previous.approval)}
          good="up"
          bar={stats.approval}
        />
      </ul>
    </section>
  );
}
