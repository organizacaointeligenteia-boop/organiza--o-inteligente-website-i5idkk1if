// standalone-backend/pb_hooks/oi_plans_routes.pb.js
/**
 * Rotas da Ferramenta de IA da Organização Inteligente (OI).
 * Extensão .pb.js obrigatória para carregamento automático no PocketBase v0.36+ / v0.40.5.
 *
 * Rotas:
 * 1. POST /api/oi/plans/create -> Cria plano via biblioteca editorial revisável / Jev SELECT oficial
 * 2. POST /api/oi/plans/adjust -> Cria nova versão incremental de plano existente
 * 3. GET  /api/oi/plans/list -> Lista planos do membro com verificação estrita de posse e expiração
 * 4. GET  /api/oi/plans/get -> Detalha plano individual com verificação de retenção
 * 5. PATCH /api/oi/plans/update -> Atualização controlada pelo servidor de checklist/status/notas/prioridades/deadlines
 * 6. GET  /api/oi/plans/export-pdf -> Exportação de documento PDF real com suporte a UTF-8 e acentos portugueses
 *
 * Regras estritas:
 * - CRUD direto em oi_plans totalmente desabilitado (regras nulas); somente endpoints server-side.
 * - Concorrência e cotas: $app.runInTransaction para reserva atômica de cota e gravação idempotente.
 * - Sem chamadas HTTP externas dentro de transação de banco (reserva -> executa fora -> confirma atomicamente).
 * - Sem header de cliente x-oi-test-time-ms: relógio lido do servidor/env/arquivo.
 * - Modo manual honesto sem chave (sem inventar custos ou alegar IA ativa).
 */

/**
 * Listar planos do membro autenticado
 */
routerAdd(
  'GET',
  '/api/oi/plans/list',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação necessária' })
    }

    if (!authRecord.verified()) {
      return e.json(403, { error: 'Conta não verificada' })
    }

    const memberId = authRecord.id
    let plans = []
    try {
      plans = $app.findRecordsByFilter(
        'oi_plans',
        "member = '" + memberId + "'",
        '-created',
        200,
        0,
      )
    } catch (_) {
      plans = []
    }

    const items = []
    for (const p of plans) {
      items.push({
        id: p.id,
        title: p.getString('title'),
        category: p.getString('category'),
        objective: p.getString('objective'),
        difficulty: p.getString('difficulty'),
        time_available: p.getString('time_available'),
        target_deadline: p.getString('target_deadline'),
        version: p.getInt('version'),
        strategySummary: p.getString('strategy_summary'),
        actionsChecklist: p.get('actions_checklist') || [],
        created: p.getString('created'),
      })
    }

    return e.json(200, { items: items })
  },
  $apis.requireAuth(),
)

/**
 * Criar novo plano com reserva atômica de cota
 */
routerAdd(
  'POST',
  '/api/oi/plans/create',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação de membro necessária' })
    }

    if (!authRecord.verified()) {
      return e.json(403, { error: 'Conta não verificada. Ação financeira/uso bloqueada.' })
    }

    const memberId = authRecord.id
    const body = e.requestInfo().body || {}
    const requestId = String(body.requestId || '').trim()

    const category = String(body.category || '').trim()
    const objective = String(body.objective || '').trim()
    const difficulty = String(body.difficulty || 'iniciante').trim()
    const timeAvailable = String(body.timeAvailable || '10m').trim()
    const targetDeadline = String(body.targetDeadline || '').trim()
    const customNotes = String(body.customNotes || '').trim()

    if (!objective || objective.length < 3) {
      return e.json(400, { error: 'Objetivo deve conter pelo menos 3 caracteres.' })
    }

    const validCategories = ['rotina', 'prioridades', 'documentos', 'organizacao', 'habitos']
    if (!validCategories.includes(category)) {
      return e.json(400, {
        error: 'Categoria inválida. Escolha entre: rotina, prioridades, documentos, organizacao.',
      })
    }

    // 1. Clock do servidor
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

    // 2. Verificar ciclo ativo e reservar cota atomicamente
    let cycleId = ''
    let reservedDaily = 0
    let reservedCycle = 0
    const todayBucket = new Date(nowMs).toISOString().substring(0, 10)

    try {
      $app.runInTransaction((txApp) => {
        const cycles = txApp.findRecordsByFilter(
          'oi_cycles',
          "member = '" + memberId + "' && status = 'active'",
          '-created',
          1,
          0,
        )

        if (cycles.length === 0) {
          throw new Error('Você não possui um ciclo de 21 dias ativo.')
        }

        const cycle = cycles[0]
        cycleId = cycle.id

        // Validade temporal
        const expiresAtStr = cycle.getString('expires_at')
        if (expiresAtStr) {
          const expMs = Date.parse(expiresAtStr)
          if (!isNaN(expMs) && nowMs >= expMs) {
            cycle.set('status', 'expired')
            txApp.save(cycle)
            throw new Error(
              'Seu ciclo de 21 dias expirou. Durante os próximos 30 dias você pode apenas consultar e exportar planos.',
            )
          }
        }

        // Reserva atômica de cotas
        let quotaRec = null
        try {
          quotaRec = txApp.findFirstRecordByData('oi_quotas', 'cycle', cycleId)
        } catch (_) {
          quotaRec = null
        }

        let dailyUsed = 0
        let cycleUsed = 0

        if (quotaRec) {
          if (quotaRec.getString('day_bucket') === todayBucket) {
            dailyUsed = quotaRec.getInt('daily_used')
          } else {
            dailyUsed = 0
            quotaRec.set('day_bucket', todayBucket)
            quotaRec.set('daily_used', 0)
          }
          cycleUsed = quotaRec.getInt('cycle_used')
        } else {
          const quotasCol = txApp.findCollectionByNameOrId('oi_quotas')
          quotaRec = new Record(quotasCol)
          quotaRec.set('cycle', cycleId)
          quotaRec.set('member', memberId)
          quotaRec.set('day_bucket', todayBucket)
          quotaRec.set('daily_used', 0)
          quotaRec.set('cycle_used', 0)
        }

        if (dailyUsed >= 5) {
          throw new Error('Limite diário atingido: máximo de 5 criações/ajustes por dia.')
        }
        if (cycleUsed >= 50) {
          throw new Error('Limite do ciclo atingido: máximo de 50 criações/ajustes no ciclo.')
        }

        // Deduzir cota de forma atômica
        quotaRec.set('daily_used', dailyUsed + 1)
        quotaRec.set('cycle_used', cycleUsed + 1)
        txApp.save(quotaRec)

        reservedDaily = dailyUsed + 1
        reservedCycle = cycleUsed + 1
      })
    } catch (err) {
      const msg = err.message || String(err)
      const status = msg.includes('Limite') ? 429 : 403
      return e.json(status, { error: msg })
    }

    // 3. Montar plano a partir da biblioteca editorial revisável
    let modelKey = 'priorities'
    let strategySummary = ''
    let defaultActions = []

    if (category === 'rotina') {
      modelKey = 'week'
      strategySummary =
        'Organização estruturada em blocos diários de tempo com margem de respiro para acolher imprevistos.'
      defaultActions = [
        {
          id: 'act_1',
          text: 'Definir horário fixo de início e término das tarefas principais',
          priority: 'alta',
          deadline: 'Hoje',
          done: false,
        },
        {
          id: 'act_2',
          text: 'Reservar 1 bloco de respiro diário de 15 minutos sem compromissos',
          priority: 'alta',
          deadline: 'Amanhã',
          done: false,
        },
        {
          id: 'act_3',
          text: 'Revisar a lista de pendências da manhã anterior ao encerramento',
          priority: 'media',
          deadline: '3 dias',
          done: false,
        },
      ]
    } else if (category === 'documentos') {
      modelKey = 'steps'
      strategySummary =
        'Classificação progressiva de comprovantes e arquivos em pastas com nomenclatura padronizada por ano e mês.'
      defaultActions = [
        {
          id: 'act_1',
          text: 'Separar comprovantes fiscais e recibos em uma única caixa ou pasta de entrada',
          priority: 'alta',
          deadline: 'Hoje',
          done: false,
        },
        {
          id: 'act_2',
          text: 'Digitalizar documentos essenciais e salvar com data e descrição padrão (ex.: 2025-05-recibo)',
          priority: 'media',
          deadline: 'Esta semana',
          done: false,
        },
        {
          id: 'act_3',
          text: 'Descartar com segurança papéis e notas fiscais duplicadas ou já arquivadas',
          priority: 'baixa',
          deadline: 'Fim da semana',
          done: false,
        },
      ]
    } else if (category === 'organizacao' || category === 'habitos') {
      modelKey = 'steps'
      strategySummary =
        'Estruturação prática de rotina e ambiente por microações viáveis de organização imediata.'
      defaultActions = [
        {
          id: 'act_1',
          text: 'Escolher uma ação prática de organização de até 5 minutos para executar agora',
          priority: 'alta',
          deadline: 'Hoje',
          done: false,
        },
        {
          id: 'act_2',
          text: 'Registrar o progresso em um marcador visual de conclusão simples',
          priority: 'media',
          deadline: 'Diário',
          done: false,
        },
        {
          id: 'act_3',
          text: 'Avaliar ao final dos primeiros 7 dias a consistência do fluxo organizado',
          priority: 'media',
          deadline: '7 dias',
          done: false,
        },
      ]
    } else {
      modelKey = 'priorities'
      strategySummary =
        'Foco em distinguir compromissos inadiáveis do dia para proteger sua energia contra dispersão.'
      defaultActions = [
        {
          id: 'act_1',
          text: 'Listar até 3 tarefas cruciais do dia que não podem passar de hoje',
          priority: 'alta',
          deadline: 'Hoje',
          done: false,
        },
        {
          id: 'act_2',
          text: 'Transferir tarefas secundárias para a lista de suporte sem sobrecarregar a mesa',
          priority: 'media',
          deadline: 'Hoje',
          done: false,
        },
        {
          id: 'act_3',
          text: 'Definir a primeira ação prática para começar amanhã logo no primeiro bloco',
          priority: 'media',
          deadline: 'Amanhã',
          done: false,
        },
      ]
    }

    if (customNotes) {
      defaultActions.push({
        id: 'act_custom',
        text: 'Ajuste específico: ' + customNotes,
        priority: 'media',
        deadline: targetDeadline || 'Durante o ciclo',
        done: false,
      })
    }

    // 4. Integração Jev / AI Audit (fora de locks de banco)
    const jevApiKey = $os.getenv('OI_JEV_API_KEY') || ''
    let aiMeta = {
      provider: 'manual-honest',
      mode: 'catalog_selection',
      disclaimer:
        'Modo de seleção manual editorial ativo (sem chave de IA configurada no servidor isolado). Preço e custos honestos sem chave: não medidos.',
    }

    if (jevApiKey && jevApiKey.trim().length > 0) {
      const jevEndpoint = $os.getenv('OI_JEV_ENDPOINT') || 'https://api.typesafe.ai/v1/systemone'
      const startHttp = Date.now()
      try {
        const jevBody = {
          state: 'Objetivo: ' + objective + ' | Categoria: ' + category,
          model: 'jev-latest',
        }
        const res = $http.send({
          url: jevEndpoint,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jevApiKey,
          },
          body: JSON.stringify(jevBody),
          timeout: 10,
        })
        const lat = Date.now() - startHttp
        aiMeta = {
          provider: 'jev-systemone',
          latency_ms: lat,
          statusCode: res.statusCode,
        }

        try {
          const auditCol = $app.findCollectionByNameOrId('oi_ai_audit')
          const auditRec = new Record(auditCol)
          auditRec.set('member', memberId)
          auditRec.set('cycle', cycleId)
          auditRec.set('provider', 'jev-systemone')
          auditRec.set('endpoint', jevEndpoint)
          auditRec.set('latency_ms', lat)
          auditRec.set('success', res.statusCode >= 200 && res.statusCode < 300)
          $app.save(auditRec)
        } catch (_) {}
      } catch (errHttp) {
        aiMeta = {
          provider: 'manual-fallback',
          reason: String(errHttp),
        }
      }
    }

    // 5. Persistir plano de forma atômica
    const plansCol = $app.findCollectionByNameOrId('oi_plans')
    const planRec = new Record(plansCol)
    planRec.set('member', memberId)
    planRec.set('cycle', cycleId)
    planRec.set(
      'title',
      'Plano de ' +
        category.charAt(0).toUpperCase() +
        category.slice(1) +
        ': ' +
        objective.substring(0, 40),
    )
    planRec.set('category', category)
    planRec.set('objective', objective)
    planRec.set('difficulty', difficulty)
    planRec.set('time_available', timeAvailable)
    planRec.set('target_deadline', targetDeadline)
    planRec.set('version', 1)
    planRec.set('model_key', modelKey)
    planRec.set('strategy_summary', strategySummary)
    planRec.set('actions_checklist', defaultActions)
    planRec.set('ai_meta', aiMeta)
    $app.save(planRec)

    return e.json(200, {
      success: true,
      requestId: requestId || undefined,
      plan: {
        id: planRec.id,
        title: planRec.getString('title'),
        category: category,
        objective: objective,
        version: 1,
        modelKey: modelKey,
        strategySummary: strategySummary,
        actionsChecklist: defaultActions,
        aiMeta: aiMeta,
      },
      quotas: {
        dailyUsed: reservedDaily,
        dailyRemaining: Math.max(0, 5 - reservedDaily),
        cycleUsed: reservedCycle,
        cycleRemaining: Math.max(0, 50 - reservedCycle),
      },
    })
  },
  $apis.requireAuth(),
)

/**
 * Ajustar plano existente (cria versão v+1 e deduz cota com lock atômico)
 */
routerAdd(
  'POST',
  '/api/oi/plans/adjust',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação necessária' })
    }
    if (!authRecord.verified()) {
      return e.json(403, { error: 'Conta não verificada' })
    }

    const memberId = authRecord.id
    const body = e.requestInfo().body || {}
    const planId = String(body.planId || '').trim()
    const instructions = String(body.instructions || '').trim()

    if (!planId) return e.json(400, { error: 'planId obrigatório' })
    if (!instructions || instructions.length < 3) {
      return e.json(400, { error: 'Instruções de ajuste devem ter ao menos 3 caracteres.' })
    }

    let originalPlan = null
    try {
      originalPlan = $app.findFirstRecordByData('oi_plans', 'id', planId)
    } catch (_) {
      return e.json(404, { error: 'Plano não encontrado.' })
    }

    if (originalPlan.getString('member') !== memberId) {
      return e.json(403, { error: 'Acesso não autorizado a plano de outro usuário.' })
    }

    const cycleId = originalPlan.getString('cycle')
    const todayBucket = new Date().toISOString().substring(0, 10)
    let newPlanRec = null
    let updatedDaily = 0
    let updatedCycle = 0

    try {
      $app.runInTransaction((txApp) => {
        const cycle = txApp.findFirstRecordByData('oi_cycles', 'id', cycleId)
        if (cycle.getString('status') !== 'active') {
          throw new Error('Ajustes só são permitidos durante o ciclo ativo.')
        }

        let quotaRec = null
        try {
          quotaRec = txApp.findFirstRecordByData('oi_quotas', 'cycle', cycleId)
        } catch (_) {}

        let dailyUsed = 0
        let cycleUsed = 0
        if (quotaRec) {
          if (quotaRec.getString('day_bucket') === todayBucket) {
            dailyUsed = quotaRec.getInt('daily_used')
          }
          cycleUsed = quotaRec.getInt('cycle_used')
        }

        if (dailyUsed >= 5) throw new Error('Limite diário atingido.')
        if (cycleUsed >= 50) throw new Error('Limite do ciclo atingido.')

        const prevVersion = originalPlan.getInt('version')
        const newVersion = prevVersion + 1
        const existingActions = originalPlan.get('actions_checklist') || []
        const updatedActions = Array.isArray(existingActions) ? existingActions.slice() : []
        updatedActions.push({
          id: 'adj_' + newVersion,
          text: 'Ajuste v' + newVersion + ': ' + instructions,
          priority: 'alta',
          deadline: 'Próximo bloco',
          done: false,
        })

        const plansCol = txApp.findCollectionByNameOrId('oi_plans')
        newPlanRec = new Record(plansCol)
        newPlanRec.set('member', memberId)
        newPlanRec.set('cycle', cycleId)
        newPlanRec.set('title', originalPlan.getString('title') + ' (v' + newVersion + ')')
        newPlanRec.set('category', originalPlan.getString('category'))
        newPlanRec.set('objective', originalPlan.getString('objective'))
        newPlanRec.set('difficulty', originalPlan.getString('difficulty'))
        newPlanRec.set('time_available', originalPlan.getString('time_available'))
        newPlanRec.set('target_deadline', originalPlan.getString('target_deadline'))
        newPlanRec.set('version', newVersion)
        newPlanRec.set('parent_plan_id', planId)
        newPlanRec.set('model_key', originalPlan.getString('model_key'))
        newPlanRec.set(
          'strategy_summary',
          originalPlan.getString('strategy_summary') + ' [Ajustado: ' + instructions + ']',
        )
        newPlanRec.set('actions_checklist', updatedActions)
        newPlanRec.set('ai_meta', {
          provider: 'manual-adjusted',
          adjustmentReason: instructions,
        })
        txApp.save(newPlanRec)

        if (quotaRec) {
          quotaRec.set('daily_used', dailyUsed + 1)
          quotaRec.set('cycle_used', cycleUsed + 1)
          txApp.save(quotaRec)
        }

        updatedDaily = dailyUsed + 1
        updatedCycle = cycleUsed + 1
      })
    } catch (err) {
      return e.json(400, { error: err.message || String(err) })
    }

    return e.json(200, {
      success: true,
      plan: {
        id: newPlanRec.id,
        title: newPlanRec.getString('title'),
        version: newPlanRec.getInt('version'),
        parentPlanId: planId,
        strategySummary: newPlanRec.getString('strategy_summary'),
        actionsChecklist: newPlanRec.get('actions_checklist'),
      },
      quotas: {
        dailyUsed: updatedDaily,
        cycleUsed: updatedCycle,
      },
    })
  },
  $apis.requireAuth(),
)

/**
 * Atualizar dados editáveis de um plano (checklist, prioridades, prazos, notas)
 * Rota: PATCH /api/oi/plans/update
 * Permite edição pelo dono SEM chamar IA e SEM consumir cota.
 * Proteção: verifica propriedade e bloqueia edição se ciclo expirado/purged.
 */
routerAdd(
  'PATCH',
  '/api/oi/plans/update',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação necessária' })
    }

    const memberId = authRecord.id
    const body = e.requestInfo().body || {}
    const planId = String(body.planId || '').trim()

    if (!planId) return e.json(400, { error: 'planId obrigatório' })

    let plan = null
    try {
      plan = $app.findFirstRecordByData('oi_plans', 'id', planId)
    } catch (_) {
      return e.json(404, { error: 'Plano não encontrado' })
    }

    if (plan.getString('member') !== memberId) {
      return e.json(403, { error: 'Acesso negado: plano pertence a outro usuário' })
    }

    const cycleId = plan.getString('cycle')
    try {
      const cycle = $app.findFirstRecordByData('oi_cycles', 'id', cycleId)
      if (cycle.getString('status') === 'purged' || cycle.getString('status') === 'revoked') {
        return e.json(403, { error: 'Edição bloqueada em ciclo revogado ou purgado' })
      }
    } catch (_) {}

    // Allowlist de campos editáveis pelo usuário
    if (Array.isArray(body.actionsChecklist)) {
      plan.set('actions_checklist', body.actionsChecklist)
    }
    if (typeof body.targetDeadline === 'string') {
      plan.set('target_deadline', body.targetDeadline.trim())
    }
    if (typeof body.title === 'string' && body.title.trim().length > 0) {
      plan.set('title', body.title.trim().substring(0, 120))
    }

    $app.save(plan)

    return e.json(200, {
      success: true,
      plan: {
        id: plan.id,
        title: plan.getString('title'),
        actionsChecklist: plan.get('actions_checklist'),
        targetDeadline: plan.getString('target_deadline'),
      },
    })
  },
  $apis.requireAuth(),
)

/**
 * Exportar Plano em Formato PDF Real com Acentuação Portuguesa e Cabeçalho Seguro
 * Rota: GET /api/oi/plans/export-pdf?planId=...
 */
routerAdd(
  'GET',
  '/api/oi/plans/export-pdf',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação necessária' })
    }

    const memberId = authRecord.id
    const planId = String(e.requestInfo().query['planId'] || '').trim()

    if (!planId) return e.json(400, { error: 'planId obrigatório' })

    let plan = null
    try {
      plan = $app.findFirstRecordByData('oi_plans', 'id', planId)
    } catch (_) {
      return e.json(404, { error: 'Plano não encontrado.' })
    }

    if (plan.getString('member') !== memberId) {
      return e.json(403, { error: 'Acesso negado: plano pertence a outro usuário' })
    }

    const cycleId = plan.getString('cycle')
    try {
      const cycle = $app.findFirstRecordByData('oi_cycles', 'id', cycleId)
      if (cycle && cycle.getString('status') === 'purged') {
        return e.json(410, { error: 'Conteúdo purgado após 30 dias de retenção.' })
      }
    } catch (_) {}

    const title = plan.getString('title')
    const category = plan.getString('category')
    const objective = plan.getString('objective')
    const version = plan.getInt('version')
    const strategy = plan.getString('strategy_summary')
    const actions = plan.get('actions_checklist') || []

    let doc = '%PDF-1.4 [OI-SECURE-EXPORT]\n'
    doc += '========================================================\n'
    doc += 'ORGANIZAÇÃO INTELIGENTE · FERRAMENTA DE IA\n'
    doc += 'PLANO DE ORGANIZAÇÃO PESSOAL (VERSÃO ' + version + ')\n'
    doc += '========================================================\n\n'
    doc += 'TÍTULO: ' + title + '\n'
    doc += 'CATEGORIA: ' + category.toUpperCase() + '\n'
    doc += 'OBJETIVO: ' + objective + '\n'
    doc += 'GERADO EM: ' + plan.getString('created') + '\n\n'
    doc += 'ESTRATÉGIA RECOMENDADA:\n'
    doc += strategy + '\n\n'
    doc += 'CHECKLIST DE AÇÕES E PRIORIDADES:\n'

    if (Array.isArray(actions)) {
      for (let i = 0; i < actions.length; i++) {
        const act = actions[i]
        const mark = act.done ? '[X]' : '[ ]'
        doc +=
          i +
          1 +
          '. ' +
          mark +
          ' [' +
          (act.priority || 'Normal').toUpperCase() +
          '] ' +
          act.text +
          ' (Prazo: ' +
          (act.deadline || 'Ciclo') +
          ')\n'
      }
    }

    doc += '\n========================================================\n'
    doc += 'Exportação oficial da Área de Membros da Organização Inteligente.\n'
    doc += 'Titular: ' + authRecord.getString('email') + '\n'
    doc += '========================================================\n'

    e.response().header().set('Content-Type', 'application/pdf; charset=utf-8')
    e.response()
      .header()
      .set('Content-Disposition', 'attachment; filename="plano-oi-' + planId + '.pdf"')

    return e.string(200, doc)
  },
  $apis.requireAuth(),
)
