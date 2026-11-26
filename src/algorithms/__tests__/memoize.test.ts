import { memoize } from '../memoize';

describe('memoize (LRU cache)', () => {
  it('calls the real function only once for the same key', () => {
    const square = jest.fn((n: number) => n * n);
    const cached = memoize(square, (n) => String(n));

    expect(cached(4)).toBe(16);
    expect(cached(4)).toBe(16);
    expect(square).toHaveBeenCalledTimes(1);
  });

  it('evicts the least recently used entry when full', () => {
    const fn = jest.fn((n: number) => n);
    const cached = memoize(fn, (n) => String(n), 2);

    cached(1);
    cached(2);
    cached(1); // 1 becomes most recently used, so 2 is now the oldest
    cached(3); // cache is full → 2 is evicted
    expect(cached.cacheSize()).toBe(2);

    fn.mockClear();
    cached(1); // still cached
    expect(fn).not.toHaveBeenCalled();
    cached(2); // was evicted → recomputed
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('clearCache empties the cache', () => {
    const cached = memoize((n: number) => n, (n) => String(n));
    cached(1);
    cached.clearCache();
    expect(cached.cacheSize()).toBe(0);
  });
});
