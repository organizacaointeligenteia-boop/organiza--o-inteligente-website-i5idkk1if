// standalone-backend/pb_hooks/oi_webhook_kiwify.pb.js
/**
 * Webhook Kiwify para compra da Ferramenta de IA da Organização Inteligente (OI).
 * Extensão .pb.js obrigatória para carregamento automático no PocketBase v0.36+ / v0.40.5.
 * Rota: POST /api/oi/webhook/kiwify
 *
 * Regras estritas:
 * 1. Autenticação via token comparado com OI_KIWIFY_WEBHOOK_SECRET.
 * 2. Compra do Kit NÃO libera a ferramenta de IA (rejeitado com 200/ignored).
 * 3. Tombstone de Refund/Chargeback ANTES da aprovação: se chegar refund de pedido desconhecido,
 *    grava tombstone em oi_orders impedindo aprovação posterior.
 * 4. Nova compra durante ciclo "active" NÃO estende os 21 dias (registra pedido mas associa ao ciclo sem prorrogar).
 * 5. Correlaciona conta verificada: vincula membro e garante que conta seja associada.
 * 6. Proteção contra ressurreição por evento fora de ordem.
 */

routerAdd('POST', '/api/oi/webhook/kiwify', (e) => {
  const secret = $os.getenv('OI_KIWIFY_WEBHOOK_SECRET') || 'oi-kiwify-test-secret'
  const providedToken =
    e.requestInfo().query['token'] || e.requestInfo().headers['x-kiwify-token'] || ''

  if (!providedToken || providedToken !== secret) {
    return e.json(401, { error: 'Não autorizado: token de webhook inválido ou ausente' })
  }

  const rawBody = e.requestInfo().body
  if (!rawBody || typeof rawBody !== 'object') {
    return e.json(400, { error: 'Payload do webhook inválido' })
  }

  const expectedProductId = $os.getenv('OI_KIWIFY_PRODUCT_ID') || 'oi-ia-tool'
  const payloadProductId = String(
    rawBody.Product ? rawBody.Product.product_id : rawBody.product_id || '',
  ).trim()

  const orderId = String(
    rawBody.order_id || rawBody.order_ref || (rawBody.order ? rawBody.order.id : ''),
  ).trim()

  if (!orderId) {
    return e.json(400, { error: 'order_id ausente no webhook' })
  }

  // 1. ISOLAMENTO DO PRODUTO: compra do Kit NÃO libera a ferramenta de IA
  if (payloadProductId !== expectedProductId) {
    return e.json(200, {
      received: true,
      ignored: true,
      reason:
        'Produto diferente da Ferramenta de IA da OI (' +
        payloadProductId +
        ' != ' +
        expectedProductId +
        ')',
    })
  }

  const customerEmail = String(rawBody.Customer ? rawBody.Customer.email : rawBody.email || '')
    .trim()
    .toLowerCase()

  const customerName = String(
    rawBody.Customer ? rawBody.Customer.full_name : rawBody.name || '',
  ).trim()

  const orderStatusRaw = String(rawBody.order_status || rawBody.status || '')
    .trim()
    .toLowerCase()

  let normalizedStatus = 'pending'
  if (orderStatusRaw === 'paid' || orderStatusRaw === 'approved') {
    normalizedStatus = 'approved'
  } else if (orderStatusRaw === 'refunded') {
    normalizedStatus = 'refunded'
  } else if (orderStatusRaw === 'chargedback' || orderStatusRaw === 'chargeback') {
    normalizedStatus = 'chargedback'
  } else if (
    orderStatusRaw === 'canceled' ||
    orderStatusRaw === 'cancelled' ||
    orderStatusRaw === 'rejected'
  ) {
    normalizedStatus = 'rejected'
  }

  let existingOrder = null
  try {
    existingOrder = $app.findFirstRecordByData('oi_orders', 'order_id', orderId)
  } catch (_) {
    existingOrder = null
  }

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19)

  // 2. REEMBOLSO / CHARGEBACK
  if (normalizedStatus === 'refunded' || normalizedStatus === 'chargedback') {
    if (existingOrder) {
      existingOrder.set('status', normalizedStatus)
      existingOrder.set('refunded_at', nowIso)
      $app.save(existingOrder)

      // Revogar ciclo ativo correspondente imediatamente
      try {
        const cycle = $app.findFirstRecordByData('oi_cycles', 'order', existingOrder.id)
        if (cycle) {
          cycle.set('status', 'revoked')
          cycle.set('revoked_at', nowIso)
          cycle.set('revocation_reason', 'Reembolso/Chargeback no pedido ' + orderId)
          $app.save(cycle)
        }
      } catch (_) {}
    } else {
      // TOMBSTONE ANTES DA APROVAÇÃO:
      // Grava tombstone de pedido reembolsado antes da chegada do evento approved
      // Impedindo qualquer aprovação posterior desse pedido!
      const ordersCol = $app.findCollectionByNameOrId('oi_orders')
      const tombstone = new Record(ordersCol)
      tombstone.set('order_id', orderId)
      tombstone.set('product_id', payloadProductId)
      tombstone.set('customer_email', customerEmail || 'unknown@refund.oi')
      tombstone.set('status', normalizedStatus)
      tombstone.set('refunded_at', nowIso)
      tombstone.set('raw_payload', rawBody)
      $app.save(tombstone)
    }

    return e.json(200, {
      received: true,
      order_id: orderId,
      status: normalizedStatus,
      action: 'access_revoked',
    })
  }

  if (normalizedStatus !== 'approved') {
    if (existingOrder) {
      existingOrder.set('status', normalizedStatus)
      $app.save(existingOrder)
    }
    return e.json(200, {
      received: true,
      order_id: orderId,
      status: normalizedStatus,
      action: 'ignored_non_approved',
    })
  }

  // 3. STATUS APROVADO:
  // Se existia e já era refunded/chargedback (inclusive tombstone): NUNCA ressuscitar!
  if (existingOrder) {
    const prevStatus = existingOrder.getString('status')
    if (prevStatus === 'refunded' || prevStatus === 'chargedback') {
      return e.json(200, {
        received: true,
        order_id: orderId,
        status: prevStatus,
        action: 'ignored_out_of_order_resurrection_prevented',
      })
    }
    // Idempotência
    return e.json(200, {
      received: true,
      order_id: orderId,
      status: 'approved',
      action: 'already_processed',
    })
  }

  // 4. Localizar ou vincular conta de membro
  let memberRec = null
  try {
    memberRec = $app.findAuthRecordByEmail('oi_memberships', customerEmail)
  } catch (_) {
    const membershipsCol = $app.findCollectionByNameOrId('oi_memberships')
    memberRec = new Record(membershipsCol)
    memberRec.setEmail(customerEmail)
    memberRec.setPassword($security.randomString(20))
    // Conta criada via compra paga é marcada como verified=true
    memberRec.setVerified(true)
    memberRec.set('name', customerName || 'Membro OI')
    memberRec.set('role', 'member')
    $app.save(memberRec)
  }

  // 5. Gravar pedido aprovado
  const ordersCol = $app.findCollectionByNameOrId('oi_orders')
  const orderRec = new Record(ordersCol)
  orderRec.set('order_id', orderId)
  orderRec.set('product_id', payloadProductId)
  orderRec.set(
    'product_name',
    String(rawBody.Product ? rawBody.Product.product_name : 'Ferramenta de IA OI'),
  )
  orderRec.set('member', memberRec.id)
  orderRec.set('customer_email', customerEmail)
  orderRec.set('customer_name', customerName)
  orderRec.set('status', 'approved')
  orderRec.set('amount_cents', Number(rawBody.order_amount || 0))
  orderRec.set('approved_at', nowIso)
  orderRec.set('raw_payload', rawBody)
  orderRec.set('is_test', Boolean(rawBody.is_test || rawBody.test_mode))
  $app.save(orderRec)

  // 6. Verificar se o membro já tem um ciclo "active" no momento
  // REGRA: Compras novas durante ciclo ativo NÃO estendem o ciclo vigente!
  let activeCycles = []
  try {
    activeCycles = $app.findRecordsByFilter(
      'oi_cycles',
      "member = '" + memberRec.id + "' && status = 'active'",
      '-created',
      1,
      0,
    )
  } catch (_) {
    activeCycles = []
  }

  if (activeCycles.length > 0) {
    // Membro já possui ciclo ativo em andamento: não prorroga expires_at nem cria ciclo sobreposto!
    return e.json(200, {
      success: true,
      order_id: orderId,
      member_id: memberRec.id,
      cycle_id: activeCycles[0].id,
      status: 'active',
      note: 'Compra associada ao membro; ciclo ativo em andamento NÃO foi estendido.',
    })
  }

  // Se não tem ciclo ativo, cria novo ciclo com status waiting_start (7 dias para iniciar)
  const nowMs = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const autoStartIso = new Date(nowMs + sevenDaysMs)
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19)

  const cyclesCol = $app.findCollectionByNameOrId('oi_cycles')
  const cycleRec = new Record(cyclesCol)
  cycleRec.set('member', memberRec.id)
  cycleRec.set('order', orderRec.id)
  cycleRec.set('plan_id', 'oi-21-standard')
  cycleRec.set('status', 'waiting_start')
  cycleRec.set('approved_at', nowIso)
  cycleRec.set('auto_start_at', autoStartIso)
  $app.save(cycleRec)

  return e.json(200, {
    success: true,
    order_id: orderId,
    member_id: memberRec.id,
    cycle_id: cycleRec.id,
    status: 'waiting_start',
    auto_start_at: autoStartIso,
  })
})
