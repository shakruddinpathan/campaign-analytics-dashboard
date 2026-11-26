import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'info' | 'destructive';

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
  /** true while the exit animation plays, just before the toast is removed */
  leaving?: boolean;
}

const VISIBLE_MS = 4000;
const EXIT_MS = 200; // must match the toast-out animation in index.css

/** Tiny toast queue: show(), auto-hide after 4s, and an exit animation. */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const later = useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      fn();
    }, ms);
    timers.current.add(timer);
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      // Step 1: mark as leaving (plays the slide-out). Step 2: remove it.
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      later(() => setToasts((list) => list.filter((t) => t.id !== id)), EXIT_MS);
    },
    [later],
  );

  const show = useCallback(
    (toast: Omit<ToastItem, 'id' | 'leaving'>) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { ...toast, id }]); // max 3 on screen
      later(() => dismiss(id), VISIBLE_MS);
    },
    [dismiss, later],
  );

  // Clear pending timers when the app unmounts.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return { toasts, show, dismiss };
}
