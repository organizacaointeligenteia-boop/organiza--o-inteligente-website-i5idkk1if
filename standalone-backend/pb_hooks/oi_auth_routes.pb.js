// standalone-backend/pb_hooks/oi_auth_routes.pb.js
/**
 * Rotas Complementares de Autenticação para Área de Membros da OI.
 * Extensão .pb.js obrigatória para carregamento automático no PocketBase v0.36+ / v0.40.5.
 *
 * Rotas:
 * 1. POST /api/oi/auth/signup -> Cadastro com verified=false, role='member' fixo, geração de token real de verificação gravado em oi_auth_tokens e arquivado no inbox local.
 * 2. POST /api/oi/auth/verify-email -> Consome token de verificação único, com TTL e expiração, ativa verified=true.
 * 3. POST /api/oi/auth/login -> Login estrito que rejeita conta não verificada (verified !== true), exige credenciais válidas e retorna token de sessão.
 * 4. POST /api/oi/auth/reset-password-request -> Gera token real com TTL e grava no inbox local privado do servidor (sem envio real de e-mail).
 * 5. POST /api/oi/auth/reset-password-confirm -> Valida e consome token de reset único, altera senha e invalida tokens anteriores.
 * 6. POST /api/oi/auth/logout -> Invalida a sessão do membro alterando o tokenKey da conta de forma atômica.
 * 7. POST /api/oi/auth/update-profile -> Atualização com allowlist estrita de campos (apenas name, phone).
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

  let newMemberId = ''
  let verifyTokenStr = ''
  const nowMs = Date.now()
  const tokenTtlMs = 24 * 60 * 60 * 1000 // 24h
  const expiresIso = new Date(nowMs + tokenTtlMs).toISOString().replace('T', ' ').substring(0, 19)

  try {
    $app.runInTransaction((txApp) => {
      const membershipsCol = txApp.findCollectionByNameOrId('oi_memberships')
      const record = new Record(membershipsCol)
      record.setEmail(email)
      record.setPassword(password)
      // REGRA OBRIGATÓRIA: signup cria conta NÃO verificada
      record.setVerified(false)
      record.set('name', name || 'Membro OI')
      record.set('role', 'member') // Role SEMPRE fixado como member
      txApp.save(record)
      newMemberId = record.id

      // Gerar token de verificação REAL de uso único
      verifyTokenStr = 'vfy_' + $security.randomString(32)
      const tokensCol = txApp.findCollectionByNameOrId('oi_auth_tokens')
      const tokenRec = new Record(tokensCol)
      tokenRec.set('member', newMemberId)
      tokenRec.set('email', email)
      tokenRec.set('type', 'verify_email')
      tokenRec.set('token', verifyTokenStr)
      tokenRec.set('expires_at', expiresIso)
      txApp.save(tokenRec)
    })
  } catch (err) {
    return e.json(500, { error: 'Falha ao processar cadastro: ' + String(err) })
  }

  // Gravar no inbox local em arquivo privado acessível apenas ao processo/admin
  try {
    const inboxDir = $app.dataDir() + '/local_inbox'
    $os.mkdirAll(inboxDir, 0o700)
    const inboxPath = inboxDir + '/emails.log'
    const entry =
      JSON.stringify({
        timestamp: new Date().toISOString(),
        type: 'verify_email',
        email: email,
        memberId: newMemberId,
        token: verifyTokenStr,
        instruction: 'Use o token para verificar em POST /api/oi/auth/verify-email',
      }) + '\n'
    $os.writeFile(inboxPath, entry, 0o600)
  } catch (_) {
    // Falha silenciosa em logging do inbox se sistema de arquivos restrito
  }

  return e.json(200, {
    success: true,
    message:
      'Cadastro realizado com sucesso. Sua conta foi criada como NÃO verificada. Verifique seu e-mail (token gerado no inbox local de testes).',
    verified: false,
    member: {
      id: newMemberId,
      email: email,
      name: name || 'Membro OI',
      role: 'member',
      verified: false,
    },
  })
})

/**
 * Confirmar verificação de e-mail com token de uso único e TTL
 */
routerAdd('POST', '/api/oi/auth/verify-email', (e) => {
  const body = e.requestInfo().body || {}
  const token = String(body.token || '').trim()

  if (!token) {
    return e.json(400, { error: 'Token de verificação obrigatório' })
  }

  let memberId = ''
  let email = ''

  try {
    $app.runInTransaction((txApp) => {
      let tokenRec = null
      try {
        tokenRec = txApp.findFirstRecordByData('oi_auth_tokens', 'token', token)
      } catch (_) {
        throw new Error('Token de verificação inválido ou inexistente')
      }

      if (tokenRec.getString('type') !== 'verify_email') {
        throw new Error('Tipo de token inválido')
      }

      if (tokenRec.getString('used_at')) {
        throw new Error('Este token de verificação já foi utilizado')
      }

      const expiresAt = Date.parse(tokenRec.getString('expires_at'))
      if (!isNaN(expiresAt) && Date.now() > expiresAt) {
        throw new Error('Token de verificação expirado')
      }

      memberId = tokenRec.getString('member')
      email = tokenRec.getString('email')

      // Marcar token como utilizado (uso único)
      const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19)
      tokenRec.set('used_at', nowIso)
      txApp.save(tokenRec)

      // Ativar verified=true no membro
      const member = txApp.findFirstRecordByData('oi_memberships', 'id', memberId)
      member.setVerified(true)
      txApp.save(member)
    })
  } catch (err) {
    return e.json(400, { error: err.message || String(err) })
  }

  return e.json(200, {
    success: true,
    message: 'Conta de membro verificada com sucesso! Você já pode realizar login.',
    verified: true,
    memberId: memberId,
    email: email,
  })
})

/**
 * Login estrito de membro:
 * Exige credenciais válidas E verified === true.
 */
routerAdd('POST', '/api/oi/auth/login', (e) => {
  const body = e.requestInfo().body || {}
  const identity = String(body.identity || body.email || '')
    .trim()
    .toLowerCase()
  const password = String(body.password || '').trim()

  if (!identity || !password) {
    return e.json(400, { error: 'Email e senha são obrigatórios' })
  }

  let member = null
  try {
    member = $app.findAuthRecordByEmail('oi_memberships', identity)
  } catch (_) {
    return e.json(400, { error: 'Credenciais inválidas' })
  }

  // Validar senha
  if (!member.validatePassword(password)) {
    return e.json(400, { error: 'Credenciais inválidas' })
  }

  // Exigência estrita: login e ações financeiras exigem verified=true
  if (!member.verified()) {
    return e.json(403, {
      error:
        'Conta não verificada. Por favor confirme seu e-mail antes de efetuar login e acessar a ferramenta.',
      unverified: true,
      email: member.getString('email'),
    })
  }

  // Gerar token de autenticação PocketBase oficial para oi_memberships
  const token = member.newAuthToken()

  return e.json(200, {
    success: true,
    token: token,
    record: {
      id: member.id,
      email: member.getString('email'),
      name: member.getString('name'),
      role: member.getString('role') || 'member',
      verified: member.verified(),
    },
  })
})

/**
 * Solicitação de Redefinição de Senha:
 * Gera token real de uso único com TTL, grava no inbox local privado do servidor.
 * NUNCA envia e-mail externo real.
 */
routerAdd('POST', '/api/oi/auth/reset-password-request', (e) => {
  const body = e.requestInfo().body || {}
  const email = String(body.email || '')
    .trim()
    .toLowerCase()

  if (!email || !email.includes('@')) {
    return e.json(400, { error: 'Email inválido' })
  }

  let user = null
  try {
    user = $app.findAuthRecordByEmail('oi_memberships', email)
  } catch (_) {
    user = null
  }

  if (user) {
    const resetTokenStr = 'rst_' + $security.randomString(32)
    const tokenTtlMs = 60 * 60 * 1000 // 1 hora de TTL
    const expiresIso = new Date(Date.now() + tokenTtlMs)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)

    try {
      const tokensCol = $app.findCollectionByNameOrId('oi_auth_tokens')
      const tokenRec = new Record(tokensCol)
      tokenRec.set('member', user.id)
      tokenRec.set('email', email)
      tokenRec.set('type', 'reset_password')
      tokenRec.set('token', resetTokenStr)
      tokenRec.set('expires_at', expiresIso)
      $app.save(tokenRec)

      // Gravar no inbox local em arquivo privado acessível somente ao processo/admin local
      const inboxDir = $app.dataDir() + '/local_inbox'
      $os.mkdirAll(inboxDir, 0o700)
      const inboxPath = inboxDir + '/emails.log'
      const entry =
        JSON.stringify({
          timestamp: new Date().toISOString(),
          type: 'reset_password',
          email: email,
          memberId: user.id,
          token: resetTokenStr,
          instruction:
            'Use o token para redefinir senha em POST /api/oi/auth/reset-password-confirm',
        }) + '\n'
      $os.writeFile(inboxPath, entry, 0o600)
    } catch (_) {}
  }

  return e.json(200, {
    success: true,
    message:
      'Se o e-mail estiver cadastrado, as instruções com token foram registradas no inbox local de testes.',
    inboxLocal: true,
  })
})

/**
 * Confirmação de redefinição de senha com token de uso único e TTL
 */
routerAdd('POST', '/api/oi/auth/reset-password-confirm', (e) => {
  const body = e.requestInfo().body || {}
  const token = String(body.token || '').trim()
  const newPassword = String(body.newPassword || '').trim()

  if (!token) {
    return e.json(400, { error: 'Token de redefinição obrigatório' })
  }
  if (!newPassword || newPassword.length < 8) {
    return e.json(400, { error: 'A nova senha deve ter no mínimo 8 caracteres' })
  }

  try {
    $app.runInTransaction((txApp) => {
      let tokenRec = null
      try {
        tokenRec = txApp.findFirstRecordByData('oi_auth_tokens', 'token', token)
      } catch (_) {
        throw new Error('Token de redefinição inválido ou não encontrado')
      }

      if (tokenRec.getString('type') !== 'reset_password') {
        throw new Error('Tipo de token inválido')
      }

      if (tokenRec.getString('used_at')) {
        throw new Error('Este token de redefinição já foi utilizado')
      }

      const expiresAt = Date.parse(tokenRec.getString('expires_at'))
      if (!isNaN(expiresAt) && Date.now() > expiresAt) {
        throw new Error('Token de redefinição expirado')
      }

      const memberId = tokenRec.getString('member')
      const member = txApp.findFirstRecordByData('oi_memberships', 'id', memberId)

      // Atualizar senha e rotacionar tokenKey para invalidar sessões anteriores
      member.setPassword(newPassword)
      member.refreshTokenKey()
      txApp.save(member)

      // Marcar token como consumido
      const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19)
      tokenRec.set('used_at', nowIso)
      txApp.save(tokenRec)
    })
  } catch (err) {
    return e.json(400, { error: err.message || String(err) })
  }

  return e.json(200, {
    success: true,
    message: 'Senha redefinida com sucesso. Todas as sessões anteriores foram invalidadas.',
  })
})

/**
 * Logout do membro:
 * Invalida a sessão rotacionando o tokenKey no servidor
 */
routerAdd(
  'POST',
  '/api/oi/auth/logout',
  (e) => {
    const authRecord = e.auth
    if (!authRecord || authRecord.collection().name !== 'oi_memberships') {
      return e.json(401, { error: 'Autenticação necessária' })
    }

    try {
      authRecord.refreshTokenKey()
      $app.save(authRecord)
    } catch (err) {
      return e.json(500, { error: 'Falha ao invalidar sessão: ' + String(err) })
    }

    return e.json(200, {
      success: true,
      message: 'Sessão encerrada com sucesso no servidor.',
    })
  },
  $apis.requireAuth(),
)

/**
 * Atualização segura de perfil com allowlist estrita
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
    if (typeof body.name === 'string') {
      authRecord.set('name', body.name.trim())
    }
    if (typeof body.phone === 'string') {
      authRecord.set('phone', body.phone.trim())
    }

    // Role permanece estritamente preservado
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
