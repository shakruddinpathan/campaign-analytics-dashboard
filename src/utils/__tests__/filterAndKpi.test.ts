import { generateMockData } from '../../data/mockData';
import type { Filters } from '../../types';
import { filterRecords, filterRecordsCached, searchRecords } from '../filterRecords';
import { calculateKpis } from '../kpi';
import { sortRecords } from '../sortRecords';

const data = generateMockData(30, 7);
const allFilters: Filters = { startDate: data[0].date, endDate: data[data.length - 1].date, campaign: 'All', source: 'All' };

describe('mock data', () => {
  it('is sorted by date (binary search depends on this)', () => {
    for (let i = 1; i < data.length; i++) expect(data[i - 1].date <= data[i].date).toBe(true);
  });

  it('is the same every time for the same seed', () => {
    expect(generateMockData(5, 1)).toEqual(generateMockData(5, 1));
  });
});

describe('filterRecords', () => {
  it('gives the same result as a simple linear filter', () => {
    const filters: Filters = { startDate: '2026-07-05', endDate: '2026-07-12', campaign: 'All', source: 'Email' };
    const expected = data.filter(
      (r) => r.date >= filters.startDate && r.date <= filters.endDate && r.source === filters.source,
    );
    expect(filterRecords(data, filters)).toEqual(expected);
  });

  it('returns everything when no filter is set', () => {
    expect(filterRecords(data, allFilters)).toHaveLength(data.length);
  });

  it('cached version returns the same array instance for the same filters', () => {
    filterRecordsCached.clearCache();
    const first = filterRecordsCached(data, allFilters);
    const second = filterRecordsCached(data, { ...allFilters });
    expect(second).toBe(first);
  });
});

describe('searchRecords', () => {
  it('matches campaign or source text, ignoring case', () => {
    const result = searchRecords(data, 'FACEBOOK');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.source === 'Facebook')).toBe(true);
  });

  it('returns all rows for an empty search', () => {
    expect(searchRecords(data, '   ')).toHaveLength(data.length);
  });
});

describe('sortRecords', () => {
  it('sorts numbers descending', () => {
    const sorted = sortRecords(data, { key: 'revenue', direction: 'desc' });
    for (let i = 1; i < sorted.length; i++) expect(sorted[i - 1].revenue >= sorted[i].revenue).toBe(true);
  });
});

describe('calculateKpis', () => {
  it('computes conversion rate from totals', () => {
    const kpis = calculateKpis([
      { id: '1', date: '2026-07-01', campaign: 'A', source: 'Email', clicks: 100, conversions: 10, revenue: 1000 },
      { id: '2', date: '2026-07-01', campaign: 'B', source: 'Email', clicks: 900, conversions: 10, revenue: 500 },
    ]);
    expect(kpis).toEqual({ clicks: 1000, conversions: 20, revenue: 1500, conversionRate: 2 });
  });

  it('returns 0% conversion rate when there are no clicks', () => {
    expect(calculateKpis([]).conversionRate).toBe(0);
  });
});
