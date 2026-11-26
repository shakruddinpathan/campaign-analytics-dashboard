// Small animation helpers shared by the CRUD features.

/** Must match the row-exit animation duration in index.css. */
export const ROW_EXIT_MS = 300;

/** Respect the OS "Reduce motion" setting (accessibility). */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

const FLASH_COLORS = {
  created: 'oklch(0.72 0.17 155 / 0.35)', // green = new
  updated: 'oklch(0.8 0.16 80 / 0.4)', // amber = changed
} as const;

/**
 * Flashes a background colour on an element and fades it out, using the
 * Web Animations API (element.animate). Unlike a CSS class, this can be
 * replayed on the same element without re-mounting it.
 */
export function flashElement(element: HTMLElement | null, type: keyof typeof FLASH_COLORS) {
  if (!element || typeof element.animate !== 'function') return; // jsdom / old browsers
  const color = FLASH_COLORS[type];
  if (prefersReducedMotion()) {
    element.animate([{ backgroundColor: color }, { backgroundColor: 'transparent' }], { duration: 1200 });
    return;
  }
  element.animate(
    [
      { backgroundColor: color, transform: type === 'created' ? 'translateY(-6px)' : 'scale(1.01)', opacity: 0.6 },
      { backgroundColor: color, transform: 'none', opacity: 1, offset: 0.2 },
      { backgroundColor: 'transparent' },
    ],
    { duration: 1600, easing: 'ease-out' },
  );
}
