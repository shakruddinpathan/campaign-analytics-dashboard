/**
 * MEMOIZATION WITH AN LRU CACHE
 *
 * Idea: remember the result of an expensive function for a given input.
 * Next time the same input comes, return the saved result instead of
 * computing again.
 *
 * Why here: filtering 3,000+ rows runs every time a filter changes. Users
 * often switch back and forth ("Google Ads" → "All" → "Google Ads"), so the
 * same filter combination is computed again and again. The cache makes
 * repeated filters instant.
 *
 * Why LRU (Least Recently Used)? An unlimited cache would keep growing
 * forever. LRU keeps only the newest `maxSize` entries and drops the one not
 * used for the longest time. A JavaScript Map keeps insertion order, so the
 * FIRST key in the Map is always the least recently used one.
 *
 * Time:  O(1) average for both a cache hit and a cache miss lookup
 *        (plus the cost of the real function on a miss).
 * Space: O(maxSize).
 */
export interface MemoizedFunction<Args extends unknown[], Result> {
  (...args: Args): Result;
  cacheSize: () => number;
  clearCache: () => void;
}

export function memoize<Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
  getKey: (...args: Args) => string,
  maxSize = 50,
): MemoizedFunction<Args, Result> {
  const cache = new Map<string, Result>();

  const memoized = (...args: Args): Result => {
    const key = getKey(...args);

    if (cache.has(key)) {
      // Re-insert the key so it becomes the "most recently used" one.
      const cached = cache.get(key) as Result;
      cache.delete(key);
      cache.set(key, cached);
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result);

    if (cache.size > maxSize) {
      // First key = least recently used → remove it.
      const oldestKey = cache.keys().next().value as string;
      cache.delete(oldestKey);
    }
    return result;
  };

  memoized.cacheSize = () => cache.size;
  memoized.clearCache = () => cache.clear();
  return memoized;
}
