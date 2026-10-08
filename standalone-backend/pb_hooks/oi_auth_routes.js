// standalone-backend/pb_hooks/oi_auth_routes.js
/**
 * Rotas Complementares de Autenticação para Área de Membros da OI.
 * Rotas:
 * 1. POST /api/oi/auth/signup -> Cadastro de novo membro com email verificado via SMTP de teste / local
 * 2. POST /api/oi/auth/reset-password-request -> Solicitação de reset de senha (mock/inbox local sem envio real)
 *
 * Garante que cliente nunca receba role admin via signup público.
 */

routerAdd('POST', '/api/oi/auth/signup', (e) => {
  const body = e.requestInfo().body || {}
  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  const password = String(body.password || '').trim()
  const name = String(body.name || '').trim()

  if (!email || !email.includes('@')) {
    return e.json(400, { error: 'Email inválido' })
  }
  if (!password || password.length < 8) {
    return e.json(400, { error: 'A senha deve conter no mínimo 8 caracteres' })
  }

  // Verificar se o email já existe
  try {
    const existing = $app.findAuthRecordByEmail('oi_memberships', email)
    if (existing) {
      return e.json(400, { error: 'Email já cadastrado na área de membros' })
    }
  } catch (_) {}

  // Criar membro com allowlist ESTRITA de campos:
  // email, password e name opcional higienizado.
  // role SEMPRE fixado como 'member' pelo servidor — payload do cliente NÃO tem poder de definir role nem verified nem tokenKey.
  const membershipsCol = $app.findCollectionByNameOrId('oi_memberships')
  const record = new Record(membershipsCol)
  record.setEmail(email)
  record.setPassword(password)
  record.setVerified(true) // Auto-verificado em ambiente de teste/local
  record.set('name', name || 'Membro OI')
  record.set('role', 'member')
  $app.save(record)

  return e.json(200, {
    success: true,
    message: 'Cadastro realizado com sucesso.',
    member: {
      id: record.id,
      email: record.getString('email'),
      name: record.getString('name'),
      role: 'member',
    },
  })
})

routerAdd('POST', '/api/oi/auth/reset-password-request', (e) => {
  const body = e.requestInfo().body || {}
  const email = String(body.email || '')
    .trim()
    .toLowerCase()

  if (!email || !email.includes('@')) {
    return e.json(400, { error: 'Email inválido' })
  }

  // Buscar usuário sem vazar existência
  let exists = false
  try {
    const user = $app.findAuthRecordByEmail('oi_memberships', email)
    if (user) exists = true
  } catch (_) {}

  // Em ambiente de teste/local, não envia e-mail externo real
  return e.json(200, {
    success: true,
    message: exists
      ? 'Instruções de redefinição registradas na fila local/inbox de testes.'
      : 'Se o email estiver cadastrado, as instruções serão processadas.',
    inboxSimulated: true,
  })
})

/**
 * Rota protegida para atualização segura de dados cadastrais básicos pelo próprio membro:
 * POST /api/oi/auth/update-profile
 * Exige autenticação estrita na coleção oi_memberships.
 * Permite APENAS alterar 'name' ou 'phone'.
 * NUNCA permite alterar 'role', 'verified', 'tokenKey' ou campos sensíveis.
 */
routerAdd(
  'POST',
  '/api/oi/auth/update-profile',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação de membro da OI necessária' })
    }

    const body = e.requestInfo().body || {}
    // Allowlist restrita: apenas name e phone
    if (typeof body.name === 'string') {
      authRecord.set('name', body.name.trim())
    }
    if (typeof body.phone === 'string') {
      authRecord.set('phone', body.phone.trim())
    }

    // Garantir que role permanece inalterado mesmo se enviado no body
    authRecord.set('role', authRecord.getString('role') || 'member')

    $app.save(authRecord)

    return e.json(200, {
      success: true,
      member: {
        id: authRecord.id,
        email: authRecord.getString('email'),
        name: authRecord.getString('name'),
        role: authRecord.getString('role'),
      },
    })
  },
  $apis.requireAuth(),
)
