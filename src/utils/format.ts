// Formatting helpers. Intl formatters are created once and reused, because
// creating a new Intl.NumberFormat on every render is surprisingly slow.

const numberFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const compactFormatter = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });

/** 1234567 → "12,34,567" (Indian digit grouping) */
export const formatNumber = (value: number): string => numberFormatter.format(value);

/** 1234567 → "₹12,34,567" */
export const formatCurrency = (value: number): string => currencyFormatter.format(value);

/** 1234567 → "12.3L"-style short numbers for chart axes and KPI cards */
export const formatCompact = (value: number): string => compactFormatter.format(value);

/** 3.14159 → "3.14%" */
export const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

/** "2026-07-05" → "05 Jul 2026" */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
