import { describe, it, expect } from 'vitest'
import { getStaticDownloads, getStaticArticles, getStaticAffiliates } from '@/lib/staticCatalog'
import { findFreeDownloadFile } from '@/lib/freeDownloadFiles'

describe('staticCatalog', () => {
  describe('getStaticDownloads', () => {
    it('returns exactly 5 items', () => {
      const downloads = getStaticDownloads()
      expect(downloads).toHaveLength(5)
    })

    it('returns the expected titles', () => {
      const downloads = getStaticDownloads()
      const titles = downloads.map((d) => d.title)
      expect(titles).toEqual([
        'Planilha de Hábitos - 8 Semanas',
        'Ebook: O Guia da Mente Organizada',
        'Controle de Hábitos Mensal',
        'Planejamento Semanal Inteligente',
        'Checklist da Rotina Matinal Ideal',
      ])
    })

    it('returns specific (non-"Baixar PDF") labels', () => {
      const downloads = getStaticDownloads()
      for (const d of downloads) {
        expect(d.label).not.toBe('Baixar PDF')
      }
      const labels = downloads.map((d) => d.label)
      expect(labels).toContain('Baixar planilha')
      expect(labels).toContain('Baixar e-book')
      expect(labels).toContain('Baixar planner')
      expect(labels).toContain('Baixar checklist')
    })

    it('returns correct filenames that match freeDownloadFiles aliases', () => {
      const downloads = getStaticDownloads()
      const filenames = downloads.map((d) => d.file)
      expect(filenames).toEqual([
        'planilha-habitos-8-semanas.xlsx',
        'guia-da-mente-organizada.pdf',
        'controle-habitos-mensal.xlsx',
        'planejamento-semanal-inteligente.pdf',
        'checklist-rotina-matinal-ideal.pdf',
      ])

      // Every static download title must resolve to a real FreeDownloadFile
      // so the page can build a real (non-blob) asset URL.
      for (const d of downloads) {
        const file = findFreeDownloadFile(d.title)
        expect(file, `expected file for "${d.title}"`).toBeDefined()
        expect(file?.filename).toBe(d.file)
      }
    })

    it('never produces blob: URLs', () => {
      const downloads = getStaticDownloads()
      for (const d of downloads) {
        expect(d.fileUrl).not.toMatch(/^blob:/)
        const file = findFreeDownloadFile(d.title)
        expect(file?.publicUrl).not.toMatch(/^blob:/)
      }
    })
  })

  describe('getStaticArticles', () => {
    it('returns a non-empty array', () => {
      const articles = getStaticArticles()
      expect(Array.isArray(articles)).toBe(true)
      expect(articles.length).toBeGreaterThan(0)
    })

    it('returns 4 featured articles with slugs', () => {
      const articles = getStaticArticles()
      expect(articles).toHaveLength(4)
      for (const a of articles) {
        expect(a.slug).toBeTruthy()
        expect(a.title).toBeTruthy()
      }
    })
  })

  describe('getStaticAffiliates', () => {
    it('returns a non-empty array', () => {
      const affiliates = getStaticAffiliates()
      expect(Array.isArray(affiliates)).toBe(true)
      expect(affiliates.length).toBeGreaterThan(0)
    })

    it('returns 8 affiliates with urls', () => {
      const affiliates = getStaticAffiliates()
      expect(affiliates).toHaveLength(8)
      for (const a of affiliates) {
        expect(a.affiliateUrl).toBeTruthy()
        expect(a.affiliateUrl).toMatch(/^https?:\/\//)
      }
    })
  })
})
