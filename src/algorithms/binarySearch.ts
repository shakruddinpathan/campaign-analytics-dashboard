/**
 * BINARY SEARCH (lower bound / upper bound)
 *
 * Idea: in a SORTED array, look at the middle item. If it is too small, the
 * answer must be in the right half; otherwise it is in the left half.
 * Each step throws away half of the remaining items.
 *
 * Why it is used here: the data is sorted by date. To keep only rows between
 * startDate and endDate, we find the first index >= startDate and the first
 * index > endDate, then slice between them. That is two O(log n) searches
 * instead of checking every row one by one (O(n)).
 *
 * Time:  O(log n) per search.
 * Space: O(1) — only a few index variables.
 */

/** Returns the first index whose value is >= target (or array length if none). */
export function lowerBound<T>(items: readonly T[], target: string, getValue: (item: T) => string): number {
  let low = 0;
  let high = items.length; // "high" is exclusive

  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);
    if (getValue(items[mid]) < target) {
      low = mid + 1; // middle is too small, answer is on the right
    } else {
      high = mid; // middle could be the answer, keep it in range
    }
  }
  return low;
}

/** Returns the first index whose value is > target (or array length if none). */
export function upperBound<T>(items: readonly T[], target: string, getValue: (item: T) => string): number {
  let low = 0;
  let high = items.length;

  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);
    if (getValue(items[mid]) <= target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

/**
 * Returns all items with a value between start and end (both inclusive).
 * The input MUST already be sorted by that value.
 * Works for ISO dates because "2026-07-05" < "2026-07-10" as plain strings.
 */
export function rangeByBinarySearch<T>(
  sortedItems: readonly T[],
  start: string,
  end: string,
  getValue: (item: T) => string,
): T[] {
  if (start > end) return [];
  const from = lowerBound(sortedItems, start, getValue);
  const to = upperBound(sortedItems, end, getValue);
  return sortedItems.slice(from, to);
}
