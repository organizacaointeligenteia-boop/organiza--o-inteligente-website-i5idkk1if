export const PILOT_ALLOWED_HOSTNAME = 'organizacao-inteligente-website-943ee--preview.goskip.app'

/**
 * Pure allowlist function. Returns true ONLY if the provided hostname is
 * EXACTLY PILOT_ALLOWED_HOSTNAME.
 *
 * Explicit rules:
 * - No wildcards
 * - No startsWith / endsWith / includes
 * - No query param or localStorage release
 * - Strictly pure and easily testable
 */
export function isPilotHostnameAllowed(hostname: string | null | undefined): boolean {
  if (typeof hostname !== 'string') return false
  const trimmed = hostname.trim().toLowerCase()
  return trimmed === PILOT_ALLOWED_HOSTNAME
}

/**
 * Returns current window hostname safely (handles SSR / tests without window).
 */
export function getCurrentHostname(): string {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname
  }
  return ''
}
