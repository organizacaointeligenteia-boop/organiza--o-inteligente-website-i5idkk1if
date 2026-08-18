import { describe, it, expect } from 'vitest'
import { buildTitle, BRAND } from '@/hooks/use-page-title'
import { buildCanonicalUrl, applyPageMeta, BASE_URL, DEFAULT_IMAGE } from '@/hooks/use-page-meta'
import { getStaticArticles } from '@/lib/staticCatalog'

// --- Minimal document stub so applyPageMeta can be tested in the node
// environment without jsdom. -------------------------------------------
interface StubElement {
  tagName: string
  attrs: Record<string, string>
  children: StubElement[]
}
function makeDoc() {
  const head: StubElement = { tagName: 'head', attrs: {}, children: [] }
  function createElement(tagName: string): StubElement {
    return { tagName: tagName.toLowerCase(), attrs: {}, children: [] }
  }
  function querySelector(selector: string): StubElement | null {
    // supports: 'link[rel="canonical"]', 'meta[name="x"]', 'meta[property="x"]'
    const linkMatch = selector.match(/^link\[rel="canonical"]$/)
    if (linkMatch) {
      return head.children.find((c) => c.tagName === 'link' && c.attrs.rel === 'canonical') || null
    }
    const metaMatch = selector.match(/^meta\[(name|property)="(.+)"]$/)
    if (metaMatch) {
      const [, attr, key] = metaMatch
      return head.children.find((c) => c.tagName === 'meta' && c.attrs[attr] === key) || null
    }
    return null
  }
  return {
    head,
    title: '',
    createElement,
    querySelector,
  } as unknown as Document
}

/** Helper that reads an attribute off whatever querySelector returned. */
function attr(el: Element | null, name: string): string | undefined {
  return (el as unknown as StubElement | null)?.attrs[name]
}

describe('SEO: buildTitle', () => {
  it('appends the brand for a plain title (no double brand)', () => {
    expect(buildTitle('Blog')).toBe('Blog | Organização Inteligente')
  })

  it('does NOT double the brand when it is already present', () => {
    expect(buildTitle('X | Organização Inteligente')).toBe('X | Organização Inteligente')
  })

  it('returns just the brand for an empty title', () => {
    expect(buildTitle('')).toBe(BRAND)
  })
})

describe('SEO: buildCanonicalUrl', () => {
  it('produces the base URL (no trailing slash) for Home', () => {
    expect(buildCanonicalUrl('/')).toBe(BASE_URL)
    expect(buildCanonicalUrl('/')).not.toMatch(/\/$/)
  })

  it('produces the base URL for an empty/undefined path', () => {
    expect(buildCanonicalUrl('')).toBe(BASE_URL)
    expect(buildCanonicalUrl(undefined)).toBe(BASE_URL)
  })

  it('builds a canonical URL for a page path', () => {
    expect(buildCanonicalUrl('/ferramentas-gratuitas')).toBe(`${BASE_URL}/ferramentas-gratuitas`)
  })

  it('builds a canonical URL for an article path', () => {
    const path = '/blog/5-tecnicas-organizacao-home-office'
    expect(buildCanonicalUrl(path)).toBe(`${BASE_URL}${path}`)
    expect(buildCanonicalUrl(path).endsWith(path)).toBe(true)
  })

  it('strips trailing slashes and query strings', () => {
    expect(buildCanonicalUrl('/blog/some-slug/')).toBe(`${BASE_URL}/blog/some-slug`)
    expect(buildCanonicalUrl('/blog/some-slug?utm=foo')).toBe(`${BASE_URL}/blog/some-slug`)
  })
})

describe('SEO: static article slugs', () => {
  it('all 17 static article slugs are unique', () => {
    const articles = getStaticArticles()
    expect(articles).toHaveLength(17)
    const slugs = articles.map((a) => a.slug)
    expect(new Set(slugs).size).toBe(17)
  })
})

describe('SEO: applyPageMeta (DOM side-effects)', () => {
  it('sets meta[name="description"] from the description param', () => {
    const doc = makeDoc()
    const realDoc = globalThis.document
    globalThis.document = doc
    try {
      applyPageMeta({ path: '/blog', description: 'desc here' })
      const meta = doc.querySelector('meta[name="description"]')
      expect(attr(meta, 'content')).toBe('desc here')
    } finally {
      globalThis.document = realDoc
    }
  })

  it('syncs og:title with document.title', () => {
    const doc = makeDoc()
    doc.title = 'Blog | Organização Inteligente'
    const realDoc = globalThis.document
    globalThis.document = doc
    try {
      applyPageMeta({ path: '/blog', description: 'd' })
      const og = doc.querySelector('meta[property="og:title"]')
      expect(attr(og, 'content')).toBe('Blog | Organização Inteligente')
    } finally {
      globalThis.document = realDoc
    }
  })

  it('sets canonical link to the built URL', () => {
    const doc = makeDoc()
    const realDoc = globalThis.document
    globalThis.document = doc
    try {
      applyPageMeta({ path: '/ferramentas-gratuitas', description: 'd' })
      const link = doc.querySelector('link[rel="canonical"]')
      expect(attr(link, 'href')).toBe(`${BASE_URL}/ferramentas-gratuitas`)
    } finally {
      globalThis.document = realDoc
    }
  })

  it('falls back to /og-image.png when no image is provided', () => {
    const doc = makeDoc()
    const realDoc = globalThis.document
    globalThis.document = doc
    try {
      applyPageMeta({ path: '/sobre', description: 'd' })
      const og = doc.querySelector('meta[property="og:image"]')
      expect(attr(og, 'content')).toBe(DEFAULT_IMAGE)
    } finally {
      globalThis.document = realDoc
    }
  })

  it('sets twitter:url equal to the canonical URL', () => {
    const doc = makeDoc()
    const realDoc = globalThis.document
    globalThis.document = doc
    try {
      applyPageMeta({ path: '/recomendados', description: 'd' })
      const tw = doc.querySelector('meta[name="twitter:url"]')
      expect(attr(tw, 'content')).toBe(`${BASE_URL}/recomendados`)
    } finally {
      globalThis.document = realDoc
    }
  })
})
