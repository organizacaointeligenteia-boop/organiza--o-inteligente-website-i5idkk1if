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

  describe('2. Integridade dos Modelos Editoriais e Catálogo Preservado', () => {
    it('as funções do catálogo continuam puras e utilizáveis sem acoplamento a UI externa', () => {
      const steps = buildRoutineSteps('priorities', 10)
      expect(steps).toHaveLength(3)
      expect(TIME_MINUTES_MAP['10m']).toBe(10)
    })
  })

  describe('3. Proteção e Fail-Closed na Apresentação da Área Paga', () => {
    it('PilotOrganizacaoPage não contém campos de entrada livre de texto de visitante nem painel de auto-liberação', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pageSource).not.toContain('<textarea')
      expect(pageSource).not.toContain('Encontrar meu caminho')
      expect(pageSource).not.toContain('Teste do adaptador Jev (simulado)')
    })

    it('PilotOrganizacaoPage exige login oficial ou aponta para rota de membros /piloto-organizacao/login', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pageSource).toContain('to="/piloto-organizacao/login"')
      expect(pageSource).toContain('useAuth()')
      expect(pageSource).toContain('resolveAuthorization')
    })
  })

  describe('4. Preservação dos Limites e Semântica Institucional', () => {
    it('afirma explicitamente que a ferramenta é produto pago separado do Kit', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pageSource).toContain('produto pago separado do Kit')
      expect(pageSource).toContain('Pagamento Único por 21 Dias')
    })

    it('mantém isolamento estrito sem liberação insegura por localStorage ou query string', () => {
      const pageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pageSource).not.toContain('localStorage')
      expect(pageSource).not.toContain('sessionStorage')
      expect(pageSource).not.toContain('location.search')
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
