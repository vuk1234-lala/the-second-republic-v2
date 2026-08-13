/** The state of the nation during the governing years, 1994–1999. */
export interface CountryStats {
  /** annual GDP growth, in percent */
  growth: number;
  /** 0..100, higher is worse */
  crime: number;
  /** 0..100, higher is better */
  welfare: number;
  /** -100..100, higher is a surplus */
  budget: number;
  /** 0..100, higher is more debt */
  debt: number;
  /** 0..100 government approval */
  approval: number;
}

export const START_COUNTRY: CountryStats = {
  growth: -0.8,
  crime: 84,
  welfare: 29,
  budget: -34,
  debt: 63,
  approval: 52,
};

export type Trend = "up" | "flat" | "down";

export function trendOf(now: number, before: number, epsilon = 0.4): Trend {
  if (now - before > epsilon) return "up";
  if (before - now > epsilon) return "down";
  return "flat";
}

const BUDGET_BANDS: [number, string][] = [
  [40, "Big surplus"],
  [15, "Small surplus"],
  [-6, "Balanced"],
  [-26, "Slight deficit"],
  [-52, "Big deficit"],
  [-76, "A budget hole"],
];

export function budgetLabel(v: number) {
  for (const [floor, label] of BUDGET_BANDS) if (v >= floor) return label;
  return "Bankruptcy";
}

const DEBT_BANDS: [number, string][] = [
  [94, "Default"],
  [80, "Extremely high"],
  [66, "Very high"],
  [52, "High"],
  [38, "Concerning"],
  [22, "Manageable"],
  [8, "Low"],
];

export function debtLabel(v: number) {
  for (const [floor, label] of DEBT_BANDS) if (v >= floor) return label;
  return "Non-existent";
}

export function crimeLabel(v: number) {
  if (v >= 80) return "Rampant";
  if (v >= 62) return "Very high";
  if (v >= 46) return "High";
  if (v >= 30) return "Contained";
  if (v >= 16) return "Low";
  return "Rare";
}

export function welfareLabel(v: number) {
  if (v >= 82) return "Excellent";
  if (v >= 66) return "Good";
  if (v >= 50) return "Adequate";
  if (v >= 34) return "Poor";
  if (v >= 18) return "Bad";
  return "Collapsing";
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * One month of the machine running on its own: growth reverts to trend and is
 * dragged by debt, the deficit feeds the debt, the debt feeds interest costs
 * back into the budget, and neglect pushes welfare down and crime up.
 */
export function tickCountry(s: CountryStats): CountryStats {
  const growth = r1(s.growth + (1.4 - s.growth) * 0.12 - Math.max(0, s.debt - 55) * 0.012);

  const revenue = growth * 0.9;
  const interest = s.debt * 0.03;
  const welfareCost = s.welfare * 0.02;
  const budget = r1(clamp(s.budget + revenue - interest - welfareCost + 1.9, -100, 100));

  const deficitPressure = s.budget < 0 ? -s.budget * 0.02 : -s.budget * 0.025;
  const debt = r1(clamp(s.debt + deficitPressure - growth * 0.45, 0, 100));

  const welfare = r1(clamp(s.welfare - 0.2 - (s.budget < -50 ? 0.3 : 0), 0, 100));
  const crime = r1(clamp(s.crime + 0.3 - (s.welfare - 40) * 0.02 - growth * 0.15, 0, 100));

  const approval = r1(
    clamp(
      s.approval +
        growth * 0.5 +
        (s.welfare - 45) * 0.03 -
        (s.crime - 50) * 0.03 +
        (s.budget < -60 ? -0.6 : 0),
      0,
      100,
    ),
  );

  return { growth, crime, welfare, budget, debt, approval };
}
