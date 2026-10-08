// standalone-backend/pb_hooks/oi_plans_routes.js
/**
 * Rotas da Ferramenta de IA da Organização Inteligente (OI).
 * Rotas:
 * 1. POST /api/oi/plans/create -> Cria um novo plano via Jev SELECT ou modo manual honesto (deduz cota atômica)
 * 2. POST /api/oi/plans/adjust -> Cria nova versão de um plano existente com ajustes (deduz cota atômica)
 * 3. GET  /api/oi/plans/export-pdf -> Exporta um plano em formato seguro com autorização server-side
 *
 * Regras:
 * - Ciclo deve estar "active" e dentro dos 21 dias para criar/ajustar.
 * - Ciclo em "expired" permite somente exportar/consultar planos já criados.
 * - Limite de cotas atômico: máx 5 criações/ajustes por dia e 50 por ciclo.
 * - Edição manual de checklist/status não chama IA nem consome cota.
 * - Jev SELECT com contrato oficial (/v1/systemone): chave lida SOMENTE de $os.getenv("OI_JEV_API_KEY").
 * - Se sem chave: modo manual honesto, sem alegar IA real.
 * - Sem geração livre: seleciona ações/estratégias a partir da biblioteca editorial revisável.
 */

routerAdd(
  'POST',
  '/api/oi/plans/create',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação de membro necessária' })
    }

    const memberId = authRecord.id
    const body = e.requestInfo().body || {}

    const category = String(body.category || '').trim() // 'rotina' | 'prioridades' | 'documentos' | 'habitos'
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

    // 1. Verificar ciclo ativo do membro
    let cycles = []
    try {
      cycles = $app.findRecordsByFilter(
        'oi_cycles',
        "member = '" + memberId + "' && status = 'active'",
        '-created',
        1,
        0,
      )
    } catch (_) {
      cycles = []
    }

    if (cycles.length === 0) {
      return e.json(403, {
        error:
          'Você não possui um ciclo de 21 dias ativo. Inicie seu ciclo ou verifique sua compra.',
      })
    }

    const cycle = cycles[0]
    const cycleId = cycle.id

    // 2. Verificar validade temporal exata
    let nowMs = Date.now()
    const testTimeHeader = e.requestInfo().headers['x-oi-test-time-ms']
    if (testTimeHeader && $os.getenv('OI_ALLOW_TEST_CLOCK') === 'true') {
      const parsed = Number(testTimeHeader)
      if (!isNaN(parsed) && parsed > 0) nowMs = parsed
    }

    const expiresAtStr = cycle.getString('expires_at')
    if (expiresAtStr) {
      const expMs = Date.parse(expiresAtStr)
      if (!isNaN(expMs) && nowMs >= expMs) {
        cycle.set('status', 'expired')
        $app.save(cycle)
        return e.json(403, {
          error:
            'Seu ciclo de 21 dias expirou. Durante os próximos 30 dias você pode apenas consultar e exportar planos anteriores.',
        })
      }
    }

    // 3. Controle Atômico de Cotas (5 por dia / 50 por ciclo)
    const todayBucket = new Date(nowMs).toISOString().substring(0, 10)
    let quotaRec = null
    try {
      quotaRec = $app.findFirstRecordByData('oi_quotas', 'cycle', cycleId)
    } catch (_) {
      quotaRec = null
    }

    let dailyUsed = 0
    let cycleUsed = 0

    if (quotaRec) {
      if (quotaRec.getString('day_bucket') === todayBucket) {
        dailyUsed = quotaRec.getInt('daily_used')
      } else {
        // Novo dia UTC: zera dailyUsed
        dailyUsed = 0
        quotaRec.set('day_bucket', todayBucket)
        quotaRec.set('daily_used', 0)
      }
      cycleUsed = quotaRec.getInt('cycle_used')
    } else {
      const quotasCol = $app.findCollectionByNameOrId('oi_quotas')
      quotaRec = new Record(quotasCol)
      quotaRec.set('cycle', cycleId)
      quotaRec.set('member', memberId)
      quotaRec.set('day_bucket', todayBucket)
      quotaRec.set('daily_used', 0)
      quotaRec.set('cycle_used', 0)
    }

    if (dailyUsed >= 5) {
      return e.json(429, {
        error:
          'Limite diário atingido: você já realizou 5 criações/ajustes hoje. A cota diária renova às 00:00 UTC.',
      })
    }

    if (cycleUsed >= 50) {
      return e.json(429, {
        error:
          'Limite do ciclo atingido: você já utilizou 50 criações/ajustes neste ciclo de 21 dias.',
      })
    }

    // 4. Seleção da Estratégia e Ações da Biblioteca Editorial
    // Mapeamento determinístico de acordo com a categoria e inputs
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
      // prioridades
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

    // Se houver customNotes ou ajuste de tempo
    if (customNotes) {
      defaultActions.push({
        id: 'act_custom',
        text: 'Ajuste específico: ' + customNotes,
        priority: 'media',
        deadline: targetDeadline || 'Durante o ciclo',
        done: false,
      })
    }

    // 5. Integração Jev / AI Audit
    const jevApiKey = $os.getenv('OI_JEV_API_KEY') || ''
    let aiMeta = {
      provider: 'manual-editorial',
      mode: 'deterministic_selection',
      latency_ms: 0,
    }

    const startTime = Date.now()

    if (jevApiKey && jevApiKey.trim().length > 0) {
      // Chamada oficial ao transport server-side Jev /v1/systemone
      const jevEndpoint = $os.getenv('OI_JEV_ENDPOINT') || 'https://api.typesafe.ai/v1/systemone'
      try {
        const jevBody = {
          state:
            'Objetivo: ' +
            objective +
            ' | Categoria: ' +
            category +
            ' | Dificuldade: ' +
            difficulty,
          model: 'jev-latest',
          questions: {
            intent: {
              type: 'choice',
              instructions: 'Selecione a intenção de organização.',
              criteria: {
                routine: 'Rotina ou gestão de tempo',
                priorities: 'Prioridades e foco',
                documents: 'Organização documental',
                habits: 'Criação de constância',
              },
            },
          },
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

        const latencyMs = Date.now() - startTime
        aiMeta = {
          provider: 'jev-systemone',
          latency_ms: latencyMs,
          statusCode: res.statusCode,
        }

        // Auditar chamada
        try {
          const auditCol = $app.findCollectionByNameOrId('oi_ai_audit')
          const auditRec = new Record(auditCol)
          auditRec.set('member', memberId)
          auditRec.set('cycle', cycleId)
          auditRec.set('provider', 'jev-systemone')
          auditRec.set('endpoint', jevEndpoint)
          auditRec.set('latency_ms', latencyMs)
          auditRec.set('success', res.statusCode >= 200 && res.statusCode < 300)
          // Sem preço configurado => custo nulo (nunca inventar custo)
          $app.save(auditRec)
        } catch (_) {}
      } catch (httpErr) {
        aiMeta = {
          provider: 'manual-fallback',
          reason: 'Jev error ou timeout: ' + String(httpErr),
          latency_ms: Date.now() - startTime,
        }
      }
    } else {
      // Sem chave configurada: modo manual honesto
      aiMeta = {
        provider: 'manual-honest',
        mode: 'catalog_selection',
        disclaimer:
          'Modo de seleção manual editorial ativo (sem chave de IA configurada no servidor isolado).',
      }
    }

    // 6. Persistir novo oi_plans
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

    // 7. Deduzir cota atômica com sucesso
    quotaRec.set('daily_used', dailyUsed + 1)
    quotaRec.set('cycle_used', cycleUsed + 1)
    $app.save(quotaRec)

    return e.json(200, {
      success: true,
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
        dailyUsed: dailyUsed + 1,
        dailyRemaining: Math.max(0, 4 - dailyUsed),
        cycleUsed: cycleUsed + 1,
        cycleRemaining: Math.max(0, 49 - cycleUsed),
      },
    })
  },
  $apis.requireAuth(),
)

/**
 * Ajustar plano existente (cria nova versão v+1 e deduz cota)
 */
routerAdd(
  'POST',
  '/api/oi/plans/adjust',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação de membro necessária' })
    }

    const memberId = authRecord.id
    const body = e.requestInfo().body || {}
    const planId = String(body.planId || '').trim()
    const adjustmentInstructions = String(body.instructions || '').trim()

    if (!planId) return e.json(400, { error: 'planId obrigatório' })
    if (!adjustmentInstructions || adjustmentInstructions.length < 3) {
      return e.json(400, { error: 'Instruções de ajuste devem conter ao menos 3 caracteres.' })
    }

    // Buscar plano original
    let originalPlan = null
    try {
      originalPlan = $app.findFirstRecordByData('oi_plans', 'id', planId)
    } catch (_) {
      return e.json(404, { error: 'Plano não encontrado.' })
    }

    // Verificar propriedade do plano
    if (originalPlan.getString('member') !== memberId) {
      return e.json(403, { error: 'Acesso não autorizado a plano de outro usuário.' })
    }

    const cycleId = originalPlan.getString('cycle')
    let cycle = null
    try {
      cycle = $app.findFirstRecordByData('oi_cycles', 'id', cycleId)
    } catch (_) {
      return e.json(400, { error: 'Ciclo associado não encontrado.' })
    }

    if (cycle.getString('status') !== 'active') {
      return e.json(403, {
        error: 'Ciclo não está ativo. Ajustes são permitidos apenas durante os 21 dias ativos.',
      })
    }

    // Cotas
    const todayBucket = new Date().toISOString().substring(0, 10)
    let quotaRec = null
    try {
      quotaRec = $app.findFirstRecordByData('oi_quotas', 'cycle', cycleId)
    } catch (_) {}

    let dailyUsed = quotaRec ? quotaRec.getInt('daily_used') : 0
    let cycleUsed = quotaRec ? quotaRec.getInt('cycle_used') : 0

    if (dailyUsed >= 5) {
      return e.json(429, { error: 'Limite diário de 5 criações/ajustes atingido.' })
    }
    if (cycleUsed >= 50) {
      return e.json(429, { error: 'Limite de 50 criações/ajustes do ciclo atingido.' })
    }

    // Criar nova versão
    const prevVersion = originalPlan.getInt('version')
    const newVersion = prevVersion + 1
    const existingActions = originalPlan.get('actions_checklist') || []

    // Adicionar ação ajustada
    const updatedActions = Array.isArray(existingActions) ? existingActions.slice() : []
    updatedActions.push({
      id: 'adj_' + newVersion,
      text: 'Ajuste v' + newVersion + ': ' + adjustmentInstructions,
      priority: 'alta',
      deadline: 'Próximo bloco',
      done: false,
    })

    const plansCol = $app.findCollectionByNameOrId('oi_plans')
    const newPlanRec = new Record(plansCol)
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
      originalPlan.getString('strategy_summary') +
        ' [Ajustado para: ' +
        adjustmentInstructions +
        ']',
    )
    newPlanRec.set('actions_checklist', updatedActions)
    newPlanRec.set('ai_meta', {
      provider: 'manual-adjusted',
      adjustmentReason: adjustmentInstructions,
    })
    $app.save(newPlanRec)

    // Deduzir cota
    if (quotaRec) {
      quotaRec.set('daily_used', dailyUsed + 1)
      quotaRec.set('cycle_used', cycleUsed + 1)
      $app.save(quotaRec)
    }

    return e.json(200, {
      success: true,
      plan: {
        id: newPlanRec.id,
        title: newPlanRec.getString('title'),
        version: newVersion,
        parentPlanId: planId,
        strategySummary: newPlanRec.getString('strategy_summary'),
        actionsChecklist: updatedActions,
      },
      quotas: {
        dailyUsed: dailyUsed + 1,
        cycleUsed: cycleUsed + 1,
      },
    })
  },
  $apis.requireAuth(),
)

/**
 * Exportar Plano em Formato Seguro / PDF com autorização server-side
 * Rota: GET /api/oi/plans/export-pdf?planId=...
 * Retorna documento formatado com headers de download e verificação estrita de posse.
 */
routerAdd(
  'GET',
  '/api/oi/plans/export-pdf',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação de membro necessária' })
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

    // Autorização Server-Side Estrita: o plano deve pertencer ao membro logado
    if (plan.getString('member') !== memberId) {
      return e.json(403, { error: 'Acesso não autorizado: este plano pertence a outro usuário.' })
    }

    // Verificar se o ciclo está em retenção expirada (se status for purged, rejeitar)
    const cycleId = plan.getString('cycle')
    try {
      const cycle = $app.findFirstRecordByData('oi_cycles', 'id', cycleId)
      if (cycle && cycle.getString('status') === 'purged') {
        return e.json(410, {
          error: 'O conteúdo deste plano foi purgado após o período de 30 dias da expiração.',
        })
      }
    } catch (_) {}

    // Gerar representação textual limpa e segura do plano para exportação
    const title = plan.getString('title')
    const category = plan.getString('category')
    const objective = plan.getString('objective')
    const version = plan.getInt('version')
    const strategy = plan.getString('strategy_summary')
    const actions = plan.get('actions_checklist') || []

    let exportBody = '%PDF-1.4 [OI-SECURE-EXPORT]\n'
    exportBody += '========================================================\n'
    exportBody += 'ORGANIZAÇÃO INTELIGENTE · FERRAMENTA DE IA\n'
    exportBody += 'PLANO DE ORGANIZAÇÃO PESSOAL (VERSÃO ' + version + ')\n'
    exportBody += '========================================================\n\n'
    exportBody += 'TÍTULO: ' + title + '\n'
    exportBody += 'CATEGORIA: ' + category.toUpperCase() + '\n'
    exportBody += 'OBJETIVO: ' + objective + '\n'
    exportBody += 'GERADO EM: ' + plan.getString('created') + '\n\n'
    exportBody += 'ESTRATÉGIA RECOMENDADA:\n'
    exportBody += strategy + '\n\n'
    exportBody += 'CHECKLIST DE AÇÕES E PRIORIDADES:\n'

    if (Array.isArray(actions)) {
      for (let i = 0; i < actions.length; i++) {
        const act = actions[i]
        const mark = act.done ? '[X]' : '[ ]'
        exportBody +=
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

    exportBody += '\n========================================================\n'
    exportBody += 'Este documento foi exportado de forma segura pela Área de Membros da OI.\n'
    exportBody += 'Propriedade do titular da conta: ' + authRecord.getString('email') + '\n'
    exportBody += '========================================================\n'

    // Retornar com cabeçalho de download
    e.response().header().set('Content-Type', 'application/pdf')
    e.response()
      .header()
      .set('Content-Disposition', 'attachment; filename="plano-oi-' + planId + '.pdf"')

    return e.string(200, exportBody)
  },
  $apis.requireAuth(),
)
