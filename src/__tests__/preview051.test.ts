import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Preview 0.0.51 Specific Requirements', () => {
  const kitPageSource = readFileSync(resolve(__dirname, '../pages/KitPage.tsx'), 'utf-8')
  const diagnosticoSource = readFileSync(resolve(__dirname, '../pages/Diagnostico.tsx'), 'utf-8')
  const footerSource = readFileSync(resolve(__dirname, '../components/Footer.tsx'), 'utf-8')
  const indexSource = readFileSync(resolve(__dirname, '../pages/Index.tsx'), 'utf-8')

  describe('KitPage: CTAs e Preço', () => {
    it('tem CTAs com rótulo "Comprar o Kit"', () => {
      expect(kitPageSource).toContain('Comprar o Kit')
    })

    it('exibe visivelmente "R$ 29,90" ou "R$ 29,90 à vista"', () => {
      expect(kitPageSource).toContain('R$ 29,90')
      expect(kitPageSource).toContain('R$ 29,90 à vista')
    })

    it('preserva checkout qpFPGxF via helper getKiwifyCheckoutUrl', () => {
      expect(kitPageSource).toContain("getKiwifyCheckoutUrl('pagina_kit')")
    })

    it('informa acesso pela área de membros da Kiwify após confirmação do pagamento e orienta conferir e-mail', () => {
      expect(kitPageSource).toMatch(/área de membros da Kiwify/i)
      expect(kitPageSource).toMatch(/após confirmação do pagamento/i)
      expect(kitPageSource).toMatch(/conferir e-mail/i)
    })

    it('orienta imprimir ou usar aplicativo de anotação compatível sem prometer campos preenchíveis automáticos', () => {
      expect(kitPageSource).toMatch(/imprimir ou usar aplicativo de anotação compatível/i)
    })
  })

  describe('Diagnostico: CTA Conhecer o Kit', () => {
    it('aponta Link interno para /kit-organizacao-inteligente em vez de checkout direto', () => {
      expect(diagnosticoSource).toContain('to="/kit-organizacao-inteligente"')
      expect(diagnosticoSource).not.toContain('diagnostico_resultado')
      expect(diagnosticoSource).not.toContain('getKiwifyCheckoutUrl')
    })

    it('preserva o endpoint oficial do diagnóstico (/backend/v1/diagnosis/subscribe)', () => {
      expect(diagnosticoSource).toContain('/backend/v1/diagnosis/subscribe')
    })
  })

  describe('Footer: Redes Sociais e Diagnóstico', () => {
    it('remove links genéricos x.com e linkedin.com', () => {
      expect(footerSource).not.toContain('x.com')
      expect(footerSource).not.toContain('linkedin.com')
      expect(footerSource).not.toContain('Twitter')
      expect(footerSource).not.toContain('Linkedin')
    })

    it('preserva o link do Instagram organizacao.inteligente.ia', () => {
      expect(footerSource).toContain('https://www.instagram.com/organizacao.inteligente.ia/')
    })

    it('não possui formulário alternativo de newsletter no Footer', () => {
      expect(footerSource).not.toContain('/backend/v1/newsletter/subscribe')
      expect(footerSource).not.toContain('<form')
    })

    it('possui convite/link para o diagnóstico gratuito (/diagnostico)', () => {
      expect(footerSource).toContain('to="/diagnostico"')
      expect(footerSource).toMatch(/Fazer diagnóstico gratuito/i)
    })
  })

  describe('Home (Index): Ausência de Newsletter Alternativa e Preservação', () => {
    it('não possui formulário alternativo de newsletter na Home', () => {
      expect(indexSource).not.toContain('/backend/v1/newsletter/subscribe')
      expect(indexSource).not.toContain('handleSubscribe')
      expect(indexSource).not.toContain('<form')
    })

    it('substitui newsletter por convite ao diagnóstico gratuito (/diagnostico)', () => {
      expect(indexSource).toContain('to="/diagnostico"')
      expect(indexSource).toMatch(/Fazer diagnóstico gratuito/i)
    })

    it('remove qualquer menção a "mapa financeiro"', () => {
      expect(indexSource).not.toMatch(/mapa financeiro/i)
    })

    it('descreve os 3 materiais e os 7 modelos dentro do workbook com plano de 14 dias', () => {
      expect(indexSource).toMatch(/3 materiais/i)
      expect(indexSource).toMatch(/workbook.*26 páginas/i)
      expect(indexSource).toMatch(/7 modelos.*workbook/i)
      expect(indexSource).toMatch(/14 dias/i)
    })
  })
})
