/**
 * DEBOUNCE
 *
 * Idea: wait until the user STOPS calling a function for `delay` ms, then
 * call it once. Every new call cancels the previous timer and starts again.
 *
 * Why for search: without debounce, typing "facebook" would filter 3,000+
 * rows 8 times (once per letter). With a 300 ms debounce it filters once,
 * after the user pauses typing.
 *
 * Time:  O(1) per call (only clears and sets a timer).
 * Space: O(1).
 *
 * The React version of this idea lives in hooks/useDebouncedValue.ts.
 */
export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}

export function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delay: number): DebouncedFunction<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };

  return debounced;
}
