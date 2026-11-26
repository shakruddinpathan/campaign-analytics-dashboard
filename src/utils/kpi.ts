import type { CampaignRecord, KpiTotals } from '../types';

/**
 * Totals for the KPI cards in a single O(n) pass.
 * Conversion rate is computed from the TOTALS (total conversions ÷ total
 * clicks), not by averaging each row's rate — averaging rates would give
 * small rows the same weight as big rows, which is wrong.
 */
export function calculateKpis(records: readonly CampaignRecord[]): KpiTotals {
  let clicks = 0;
  let conversions = 0;
  let revenue = 0;

  for (const record of records) {
    clicks += record.clicks;
    conversions += record.conversions;
    revenue += record.revenue;
  }

  return {
    clicks,
    conversions,
    revenue,
    conversionRate: clicks === 0 ? 0 : (conversions / clicks) * 100,
  };
}
