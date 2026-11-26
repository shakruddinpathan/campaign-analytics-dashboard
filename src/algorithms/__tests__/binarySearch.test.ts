import { lowerBound, rangeByBinarySearch, upperBound } from '../binarySearch';

const dates = ['2026-07-01', '2026-07-02', '2026-07-02', '2026-07-05', '2026-07-09'];
const identity = (d: string) => d;

describe('binary search', () => {
  it('lowerBound finds the first index >= target', () => {
    expect(lowerBound(dates, '2026-07-02', identity)).toBe(1);
    expect(lowerBound(dates, '2026-07-03', identity)).toBe(3);
    expect(lowerBound(dates, '2026-06-01', identity)).toBe(0);
    expect(lowerBound(dates, '2026-08-01', identity)).toBe(5);
  });

  it('upperBound finds the first index > target', () => {
    expect(upperBound(dates, '2026-07-02', identity)).toBe(3);
    expect(upperBound(dates, '2026-07-09', identity)).toBe(5);
  });

  it('rangeByBinarySearch returns an inclusive date range', () => {
    expect(rangeByBinarySearch(dates, '2026-07-02', '2026-07-05', identity)).toEqual([
      '2026-07-02',
      '2026-07-02',
      '2026-07-05',
    ]);
  });

  it('returns an empty array for an invalid or empty range', () => {
    expect(rangeByBinarySearch(dates, '2026-07-06', '2026-07-08', identity)).toEqual([]);
    expect(rangeByBinarySearch(dates, '2026-07-09', '2026-07-01', identity)).toEqual([]);
    expect(rangeByBinarySearch([], '2026-07-01', '2026-07-09', identity)).toEqual([]);
  });
});
