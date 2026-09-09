import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { getStaticArticles } from '@/lib/staticCatalog'

describe('Preview 0.0.59 Requirements: Content Batch 2', () => {
  const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml')
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8')
  const migrationPath = path.resolve(
    process.cwd(),
    'pocketbase/migrations/0020_editorial_adjustments_and_documents_article.js',
  )
  const migrationContent = fs.readFileSync(migrationPath, 'utf-8')

  describe('Sitemap público', () => {
    it('contém exatamente 28 URLs totais (10 páginas core + 18 artigos) e nenhuma URL de preview ou draft', () => {
      expect(sitemapContent).not.toContain('preview')
      expect(sitemapContent).not.toContain('localhost')
      expect(sitemapContent).not.toContain('127.0.0.1')
      expect(sitemapContent).not.toContain('draft')

      const locMatches = sitemapContent.match(/<loc>[^<]+<\/loc>/g) || []
      expect(locMatches).toHaveLength(28)

      const blogLocMatches = sitemapContent.match(/<loc>[^<]+\/blog\/[^<]+<\/loc>/g) || []
      expect(blogLocMatches).toHaveLength(18)

      expect(sitemapContent).toContain(
        '<loc>https://organizacao-inteligente-website-943ee.goskip.app/blog/como-organizar-documentos-digitais-em-pastas</loc>',
      )
    })
  })

  describe('Novo 18º Artigo no Catálogo Estático', () => {
    const articles = getStaticArticles()
    const newArticle = articles.find(
      (a) => a.slug === 'como-organizar-documentos-digitais-em-pastas',
    )

    it('está presente no catálogo estático como primeiro da lista (ordenação mais recente)', () => {
      expect(newArticle).toBeDefined()
      expect(articles[0].slug).toBe('como-organizar-documentos-digitais-em-pastas')
    })

    it('possui título, excerpt, categoria e readingTime corretos', () => {
      expect(newArticle?.title).toBe(
        'Como organizar documentos digitais em pastas: um sistema simples para encontrar arquivos',
      )
      expect(newArticle?.excerpt).toBe(
        'Organize documentos digitais com um modelo de pastas, nomes de arquivos, exemplos práticos e uma rotina de dez minutos para manter tudo em ordem.',
      )
      expect(newArticle?.category).toBe('Organização Pessoal')
      expect(newArticle?.readingTime).toBe(7)
    })

    it('mantém publishedAt em 08/09/2026 e updatedAt como texto 08/09/2026', () => {
      expect(newArticle?.publishedAt).toContain('2026-09-08')
      expect(newArticle?.updatedAt).toBe('08/09/2026')
    })

    it('preserva datas originais dos dois artigos revisados e atualiza apenas updatedAt para 08/09/2026', () => {
      const rotina = articles.find((a) => a.slug === 'como-organizar-rotina-semanal')
      const checklist = articles.find((a) => a.slug === 'checklist-organizacao-pessoal')

      expect(rotina).toBeDefined()
      expect(rotina?.publishedAt).toBe('2026-06-28T17:51:22.876Z')
      expect(rotina?.updatedAt).toBe('08/09/2026')

      expect(checklist).toBeDefined()
      expect(checklist?.publishedAt).toBe('2026-06-29T17:51:22.876Z')
      expect(checklist?.updatedAt).toBe('08/09/2026')
    })
  })

  describe('Migração 0020: Ajustes editoriais e Novo Artigo', () => {
    it('artigo como-organizar-rotina-semanal tem substituições editoriais requeridas', () => {
      expect(migrationContent).toContain('cenário fictício')
      expect(migrationContent).not.toContain('rotina real')
      expect(migrationContent).toContain('Talvez você')
      expect(migrationContent).not.toContain('A maioria das pessoas')
      expect(migrationContent).toContain(
        'cada formato tem vantagens; o importante é escolher o que você consegue manter',
      )
      expect(migrationContent).not.toContain('costuma ser reativo')
    })

    it('artigo checklist-organizacao-pessoal remove disclaimer extenso e ajusta orientações', () => {
      // Disclaimer extenso médico/financeiro/jurídico foi removido
      expect(migrationContent).not.toContain('Nota de transparência: as orientações')
      expect(migrationContent).not.toContain('aconselhamento médico')

      // Substituição de apagar arquivos por conferir o conteúdo e o backup antes
      expect(migrationContent).toContain(
        'conferir o conteúdo e o backup antes de qualquer exclusão',
      )
      expect(migrationContent).toContain('conferir o conteúdo e o backup antes de descartar papéis')

      // Sugestão de duração sem garantia
      expect(migrationContent).toContain(
        '15 minutos é uma sugestão de duração; ajuste conforme sua semana',
      )

      // FAQ com ponto de partida adaptável
      expect(migrationContent).toContain(
        'Comece com 20 a 30 minutos como um ponto de partida adaptável e ajuste o tempo conforme sua prática e a complexidade da sua semana.',
      )
    })

    it('novo artigo possui formatação de código, tabela responsiva, links internos e CTA do Kit', () => {
      // Modelo de pastas em <pre><code>
      expect(migrationContent).toContain('<pre><code>Documentos pessoais/')
      expect(migrationContent).toContain('├── 00_Entrada/')

      // Exemplos de nomes de arquivos em código
      expect(migrationContent).toContain('2026-09-08_internet-casa_comprovante.pdf')

      // Tabela da rotina de 10 min em wrapper com overflow-x:auto
      expect(migrationContent).toContain('overflow-x:auto')
      expect(migrationContent).toContain('<table')
      expect(migrationContent).toContain('2 minutos')
      expect(migrationContent).toContain('Reunir documentos recentes da pasta Downloads')
      expect(migrationContent).toContain('4 minutos')
      expect(migrationContent).toContain(
        'Abrir, identificar, renomear e classificar os itens mais importantes.',
      )

      // Links internos contextuais
      expect(migrationContent).toContain('/blog/minimalismo-digital-organize-vida-online')
      expect(migrationContent).toContain('/blog/checklist-organizacao-pessoal')

      // Link para o CERT.br
      expect(migrationContent).toContain(
        'https://cartilha.cert.br/fasciculos/backup/fasciculo-backup.pdf',
      )

      // CTA do Kit e ferramentas gratuitas (sem "7 arquivos", sem checkout direto)
      expect(migrationContent).toContain('Kit Organização Inteligente por R$ 29,90 à vista')
      expect(migrationContent).toContain('workbook em PDF de 26 páginas')
      expect(migrationContent).toContain('apresentação visual e vídeo introdutório')
      expect(migrationContent).not.toContain('7 arquivos')
      expect(migrationContent).not.toContain('pay.kiwify.com.br')
      expect(migrationContent).toContain('/kit-organizacao-inteligente')
      expect(migrationContent).toContain('/ferramentas-gratuitas')
    })
  })
})
