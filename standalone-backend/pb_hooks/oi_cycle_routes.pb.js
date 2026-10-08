routerAdd(
  'GET',
  '/api/oi/cycle/status',
  (e) => {
    const a = require(__hooks + '/oi_access.js'),
      member = a.member(e),
      time = a.now()
    let result
    $app.runInTransaction((app) => {
      const c = a.current(app, member.id, time)
      if (!c) {
        result = { hasCycle: false, status: 'none', canCreatePlans: false, canStartNow: false }
        return
      }
      const status = c.getString('status'),
        q = a.quota(app, c.id, member.id, time)
      result = {
        hasCycle: true,
        cycleId: c.id,
        status,
        approvedAt: c.getString('approved_at'),
        autoStartAt: c.getString('auto_start_at'),
        startedAt: c.getString('started_at'),
        expiresAt: c.getString('expires_at'),
        retentionUntil: c.getString('retention_until'),
        daysRemaining:
          Math.max(
            0,
            Math.ceil(
              (a.ms(c.getString(status === 'expired' ? 'retention_until' : 'expires_at')) - time) /
                a.DAY,
            ),
          ) || 0,
        canStartNow: status === 'waiting_start',
        canCreatePlans: status === 'active',
        isDownloadOnly: status === 'expired',
        quotas: a.quotaView(q),
      }
    })
    return e.json(200, result)
  },
  $apis.requireAuth('oi_memberships'),
)
routerAdd(
  'POST',
  '/api/oi/cycle/start',
  (e) => {
    const a = require(__hooks + '/oi_access.js'),
      member = a.member(e),
      time = a.now()
    let result
    $app.runInTransaction((app) => {
      const c = a.current(app, member.id, time)
      if (!c) throw new ForbiddenError('Nenhuma compra confirmada.')
      if (c.getString('status') === 'waiting_start') {
        c.set('status', 'active')
        c.set('started_at', a.stamp(time))
        c.set('expires_at', a.stamp(time + 21 * a.DAY))
        c.set('retention_until', a.stamp(time + 51 * a.DAY))
        app.save(c)
      }
      if (c.getString('status') !== 'active') throw new ForbiddenError('Ciclo encerrado.')
      result = {
        success: true,
        cycleId: c.id,
        status: 'active',
        startedAt: c.getString('started_at'),
        expiresAt: c.getString('expires_at'),
        retentionUntil: c.getString('retention_until'),
      }
    })
    return e.json(200, result)
  },
  $apis.requireAuth('oi_memberships'),
)
cronAdd('oi-retention', '* * * * *', () => {
  const a = require(__hooks + '/oi_access.js'),
    time = a.now()
  $app.runInTransaction((app) => {
    for (const c of a.rows(app, 'oi_cycles', "status != 'purged'")) a.sync(app, c, time)
  })
})
