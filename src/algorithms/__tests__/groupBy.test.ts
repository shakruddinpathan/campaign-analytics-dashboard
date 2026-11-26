import type { CampaignRecord } from '../../types';
import { groupAndSum, sumRevenueByDate } from '../groupBy';

const row = (date: string, campaign: string, clicks: number, conversions: number, revenue: number): CampaignRecord => ({
  id: `${date}-${campaign}`,
  date,
  campaign,
  source: 'Email',
  clicks,
  conversions,
  revenue,
});

const rows = [row('2026-07-01', 'A', 100, 5, 500), row('2026-07-01', 'B', 50, 2, 200), row('2026-07-02', 'A', 10, 1, 100)];

describe('groupAndSum', () => {
  it('sums clicks, conversions and revenue per key', () => {
    expect(groupAndSum(rows, (r) => r.campaign)).toEqual([
      { key: 'A', clicks: 110, conversions: 6, revenue: 600 },
      { key: 'B', clicks: 50, conversions: 2, revenue: 200 },
    ]);
  });

  it('returns an empty array for no rows', () => {
    expect(groupAndSum([], (r) => r.campaign)).toEqual([]);
  });
});

describe('sumRevenueByDate', () => {
  it('sums revenue per day in date order', () => {
    expect(sumRevenueByDate(rows)).toEqual([
      { date: '2026-07-01', revenue: 700 },
      { date: '2026-07-02', revenue: 100 },
    ]);
  });
});
