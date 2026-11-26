import type { CampaignRecord } from '../types';

const HEADERS = ['Date', 'Campaign', 'Source', 'Clicks', 'Conversions', 'Revenue (INR)', 'Conversion Rate (%)'];

/**
 * Escapes one CSV cell. A value containing a comma, quote or new line must be
 * wrapped in quotes, and quotes inside it must be doubled ("" ) — otherwise
 * Excel would split the cell into wrong columns.
 */
export function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Converts rows into CSV text (header line + one line per row). */
export function toCsv(records: readonly CampaignRecord[]): string {
  const lines = records.map((r) => {
    const rate = r.clicks === 0 ? 0 : (r.conversions / r.clicks) * 100;
    return [r.date, r.campaign, r.source, r.clicks, r.conversions, r.revenue, rate.toFixed(2)]
      .map(escapeCsvValue)
      .join(',');
  });
  return [HEADERS.join(','), ...lines].join('\n');
}

/**
 * Triggers a browser download without any server: the CSV text becomes a
 * Blob, the Blob gets a temporary URL, and a hidden link is clicked.
 */
export function downloadCsv(records: readonly CampaignRecord[], fileName = 'campaign-report.csv'): void {
  const blob = new Blob([toCsv(records)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Free the memory used by the temporary URL.
  URL.revokeObjectURL(url);
}
