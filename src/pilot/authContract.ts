/**
 * Contrato de autorização e verificação de direito de acesso (Entitlement).
 *
 * Produto: Ferramenta de IA de Organização Inteligente.
 * Orientação do Proprietário: Produto pago separado do Kit, acessível pela área de membros
 * com login e direito de acesso pago confirmado. Preço e periodicidade ainda serão definidos.
 *
 * Regras mandatórias:
 * 1. Negação por padrão (deny by default): todo estado que não seja explicitamente paid-active com evidência verificável é negado.
 * 2. Isolamento de marca OI (project === 'organizacao-inteligente'): rejeitar qualquer registro ou entitlement de outra marca ou escopo.
 * 3. Estados fechados: 'anonymous' | 'authenticated-unpaid' | 'paid-active' | 'expired' | 'cancelled' | 'refunded' | 'unverifiable'.
 * 4. Validação estrita sem casts cegos: checar tipos, enums, vigência temporal e assinaturas/estruturas antes de qualquer decisão.
 * 5. Nenhum fallback inseguro: localStorage, query params, cookies ou compra do Kit NUNCA concedem acesso.
 * 6. Fail-closed: na ausência de infraestrutura real no backend compartilhado, qualquer usuário autenticado sem registro de entitlement verificado recebe recusa segura.
 */

export const OI_BRAND_PROJECT_ID = 'organizacao-inteligente' as const
export type OiBrandProjectId = typeof OI_BRAND_PROJECT_ID

export const OI_PRODUCT_ID = 'ferramenta-ia-organizacao-inteligente' as const
export type OiProductId = typeof OI_PRODUCT_ID

/**
 * Estados possíveis do ciclo de vida de acesso/autorização.
 */
export const AUTHZ_STATES = [
  'anonymous',
  'authenticated-unpaid',
  'paid-active',
  'expired',
  'cancelled',
  'refunded',
  'unverifiable',
] as const

export type AuthzState = (typeof AUTHZ_STATES)[number]

/**
 * Razões formais de recusa ou aprovação da decisão.
 */
export type AuthzDecisionReason =
  | 'ANONYMOUS_LOGIN_REQUIRED'
  | 'AUTHENTICATED_UNPAID'
  | 'PAID_ACTIVE_CONFIRMED'
  | 'ENTITLEMENT_EXPIRED'
  | 'ENTITLEMENT_CANCELLED'
  | 'ENTITLEMENT_REFUNDED'
  | 'BRAND_ISOLATION_REJECTED'
  | 'PRODUCT_MISMATCH_REJECTED'
  | 'MISSING_MANDATORY_FIELDS'
  | 'INVALID_ENTITLEMENT_SHAPE'
  | 'TEMPORAL_WINDOW_INVALID'
  | 'UNVERIFIABLE_SOURCE'
  | 'UNVERIFIABLE_SESSION'

/**
 * Estrutura estrita do registro de entitlement pago.
 */
export interface OiPaidEntitlement {
  project: OiBrandProjectId
  productId: OiProductId
  userId: string
  status: 'active' | 'expired' | 'cancelled' | 'refunded'
  validUntilIso: string // ISO 8601 string, ex.: '2025-12-31T23:59:59.000Z'
  source: 'confirmed-payment'
  confirmedAtIso: string
}

/**
 * Entrada para o resolvedor puro de autorização.
 * Aceita a sessão de autenticação (PocketBase/use-auth) e entitlement opcional/desconhecido.
 */
export interface AuthzContextInput {
  isAuthenticated: boolean
  user: { id?: string; email?: string } | null | undefined
  // Entitlement recebido de fonte de dados (pode ser unknown / ausente / adulterado)
  entitlement?: unknown
  // Timestamp de referência em milissegundos para validação de vigência (injeção pura para testes estáveis)
  currentTimeMs?: number
}

/**
 * Decisão final normalizada da autorização.
 */
export interface AuthzDecision {
  allowed: boolean
  state: AuthzState
  reason: AuthzDecisionReason
  message: string
  userId: string | null
  entitlement: OiPaidEntitlement | null
  validationErrors: string[]
}

/**
 * Validador estrito da estrutura de um Entitlement pago.
 * Não faz casts cegos: verifica campos, tipos e correspondência à marca OI.
 */
export type PaidEntitlementValidationResult =
  | { valid: true; entitlement: OiPaidEntitlement; errors?: never }
  | { valid: false; errors: string[]; entitlement?: never }

export function validatePaidEntitlementStructure(raw: unknown): PaidEntitlementValidationResult {
  const errors: string[] = []

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['Entitlement deve ser um objeto JSON não-nulo'] }
  }

  const candidate = raw as Record<string, unknown>

  // 1. Marca obrigatória: isolamento estrito
  if (candidate.project !== OI_BRAND_PROJECT_ID) {
    errors.push(
      `Marca/projeto inválido ou divergente. Esperado: '${OI_BRAND_PROJECT_ID}', recebido: '${String(candidate.project)}'`,
    )
  }

  // 2. Produto obrigatório: deve ser a ferramenta de IA separada do Kit
  if (candidate.productId !== OI_PRODUCT_ID) {
    errors.push(
      `Produto inválido ou divergente. Esperado: '${OI_PRODUCT_ID}', recebido: '${String(candidate.productId)}'`,
    )
  }

  // 3. Usuário obrigatório
  if (typeof candidate.userId !== 'string' || candidate.userId.trim().length === 0) {
    errors.push("Campo 'userId' obrigatório e deve ser string não-vazia")
  }

  // 4. Status de acesso
  const allowedStatuses = ['active', 'expired', 'cancelled', 'refunded']
  if (typeof candidate.status !== 'string' || !allowedStatuses.includes(candidate.status)) {
    errors.push(
      `Campo 'status' inválido. Esperado um de: ${allowedStatuses.join(', ')}, recebido: '${String(candidate.status)}'`,
    )
  }

  // 5. Fonte de confirmação
  if (candidate.source !== 'confirmed-payment') {
    errors.push(
      `Campo 'source' inválido. Esperado: 'confirmed-payment', recebido: '${String(candidate.source)}'`,
    )
  }

  // 6. Datas em formato ISO válido
  if (typeof candidate.validUntilIso !== 'string' || isNaN(Date.parse(candidate.validUntilIso))) {
    errors.push("Campo 'validUntilIso' deve ser string ISO 8601 válida")
  }

  if (typeof candidate.confirmedAtIso !== 'string' || isNaN(Date.parse(candidate.confirmedAtIso))) {
    errors.push("Campo 'confirmedAtIso' deve ser string ISO 8601 válida")
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    entitlement: {
      project: OI_BRAND_PROJECT_ID,
      productId: OI_PRODUCT_ID,
      userId: (candidate.userId as string).trim(),
      status: candidate.status as 'active' | 'expired' | 'cancelled' | 'refunded',
      validUntilIso: candidate.validUntilIso as string,
      source: 'confirmed-payment',
      confirmedAtIso: candidate.confirmedAtIso as string,
    },
  }
}

/**
 * Resolvedor de autorização puro (deny-by-default, fail-closed).
 *
 * Avalia o contexto de autenticação real e o entitlement fornecido.
 * Retorna 'allowed: true' UNICAMENTE para 'paid-active' com entitlement verificado,
 * pertencente à marca 'organizacao-inteligente', com data de vigência válida e usuário coincidente.
 *
 * Todos os demais casos retornam 'allowed: false' com o estado e razão honestos.
 */
export function resolveAuthorization(input: AuthzContextInput): AuthzDecision {
  const now = input.currentTimeMs ?? Date.now()

  // 1. Verificação de sessão (autenticação do usuário)
  const isSessionValid =
    input.isAuthenticated &&
    input.user !== null &&
    input.user !== undefined &&
    typeof input.user === 'object' &&
    typeof input.user.id === 'string' &&
    input.user.id.trim().length > 0

  if (!isSessionValid) {
    // Se a flag isAuthenticated veio true mas o objeto user é inválido/corrompido
    if (input.isAuthenticated) {
      return {
        allowed: false,
        state: 'unverifiable',
        reason: 'UNVERIFIABLE_SESSION',
        message: 'Sessão de usuário inconsistente ou corrompida. Faça login novamente.',
        userId: null,
        entitlement: null,
        validationErrors: ['Sessão marcada como autenticada porém sem registro de usuário válido'],
      }
    }

    return {
      allowed: false,
      state: 'anonymous',
      reason: 'ANONYMOUS_LOGIN_REQUIRED',
      message: 'Acesso restrito. É necessário fazer login com sua conta da área de membros.',
      userId: null,
      entitlement: null,
      validationErrors: [],
    }
  }

  const authenticatedUserId = input.user!.id!.trim()

  // 2. Verificação do Entitlement de pagamento
  // Se não foi fornecido qualquer entitlement (estado atual do sistema, onde não há coleção no PB)
  if (input.entitlement === undefined || input.entitlement === null) {
    return {
      allowed: false,
      state: 'authenticated-unpaid',
      reason: 'AUTHENTICATED_UNPAID',
      message:
        'Sua conta está autenticada, mas ainda não possui confirmação de acesso pago à Ferramenta de IA. A liberação de acesso e contratação estão em preparação.',
      userId: authenticatedUserId,
      entitlement: null,
      validationErrors: [],
    }
  }

  // 3. Validação estrita da estrutura e marca do entitlement
  const validation = validatePaidEntitlementStructure(input.entitlement)
  if (!validation.valid) {
    // Rejeição por formato corrompido, adulterado ou de outra marca
    const isBrandMismatch = validation.errors.some((err) => err.includes('Marca/projeto inválido'))
    const isProductMismatch = validation.errors.some((err) => err.includes('Produto inválido'))

    const reason: AuthzDecisionReason = isBrandMismatch
      ? 'BRAND_ISOLATION_REJECTED'
      : isProductMismatch
        ? 'PRODUCT_MISMATCH_REJECTED'
        : 'INVALID_ENTITLEMENT_SHAPE'

    return {
      allowed: false,
      state: 'unverifiable',
      reason,
      message:
        'Registro de direito de acesso não pôde ser verificado por inconsistência estrutural ou de marca.',
      userId: authenticatedUserId,
      entitlement: null,
      validationErrors: validation.errors,
    }
  }

  const ent = validation.entitlement

  // 4. Verificação de correspondência entre o usuário autenticado e o titular do entitlement
  if (ent.userId !== authenticatedUserId) {
    return {
      allowed: false,
      state: 'unverifiable',
      reason: 'UNVERIFIABLE_SOURCE',
      message:
        'O registro de acesso fornecido pertence a um usuário diferente da sessão autenticada.',
      userId: authenticatedUserId,
      entitlement: null,
      validationErrors: [
        `Titular do entitlement ('${ent.userId}') difere do usuário logado ('${authenticatedUserId}')`,
      ],
    }
  }

  // 5. Verificação de status específico do entitlement
  if (ent.status === 'cancelled') {
    return {
      allowed: false,
      state: 'cancelled',
      reason: 'ENTITLEMENT_CANCELLED',
      message: 'O acesso a esta ferramenta foi cancelado.',
      userId: authenticatedUserId,
      entitlement: ent,
      validationErrors: [],
    }
  }

  if (ent.status === 'refunded') {
    return {
      allowed: false,
      state: 'refunded',
      reason: 'ENTITLEMENT_REFUNDED',
      message: 'O acesso a esta ferramenta foi revogado após reembolso.',
      userId: authenticatedUserId,
      entitlement: ent,
      validationErrors: [],
    }
  }

  if (ent.status === 'expired') {
    return {
      allowed: false,
      state: 'expired',
      reason: 'ENTITLEMENT_EXPIRED',
      message: 'O período de vigência do seu acesso expirou.',
      userId: authenticatedUserId,
      entitlement: ent,
      validationErrors: [],
    }
  }

  // 6. Verificação de validade temporal (validUntilIso) mesmo se status for 'active'
  const expirationTimeMs = Date.parse(ent.validUntilIso)
  if (expirationTimeMs <= now) {
    return {
      allowed: false,
      state: 'expired',
      reason: 'TEMPORAL_WINDOW_INVALID',
      message: 'O período de vigência do seu acesso terminou.',
      userId: authenticatedUserId,
      entitlement: ent,
      validationErrors: [
        `Data de validade (${ent.validUntilIso}) é anterior ao momento de validação (${new Date(now).toISOString()})`,
      ],
    }
  }

  // 7. Acesso confirmado (ÚNICA condição de liberação)
  if (ent.status === 'active') {
    return {
      allowed: true,
      state: 'paid-active',
      reason: 'PAID_ACTIVE_CONFIRMED',
      message: 'Acesso confirmado e ativo.',
      userId: authenticatedUserId,
      entitlement: ent,
      validationErrors: [],
    }
  }

  // Fallback de negação por padrão para qualquer outro caso residual
  return {
    allowed: false,
    state: 'unverifiable',
    reason: 'UNVERIFIABLE_SOURCE',
    message: 'Não foi possível confirmar os requisitos de acesso.',
    userId: authenticatedUserId,
    entitlement: null,
    validationErrors: ['Status não reconhecido no fluxo de autorização'],
  }
}
