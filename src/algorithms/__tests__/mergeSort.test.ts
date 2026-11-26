import { mergeSort } from '../mergeSort';

describe('mergeSort', () => {
  const ascending = (a: number, b: number) => a - b;

  it('sorts numbers in ascending order', () => {
    expect(mergeSort([5, 3, 8, 1, 9, 2], ascending)).toEqual([1, 2, 3, 5, 8, 9]);
  });

  it('handles empty and single-item arrays', () => {
    expect(mergeSort([], ascending)).toEqual([]);
    expect(mergeSort([7], ascending)).toEqual([7]);
  });

  it('does not mutate the input array', () => {
    const input = [3, 1, 2];
    mergeSort(input, ascending);
    expect(input).toEqual([3, 1, 2]);
  });

  it('is stable: equal items keep their original order', () => {
    const items = [
      { name: 'a', score: 2 },
      { name: 'b', score: 1 },
      { name: 'c', score: 2 },
      { name: 'd', score: 1 },
    ];
    const sorted = mergeSort(items, (x, y) => x.score - y.score);
    expect(sorted.map((i) => i.name)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('matches Array.sort on a large random array', () => {
    const big = Array.from({ length: 5000 }, (_, i) => (i * 7919) % 1000);
    expect(mergeSort(big, ascending)).toEqual([...big].sort(ascending));
  });
});
