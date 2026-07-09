import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges conditional class names and resolves conflicting Tailwind
 * utility classes (e.g. cn('px-2', 'px-4') -> 'px-4').
 * Used by every component in components/ui so variants stay composable.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
