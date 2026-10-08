// Shared server-only access policy. All timestamps are UTC, and test time is private.
const DAY = 86400000
function now() {
  let value = $os.getenv('OI_TEST_NOW_MS')
  if (!value) {
    try {
      value = toString($os.readFile($app.dataDir() + '/test_clock_ms.txt'))
    } catch (_) {}
  }
  const parsed = Number(value)
  return value && Number.isFinite(parsed) && parsed > 0 ? parsed : Date.now()
}
function stamp(value) {
  return new Date(value).toISOString()
}
function ms(value) {
  if (!value) return NaN
  return Date.parse(value.replace(' ', 'T').replace(/Z?$/, 'Z'))
}
function rows(app, collection, filter, params) {
  return app.findRecordsByFilter(collection, filter, '-created,-id', 0, 0, params || {})
}
function sync(app, cycle, time) {
  let status = cycle.getString('status')
  if (status === 'waiting_start' && time >= ms(cycle.getString('auto_start_at'))) {
    const start = ms(cycle.getString('auto_start_at'))
    cycle.set('status', 'active')
    cycle.set('started_at', stamp(start))
    cycle.set('expires_at', stamp(start + 21 * DAY))
    cycle.set('retention_until', stamp(start + 51 * DAY))
    app.save(cycle)
    status = 'active'
  }
  if (
    status === 'active' &&
    (!Number.isFinite(ms(cycle.getString('expires_at'))) ||
      time >= ms(cycle.getString('expires_at')))
  ) {
    cycle.set('status', 'expired')
    app.save(cycle)
    status = 'expired'
  }
  const retention =
    ms(cycle.getString('retention_until')) || ms(cycle.getString('auto_start_at')) + 51 * DAY
  if (['expired', 'revoked'].includes(status) && time >= retention) {
    for (const p of rows(app, 'oi_plans', 'cycle = {:cycle}', { cycle: cycle.id })) app.delete(p)
    try {
      for (const job of rows(app, 'oi_requests', 'cycle = {:cycle}', { cycle: cycle.id }))
        app.delete(job)
    } catch (_) {}
    cycle.set('status', 'purged')
    app.save(cycle)
    status = 'purged'
  }
  return cycle
}
function current(app, member, time) {
  claim(app, member)
  const cycles = rows(app, 'oi_cycles', 'member = {:member}', { member })
  for (const cycle of cycles) sync(app, cycle, time)
  const usable = cycles.filter((c) => ['waiting_start', 'active'].includes(c.getString('status')))
  return usable[0] || cycles[0] || null
}
function member(e) {
  if (!e.auth || e.auth.collection().name !== 'oi_memberships')
    throw new UnauthorizedError('Login de membro necessário.')
  if (!e.auth.verified()) throw new ForbiddenError('Confirme seu e-mail para continuar.')
  if (e.auth.getString('role') !== 'member')
    throw new ForbiddenError('Use uma conta de membro para a ferramenta.')
  return e.auth
}
function plan(app, id, owner, editing, time) {
  let p
  try {
    p = app.findRecordById('oi_plans', id)
  } catch (_) {
    throw new NotFoundError('Plano não encontrado.')
  }
  if (p.getString('member') !== owner) throw new ForbiddenError('Plano de outra conta.')
  const c = sync(app, app.findRecordById('oi_cycles', p.getString('cycle')), time)
  const status = c.getString('status')
  if (editing && status !== 'active') throw new ForbiddenError('Seu período de uso terminou.')
  if (!editing && !['active', 'expired'].includes(status))
    throw new ForbiddenError('Resultado não disponível.')
  if (status === 'expired' && time >= ms(c.getString('retention_until')))
    throw new ForbiddenError('O período de download terminou.')
  return p
}
function item(p) {
  return {
    id: p.id,
    title: p.getString('title'),
    category: p.getString('category'),
    objective: p.getString('objective'),
    difficulty: p.getString('difficulty'),
    time_available: p.getString('time_available'),
    target_deadline: p.getString('target_deadline'),
    version: p.getInt('version'),
    parentPlanId: p.getString('parent_plan_id'),
    modelKey: p.getString('model_key'),
    strategySummary: p.getString('strategy_summary'),
    actionsChecklist: JSON.parse(p.getString('actions_checklist') || '[]'),
    aiMeta: JSON.parse(p.getString('ai_meta') || '{}'),
    cycle: p.getString('cycle'),
    created: p.getString('created'),
  }
}
function quota(app, cycle, owner, time) {
  let q
  try {
    q = app.findFirstRecordByData('oi_quotas', 'cycle', cycle)
  } catch (_) {
    q = new Record(app.findCollectionByNameOrId('oi_quotas'))
    q.set('cycle', cycle)
    q.set('member', owner)
    q.set('cycle_used', 0)
  }
  const day = stamp(time).slice(0, 10)
  if (q.getString('day_bucket') !== day) {
    q.set('day_bucket', day)
    q.set('daily_used', 0)
  }
  return q
}
function quotaView(q) {
  const daily = q ? q.getInt('daily_used') : 0,
    total = q ? q.getInt('cycle_used') : 0
  return {
    dailyUsed: daily,
    dailyLimit: 5,
    dailyRemaining: Math.max(0, 5 - daily),
    cycleUsed: total,
    cycleLimit: 50,
    cycleRemaining: Math.max(0, 50 - total),
  }
}
function newCycle(app, order, owner) {
  const approved = ms(order.getString('approved_at'))
  const c = new Record(app.findCollectionByNameOrId('oi_cycles'))
  c.set('member', owner)
  c.set('order', order.id)
  c.set('plan_id', 'oi-21-standard')
  c.set('status', 'waiting_start')
  c.set('approved_at', stamp(approved))
  c.set('auto_start_at', stamp(approved + 7 * DAY))
  app.save(c)
  return c
}
function claim(app, owner) {
  const m = app.findRecordById('oi_memberships', owner)
  if (!m.verified() || m.getString('role') !== 'member') return
  const pending = rows(
    app,
    'oi_orders',
    "customer_email = {:email} && status = 'approved' && member = ''",
    { email: m.getString('email') },
  )
  for (const order of pending) {
    order.set('member', owner)
    app.save(order)
    const existing = rows(
      app,
      'oi_cycles',
      "member = {:owner} && (status = 'active' || status = 'waiting_start')",
      { owner },
    )
    if (!existing.length) newCycle(app, order, owner)
  }
}
module.exports = {
  newCycle,
  DAY,
  now,
  ms,
  stamp,
  rows,
  sync,
  current,
  member,
  plan,
  item,
  quota,
  quotaView,
}
