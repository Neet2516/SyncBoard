/**
 * Simple utility to join class names
 */
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Delay execution for a specified amount of time
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
