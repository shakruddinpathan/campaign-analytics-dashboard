/**
 * MIN-HEAP (PRIORITY QUEUE) + TOP-K
 *
 * A min-heap is a binary tree stored in an array where every parent is
 * smaller than (or equal to) its children. So the SMALLEST item is always at
 * index 0. For the item at index i:
 *   parent = (i - 1) / 2, left child = 2i + 1, right child = 2i + 2
 *
 * Top-K trick: to find the K LARGEST items, keep a min-heap of size K.
 * The root is the "weakest" of the current top K. For each new item, if it
 * beats the root, remove the root and insert the new item.
 *
 * Why not just sort everything and take 5?
 * Sorting is O(n log n). The heap approach is O(n log k), and k = 5 is tiny,
 * so it is close to O(n). It also needs only O(k) extra memory.
 */
export class MinHeap<T> {
  private items: T[] = [];

  constructor(private readonly compare: (a: T, b: T) => number) {}

  get size(): number {
    return this.items.length;
  }

  /** Smallest item, without removing it. O(1). */
  peek(): T | undefined {
    return this.items[0];
  }

  /** Adds an item and moves it up until the heap rule holds. O(log n). */
  push(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  /** Removes and returns the smallest item. O(log n). */
  pop(): T | undefined {
    if (this.items.length === 0) return undefined;

    const smallest = this.items[0];
    const last = this.items.pop() as T;

    // Move the last item to the root, then push it down to its correct place.
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return smallest;
  }

  private bubbleUp(index: number): void {
    let child = index;
    while (child > 0) {
      const parent = Math.floor((child - 1) / 2);
      if (this.compare(this.items[child], this.items[parent]) >= 0) break;
      this.swap(child, parent);
      child = parent;
    }
  }

  private bubbleDown(index: number): void {
    let parent = index;
    const length = this.items.length;

    while (true) {
      const left = 2 * parent + 1;
      const right = 2 * parent + 2;
      let smallest = parent;

      if (left < length && this.compare(this.items[left], this.items[smallest]) < 0) smallest = left;
      if (right < length && this.compare(this.items[right], this.items[smallest]) < 0) smallest = right;
      if (smallest === parent) break; // heap rule holds, stop

      this.swap(parent, smallest);
      parent = smallest;
    }
  }

  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
  }
}

/**
 * Returns the k largest items by score, largest first.
 *
 * Time:  O(n log k) to scan + O(k log k) to sort the final k items.
 * Space: O(k).
 */
export function topK<T>(items: readonly T[], k: number, getScore: (item: T) => number): T[] {
  if (k <= 0) return [];

  const heap = new MinHeap<T>((a, b) => getScore(a) - getScore(b));

  for (const item of items) {
    if (heap.size < k) {
      heap.push(item);
    } else if (getScore(item) > getScore(heap.peek() as T)) {
      heap.pop(); // drop the weakest of the current top k
      heap.push(item);
    }
  }

  // Popping a min-heap gives smallest first, so reverse for "largest first".
  const result: T[] = [];
  while (heap.size > 0) result.push(heap.pop() as T);
  return result.reverse();
}
