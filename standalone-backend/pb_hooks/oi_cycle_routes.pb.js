// standalone-backend/pb_hooks/oi_cycle_routes.pb.js
/**
 * Rotas de Gestão do Ciclo de 21 Dias da Ferramenta OI.
 * Extensão .pb.js obrigatória para carregamento automático no PocketBase v0.36+ / v0.40.5.
 *
 * Rotas:
 * 1. GET /api/oi/cycle/status -> Consulta o estado exato do ciclo ativo/recente do membro logado
 * 2. POST /api/oi/cycle/start -> Inicia atomicamente os 21 dias uma única vez com transação e lock
 *
 * Regras:
 * - REMOÇÃO TOTAL do header x-oi-test-time-ms controlado pelo cliente.
 * - Clock de teste APENAS via env/arquivo privado local: OI_TEST_NOW_MS ou arquivo pb_data/test_clock_ms.txt.
 * - Início atômico via $app.runInTransaction impedindo condições de corrida.
 * - Expurgo total: após retention_until (30 dias de expiração), limpa título, objetivo, strategy_summary, actions_checklist, ai_meta e dados.
 */

routerAdd(
  'GET',
  '/api/oi/cycle/status',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação de membro necessária' })
    }

    if (!authRecord.verified()) {
      return e.json(403, { error: 'Conta de membro não verificada. Acesso bloqueado.' })
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

    // Clock estrito do servidor: nenhum header do cliente é aceito!
    let nowMs = Date.now()
    const envTestClock = $os.getenv('OI_TEST_NOW_MS')
    if (envTestClock) {
      const parsed = Number(envTestClock)
      if (!isNaN(parsed) && parsed > 0) nowMs = parsed
    } else {
      // Ou arquivo privado do servidor pb_data/test_clock_ms.txt
      try {
        const fileContent = $os.readFile('pb_data/test_clock_ms.txt')
        if (fileContent) {
          const parsed = Number(String(fileContent).trim())
          if (!isNaN(parsed) && parsed > 0) nowMs = parsed
        }
      } catch (_) {}
    }

    const twentyOneDaysMs = 21 * 24 * 60 * 60 * 1000
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    // Se estiver "waiting_start", verificar se ultrapassou auto_start_at (7 dias após compra)
    if (status === 'waiting_start') {
      const autoStartMs = Date.parse(autoStartAtStr)
      if (!isNaN(autoStartMs) && nowMs >= autoStartMs) {
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
        status = 'purged'
        cycle.set('status', 'purged')
        $app.save(cycle)

        // Expurgo COMPLETO de todos os dados dos planos do ciclo:
        // título, objetivo, sumário, checklists, notas, metadados
        try {
          const plans = $app.findRecordsByFilter(
            'oi_plans',
            "cycle = '" + cycleId + "'",
            '-created',
            500,
            0,
          )
          for (const p of plans) {
            p.set('title', '[PLANO EXPURGADO APÓS 30 DIAS]')
            p.set('objective', '[EXPURGADO]')
            p.set('strategy_summary', '[CONTEÚDO EXPURGADO APÓS 30 DIAS DA EXPIRAÇÃO DO CICLO]')
            p.set('actions_checklist', [
              { id: 'purged', text: 'Conteúdo purgado por política de retenção.', done: true },
            ])
            p.set('ai_meta', { purged: true })
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
 * Iniciar atomicamente o ciclo de 21 dias com transação
 */
routerAdd(
  'POST',
  '/api/oi/cycle/start',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação de membro necessária' })
    }

    if (!authRecord.verified()) {
      return e.json(403, { error: 'Conta não verificada. Ação bloqueada.' })
    }

    const memberId = authRecord.id
    let cycleId = ''
    let startedIso = ''
    let expiresIso = ''
    let retentionIso = ''

    // Clock estrito do servidor
    let nowMs = Date.now()
    const envTestClock = $os.getenv('OI_TEST_NOW_MS')
    if (envTestClock) {
      const parsed = Number(envTestClock)
      if (!isNaN(parsed) && parsed > 0) nowMs = parsed
    } else {
      try {
        const fileContent = $os.readFile('pb_data/test_clock_ms.txt')
        if (fileContent) {
          const parsed = Number(String(fileContent).trim())
          if (!isNaN(parsed) && parsed > 0) nowMs = parsed
        }
      } catch (_) {}
    }

    const twentyOneDaysMs = 21 * 24 * 60 * 60 * 1000
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

    try {
      $app.runInTransaction((txApp) => {
        const cycles = txApp.findRecordsByFilter(
          'oi_cycles',
          "member = '" + memberId + "' && status = 'waiting_start'",
          '-created',
          1,
          0,
        )

        if (cycles.length === 0) {
          throw new Error('Nenhum ciclo aguardando início para este membro.')
        }

        const cycle = cycles[0]
        cycleId = cycle.id

        startedIso = new Date(nowMs).toISOString().replace('T', ' ').substring(0, 19)
        expiresIso = new Date(nowMs + twentyOneDaysMs)
          .toISOString()
          .replace('T', ' ')
          .substring(0, 19)
        retentionIso = new Date(nowMs + twentyOneDaysMs + thirtyDaysMs)
          .toISOString()
          .replace('T', ' ')
          .substring(0, 19)

        cycle.set('status', 'active')
        cycle.set('started_at', startedIso)
        cycle.set('expires_at', expiresIso)
        cycle.set('retention_until', retentionIso)
        txApp.save(cycle)
      })
    } catch (err) {
      return e.json(400, { error: err.message || String(err) })
    }

    return e.json(200, {
      success: true,
      cycleId: cycleId,
      status: 'active',
      startedAt: startedIso,
      expiresAt: expiresIso,
      retentionUntil: retentionIso,
      daysRemaining: 21,
    })
  },
  $apis.requireAuth(),
)
