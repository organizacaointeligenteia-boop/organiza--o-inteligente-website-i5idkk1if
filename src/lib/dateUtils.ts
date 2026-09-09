/**
 * Utility functions for parsing dates in Brazilian format (DD/MM/YYYY) and ISO format,
 * formatting dates in pt-BR, and determining whether an article has a real subsequent editorial update.
 */

/**
 * Safely parses a date string that may be in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...)
 * or Brazilian format (DD/MM/YYYY or DD/MM/YYYY HH:mm:ss).
 *
 * Avoids the standard `new Date("DD/MM/YYYY")` pitfall where JS engines treat "08/09/2026"
 * as MM/DD/YYYY (August 9 instead of September 8).
 */
export function parseDateSafe(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const trimmed = dateStr.trim()
  if (!trimmed) return null

  // Check Brazilian date pattern: DD/MM/YYYY (with optional HH:mm or HH:mm:ss)
  const brMatch = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/,
  )
  if (brMatch) {
    const day = parseInt(brMatch[1], 10)
    const month = parseInt(brMatch[2], 10) - 1 // 0-based
    const year = parseInt(brMatch[3], 10)
    const hours = brMatch[4] ? parseInt(brMatch[4], 10) : 0
    const minutes = brMatch[5] ? parseInt(brMatch[5], 10) : 0
    const seconds = brMatch[6] ? parseInt(brMatch[6], 10) : 0

    const date = new Date(year, month, day, hours, minutes, seconds)
    if (
      !isNaN(date.getTime()) &&
      date.getDate() === day &&
      date.getMonth() === month &&
      date.getFullYear() === year
    ) {
      return date
    }
    return null
  }

  // Handle standard ISO / date strings
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    return parsed
  }

  return null
}

/**
 * Formats a date into pt-BR "DD/MM/YYYY".
 */
export function formatDateBr(dateStr?: string | null): string {
  const d = parseDateSafe(dateStr)
  if (!d) return ''
  return d.toLocaleDateString('pt-BR')
}

/**
 * Compares editorial published date and updated date.
 * Returns the formatted update date ONLY if there was a real subsequent editorial review
 * (i.e. updated date calendar day is strictly AFTER the published date calendar day).
 *
 * If updated date is missing, equal, or prior to publication date, returns null.
 */
export function getEditorialUpdatedDate(
  publishedAt?: string | null,
  updatedAt?: string | null,
): string | null {
  if (!updatedAt) return null
  const pubDate = parseDateSafe(publishedAt)
  const updDate = parseDateSafe(updatedAt)

  if (!updDate) return null
  if (!pubDate) return updDate.toLocaleDateString('pt-BR')

  // Compare by calendar day in local time to avoid sub-day / timezone mismatch
  // Normalize both to start-of-day
  const pubDay = new Date(pubDate.getFullYear(), pubDate.getMonth(), pubDate.getDate()).getTime()
  const updDay = new Date(updDate.getFullYear(), updDate.getMonth(), updDate.getDate()).getTime()

  // STRICTLY subsequent review
  if (updDay > pubDay) {
    return updDate.toLocaleDateString('pt-BR')
  }

  return null
}
