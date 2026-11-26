import { movingAverage } from '../movingAverage';

describe('movingAverage (sliding window)', () => {
  it('returns null until a full window is available', () => {
    expect(movingAverage([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });

  it('matches the slow "sum every window" approach', () => {
    const values = Array.from({ length: 50 }, (_, i) => (i * 37) % 11);
    const slow = values.map((_, i) =>
      i < 6 ? null : Math.round((values.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7) * 100) / 100,
    );
    expect(movingAverage(values, 7)).toEqual(slow);
  });

  it('returns the values themselves for a window of 1', () => {
    expect(movingAverage([4, 8, 15], 1)).toEqual([4, 8, 15]);
  });

  it('throws for an invalid window size', () => {
    expect(() => movingAverage([1, 2], 0)).toThrow();
  });
});
