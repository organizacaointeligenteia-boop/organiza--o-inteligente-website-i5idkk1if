routerAdd('POST', '/api/oi/webhook/kiwify', (e) => {
  if ($os.getenv('OI_MODE') !== 'test')
    throw new ForbiddenError('Integração financeira habilitada somente na instância de testes.')
  const secret = $os.getenv('OI_KIWIFY_WEBHOOK_SECRET')
  const token = e.request.header.get('X-Kiwify-Token') || e.request.url.query().get('token')
  if (!secret || token !== secret) throw new UnauthorizedError('Evento não autenticado.')
  const body = e.requestInfo().body || {},
    product = String(body.Product ? body.Product.product_id : body.product_id || '')
  if (product !== ($os.getenv('OI_KIWIFY_PRODUCT_ID') || 'oi-ia-tool'))
    return e.json(200, {
      received: true,
      ignored: true,
      reason: 'Outro produto não libera a ferramenta.',
    })
  const id = String(body.order_id || '').trim()
  if (!id || id.length > 150) throw new BadRequestError('Pedido inválido.')
  const raw = String(body.order_status || '').toLowerCase()
  const status = ['paid', 'approved'].includes(raw)
    ? 'approved'
    : raw === 'refunded'
      ? 'refunded'
      : ['chargeback', 'chargedback'].includes(raw)
        ? 'chargedback'
        : 'pending'
  const email = String(body.Customer ? body.Customer.email : body.email || '')
    .trim()
    .toLowerCase()
  const a = require(__hooks + '/oi_access.js'),
    time = a.now()
  let result
  $app.runInTransaction((app) => {
    let order
    try {
      order = app.findFirstRecordByData('oi_orders', 'order_id', id)
    } catch (_) {}
    if (order && ['refunded', 'chargedback'].includes(order.getString('status'))) {
      result = {
        received: true,
        order_id: id,
        status: order.getString('status'),
        action: 'ignored_out_of_order_resurrection_prevented',
      }
      return
    }
    if (status === 'pending') {
      result = { received: true, order_id: id, action: 'ignored_non_approved' }
      return
    }
    if (status === 'approved' && order) {
      result = { received: true, order_id: id, status: 'approved', action: 'already_processed' }
      return
    }
    if (!order) {
      order = new Record(app.findCollectionByNameOrId('oi_orders'))
      order.set('order_id', id)
      order.set('product_id', product)
      order.set('customer_email', email || 'unknown@example.test')
      order.set('is_test', true)
    }
    if (status !== 'approved') {
      order.set('status', status)
      order.set('refunded_at', a.stamp(time))
      app.save(order)
      for (const c of a.rows(app, 'oi_cycles', 'order={:order}', { order: order.id })) {
        c.set('status', 'revoked')
        c.set('revoked_at', a.stamp(time))
        c.set('revocation_reason', status)
        app.save(c)
      }
      result = { received: true, order_id: id, status, action: 'access_revoked' }
      return
    }
    if (!email || !email.includes('@'))
      throw new BadRequestError('Identidade do comprador ausente.')
    order.set('status', 'approved')
    order.set('approved_at', a.stamp(time))
    order.set('customer_name', String(body.Customer ? body.Customer.full_name || '' : ''))
    const amount = Number(body.order_amount || 0)
    if (!Number.isFinite(amount) || amount < 0) throw new BadRequestError('Valor inválido.')
    order.set('amount_cents', amount)
    app.save(order)
    let member
    try {
      member = app.findAuthRecordByEmail('oi_memberships', email)
    } catch (_) {}
    if (!member || !member.verified() || member.getString('role') !== 'member') {
      result = {
        received: true,
        order_id: id,
        status: 'waiting_for_verified_account',
        success: true,
      }
      return
    }
    const c = a.current(app, member.id, time)
    order.set('member', member.id)
    app.save(order)
    if (c && ['active', 'waiting_start'].includes(c.getString('status'))) {
      result = {
        success: true,
        order_id: id,
        cycle_id: c.id,
        status: c.getString('status'),
        note: 'Ciclo existente preservado; nenhuma extensão.',
      }
      return
    }
    const created = a.newCycle(app, order, member.id)
    result = {
      success: true,
      order_id: id,
      member_id: member.id,
      cycle_id: created.id,
      status: 'waiting_start',
    }
  })
  return e.json(200, result)
})
