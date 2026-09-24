const DAY = 86_400_000

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/**
 * Message-list date, the way Mail shows it: a time for today, "Yesterday",
 * the weekday within the last week, and a short date after that.
 */
export function listDate(timestamp: number, now = Date.now(), locale?: string): string {
  const date = new Date(timestamp)
  const days = Math.round((startOfDay(new Date(now)) - startOfDay(date)) / DAY)
  if (days <= 0) return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString(locale, { weekday: 'long' })
  return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' })
}

/** Reader header date: "24 September 2026 at 5:06 PM". */
export function fullDate(timestamp: number, locale?: string): string {
  const date = new Date(timestamp)
  const day = date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  const time = date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
  return `${day} at ${time}`
}

/** Monogram letters for an avatar: first letter of the first two words. */
export function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((word) => word.match(/\p{L}|\p{N}/u)?.[0] ?? '')
    .filter(Boolean)
  return (letters.slice(0, 2).join('') || '?').toUpperCase()
}
