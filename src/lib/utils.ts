import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins class names and removes Tailwind conflicts.
 * cn('px-2', isActive && 'px-4') → 'px-4' (the later class wins).
 * Every shadcn/ui component uses this helper.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
