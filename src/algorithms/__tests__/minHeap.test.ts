import { MinHeap, topK } from '../minHeap';

describe('MinHeap', () => {
  it('always pops the smallest item first', () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    [5, 3, 9, 1, 7, 2].forEach((n) => heap.push(n));

    const popped: number[] = [];
    while (heap.size > 0) popped.push(heap.pop() as number);
    expect(popped).toEqual([1, 2, 3, 5, 7, 9]);
  });

  it('returns undefined when empty', () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    expect(heap.pop()).toBeUndefined();
    expect(heap.peek()).toBeUndefined();
  });
});

describe('topK', () => {
  it('returns the k largest items, largest first', () => {
    expect(topK([4, 10, 1, 8, 3, 9, 2], 3, (n) => n)).toEqual([10, 9, 8]);
  });

  it('works on objects with a score function', () => {
    const campaigns = [
      { key: 'A', revenue: 100 },
      { key: 'B', revenue: 500 },
      { key: 'C', revenue: 300 },
    ];
    expect(topK(campaigns, 2, (c) => c.revenue).map((c) => c.key)).toEqual(['B', 'C']);
  });

  it('returns everything when k is larger than the input, and nothing for k = 0', () => {
    expect(topK([1, 2], 5, (n) => n)).toEqual([2, 1]);
    expect(topK([1, 2], 0, (n) => n)).toEqual([]);
  });
});
