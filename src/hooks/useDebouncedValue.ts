import { useEffect, useState } from 'react';

/**
 * React version of debounce: returns `value` only after it has stopped
 * changing for `delay` ms.
 *
 * The input box still updates instantly (it uses the raw value), but the
 * expensive search runs on the debounced value, so typing never feels laggy.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Cleanup runs when `value` changes again before the timer fires,
    // cancelling the old timer — this is exactly the debounce behaviour.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
