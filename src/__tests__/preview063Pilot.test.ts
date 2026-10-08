import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isPilotHostnameAllowed, PILOT_ALLOWED_HOSTNAME } from '@/pilot/guard'
import {
  EDITORIAL_CATALOG,
  KIT_SAMPLES,
  TOPIC_LABELS,
  TIME_LABELS,
  FORMAT_LABELS,
  resolveSuggestedModel,
  buildRoutineSteps,
  buildGuidanceSteps,
} from '@/pilot/catalog'
import { classifyFreeText, normalizeText } from '@/pilot/classifier'
import fs from 'node:fs'
import path from 'node:path'

describe('Pilot Frontend 0.0.63 - Piloto de Demonstração', () => {
  describe('1. Pure Allowlist e Proteção de Hostname', () => {
    it('libera EXATAMENTE o hostname oficial da preview', () => {
      expect(
        isPilotHostnameAllowed('organizacao-inteligente-website-943ee--preview.goskip.app'),
      ).toBe(true)
      expect(isPilotHostnameAllowed(PILOT_ALLOWED_HOSTNAME)).toBe(true)
    })

    it('bloqueia o domínio próprio de produção', () => {
      expect(isPilotHostnameAllowed('organizeinteligente.com.br')).toBe(false)
      expect(isPilotHostnameAllowed('www.organizeinteligente.com.br')).toBe(false)
    })

    it('bloqueia localhost e IP local', () => {
      expect(isPilotHostnameAllowed('localhost')).toBe(false)
      expect(isPilotHostnameAllowed('127.0.0.1')).toBe(false)
      expect(isPilotHostnameAllowed('0.0.0.0')).toBe(false)
    })

    it('bloqueia subdomínios fraudulentos ou variações de sufixo', () => {
      expect(
        isPilotHostnameAllowed('fake-organizacao-inteligente-website-943ee--preview.goskip.app'),
      ).toBe(false)
      expect(
        isPilotHostnameAllowed(
          'organizacao-inteligente-website-943ee--preview.goskip.app.attacker.com',
        ),
      ).toBe(false)
      expect(
        isPilotHostnameAllowed('organizacao-inteligente-website-943ee--preview.goskip.app/piloto'),
      ).toBe(false)
      expect(isPilotHostnameAllowed('preview.goskip.app')).toBe(false)
      expect(isPilotHostnameAllowed('goskip.app')).toBe(false)
    })

    it('trata valores nulos, vazios ou indefinidos com segurança', () => {
      expect(isPilotHostnameAllowed('')).toBe(false)
      expect(isPilotHostnameAllowed(null)).toBe(false)
      expect(isPilotHostnameAllowed(undefined)).toBe(false)
    })

    it('aceita correspondência com espaços ou letras maiúsculas por normalização pura', () => {
      expect(
        isPilotHostnameAllowed(' ORGANIZACAO-INTELIGENTE-WEBSITE-943EE--PREVIEW.GOSKIP.APP '),
      ).toBe(true)
    })
  })

  describe('2. Classificador por Regras Locais (classifier.ts)', () => {
    it('normaliza texto removendo acentos e pontuações', () => {
      expect(normalizeText('ORGANIZAÇÃO SEMANAL!')).toBe('organizacao semanal!')
      expect(normalizeText('Hábitos & Rotina')).toBe('habitos & rotina')
    })

    it('classifica texto vazio como desconhecido com fonte demo-local', () => {
      const res = classifyFreeText('   ')
      expect(res.source).toBe('demo-local')
      expect(res.intent).toBe('unknown')
      expect(res.suggestedPath).toBeNull()
    })

    describe('Prioridade Máxima para Temas Restritos (Saúde, Direito, Finanças)', () => {
      it('restringe termos clínicos mesmo misturados a termos de rotina', () => {
        const res = classifyFreeText(
          'Preciso de rotina para tomar meu medicamento controlado e depressao',
        )
        expect(res.intent).toBe('restricted')
        expect(res.suggestedPath).toBeNull()
        expect(res.source).toBe('demo-local')
        expect(res.restrictedReason).toContain('saúde, direito ou finanças')
      })

      it('restringe termos jurídicos (processo judicial, audiência, advogado, inss)', () => {
        const res = classifyFreeText('Como organizar prazos do meu processo judicial no inss')
        expect(res.intent).toBe('restricted')
        expect(res.suggestedPath).toBeNull()
      })

      it('restringe termos financeiros e investimentos (investir, bitcoin, divida, imposto)', () => {
        const res = classifyFreeText(
          'Quero organizar meu dinheiro para investir em bitcoin e pagar divida',
        )
        expect(res.intent).toBe('restricted')
        expect(res.suggestedPath).toBeNull()
      })
    })

    describe('Classificação de Rotina (routine) por Tópicos', () => {
      it('classifica semana/tempo para rotina e tópico time', () => {
        const res = classifyFreeText('Quero organizar minha semana e planejar meu tempo')
        expect(res.intent).toBe('routine')
        expect(res.suggestedPath).toBe('routine')
        expect(res.topic).toBe('time')
      })

      it('classifica prioridades/foco para rotina e tópico priorities', () => {
        const res = classifyFreeText('Tenho muitas tarefas e preciso definir minhas prioridades')
        expect(res.intent).toBe('routine')
        expect(res.suggestedPath).toBe('routine')
        expect(res.topic).toBe('priorities')
      })

      it('classifica hábitos/constância para rotina e tópico consistency', () => {
        const res = classifyFreeText('Quero manter habitos saudaveis e criar constancia no dia')
        expect(res.intent).toBe('routine')
        expect(res.suggestedPath).toBe('routine')
        expect(res.topic).toBe('consistency')
      })
    })

    describe('Classificação de Kit (kit)', () => {
      it('classifica menções a kit, modelo, ferramenta ou template', () => {
        const res = classifyFreeText('Gostaria de ver o kit e os modelos de planilhas')
        expect(res.intent).toBe('kit')
        expect(res.suggestedPath).toBe('kit')
      })
    })

    describe('Classificação de Orientação (guidance)', () => {
      it('classifica menções a orientação, passo a passo ou como funciona', () => {
        const res = classifyFreeText('Como funciona a aplicacao pratica no dia a dia passo a passo')
        expect(res.intent).toBe('guidance')
        expect(res.suggestedPath).toBe('guidance')
      })
    })

    describe('Texto Desconhecido', () => {
      it('retorna unknown para texto genérico sem fingir entendimento', () => {
        const res = classifyFreeText('Hoje o céu está azul com nuvens brancas')
        expect(res.intent).toBe('unknown')
        expect(res.suggestedPath).toBeNull()
      })
    })
  })

  describe('3. Catálogo Editorial e Lógica de Sugestão (catalog.ts)', () => {
    it('contém exatamente os 3 modelos conceituais especificados', () => {
      expect(EDITORIAL_CATALOG.priorities).toBeDefined()
      expect(EDITORIAL_CATALOG.priorities.name).toBe('Lista de prioridades')
      expect(EDITORIAL_CATALOG.priorities.examples).toHaveLength(3)

      expect(EDITORIAL_CATALOG.week).toBeDefined()
      expect(EDITORIAL_CATALOG.week.name).toBe('Mapa da semana')
      expect(EDITORIAL_CATALOG.week.examples).toHaveLength(3)

      expect(EDITORIAL_CATALOG.steps).toBeDefined()
      expect(EDITORIAL_CATALOG.steps.name).toBe('Guia de pequenos passos')
      expect(EDITORIAL_CATALOG.steps.examples).toHaveLength(3)
    })

    it('fornece amostras fictícias para o caminho do Kit sem qualquer preço ou link de compra', () => {
      expect(KIT_SAMPLES).toHaveLength(3)
      for (const sample of KIT_SAMPLES) {
        expect(sample.sampleText).toContain('Simulação de preenchimento')
        expect(sample.structure.length).toBeGreaterThanOrEqual(4)
      }
    })

    it('resolve sugestão de modelo por tópico corretamente', () => {
      expect(resolveSuggestedModel('time', undefined)).toBe('week')
      expect(resolveSuggestedModel('consistency', undefined)).toBe('steps')
      expect(resolveSuggestedModel('priorities', undefined)).toBe('priorities')
      expect(resolveSuggestedModel('general', undefined)).toBe('priorities')
    })

    it('formato explícito PREVALECE sobre o tópico sugerido', () => {
      // Mesmo com topic=time, se o usuário escolheu priorities, deve retornar priorities
      expect(resolveSuggestedModel('time', 'priorities')).toBe('priorities')
      expect(resolveSuggestedModel('time', 'steps')).toBe('steps')
      expect(resolveSuggestedModel('consistency', 'week')).toBe('week')
    })

    it('gera passos de rotina com durações proporcionais aos minutos escolhidos', () => {
      const steps5 = buildRoutineSteps('priorities', 5)
      expect(steps5).toHaveLength(3)
      expect(steps5[0].text).toContain('min')

      const steps20 = buildRoutineSteps('week', 20)
      expect(steps20).toHaveLength(3)
      expect(steps20[0].text).toContain('8 min')
    })

    it('gera 3 passos de orientação para o caminho guidance', () => {
      const guidance = buildGuidanceSteps('week', 10)
      expect(guidance).toHaveLength(3)
      expect(guidance[0].stepNumber).toBe(1)
      expect(guidance[1].title).toContain('10 minutos')
    })
  })

  describe('4. Isolamento Arquitetural e Não Afetação do Site Público', () => {
    it('o menu de navegação pública (Header.tsx) NÃO contém link para o piloto', () => {
      const headerSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/Header.tsx'),
        'utf-8',
      )
      expect(headerSource).not.toContain('/piloto-organizacao')
      expect(headerSource).not.toContain('Piloto')
    })

    it('a sidebar pública (AppSidebar.tsx) NÃO contém link para o piloto', () => {
      const sidebarSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/AppSidebar.tsx'),
        'utf-8',
      )
      expect(sidebarSource).not.toContain('/piloto-organizacao')
    })

    it('o sitemap público (public/sitemap.xml) NÃO contém URL do piloto', () => {
      const sitemapSource = fs.readFileSync(
        path.resolve(process.cwd(), 'public/sitemap.xml'),
        'utf-8',
      )
      expect(sitemapSource).not.toContain('piloto')
      expect(sitemapSource).not.toContain('piloto-organizacao')
    })

    it('a Home (Index.tsx) NÃO contém link para o piloto', () => {
      const indexSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pages/Index.tsx'),
        'utf-8',
      )
      expect(indexSource).not.toContain('/piloto-organizacao')
    })

    it('o KitPage (src/pages/KitPage.tsx) permanece integro e preservado', () => {
      const kitSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pages/KitPage.tsx'),
        'utf-8',
      )
      expect(kitSource).toContain('R$ 29,90 à vista')
      expect(kitSource).toContain('Workbook Premium em PDF')
      expect(kitSource).toContain('26 páginas')
      expect(kitSource).not.toContain('piloto-organizacao')
    })

    it('App.tsx renderiza /piloto-organizacao FORA do Layout padrão com PilotRoute', () => {
      const appSource = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8')
      expect(appSource).toContain('path="/piloto-organizacao"')
      expect(appSource).toContain('<PilotRoute />')
      // Rota deve estar fora de <Route element={<Layout />}>
      const layoutEndIdx = appSource.indexOf('</Route>\n              {/* Piloto de Demonstração')
      expect(layoutEndIdx).toBeGreaterThan(0)
    })
  })

  describe('5. Ausência de Persistência, Conexões Externas e Rede no Módulo do Piloto', () => {
    it('o código do piloto não usa localStorage, sessionStorage ou cookies para liberação', () => {
      const pageCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )
      expect(pageCode).not.toContain('localStorage')
      expect(pageCode).not.toContain('sessionStorage')
      expect(pageCode).not.toContain('document.cookie')
      expect(pageCode).not.toContain('fetch(')
      expect(pageCode).not.toContain('axios')
    })

    it('o módulo do piloto não contém checkout, preço inventado nem links de compra', () => {
      const pageCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )
      expect(pageCode).not.toContain('kiwify.com.br')
      expect(pageCode).not.toContain('R$')
      expect(pageCode).not.toContain('cartão')
      expect(pageCode).not.toContain('checkout')
    })

    it('o módulo do piloto declara explicitamente os avisos de ausência de IA ativa em produção e dados de apresentação', () => {
      const pageCode = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )
      expect(pageCode).toContain('Nenhuma IA ativa ou conectada em produção')
      expect(pageCode).toContain('PRODUTO PAGO · ÁREA RESTRITA')
      expect(pageCode).toContain('produto pago separado do Kit')
    })
  })
})
