import { useEffect } from 'react'

export const BASE_URL = 'https://organizacao-inteligente-website-943ee.goskip.app'
export const DEFAULT_IMAGE = '/og-image.png'

export interface UsePageMetaOptions {
  path?: string
  description?: string
  image?: string
}

/**
 * Build the canonical URL for a given path.
 * - Empty/"/" path → base URL with no trailing slash.
 * - Any other path → base URL + path (no trailing slash, no query string).
 * Pure function — exported for testing.
 */
export function buildCanonicalUrl(path?: string): string {
  if (!path || path === '/') return BASE_URL
  // Strip query string and trailing slash, but keep a single leading slash.
  const clean = path.split('?')[0].replace(/\/+$/, '')
  return `${BASE_URL}${clean.startsWith('/') ? clean : `/${clean}`}`
}

function upsertMeta(
  head: HTMLHeadElement,
  selector: string,
  attr: 'name' | 'property',
  key: string,
  content: string,
) {
  let el = head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta') as HTMLMetaElement
    el.setAttribute(attr, key)
    head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(head: HTMLHeadElement, href: string) {
  let el = head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link') as HTMLLinkElement
    el.setAttribute('rel', 'canonical')
    head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Applies the meta tags to `document`. Extracted from the React hook so it can
 * be unit-tested in isolation. Tags are left in place after a route change —
 * the SPA simply overwrites them on the next call.
 */
export function applyPageMeta(options: UsePageMetaOptions = {}) {
  const { path, description, image } = options
  const head = document.head
  if (!head) return

  const canonical = buildCanonicalUrl(path)
  const img = image || DEFAULT_IMAGE
  const title = document.title

  upsertCanonical(head, canonical)

  if (description) {
    upsertMeta(head, 'meta[name="description"]', 'name', 'description', description)
  }

  upsertMeta(head, 'meta[property="og:title"]', 'property', 'og:title', title)
  upsertMeta(head, 'meta[property="og:url"]', 'property', 'og:url', canonical)
  upsertMeta(head, 'meta[property="og:image"]', 'property', 'og:image', img)
  if (description) {
    upsertMeta(head, 'meta[property="og:description"]', 'property', 'og:description', description)
  }

  upsertMeta(head, 'meta[name="twitter:title"]', 'name', 'twitter:title', title)
  upsertMeta(head, 'meta[name="twitter:url"]', 'name', 'twitter:url', canonical)
  upsertMeta(head, 'meta[name="twitter:image"]', 'name', 'twitter:image', img)
  if (description) {
    upsertMeta(head, 'meta[name="twitter:description"]', 'name', 'twitter:description', description)
  }
}

/**
 * Manages dynamic meta tags for an SPA route. Title is managed separately by
 * `usePageTitle` — this hook only syncs og:title / twitter:title with
 * `document.title`. Tags are left in place on unmount (SPA keeps them).
 */
export function usePageMeta(options: UsePageMetaOptions = {}) {
  const { path, description, image } = options

  useEffect(() => {
    applyPageMeta({ path, description, image })
  }, [path, description, image])
}
