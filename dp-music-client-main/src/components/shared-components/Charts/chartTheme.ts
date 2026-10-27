// Validated (dataviz validate_palette.js, dark mode, surface #1E1E27):
// slot 1 violet / slot 2 orange pass lightness, chroma, CVD, and contrast checks.
export const chartTheme = {
  surface: "#1E1E27",
  inkPrimary: "#F2F1F6",
  inkSecondary: "#C6C4D4",
  inkMuted: "#8E8C9E",
  grid: "#2E2E3A",
  baseline: "#45455A",
  series1: "#9085e9",
  series2: "#d95926",
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

// Statistics UI is localized to Ukrainian (decimal comma, "тис." compact suffix).
export const CHART_LOCALE = "uk";

export const formatNumber = (value: number, fractionDigits = 0): string =>
  value.toLocaleString(CHART_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

export const formatCompact = (value: number): string =>
  new Intl.NumberFormat(CHART_LOCALE, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const formatMoney = (value: number): string =>
  `$${formatNumber(value, value < 1 ? 4 : 2)}`;

export const formatPercent = (value: number): string =>
  `${formatNumber(value, Number.isInteger(value) ? 0 : 1)}%`;

// Rounds an axis max up to a clean 1/2/5 × 10^n step so ticks land on whole numbers.
export const niceMax = (value: number): number => {
  if (value <= 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;

  return Math.max(step * magnitude, 1);
};
