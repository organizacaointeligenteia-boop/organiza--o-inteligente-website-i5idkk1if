import { describe, it, expect } from 'vitest'
import {
  AUTHZ_STATES,
  OI_BRAND_PROJECT_ID,
  OI_PRODUCT_ID,
  resolveAuthorization,
  validatePaidEntitlementStructure,
  type AuthzContextInput,
  type OiPaidEntitlement,
} from '@/pilot/authContract'
import fs from 'node:fs'
import path from 'node:path'

describe('Preview 0.0.68 - Contrato de Autorização e Apresentação da Área Paga', () => {
  const baseTimeMs = Date.parse('2025-06-01T12:00:00.000Z')

  const validEntitlement: OiPaidEntitlement = {
    project: OI_BRAND_PROJECT_ID,
    productId: OI_PRODUCT_ID,
    userId: 'usr_valid_123',
    status: 'active',
    validUntilIso: '2025-12-31T23:59:59.000Z',
    source: 'confirmed-payment',
    confirmedAtIso: '2025-05-01T10:00:00.000Z',
  }

  describe('1. Validador Estrito da Estrutura de Entitlement (validatePaidEntitlementStructure)', () => {
    it('valida entitlement completo e compatível com a marca e produto', () => {
      const res = validatePaidEntitlementStructure(validEntitlement)
      expect(res.valid).toBe(true)
      if (res.valid) {
        expect(res.entitlement.project).toBe('organizacao-inteligente')
        expect(res.entitlement.productId).toBe('ferramenta-ia-organizacao-inteligente')
        expect(res.entitlement.userId).toBe('usr_valid_123')
      }
    })

    it('rejeita valores nulos, arrays ou primitivos', () => {
      expect(validatePaidEntitlementStructure(null).valid).toBe(false)
      expect(validatePaidEntitlementStructure(undefined).valid).toBe(false)
      expect(validatePaidEntitlementStructure('active').valid).toBe(false)
      expect(validatePaidEntitlementStructure([]).valid).toBe(false)
    })

    it('ISOLAMENTO DE MARCA: rejeita registros de outra marca / projeto', () => {
      const foreignBrand = {
        ...validEntitlement,
        project: 'outra-marca-ou-empresa',
      }
      const res = validatePaidEntitlementStructure(foreignBrand)
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes('Marca/projeto inválido'))).toBe(true)
      }
    })

    it('PRODUTO CORRETO: rejeita registros associados ao Kit ou outros produtos', () => {
      const kitEntitlement = {
        ...validEntitlement,
        productId: 'kit-organizacao-inteligente',
      }
      const res = validatePaidEntitlementStructure(kitEntitlement)
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes('Produto inválido'))).toBe(true)
      }
    })

    it('rejeita se userId for vazio ou ausente', () => {
      const emptyUser = {
        ...validEntitlement,
        userId: '   ',
      }
      const res = validatePaidEntitlementStructure(emptyUser)
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes("Campo 'userId' obrigatório"))).toBe(true)
      }
    })

    it('rejeita status fora dos enums permitidos', () => {
      const badStatus = {
        ...validEntitlement,
        status: 'pending_approval',
      }
      const res = validatePaidEntitlementStructure(badStatus)
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes("Campo 'status' inválido"))).toBe(true)
      }
    })

    it('rejeita fontes não confirmadas (ex.: free-trial, demo, manual)', () => {
      const badSource = {
        ...validEntitlement,
        source: 'local-demo',
      }
      const res = validatePaidEntitlementStructure(badSource)
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes("Campo 'source' inválido"))).toBe(true)
      }
    })

    it('rejeita datas que não sejam ISO válidas', () => {
      const badDate = {
        ...validEntitlement,
        validUntilIso: 'amanhã à tarde',
      }
      const res = validatePaidEntitlementStructure(badDate)
      expect(res.valid).toBe(false)
      if (res.valid === false) {
        expect(res.errors.some((e) => e.includes("Campo 'validUntilIso'"))).toBe(true)
      }
    })
  })

  describe('2. Deny by Default e Resolução dos 7 Estados Formais', () => {
    it('ESTADO anonymous: usuário não autenticado é negado com razão ANONYMOUS_LOGIN_REQUIRED', () => {
      const res = resolveAuthorization({
        isAuthenticated: false,
        user: null,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('anonymous')
      expect(res.reason).toBe('ANONYMOUS_LOGIN_REQUIRED')
      expect(res.message).toContain('login')
    })

    it('ESTADO authenticated-unpaid: usuário autenticado sem entitlement é negado honestamente', () => {
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_abc', email: 'teste@exemplo.com' },
        entitlement: undefined,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('authenticated-unpaid')
      expect(res.reason).toBe('AUTHENTICATED_UNPAID')
      expect(res.message).toContain('em preparação')
    })

    it('ESTADO paid-active: ÚNICO ESTADO PERMITIDO quando usuário bate, vigência válida e marca bate', () => {
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_valid_123', email: 'membro@exemplo.com' },
        entitlement: validEntitlement,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(true)
      expect(res.state).toBe('paid-active')
      expect(res.reason).toBe('PAID_ACTIVE_CONFIRMED')
      expect(res.userId).toBe('usr_valid_123')
      expect(res.entitlement).toBeDefined()
    })

    it('ESTADO expired: status "expired" é expressamente negado', () => {
      const expiredEnt: OiPaidEntitlement = {
        ...validEntitlement,
        status: 'expired',
      }
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_valid_123' },
        entitlement: expiredEnt,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('expired')
      expect(res.reason).toBe('ENTITLEMENT_EXPIRED')
    })

    it('ESTADO expired por validade temporal estourada (mesmo com status "active")', () => {
      const pastEnt: OiPaidEntitlement = {
        ...validEntitlement,
        status: 'active',
        validUntilIso: '2025-01-01T00:00:00.000Z',
      }
      // Validação em junho/2025
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_valid_123' },
        entitlement: pastEnt,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('expired')
      expect(res.reason).toBe('TEMPORAL_WINDOW_INVALID')
    })

    it('ESTADO cancelled: acesso cancelado é negado', () => {
      const cancelledEnt: OiPaidEntitlement = {
        ...validEntitlement,
        status: 'cancelled',
      }
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_valid_123' },
        entitlement: cancelledEnt,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('cancelled')
      expect(res.reason).toBe('ENTITLEMENT_CANCELLED')
    })

    it('ESTADO refunded: acesso reembolsado é revogado e negado', () => {
      const refundedEnt: OiPaidEntitlement = {
        ...validEntitlement,
        status: 'refunded',
      }
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_valid_123' },
        entitlement: refundedEnt,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('refunded')
      expect(res.reason).toBe('ENTITLEMENT_REFUNDED')
    })

    it('ESTADO unverifiable: sessão corrompida (isAuthenticated=true mas user inválido/nulo)', () => {
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: null,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('unverifiable')
      expect(res.reason).toBe('UNVERIFIABLE_SESSION')
    })

    it('ESTADO unverifiable: entitlement adulterado com campos faltando ou tipo inválido', () => {
      const corrupted = {
        status: 'active',
        // faltam project, productId, validUntilIso, source
      }
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_1' },
        entitlement: corrupted,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('unverifiable')
      expect(res.reason).toBe('INVALID_ENTITLEMENT_SHAPE')
      expect(res.validationErrors.length).toBeGreaterThan(0)
    })

    it('ESTADO unverifiable: entitlement pertence a outro usuário (mismatch com sessão)', () => {
      const foreignUserEnt: OiPaidEntitlement = {
        ...validEntitlement,
        userId: 'usr_alvo_diferente',
      }
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_atacante' },
        entitlement: foreignUserEnt,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('unverifiable')
      expect(res.reason).toBe('UNVERIFIABLE_SOURCE')
    })

    it('ESTADO unverifiable: marca diferente rejeitada explicitamente no resolvedor', () => {
      const foreignBrandEnt = {
        ...validEntitlement,
        project: 'outra-empresa',
      }
      const res = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_valid_123' },
        entitlement: foreignBrandEnt,
        currentTimeMs: baseTimeMs,
      })
      expect(res.allowed).toBe(false)
      expect(res.state).toBe('unverifiable')
      expect(res.reason).toBe('BRAND_ISOLATION_REJECTED')
    })
  })

  describe('3. Falhas Fechadas e Ausência de Fontes Inseguras', () => {
    it('o resolvedor não lê nem consulta localStorage, location nem cookies', () => {
      const authContractSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/authContract.ts'),
        'utf-8',
      )
      expect(authContractSource).not.toContain('localStorage')
      expect(authContractSource).not.toContain('sessionStorage')
      expect(authContractSource).not.toContain('document.cookie')
      expect(authContractSource).not.toContain('window.location')
    })

    it('os 7 estados formais estão estritamente definidos na constante AUTHZ_STATES', () => {
      expect(AUTHZ_STATES).toEqual([
        'anonymous',
        'authenticated-unpaid',
        'paid-active',
        'expired',
        'cancelled',
        'refunded',
        'unverifiable',
      ])
    })
  })
})
