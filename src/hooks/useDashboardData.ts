import { useMemo } from 'react';
import { groupAndSum, movingAverage, sumRevenueByDate, topK } from '../algorithms';
import type { CampaignRecord, Filters } from '../types';
import { filterRecordsCached } from '../utils/filterRecords';
import { calculateKpis } from '../utils/kpi';

const MOVING_AVERAGE_DAYS = 7;
const TOP_CAMPAIGNS_COUNT = 5;

/**
 * Derives everything the dashboard shows from the raw data + filters.
 *
 * Every value is wrapped in useMemo so it is recalculated ONLY when its
 * inputs change. For example, toggling dark mode re-renders the app but
 * does not re-filter or re-group thousands of rows.
 */
export function useDashboardData(records: readonly CampaignRecord[], filters: Filters) {
  // Binary search + LRU cache (see utils/filterRecords.ts)
  const filtered = useMemo(() => filterRecordsCached(records, filters), [records, filters]);

  const kpis = useMemo(() => calculateKpis(filtered), [filtered]);

  // Hash map grouping, O(n)
  const byCampaign = useMemo(() => groupAndSum(filtered, (r) => r.campaign), [filtered]);
  const bySource = useMemo(() => groupAndSum(filtered, (r) => r.source), [filtered]);

  // Min-heap Top-K, O(n log k)
  const topCampaigns = useMemo(() => topK(byCampaign, TOP_CAMPAIGNS_COUNT, (c) => c.revenue), [byCampaign]);

  // Daily revenue + sliding-window moving average, O(n)
  const revenueTrend = useMemo(() => {
    const daily = sumRevenueByDate(filtered);
    const average = movingAverage(
      daily.map((d) => d.revenue),
      MOVING_AVERAGE_DAYS,
    );
    return { daily, average };
  }, [filtered]);

  return { filtered, kpis, byCampaign, bySource, topCampaigns, revenueTrend };
}
