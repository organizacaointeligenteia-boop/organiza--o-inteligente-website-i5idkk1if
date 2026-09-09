import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL } from '@/hooks/use-page-meta'
import { parseDateSafe, formatDateBr, getEditorialUpdatedDate } from '@/lib/dateUtils'
import { mergeArticleWithStatic } from '@/services/articles'
import { getStaticArticles } from '@/lib/staticCatalog'
import type { Article } from '@/services/articles'

describe('Preview 0.0.60 Validation Suite', () => {
  describe('(1) Canonical e Domínio Próprio', () => {
    it('BASE_URL é https://organizeinteligente.com.br sem trailing slash', () => {
      expect(BASE_URL).toBe('https://organizeinteligente.com.br')
    })

    it('index.html aponta canonical e og:url para o domínio próprio https://organizeinteligente.com.br', () => {
      const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8')
      expect(indexHtml).toContain(
        '<link rel="canonical" href="https://organizeinteligente.com.br/" />',
      )
      expect(indexHtml).toContain(
        '<meta property="og:url" content="https://organizeinteligente.com.br/" />',
      )
      expect(indexHtml).not.toContain('goskip.app/')
    })

    it('robots.txt aponta sitemap para o domínio próprio https://organizeinteligente.com.br/sitemap.xml', () => {
      const robots = fs.readFileSync(path.resolve(process.cwd(), 'public/robots.txt'), 'utf-8')
      expect(robots).toContain('Sitemap: https://organizeinteligente.com.br/sitemap.xml')
      expect(robots).not.toContain('goskip.app')
    })

    it('sitemap.xml contém todas as URLs apontando para https://organizeinteligente.com.br', () => {
      const sitemap = fs.readFileSync(path.resolve(process.cwd(), 'public/sitemap.xml'), 'utf-8')
      expect(sitemap).not.toContain('goskip.app')
      const locMatches = sitemap.match(/<loc>(https:\/\/[^<]+)<\/loc>/g) || []
      expect(locMatches.length).toBe(28)
      for (const loc of locMatches) {
        expect(loc).toContain('https://organizeinteligente.com.br')
      }
    })
  })

  describe('(2) Parsing de Datas BR/ISO e Regra Editorial de Atualização', () => {
    it('faz parse correto de datas BR (DD/MM/YYYY) sem inverter dia e mês', () => {
      const d = parseDateSafe('08/09/2026')
      expect(d).not.toBeNull()
      expect(d?.getDate()).toBe(8)
      expect(d?.getMonth()).toBe(8) // September is month index 8
      expect(d?.getFullYear()).toBe(2026)
    })

    it('faz parse correto de datas ISO', () => {
      const d = parseDateSafe('2026-09-08T12:00:00.000Z')
      expect(d).not.toBeNull()
      expect(formatDateBr('2026-09-08T12:00:00.000Z')).toBe('08/09/2026')
    })

    it('formata datas em pt-BR', () => {
      expect(formatDateBr('08/09/2026')).toBe('08/09/2026')
      expect(formatDateBr('2026-06-28T17:51:22.876Z')).toBe('28/06/2026')
    })

    it('NUNCA exibe Atualizado em quando data de atualização é igual ou anterior à de publicação', () => {
      // Artigo de documentos: publicado 08/09/2026, updatedAt 08/09/2026 (mesmo dia)
      const sameDay = getEditorialUpdatedDate('2026-09-08T12:00:00.000Z', '08/09/2026')
      expect(sameDay).toBeNull()

      // Caso de data anterior: publicado em setembro, update interpretado erroneamente em agosto
      const earlierDay = getEditorialUpdatedDate('2026-09-08T12:00:00.000Z', '09/08/2026') // se interpretado como agosto
      expect(earlierDay).toBeNull()

      // Sem updatedAt
      expect(getEditorialUpdatedDate('2026-09-08T12:00:00.000Z', undefined)).toBeNull()
    })

    it('exibe Atualizado em apenas quando houve revisão posterior real à publicação', () => {
      // Artigo de rotina: publicado em 28/06/2026, atualizado em 08/09/2026
      const rotinaUpd = getEditorialUpdatedDate('2026-06-28T17:51:22.876Z', '08/09/2026')
      expect(rotinaUpd).toBe('08/09/2026')

      // Artigo de checklist: publicado em 29/06/2026, atualizado em 08/09/2026
      const checkUpd = getEditorialUpdatedDate('2026-06-29T17:51:22.876Z', '08/09/2026')
      expect(checkUpd).toBe('08/09/2026')
    })
  })

  describe('(3) Metatag do Google Search Console', () => {
    it('index.html contém a tag exata no head sem remover verificações nem adicionar pixels', () => {
      const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8')
      expect(indexHtml).toContain(
        '<meta name="google-site-verification" content="hVnkqY01aktx8wuss18k4asik1_dTjGsTVD9pUrKnnY" />',
      )
    })
  })

  describe('(4) Precedência do Catálogo Estático sobre API Antiga', () => {
    it('substitui conteúdo desatualizado da API pelo conteúdo estático recente', () => {
      const apiArticleOld: Article = {
        id: 'api-1',
        slug: 'como-organizar-rotina-semanal',
        title: 'Título Antigo do Banco',
        content: '<p>Conteúdo antigo sem os ajustes da migração 0020</p>',
        category: 'Planejamento',
        publishedAt: '2026-06-28T17:51:22.876Z',
        updatedAt: '2026-07-02T10:00:00.000Z', // data anterior a 08/09/2026
        created: '2026-07-01T17:51:22.878Z',
        updated: '2026-07-01T17:51:22.878Z',
      }

      const merged = mergeArticleWithStatic(apiArticleOld)
      expect(merged.updatedAt).toBe('08/09/2026')
      const staticRotina = getStaticArticles().find(
        (a) => a.slug === 'como-organizar-rotina-semanal',
      )
      expect(merged.title).toBe(staticRotina?.title)
    })

    it('mantém o id e dados do banco quando a API já tiver dados atualizados', () => {
      const apiArticleUpToDate: Article = {
        id: 'api-up-to-date',
        slug: 'como-organizar-rotina-semanal',
        title: 'Título Recente',
        content: '<p>Conteúdo novo</p>',
        category: 'Planejamento',
        publishedAt: '2026-06-28T17:51:22.876Z',
        updatedAt: '09/09/2026',
        created: '2026-07-01T17:51:22.878Z',
        updated: '2026-09-09T17:51:22.878Z',
      }

      const merged = mergeArticleWithStatic(apiArticleUpToDate)
      expect(merged.id).toBe('api-up-to-date')
      expect(merged.updatedAt).toBe('09/09/2026')
    })
  })
})
