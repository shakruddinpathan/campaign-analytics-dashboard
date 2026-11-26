/**
 * SLIDING WINDOW — MOVING AVERAGE
 *
 * Idea: a 7-day moving average for day i is the average of days i-6 … i.
 * The slow way recalculates the sum of 7 values for every day: O(n × w).
 *
 * Sliding window: keep a running sum. When the window moves one step right,
 * ADD the new value entering on the right and SUBTRACT the old value leaving
 * on the left. Each step is O(1) no matter how big the window is.
 *
 * Why on the chart: daily revenue jumps up and down (weekends, promotions).
 * The moving average smooths those jumps so the real trend is visible.
 *
 * Time:  O(n) — each value is added once and removed once.
 * Space: O(n) for the output array.
 *
 * Returns null for the first (window - 1) days, because a full window is not
 * available yet. Highcharts simply skips null points.
 */
export function movingAverage(values: readonly number[], windowSize: number): (number | null)[] {
  if (windowSize <= 0) throw new Error('windowSize must be greater than 0');

  const result: (number | null)[] = [];
  let windowSum = 0;

  for (let i = 0; i < values.length; i++) {
    windowSum += values[i]; // value entering the window

    if (i >= windowSize) {
      windowSum -= values[i - windowSize]; // value leaving the window
    }

    if (i >= windowSize - 1) {
      // Round to 2 decimals to avoid long floating point tails like 1234.5600000001
      result.push(Math.round((windowSum / windowSize) * 100) / 100);
    } else {
      result.push(null);
    }
  }

  return result;
}
