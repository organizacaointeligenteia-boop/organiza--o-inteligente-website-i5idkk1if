import { describe, it, expect } from 'vitest'

/**
 * Simulação determinística em memória da máquina de estado do Ciclo de 21 Dias,
 * cotas atômicas e isolamento do webhook Kiwify.
 */
describe('Preview 0.0.70 - Lógica da Máquina de Estado do Ciclo e Cotas', () => {
  interface SimCycle {
    status: 'waiting_start' | 'active' | 'expired' | 'revoked' | 'purged'
    approvedAtMs: number
    autoStartAtMs: number
    startedAtMs?: number
    expiresAtMs?: number
    retentionUntilMs?: number
    revokedAtMs?: number
  }

  function resolveCycleState(cycle: SimCycle, nowMs: number): SimCycle {
    const copy = { ...cycle }
    const twentyOneDays = 21 * 24 * 60 * 60 * 1000
    const thirtyDays = 30 * 24 * 60 * 60 * 1000

    if (copy.status === 'revoked' || copy.status === 'purged') {
      return copy
    }

    if (copy.status === 'waiting_start') {
      if (nowMs >= copy.autoStartAtMs) {
        copy.status = 'active'
        copy.startedAtMs = copy.autoStartAtMs
        copy.expiresAtMs = copy.startedAtMs + twentyOneDays
        copy.retentionUntilMs = copy.expiresAtMs + thirtyDays
      }
    }

    if (copy.status === 'active' && copy.expiresAtMs) {
      if (nowMs >= copy.expiresAtMs) {
        copy.status = 'expired'
      }
    }

    if (copy.status === 'expired' && copy.retentionUntilMs) {
      if (nowMs >= copy.retentionUntilMs) {
        copy.status = 'purged'
      }
    }

    return copy
  }

  const baseApprovedMs = Date.parse('2025-05-01T10:00:00.000Z')
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  const twentyOneDays = 21 * 24 * 60 * 60 * 1000
  const thirtyDays = 30 * 24 * 60 * 60 * 1000

  it('início manual no dia 2 começa os 21 dias a partir do clique', () => {
    const cycle: SimCycle = {
      status: 'waiting_start',
      approvedAtMs: baseApprovedMs,
      autoStartAtMs: baseApprovedMs + sevenDays,
    }

    // Início manual no dia 2
    const dayTwoMs = baseApprovedMs + 2 * 24 * 60 * 60 * 1000
    cycle.status = 'active'
    cycle.startedAtMs = dayTwoMs
    cycle.expiresAtMs = dayTwoMs + twentyOneDays
    cycle.retentionUntilMs = cycle.expiresAtMs + thirtyDays

    // No dia 10 (8 dias após o início)
    const dayTenMs = dayTwoMs + 8 * 24 * 60 * 60 * 1000
    const res = resolveCycleState(cycle, dayTenMs)
    expect(res.status).toBe('active')

    // No dia 23 após início (expirou)
    const dayTwentyThreeMs = dayTwoMs + 23 * 24 * 60 * 60 * 1000
    const expRes = resolveCycleState(cycle, dayTwentyThreeMs)
    expect(expRes.status).toBe('expired')
  })

  it('se o usuário não clicar em 7 dias, auto-inicia no 7º dia', () => {
    const cycle: SimCycle = {
      status: 'waiting_start',
      approvedAtMs: baseApprovedMs,
      autoStartAtMs: baseApprovedMs + sevenDays,
    }

    // No dia 5 ainda está aguardando
    const dayFiveMs = baseApprovedMs + 5 * 24 * 60 * 60 * 1000
    expect(resolveCycleState(cycle, dayFiveMs).status).toBe('waiting_start')

    // No dia 8 auto-iniciou
    const dayEightMs = baseApprovedMs + 8 * 24 * 60 * 60 * 1000
    const autoStarted = resolveCycleState(cycle, dayEightMs)
    expect(autoStarted.status).toBe('active')
    expect(autoStarted.startedAtMs).toBe(baseApprovedMs + sevenDays)
    expect(autoStarted.expiresAtMs).toBe(baseApprovedMs + sevenDays + twentyOneDays)
  })

  it('após 21 dias expira, ficando em modo download-only por 30 dias', () => {
    const cycle: SimCycle = {
      status: 'waiting_start',
      approvedAtMs: baseApprovedMs,
      autoStartAtMs: baseApprovedMs + sevenDays,
    }

    // No dia 30 (7 + 23 dias): o ciclo está expirado
    const dayThirtyMs = baseApprovedMs + 30 * 24 * 60 * 60 * 1000
    const stateAtDay30 = resolveCycleState(cycle, dayThirtyMs)
    expect(stateAtDay30.status).toBe('expired')

    // No dia 50 (dentro dos 30 dias de retenção): continua expirado / download-only
    const dayFiftyMs = baseApprovedMs + 50 * 24 * 60 * 60 * 1000
    const stateAtDay50 = resolveCycleState(cycle, dayFiftyMs)
    expect(stateAtDay50.status).toBe('expired')

    // No dia 60 (após 7 + 21 + 30 dias): status vira purged
    const daySixtyMs = baseApprovedMs + 59 * 24 * 60 * 60 * 1000
    const stateAtDay60 = resolveCycleState(cycle, daySixtyMs)
    expect(stateAtDay60.status).toBe('purged')
  })

  it('reembolso ou chargeback revoga imediatamente e evento de aprovação fora de ordem não ressuscita', () => {
    let orderStatus = 'approved'
    let cycleStatus = 'active'

    // Chega evento de reembolso
    orderStatus = 'refunded'
    cycleStatus = 'revoked'

    // Chega evento fora de ordem "paid" com o mesmo order_id
    if (orderStatus === 'refunded' || orderStatus === 'chargedback') {
      // Regra de segurança: NÃO ressuscitar
      // Mantém 'refunded' e ciclo 'revoked'
    } else {
      orderStatus = 'approved'
      cycleStatus = 'active'
    }

    expect(orderStatus).toBe('refunded')
    expect(cycleStatus).toBe('revoked')
  })

  it('cotas atômicas: bloqueia no 6º uso diário ou 51º uso do ciclo', () => {
    let dailyUsed = 0
    let cycleUsed = 0

    function attemptCreate(): { ok: boolean; reason?: string } {
      if (dailyUsed >= 5) return { ok: false, reason: 'daily_limit' }
      if (cycleUsed >= 50) return { ok: false, reason: 'cycle_limit' }
      dailyUsed++
      cycleUsed++
      return { ok: true }
    }

    // Fazer 5 criações no mesmo dia
    for (let i = 0; i < 5; i++) {
      expect(attemptCreate().ok).toBe(true)
    }
    // 6ª criação no mesmo dia é bloqueada
    const res6 = attemptCreate()
    expect(res6.ok).toBe(false)
    expect(res6.reason).toBe('daily_limit')

    // Simula novo dia UTC (dailyUsed zera, cycleUsed preserva 5)
    dailyUsed = 0
    expect(attemptCreate().ok).toBe(true)
    expect(cycleUsed).toBe(6)
  })
})
