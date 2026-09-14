import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Preview 0.0.54 Specific Requirements', () => {
  const indexSource = readFileSync(resolve(__dirname, '../pages/Index.tsx'), 'utf-8')
  const kitPageSource = readFileSync(resolve(__dirname, '../pages/KitPage.tsx'), 'utf-8')
  const diagnosticoSource = readFileSync(resolve(__dirname, '../pages/Diagnostico.tsx'), 'utf-8')

  describe('Home (Index.tsx): Hero e Oferta do Kit', () => {
    it('hero tem CTA primário "Conhecer o Kit" apontando para /kit-organizacao-inteligente', () => {
      expect(indexSource).toContain('Conhecer o Kit')
      expect(indexSource).toContain('to="/kit-organizacao-inteligente"')
    })

    it('hero tem CTA secundário "Fazer diagnóstico gratuito" apontando para /diagnostico', () => {
      expect(indexSource).toContain('Fazer diagnóstico gratuito')
      expect(indexSource).toContain('to="/diagnostico"')
    })

    it('seção da oferta do Kit aparece logo após o hero e antes de artigos e downloads', () => {
      const heroIdx = indexSource.indexOf('Organize sua rotina e execute o que importa')
      const kitOfferIdx = indexSource.indexOf('Oferta Principal · Apenas R$ 29,90 à vista')
      const articlesIdx = indexSource.indexOf('Artigos em Destaque')
      const downloadsIdx = indexSource.indexOf('Ferramentas Gratuitas')

      expect(heroIdx).toBeGreaterThan(-1)
      expect(kitOfferIdx).toBeGreaterThan(heroIdx)
      expect(articlesIdx).toBeGreaterThan(kitOfferIdx)
      expect(downloadsIdx).toBeGreaterThan(articlesIdx)
    })

    it('limita artigos em destaque na Home a no máximo 3 sem apagar catálogo', () => {
      expect(indexSource).toContain('articles.slice(0, 3)')
      expect(indexSource).toContain('getArticles(3, 0)')
    })
  })

  describe('KitPage (KitPage.tsx): Preço, Checkout e Conteúdo', () => {
    it('preço "R$ 29,90 à vista" junto ao primeiro CTA', () => {
      const firstCtaIdx = kitPageSource.indexOf('Comprar o Kit')
      const priceIdx = kitPageSource.indexOf('R$ 29,90 à vista')
      expect(priceIdx).toBeGreaterThan(-1)
      expect(firstCtaIdx).toBeGreaterThan(-1)
      // O preço deve estar imediatamente antes ou após o primeiro CTA
      expect(Math.abs(priceIdx - firstCtaIdx)).toBeLessThan(300)
    })

    it('CTAs de pagamento utilizam o rótulo "Comprar o Kit"', () => {
      const occurrences = (kitPageSource.match(/Comprar o Kit/g) || []).length
      expect(occurrences).toBeGreaterThanOrEqual(2)
    })

    it('preserva checkout oficial cS6LHAp via helper getKiwifyCheckoutUrl com posições hero, meio e rodape', () => {
      expect(kitPageSource).toContain("getKiwifyCheckoutUrl('hero')")
      expect(kitPageSource).toContain("getKiwifyCheckoutUrl('meio')")
      expect(kitPageSource).toContain("getKiwifyCheckoutUrl('rodape')")
    })

    it('possui seção curta explicando diferença entre materiais gratuitos avulsos e kit integrado', () => {
      expect(kitPageSource).toMatch(/Materiais gratuitos avulsos vs\. O Kit integrado/i)
      expect(kitPageSource).toMatch(/Materiais Gratuitos Avulsos/i)
      expect(kitPageSource).toMatch(/Foco pontual/i)
      expect(kitPageSource).toMatch(/Sequência integrada/i)
      expect(kitPageSource).toMatch(/Plano guiado em 14 dias/i)
    })

    it('não promete resultados garantidos e não menciona parcelas sem juros', () => {
      expect(kitPageSource).not.toMatch(/sem juros/i)
      expect(kitPageSource).toMatch(/não há promessa de resultado garantido/i)
    })

    it('mantém menção clara aos 3 materiais e 7 modelos dentro do workbook de 26 páginas', () => {
      expect(kitPageSource).toMatch(/3 materiais complementares/i)
      expect(kitPageSource).toMatch(/26 páginas/i)
      expect(kitPageSource).toMatch(/7 modelos/i)
      expect(kitPageSource).toMatch(/14 dias/i)
      expect(kitPageSource).toMatch(/área de membros da Kiwify/i)
    })
  })

  describe('Diagnóstico (Diagnostico.tsx): Resultado e Kit', () => {
    it('link "Conhecer o Kit" aponta para /kit-organizacao-inteligente', () => {
      expect(diagnosticoSource).toContain('to="/kit-organizacao-inteligente"')
      expect(diagnosticoSource).toContain('Conhecer o Kit')
    })

    it('mostra preço R$ 29,90 e resumo dos 3 materiais no cartão do Kit', () => {
      expect(diagnosticoSource).toContain('R$ 29,90')
      expect(diagnosticoSource).toContain('3 materiais')
      expect(diagnosticoSource).toContain('26 páginas')
      expect(diagnosticoSource).toContain('apresentação visual')
      expect(diagnosticoSource).toContain('vídeo introdutório')
    })

    it('conserva formulário opcional e endpoint do diagnóstico intactos', () => {
      expect(diagnosticoSource).toContain('/backend/v1/diagnosis/subscribe')
      expect(diagnosticoSource).toContain('Receba o próximo passo no seu e-mail')
      expect(diagnosticoSource).toContain('Aceito receber o Checklist e comunicações')
    })
  })
})
