import type { CampaignRecord, GroupTotals } from '../types';

/**
 * HASH MAP GROUPING / AGGREGATION
 *
 * Idea: walk through the rows once. For each row, look up its group in a Map
 * (average O(1) lookup) and add the row's numbers to that group's totals.
 *
 * Why a Map? Without it, for every row we would search a list of groups to
 * find the right one, which is O(n × groups). The Map makes it a single pass.
 *
 * Time:  O(n) — one pass over the rows.
 * Space: O(k) — one entry per unique group (k = number of groups).
 */
export function groupAndSum(
  records: readonly CampaignRecord[],
  getKey: (record: CampaignRecord) => string,
): GroupTotals[] {
  const groups = new Map<string, GroupTotals>();

  for (const record of records) {
    const key = getKey(record);
    let totals = groups.get(key);

    if (!totals) {
      totals = { key, clicks: 0, conversions: 0, revenue: 0 };
      groups.set(key, totals);
    }

    totals.clicks += record.clicks;
    totals.conversions += record.conversions;
    totals.revenue += record.revenue;
  }

  // A Map remembers insertion order, so the output order is predictable.
  return Array.from(groups.values());
}

/**
 * Sums revenue per day. Used by the line chart.
 * Returns days in the same order they appear in the input (date order).
 *
 * Time: O(n). Space: O(d) where d = number of distinct days.
 */
export function sumRevenueByDate(records: readonly CampaignRecord[]): { date: string; revenue: number }[] {
  const byDate = new Map<string, number>();
  for (const record of records) {
    byDate.set(record.date, (byDate.get(record.date) ?? 0) + record.revenue);
  }
  return Array.from(byDate, ([date, revenue]) => ({ date, revenue }));
}
