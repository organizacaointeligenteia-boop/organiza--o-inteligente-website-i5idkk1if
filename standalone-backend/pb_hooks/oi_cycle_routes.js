// standalone-backend/pb_hooks/oi_cycle_routes.js
/**
 * Rotas de Gestão do Ciclo de 21 Dias da Ferramenta OI.
 * Rotas:
 * 1. GET /api/oi/cycle/status -> Consulta o estado exato do ciclo ativo/recente do membro logado
 * 2. POST /api/oi/cycle/start -> Inicia atomicamente os 21 dias uma única vez ("Começar meus 21 dias")
 *
 * Regras do Ciclo:
 * - Compra confirmada -> 7 dias para iniciar.
 * - Botão "Começar meus 21 dias" inicia atomicamente uma única vez:
 *     started_at = now, expires_at = started_at + 21 dias, retention_until = expires_at + 30 dias.
 * - Se não iniciar e passar de auto_start_at (approved_at + 7 dias):
 *     started_at = auto_start_at, expires_at = started_at + 21 dias, retention_until = expires_at + 30 dias.
 * - Se UTC atual > expires_at: status é "expired".
 * - Se expirado há mais de 30 dias (UTC atual > retention_until): conteúdo dos planos é purgado (status="purged").
 * - Durante os 30 dias de expiração: somente consulta e export dos resultados já gerados.
 */

routerAdd(
  'GET',
  '/api/oi/cycle/status',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação de membro necessária' })
    }

    const memberId = authRecord.id
    let cycles = []
    try {
      cycles = $app.findRecordsByFilter(
        'oi_cycles',
        "member = '" + memberId + "'",
        '-created',
        1,
        0,
      )
    } catch (_) {
      cycles = []
    }

    if (cycles.length === 0) {
      return e.json(200, {
        hasCycle: false,
        status: 'none',
        message: 'Nenhum ciclo ou compra confirmada para este membro.',
      })
    }

    const cycle = cycles[0]
    const cycleId = cycle.id
    let status = cycle.getString('status')
    const approvedAtStr = cycle.getString('approved_at')
    const autoStartAtStr = cycle.getString('auto_start_at')
    let startedAtStr = cycle.getString('started_at')
    let expiresAtStr = cycle.getString('expires_at')
    let retentionUntilStr = cycle.getString('retention_until')

    // Clock UTC do servidor (com suporte opcional a mock de relógio via header de testes locais)
    let nowMs = Date.now()
    const testTimeHeader = e.requestInfo().headers['x-oi-test-time-ms']
    if (testTimeHeader && $os.getenv('OI_ALLOW_TEST_CLOCK') === 'true') {
      const parsed = Number(testTimeHeader)
      if (!isNaN(parsed) && parsed > 0) {
        nowMs = parsed
      }
    }

    const twentyOneDaysMs = 21 * 24 * 60 * 60 * 1000
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    // Se estiver "waiting_start", verificar se ultrapassou auto_start_at (7 dias após compra)
    if (status === 'waiting_start') {
      const autoStartMs = Date.parse(autoStartAtStr)
      if (!isNaN(autoStartMs) && nowMs >= autoStartMs) {
        // Início automático!
        status = 'active'
        const startedMs = autoStartMs
        const expiresMs = startedMs + twentyOneDaysMs
        const retentionMs = expiresMs + thirtyDaysMs

        startedAtStr = new Date(startedMs).toISOString().replace('T', ' ').substring(0, 19)
        expiresAtStr = new Date(expiresMs).toISOString().replace('T', ' ').substring(0, 19)
        retentionUntilStr = new Date(retentionMs).toISOString().replace('T', ' ').substring(0, 19)

        cycle.set('status', 'active')
        cycle.set('started_at', startedAtStr)
        cycle.set('expires_at', expiresAtStr)
        cycle.set('retention_until', retentionUntilStr)
        $app.save(cycle)
      }
    }

    // Se estiver "active", verificar se expirou
    if (status === 'active' && expiresAtStr) {
      const expiresMs = Date.parse(expiresAtStr)
      if (!isNaN(expiresMs) && nowMs >= expiresMs) {
        status = 'expired'
        cycle.set('status', 'expired')
        $app.save(cycle)
      }
    }

    // Se estiver "expired", verificar se passou do período de retenção (30 dias)
    if (status === 'expired' && retentionUntilStr) {
      const retentionMs = Date.parse(retentionUntilStr)
      if (!isNaN(retentionMs) && nowMs >= retentionMs) {
        // Purgar conteúdo de planos do ciclo, preservando a conta e o registro da compra
        status = 'purged'
        cycle.set('status', 'purged')
        $app.save(cycle)

        // Purgar textos de planos
        try {
          const plans = $app.findRecordsByFilter(
            'oi_plans',
            "cycle = '" + cycleId + "'",
            '-created',
            100,
            0,
          )
          for (const p of plans) {
            p.set('strategy_summary', '[CONTEÚDO PURGADO APÓS 30 DIAS DA EXPIRAÇÃO DO CICLO]')
            p.set('actions_checklist', [
              { id: 'purged', text: 'Conteúdo do plano arquivado e purgado.', done: true },
            ])
            $app.save(p)
          }
        } catch (_) {}
      }
    }

    // Cálculo de dias restantes
    let daysRemaining = 0
    let isDownloadOnly = false
    let canCreatePlans = false

    if (status === 'active' && expiresAtStr) {
      const expMs = Date.parse(expiresAtStr)
      daysRemaining = Math.max(0, Math.ceil((expMs - nowMs) / (24 * 60 * 60 * 1000)))
      canCreatePlans = true
    } else if (status === 'expired') {
      isDownloadOnly = true
      if (retentionUntilStr) {
        const retMs = Date.parse(retentionUntilStr)
        daysRemaining = Math.max(0, Math.ceil((retMs - nowMs) / (24 * 60 * 60 * 1000)))
      }
    }

    // Consulta de cotas consumidas hoje e no ciclo
    const todayBucket = new Date(nowMs).toISOString().substring(0, 10)
    let dailyUsed = 0
    let cycleUsed = 0

    try {
      const quotaRec = $app.findFirstRecordByData('oi_quotas', 'cycle', cycleId)
      // Se for o mesmo dia
      if (quotaRec.getString('day_bucket') === todayBucket) {
        dailyUsed = quotaRec.getInt('daily_used')
      }
      cycleUsed = quotaRec.getInt('cycle_used')
    } catch (_) {}

    return e.json(200, {
      hasCycle: true,
      cycleId: cycle.id,
      status: status,
      approvedAt: approvedAtStr,
      autoStartAt: autoStartAtStr,
      startedAt: startedAtStr,
      expiresAt: expiresAtStr,
      retentionUntil: retentionUntilStr,
      daysRemaining: daysRemaining,
      canStartNow: status === 'waiting_start',
      canCreatePlans: canCreatePlans && status === 'active',
      isDownloadOnly: isDownloadOnly,
      quotas: {
        dailyUsed: dailyUsed,
        dailyLimit: 5,
        dailyRemaining: Math.max(0, 5 - dailyUsed),
        cycleUsed: cycleUsed,
        cycleLimit: 50,
        cycleRemaining: Math.max(0, 50 - cycleUsed),
      },
    })
  },
  $apis.requireAuth(),
)

/**
 * Iniciar atomicamente o ciclo de 21 dias
 */
routerAdd(
  'POST',
  '/api/oi/cycle/start',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação de membro necessária' })
    }

    const memberId = authRecord.id
    let cycles = []
    try {
      cycles = $app.findRecordsByFilter(
        'oi_cycles',
        "member = '" + memberId + "' && status = 'waiting_start'",
        '-created',
        1,
        0,
      )
    } catch (_) {
      cycles = []
    }

    if (cycles.length === 0) {
      return e.json(400, {
        error:
          'Nenhum ciclo aguardando início para este membro. O ciclo pode já ter sido iniciado ou não existir.',
      })
    }

    const cycle = cycles[0]

    let nowMs = Date.now()
    const testTimeHeader = e.requestInfo().headers['x-oi-test-time-ms']
    if (testTimeHeader && $os.getenv('OI_ALLOW_TEST_CLOCK') === 'true') {
      const parsed = Number(testTimeHeader)
      if (!isNaN(parsed) && parsed > 0) {
        nowMs = parsed
      }
    }

    const twentyOneDaysMs = 21 * 24 * 60 * 60 * 1000
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    const startedIso = new Date(nowMs).toISOString().replace('T', ' ').substring(0, 19)
    const expiresIso = new Date(nowMs + twentyOneDaysMs)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)
    const retentionIso = new Date(nowMs + twentyOneDaysMs + thirtyDaysMs)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)

    cycle.set('status', 'active')
    cycle.set('started_at', startedIso)
    cycle.set('expires_at', expiresIso)
    cycle.set('retention_until', retentionIso)
    $app.save(cycle)

    return e.json(200, {
      success: true,
      cycleId: cycle.id,
      status: 'active',
      startedAt: startedIso,
      expiresAt: expiresIso,
      retentionUntil: retentionIso,
      daysRemaining: 21,
    })
  },
  $apis.requireAuth(),
)
