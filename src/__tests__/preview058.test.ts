import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { getStaticArticles } from '@/lib/staticCatalog'

describe('Preview 0.0.58 Content Batch Requirements', () => {
  it('sitemap.xml contains exactly 17 blog articles and no preview URLs', () => {
    const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml')
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8')

    // Must not contain any preview url or localhost
    expect(sitemapContent).not.toContain('preview')
    expect(sitemapContent).not.toContain('localhost')
    expect(sitemapContent).not.toContain('127.0.0.1')
    expect(sitemapContent).not.toContain('draft')

    const articles = getStaticArticles()
    expect(articles.length).toBeGreaterThanOrEqual(17)

    // All articles must be present in the sitemap
    for (const article of articles) {
      const expectedUrl = `https://organizeinteligente.com.br/blog/${article.slug}`
      expect(sitemapContent).toContain(`<loc>${expectedUrl}</loc>`)
    }

    // Blog article links in sitemap
    const blogLocMatches = sitemapContent.match(/<loc>[^<]+\/blog\/[^<]+<\/loc>/g) || []
    expect(blogLocMatches.length).toBeGreaterThanOrEqual(17)
  })

  it('staticCatalog preserves original publication dates and sets updatedAt separately', () => {
    const articles = getStaticArticles()
    const rotina = articles.find((a) => a.slug === 'como-organizar-rotina-semanal')
    const checklist = articles.find((a) => a.slug === 'checklist-organizacao-pessoal')

    expect(rotina).toBeDefined()
    expect(rotina?.publishedAt).toBe('2026-06-28T17:51:22.876Z')
    expect(rotina?.updatedAt).toBe('08/09/2026')

    expect(checklist).toBeDefined()
    expect(checklist?.publishedAt).toBe('2026-06-29T17:51:22.876Z')
    expect(checklist?.updatedAt).toBe('08/09/2026')
  })

  it('migration 0019 complies with content guidelines', () => {
    const migPath = path.resolve(
      process.cwd(),
      'pocketbase/migrations/0019_improve_articles_content.js',
    )
    const migContent = fs.readFileSync(migPath, 'utf-8')

    // No unproven claims / no "você acerta"
    expect(migContent).not.toContain('você acerta')
    expect(migContent).not.toContain('voce acerta')

    // Mentions shift work or family flexibility
    expect(migContent).toContain('turnos')
    expect(migContent).toContain('família')

    // 20% and 30min as adaptable suggestions
    expect(migContent).toContain('referência')

    // Has example of week with 3 priorities, first action, duration, blocks, margin
    expect(migContent).toContain('Cenário semanal de exemplo')
    expect(migContent).toContain('Prioridade 1')
    expect(migContent).toContain('Primeira ação')
    expect(migContent).toContain('Margem reservada')

    // Has how to reschedule if losing a day
    expect(migContent).toContain('Como reagendar se você perder um dia inteiro')

    // Has checklist and FAQ
    expect(migContent).toContain('Checklist prático: estruturando sua semana')
    expect(migContent).toContain('Perguntas frequentes (FAQ)')

    // Checklist article differentiates from weekly guide
    expect(migContent).toContain('Diferente de um guia de rotina semanal')
    expect(migContent).toContain('áreas da vida')

    // Disclaimers: no medical, financial, legal promises
    expect(migContent).toContain('médico')
    expect(migContent).toContain('financeiro')
    expect(migContent).toContain('jurídico')

    // CTAs: free tools and Kit R$ 29,90 with 26-page workbook + visual presentation + introductory video (NOT "7 arquivos")
    expect(migContent).not.toContain('7 arquivos')
    expect(migContent).toContain('R$ 29,90')
    expect(migContent).toContain('26 páginas')
    expect(migContent).toContain('/ferramentas-gratuitas')
    expect(migContent).toContain('/kit-organizacao-inteligente')
    expect(migContent).not.toContain('pay.kiwify.com.br/cS6LHAp')
    expect(migContent).not.toContain('pay.kiwify.com.br/qpFPGxF') // internal CTA to /kit-organizacao-inteligente, not direct checkout
  })
})
