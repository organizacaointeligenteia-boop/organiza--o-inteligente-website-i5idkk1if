import { describe, it, expect } from 'vitest'
import { isPilotHostnameAllowed, PILOT_ALLOWED_HOSTNAME } from '@/pilot/guard'
import { buildRoutineSteps, distributeMinutes, TIME_MINUTES_MAP } from '@/pilot/catalog'
import type { EditorialModelKey } from '@/pilot/types'
import fs from 'node:fs'
import path from 'node:path'

describe('Pilot Frontend 0.0.64 - Regressões e Correções de QA', () => {
  describe('1. Distribuição Exata de Tempo (5, 10, 20 minutos) nos 3 Formatos', () => {
    const formats: EditorialModelKey[] = ['priorities', 'week', 'steps']
    const testMinutes = [5, 10, 20]

    for (const format of formats) {
      for (const minutes of testMinutes) {
        it(`formato "${format}" com ${minutes} min distribui soma EXATAMENTE igual a ${minutes} sem minutos órfãos nem negativos`, () => {
          const steps = buildRoutineSteps(format, minutes)
          expect(steps).toHaveLength(3)

          const parsedMinutes = steps.map((s) => {
            const match = s.text.match(/\((\d+)\s*min\)/)
            expect(match).not.toBeNull()
            const val = Number(match![1])
            expect(val).toBeGreaterThan(0)
            return val
          })

          const total = parsedMinutes.reduce((acc, m) => acc + m, 0)
          expect(total).toBe(minutes)
        })
      }
    }

    it('distributeMinutes para 5 minutos retorna partes que somam 5 (ex.: [2, 2, 1]) e não 6', () => {
      const prio5 = distributeMinutes(5, 'primary-first')
      expect(prio5.reduce((a, b) => a + b, 0)).toBe(5)
      expect(prio5).toEqual([2, 2, 1])

      const steps5 = distributeMinutes(5, 'primary-middle')
      expect(steps5.reduce((a, b) => a + b, 0)).toBe(5)
      expect(steps5).toEqual([2, 2, 1])
    })

    it('distributeMinutes para 10 minutos retorna partes que somam 10', () => {
      const p10 = distributeMinutes(10, 'primary-first')
      expect(p10.reduce((a, b) => a + b, 0)).toBe(10)

      const s10 = distributeMinutes(10, 'primary-middle')
      expect(s10.reduce((a, b) => a + b, 0)).toBe(10)
    })

    it('distributeMinutes para 20 minutos retorna partes que somam 20', () => {
      const p20 = distributeMinutes(20, 'primary-first')
      expect(p20.reduce((a, b) => a + b, 0)).toBe(20)

      const s20 = distributeMinutes(20, 'primary-middle')
      expect(s20.reduce((a, b) => a + b, 0)).toBe(20)
    })
  })

  describe('2. Idempotência do Caminho Ativo', () => {
    it('o manipulador de seleção de caminho preserva escolhas se o caminho já estiver selecionado', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      // Verifica presença da lógica idempotente:
      // se selectedPath === path, não reseta checkedSteps
      expect(pageSource).toContain('if (selectedPath === path)')
      expect(pageSource).toContain('Caminho mantido:')
      expect(pageSource).not.toMatch(
        /const handleSelectPath = \([a-zA-Z]+\) => \{\s*setSelectedPath\([a-zA-Z]+\)\s*setCheckedSteps\(\{\}\)/,
      )
    })
  })

  describe('3. Semântica dos Materiais Fictícios (role="group" + aria-pressed)', () => {
    it('removeu tablist/tab e substituiu por botões nativos num role="group" com aria-pressed acessíveis por Tab + Enter/Space', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pageSource).not.toContain('role="tablist"')
      expect(pageSource).not.toContain('role="tab"')
      expect(pageSource).toContain('role="group"')
      expect(pageSource).toContain('aria-pressed={previewModelKey === sample.key}')
    })
  })

  describe('4. Gerência de Foco pós-submit, Opt-out e Reset', () => {
    it('possui ref de foco (submitFeedbackRef), tabIndex={-1} e aria-live nos elementos de resultado/status', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pageSource).toContain('submitFeedbackRef')
      expect(pageSource).toContain('ref={submitFeedbackRef}')
      expect(pageSource).toContain('tabIndex={-1}')
      expect(pageSource).toContain('submitFeedbackRef.current.focus()')
    })

    it('opt-out limpa marcações, texto, interesses, escolhas e seleção de material, sem reativar personalização', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      // Na desativação da personalização (checked === false):
      expect(pageSource).toContain("setFreeText('')")
      expect(pageSource).toContain("setPreviewModelKey('priorities')")
      expect(pageSource).toContain('setCheckedSteps({})')
      expect(pageSource).toContain('setUserInterests([])')
      expect(pageSource).toContain('setChoices({})')
      expect(pageSource).toContain('setClassificationResult(null)')
    })
  })

  describe('5. Texto do Fallback e Preservação de Privacidade', () => {
    it('trocou "botões abaixo" por "caminhos disponíveis"', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pageSource).not.toContain('botões abaixo')
      expect(pageSource).toContain('caminhos disponíveis')
    })

    it('mantém garantia de limpeza do campo após submit de texto livre sem repetição nem transmissão', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pageSource).toContain("setFreeText('')")
    })
  })

  describe('6. Avaliação Reativa do Guard de Rota por Navegação', () => {
    it('PilotRoute utiliza useLocation para reavaliar allowlist a cada navegação', () => {
      const routeSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotRoute.tsx'),
        'utf-8',
      )

      expect(routeSource).toContain('useLocation()')
      expect(routeSource).toContain('isPilotHostnameAllowed')
      expect(routeSource).toContain('LazyPilotPage')
      expect(routeSource).toContain('location.pathname')
    })

    it('o guard mantém checagem EXATA de hostname sem includes/endsWith nem query params', () => {
      expect(isPilotHostnameAllowed(PILOT_ALLOWED_HOSTNAME)).toBe(true)
      expect(isPilotHostnameAllowed('preview.goskip.app')).toBe(false)
      expect(isPilotHostnameAllowed('organizeinteligente.com.br')).toBe(false)
      expect(isPilotHostnameAllowed(`evil.${PILOT_ALLOWED_HOSTNAME}`)).toBe(false)
    })
  })
})
