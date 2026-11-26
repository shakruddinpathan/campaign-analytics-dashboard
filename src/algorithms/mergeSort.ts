/**
 * MERGE SORT
 *
 * Idea: split the array in half again and again until each piece has one
 * item (one item is always "sorted"), then merge the sorted pieces back
 * together in order.
 *
 * Why merge sort for the table?
 * - It is STABLE: rows with equal values keep their previous order. If you
 *   sort by date and then by campaign, rows of the same campaign stay in
 *   date order. (Quick sort does not guarantee this.)
 * - It is always O(n log n), even in the worst case.
 *
 * Time:  O(n log n) — the array is halved log n times, and each level
 *        does O(n) work while merging.
 * Space: O(n) — merging needs temporary arrays. The input is NOT mutated,
 *        which matters in React because state must be treated as immutable.
 */
export type Comparator<T> = (a: T, b: T) => number;

export function mergeSort<T>(items: readonly T[], compare: Comparator<T>): T[] {
  if (items.length <= 1) return [...items];

  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), compare);
  const right = mergeSort(items.slice(middle), compare);

  return merge(left, right, compare);
}

/** Merges two already-sorted arrays into one sorted array in O(n). */
function merge<T>(left: T[], right: T[], compare: Comparator<T>): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    // "<= 0" (not "< 0") takes from the left first when values are equal.
    // That single character is what makes the sort stable.
    if (compare(left[i], right[j]) <= 0) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  // One side is finished; whatever is left on the other side is already sorted.
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);

  return result;
}
