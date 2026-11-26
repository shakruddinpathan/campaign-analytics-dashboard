import { paginate } from '../paginate';

const items = Array.from({ length: 23 }, (_, i) => i + 1); // 1..23

describe('paginate', () => {
  it('returns the correct slice for a middle page', () => {
    const result = paginate(items, 2, 10);
    expect(result.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(result.totalPages).toBe(3);
    expect(result.startIndex).toBe(10);
    expect(result.endIndex).toBe(20);
  });

  it('returns a shorter last page', () => {
    expect(paginate(items, 3, 10).items).toEqual([21, 22, 23]);
  });

  it('clamps pages that are out of range', () => {
    expect(paginate(items, 99, 10).currentPage).toBe(3);
    expect(paginate(items, 0, 10).currentPage).toBe(1);
  });

  it('handles an empty list as one empty page', () => {
    const result = paginate([], 1, 10);
    expect(result).toMatchObject({ items: [], totalPages: 1, totalItems: 0, currentPage: 1 });
  });
});
