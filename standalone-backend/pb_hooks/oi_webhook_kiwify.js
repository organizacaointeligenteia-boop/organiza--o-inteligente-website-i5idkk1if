// standalone-backend/pb_hooks/oi_webhook_kiwify.js
/**
 * Webhook Kiwify para compra da Ferramenta de IA da Organização Inteligente (OI).
 * Rota: POST /api/oi/webhook/kiwify
 *
 * Regras estritas:
 * 1. Autenticação do webhook: token via query (?token=...) ou header (X-Kiwify-Token)
 *    comparado com OI_KIWIFY_WEBHOOK_SECRET.
 * 2. Compra do Kit NÃO libera a ferramenta de IA (rejeita com 200/ignora seguro).
 * 3. Idempotência: se o order_id já foi processado e está no mesmo estado, não reprocessa.
 * 4. Eventos fora de ordem ou repetidos não ressuscitam ciclo revogado/reembolsado.
 * 5. Compra confirmada (status approved / paid) cria ou associa ao membro e cria oi_cycle com:
 *    - approved_at = now
 *    - auto_start_at = approved_at + 7 dias
 *    - status = "waiting_start"
 * 6. Refund / Chargeback revoga imediatamente o ciclo associado (status="revoked").
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

  // Identificação do produto da Kiwify
  // O produto esperado para a ferramenta de IA é configurado via OI_KIWIFY_PRODUCT_ID
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

  // VERIFICAÇÃO DE PRODUTO: compra do Kit NÃO libera a ferramenta de IA!
  // Se for produto diferente do produto configurado da OI, ignorar com mensagem clara
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

  // Extração do email do cliente
  const customerEmail = String(rawBody.Customer ? rawBody.Customer.email : rawBody.email || '')
    .trim()
    .toLowerCase()

  const customerName = String(
    rawBody.Customer ? rawBody.Customer.full_name : rawBody.name || '',
  ).trim()

  const orderStatusRaw = String(rawBody.order_status || rawBody.status || '')
    .trim()
    .toLowerCase()

  // Mapeamento de status da Kiwify para enums internos
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

  // Buscar se o pedido já existe no banco
  let existingOrder = null
  try {
    existingOrder = $app.findFirstRecordByData('oi_orders', 'order_id', orderId)
  } catch (_) {
    existingOrder = null
  }

  // Timestamp simulável ou atual em UTC
  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19)

  // 1. Processamento de REEMBOLSO / CHARGEBACK
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
          cycle.set('revocation_reason', 'Reembolso/Chargeback registrado no pedido ' + orderId)
          $app.save(cycle)
        }
      } catch (_) {}
    }

    return e.json(200, {
      received: true,
      order_id: orderId,
      status: normalizedStatus,
      action: 'access_revoked',
    })
  }

  // 2. Se for status não-aprovado (ex.: pending, rejected)
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

  // 3. Status APROVADO:
  // Se o pedido já existia com status refund/chargedback, NÃO ressuscitar por evento repetido/fora de ordem!
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
    // Idempotência: se já estava aprovado, responder OK
    return e.json(200, {
      received: true,
      order_id: orderId,
      status: 'approved',
      action: 'already_processed',
    })
  }

  // Localizar ou provisionar conta de membro para o customerEmail
  let memberRec = null
  try {
    memberRec = $app.findAuthRecordByEmail('oi_memberships', customerEmail)
  } catch (_) {
    // Membro ainda não cadastrado: criar registro com senha temporária
    const membershipsCol = $app.findCollectionByNameOrId('oi_memberships')
    memberRec = new Record(membershipsCol)
    memberRec.setEmail(customerEmail)
    memberRec.setPassword($security.randomString(16))
    memberRec.setVerified(true)
    memberRec.set('name', customerName || 'Membro OI')
    memberRec.set('role', 'member')
    $app.save(memberRec)
  }

  // Criar registro do pedido oi_orders
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

  // Criar ciclo de 21 dias para este pedido
  // Regra: compra confirmada -> 7 dias para iniciar voluntariamente.
  // Se não iniciar, started_at = approved_at + 7 dias, expires_at = started_at + 21 dias.
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
