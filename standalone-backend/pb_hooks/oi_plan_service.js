const a = require(__hooks + '/oi_access.js')
function library(category, goal, minutes, deadline, key) {
  const catalog = {
    rotina: [
      'week',
      'Distribua tarefas em blocos curtos e preserve espaço para imprevistos.',
      [
        'Escolha uma tarefa essencial para hoje',
        'Reserve um bloco de foco e prepare o ambiente',
        'Revise o que foi feito e o próximo passo',
      ],
    ],
    prioridades: [
      'priorities',
      'Escolha poucas prioridades e transforme cada uma em uma próxima ação.',
      [
        'Liste pendências relacionadas ao objetivo',
        'Escolha a prioridade de maior impacto',
        'Defina e execute uma próxima ação pequena',
      ],
    ],
    documentos: [
      'steps',
      'Organize uma pequena parte dos documentos por vez, com nomes e locais consistentes.',
      [
        'Escolha uma pasta ou conjunto de documentos',
        'Separe os arquivos por assunto e padronize nomes',
        'Confira o resultado e anote a próxima pasta',
      ],
    ],
    habitos: [
      'steps',
      'Associe uma ação pequena a um momento previsível da rotina.',
      [
        'Escolha uma ação pequena ligada ao objetivo',
        'Defina o momento e prepare os materiais',
        'Execute e registre o que facilitou a repetição',
      ],
    ],
    organizacao: [
      'steps',
      'Reduza o escopo e organize uma área de cada vez.',
      [
        'Escolha uma área pequena que possa organizar',
        'Separe o necessário e defina seu lugar',
        'Revise e escolha uma próxima ação para manter a organização',
      ],
    ],
  }
  let c = catalog[category]
  if (key && key !== c[0]) {
    const variants = {
      week: [
        'week',
        'Reserve blocos curtos para o objetivo e revise a agenda.',
        [
          'Escolha uma ação ligada ao objetivo',
          'Reserve um bloco na agenda e execute',
          'Revise o resultado e o próximo bloco',
        ],
      ],
      priorities: [
        'priorities',
        'Priorize as ações de maior impacto para o objetivo.',
        [
          'Liste as ações possíveis para o objetivo',
          'Escolha a ação de maior impacto',
          'Execute uma próxima ação e revise a prioridade',
        ],
      ],
      steps: [
        'steps',
        'Divida o objetivo em passos pequenos e repetíveis.',
        [
          'Divida o objetivo em uma ação pequena',
          'Prepare o ambiente e execute essa ação',
          'Registre o resultado e o próximo passo',
        ],
      ],
    }
    c = variants[key]
  }
  const total = parseInt(minutes, 10)
  let left = total
  const actions = c[2].map((text, i) => {
    const m = i === 2 ? left : Math.ceil(left / (3 - i))
    left -= m
    return {
      id: 'action_' + (i + 1),
      text,
      minutes: m,
      priority: i === 0 ? 'alta' : 'media',
      deadline: deadline || 'Próximo bloco de execução',
      done: false,
    }
  })
  return { modelKey: key || c[0], summary: c[1], actions }
}
function classify(body) {
  const key = $os.getenv('OI_JEV_API_KEY')
  if (!key || body.manual === true)
    return {
      provider: 'manual-honest',
      mode: 'catalog_selection',
      disclaimer: 'Plano montado a partir de modelos revisados; Jev não foi utilizado.',
      costMeasured: null,
    }
  const start = Date.now()
  let response
  try {
    const res = $http.send({
      url: 'https://api.typesafe.ai/v1/systemone',
      method: 'POST',
      timeout: 10,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        state: {
          objective: body.objective,
          category: body.category,
          difficulty: body.difficulty,
          timeAvailable: body.timeAvailable,
        },
        model: 'jev-latest',
        questions: {
          strategy: {
            type: 'choice',
            instructions:
              'Escolha a abordagem de organização mais adequada. Não ofereça orientação médica, jurídica ou financeira.',
            criteria: {
              week: 'Planejar rotina em blocos',
              priorities: 'Selecionar prioridades',
              steps: 'Dividir organização em passos pequenos',
              review: 'Informações insuficientes ou tema fora da organização pessoal',
            },
          },
        },
      }),
    })
    if (res.statusCode !== 200) throw new Error('provider_error')
    response = res.json
    const r = response && response.answers && response.answers.strategy
    const keys = ['week', 'priorities', 'steps', 'review']
    if (
      !r ||
      r.type !== 'choice' ||
      !keys.includes(r.choice) ||
      !Number.isFinite(r.confidence) ||
      r.confidence < 0.8 ||
      r.confidence > 1
    )
      throw new Error('needs_clarification')
    if (
      !r.probabilities ||
      Object.keys(r.probabilities).sort().join(',') !== keys.slice().sort().join(',')
    )
      throw new Error('invalid_schema')
    let sum = 0,
      max = 0
    for (const k of keys) {
      const v = r.probabilities[k]
      if (!Number.isFinite(v) || v < 0 || v > 1) throw new Error('invalid_schema')
      sum += v
      max = Math.max(max, v)
    }
    if (
      Math.abs(sum - 1) > 0.001 ||
      r.probabilities[r.choice] < max - 0.000001 ||
      r.choice === 'review'
    )
      throw new Error('needs_clarification')
    return {
      provider: 'jev-systemone',
      strategy: r.choice,
      confidence: r.confidence,
      latency_ms: Date.now() - start,
      costMeasured: null,
      thresholdCalibrated: false,
      usage: response.usage || null,
    }
  } catch (_) {
    throw new BadRequestError(
      'Não foi possível confirmar uma estratégia. Esclareça o objetivo ou escolha o modo manual.',
    )
  }
}
function handle(e, kind) {
  const member = a.member(e),
    body = e.requestInfo().body || {},
    time = a.now()
  let base = null
  if (kind === 'adjust') base = a.plan($app, String(body.planId || ''), member.id, true, time)
  const input = {
    category: base ? base.getString('category') : String(body.category || ''),
    objective: base ? base.getString('objective') : String(body.objective || '').trim(),
    difficulty: base ? base.getString('difficulty') : String(body.difficulty || 'iniciante'),
    timeAvailable: base ? base.getString('time_available') : String(body.timeAvailable || '10m'),
    targetDeadline: base
      ? base.getString('target_deadline')
      : String(body.targetDeadline || '').slice(0, 120),
    manual: body.manual === true,
    instructions: kind === 'adjust' ? String(body.instructions || '').trim() : '',
  }
  if (!['rotina', 'prioridades', 'documentos', 'habitos', 'organizacao'].includes(input.category))
    throw new BadRequestError('Escolha uma categoria válida.')
  if (input.objective.length < 3 || input.objective.length > 1000)
    throw new BadRequestError('Informe um objetivo de 3 a 1000 caracteres.')
  if (
    !['iniciante', 'intermediario', 'avancado'].includes(input.difficulty) ||
    !['5m', '10m', '20m', '45m'].includes(input.timeAvailable)
  )
    throw new BadRequestError('Tempo ou dificuldade inválidos.')
  if (kind === 'adjust' && (input.instructions.length < 3 || input.instructions.length > 1000))
    throw new BadRequestError('Informe o ajuste desejado.')
  const id = String(body.requestId || '').trim()
  if (!id || id.length > 100) throw new BadRequestError('requestId obrigatório.')
  const fingerprint = JSON.stringify({ kind, base: base ? base.id : null, input })
  let jobId,
    cycleId,
    replay,
    inflight = false
  $app.runInTransaction((app) => {
    const c = a.current(app, member.id, time)
    if (!c || c.getString('status') !== 'active')
      throw new ForbiddenError('Nenhum ciclo de uso ativo.')
    cycleId = c.id
    if (base && base.getString('cycle') !== cycleId)
      throw new ForbiddenError('Este plano pertence a outro ciclo.')
    let old
    try {
      old = app.findFirstRecordByFilter('oi_requests', 'member={:member} && request_id={:id}', {
        member: member.id,
        id,
      })
    } catch (_) {}
    if (old) {
      if (old.getString('fingerprint') !== fingerprint)
        throw new BadRequestError('requestId já usado para outra operação.')
      if (old.getString('status') === 'complete') {
        replay = JSON.parse(old.getString('result'))
        return
      }
      if (old.getString('status') === 'reserved') {
        inflight = true
        return
      }
      throw new BadRequestError(
        'Essa tentativa falhou. Informe um novo requestId para tentar novamente.',
      )
    }
    const q = a.quota(app, cycleId, member.id, time)
    if (q.getInt('daily_used') >= 5 || q.getInt('cycle_used') >= 50)
      throw new TooManyRequestsError('Cota de criação ou ajuste atingida.')
    q.set('daily_used', q.getInt('daily_used') + 1)
    q.set('cycle_used', q.getInt('cycle_used') + 1)
    app.save(q)
    const j = new Record(app.findCollectionByNameOrId('oi_requests'))
    j.set('member', member.id)
    j.set('cycle', cycleId)
    j.set('request_id', id)
    j.set('fingerprint', fingerprint)
    j.set('status', 'reserved')
    app.save(j)
    jobId = j.id
  })
  if (replay) return e.json(200, replay)
  if (inflight) return e.json(202, { pending: true, requestId: id })
  let meta
  try {
    meta = classify(input)
  } catch (error) {
    $app.runInTransaction((app) => {
      const j = app.findRecordById('oi_requests', jobId)
      j.set('status', 'failed')
      app.save(j)
      const q = a.quota(app, cycleId, member.id, time)
      q.set('daily_used', Math.max(0, q.getInt('daily_used') - 1))
      q.set('cycle_used', Math.max(0, q.getInt('cycle_used') - 1))
      app.save(q)
    })
    throw error
  }
  const selected = library(
    input.category,
    input.objective,
    input.timeAvailable,
    input.targetDeadline,
    meta.strategy,
  )
  let result
  $app.runInTransaction((app) => {
    const c = a.sync(app, app.findRecordById('oi_cycles', cycleId), a.now())
    if (c.getString('status') !== 'active')
      throw new ForbiddenError('O ciclo encerrou durante o processamento.')
    const p = new Record(app.findCollectionByNameOrId('oi_plans'))
    p.set('member', member.id)
    p.set('cycle', cycleId)
    p.set(
      'title',
      base
        ? base.getString('title')
        : 'Plano de ' + input.category + ': ' + input.objective.slice(0, 75),
    )
    p.set('category', input.category)
    p.set('objective', input.objective)
    p.set('difficulty', input.difficulty)
    p.set('time_available', input.timeAvailable)
    p.set('target_deadline', input.targetDeadline)
    p.set('version', base ? base.getInt('version') + 1 : 1)
    p.set('parent_plan_id', base ? base.id : '')
    p.set('model_key', selected.modelKey)
    let actions = base ? JSON.parse(base.getString('actions_checklist')) : selected.actions
    if (base)
      actions.push({
        id: 'adjust_' + p.getInt('version'),
        text: input.instructions,
        priority: 'alta',
        deadline: input.targetDeadline || 'Próximo bloco',
        done: false,
      })
    p.set('strategy_summary', selected.summary)
    p.set('actions_checklist', actions)
    p.set('ai_meta', meta)
    app.save(p)
    result = {
      success: true,
      requestId: id,
      plan: a.item(p),
      quotas: a.quotaView(a.quota(app, cycleId, member.id, time)),
    }
    const j = app.findRecordById('oi_requests', jobId)
    j.set('status', 'complete')
    j.set('result', result)
    app.save(j)
  })
  return e.json(200, result)
}
function list(e) {
  const m = a.member(e),
    time = a.now(),
    items = []
  for (const p of a.rows($app, 'oi_plans', 'member={:member}', { member: m.id })) {
    try {
      items.push(a.item(a.plan($app, p.id, m.id, false, time)))
    } catch (error) {
      if (error.status !== 403 && error.status !== 404) throw error
    }
  }
  return e.json(200, { items })
}
function get(e) {
  const m = a.member(e),
    p = a.plan($app, e.request.url.query().get('planId'), m.id, false, a.now())
  return e.json(200, { plan: a.item(p) })
}
function update(e) {
  const m = a.member(e),
    body = e.requestInfo().body || {}
  let result
  $app.runInTransaction((app) => {
    const p = a.plan(app, String(body.planId || ''), m.id, true, a.now())
    if (body.version !== undefined && body.version !== p.getInt('version'))
      throw new BadRequestError('Recarregue a versão atual do plano.')
    if (typeof body.title === 'string' && body.title.trim())
      p.set('title', body.title.trim().slice(0, 120))
    if (typeof body.targetDeadline === 'string')
      p.set('target_deadline', body.targetDeadline.slice(0, 120))
    if (body.actionsChecklist !== undefined) {
      if (
        !Array.isArray(body.actionsChecklist) ||
        body.actionsChecklist.length < 1 ||
        body.actionsChecklist.length > 100
      )
        throw new BadRequestError('Checklist inválido.')
      p.set(
        'actions_checklist',
        body.actionsChecklist.map((v, i) => {
          if (
            !v ||
            typeof v.text !== 'string' ||
            !v.text.trim() ||
            v.text.length > 1000 ||
            !['alta', 'media', 'baixa'].includes(v.priority || 'media')
          )
            throw new BadRequestError('Ação inválida.')
          return {
            id: String(v.id || 'action_' + i).slice(0, 100),
            text: v.text.trim(),
            priority: v.priority || 'media',
            deadline: String(v.deadline || '').slice(0, 120),
            done: v.done === true,
            minutes: Number.isFinite(v.minutes) ? v.minutes : undefined,
          }
        }),
      )
    }
    // Manual changes are versioned as an immutable snapshot, without AI or quota.
    const snapshot = new Record(app.findCollectionByNameOrId('oi_plans'))
    for (const field of [
      'member',
      'cycle',
      'title',
      'category',
      'objective',
      'difficulty',
      'time_available',
      'target_deadline',
      'model_key',
      'strategy_summary',
      'actions_checklist',
      'ai_meta',
    ])
      snapshot.set(field, p.get(field))
    snapshot.set('version', p.getInt('version') + 1)
    snapshot.set('parent_plan_id', p.id)
    app.save(snapshot)
    result = { success: true, plan: a.item(snapshot) }
  })
  return e.json(200, result)
}
function pdf(e) {
  const m = a.member(e),
    p = a.plan($app, e.request.url.query().get('planId'), m.id, false, a.now())
  e.response.header().set('Content-Disposition', 'attachment; filename="plano-oi-' + p.id + '.pdf"')
  return e.blob(200, 'application/pdf', require(__hooks + '/oi_pdf.js').render(a.item(p)))
}
module.exports = { classify, library, handle, list, get, update, pdf }
