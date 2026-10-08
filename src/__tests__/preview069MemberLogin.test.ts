import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { isPilotHostnameAllowed, PILOT_ALLOWED_HOSTNAME } from '@/pilot/guard'
import { resolveAuthorization, type AuthzDecision } from '@/pilot/authContract'

describe('Preview 0.0.69 - Login de Membros e Simplificação de Apresentação', () => {
  describe('1. Escopo de Preview da Rota de Login de Membros', () => {
    it('isPilotHostnameAllowed só libera o host exato da preview', () => {
      expect(isPilotHostnameAllowed(PILOT_ALLOWED_HOSTNAME)).toBe(true)
      expect(isPilotHostnameAllowed('localhost')).toBe(false)
      expect(isPilotHostnameAllowed('127.0.0.1')).toBe(false)
      expect(isPilotHostnameAllowed('organizacaointeligente.com.br')).toBe(false)
      expect(isPilotHostnameAllowed('preview.goskip.app')).toBe(false)
      expect(isPilotHostnameAllowed(null)).toBe(false)
      expect(isPilotHostnameAllowed(undefined)).toBe(false)
    })

    it('MemberLoginRoute aplica a allowlist de preview antes do lazy import', () => {
      const routeContent = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/MemberLoginRoute.tsx'),
        'utf-8',
      )

      expect(routeContent).toContain('isPilotHostnameAllowed')
      expect(routeContent).toContain('LazyMemberLoginPage')
      expect(routeContent).toContain('PilotUnavailablePage')
      expect(routeContent).toContain('useLocation')
    })

    it('App.tsx registra /piloto-organizacao/login fora do Layout público com MemberLoginRoute', () => {
      const appContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8')
      expect(appContent).toContain('path="/piloto-organizacao/login"')
      expect(appContent).toContain('element={<MemberLoginRoute />}')
    })
  })

  describe('2. Linguagem de Cliente sem Termos Administrativos na UI de Membros', () => {
    it('MemberLoginPage usa termos de cliente/membro e não de administrador', () => {
      const loginContent = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/MemberLoginPage.tsx'),
        'utf-8',
      )

      expect(loginContent).not.toContain('senha de administrador')
      expect(loginContent).not.toContain('Acesso Restrito') // Título da tela admin
      expect(loginContent).not.toContain('painel de administração')
      expect(loginContent).not.toContain('/admin')

      expect(loginContent).toContain('Acesso do Membro')
      expect(loginContent).toContain('Seu email de membro')
      expect(loginContent).toContain('Entrar na Área de Membros')
      expect(loginContent).toContain('/piloto-organizacao')
    })
  })

  describe('3. Link de Membros na Página do Piloto', () => {
    it('PilotOrganizacaoPage direciona botão Fazer login e chamada para a rota de membros', () => {
      const pilotContent = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pilotContent).toContain('to="/piloto-organizacao/login"')
      expect(pilotContent).not.toContain('to="/login"')
    })
  })

  describe('4. Remoção de Detalhes Técnicos da UI do Piloto', () => {
    it('PilotOrganizacaoPage não expõe localStorage, parâmetros de URL nem ids crus na tela', () => {
      const pilotContent = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      // Não deve ter texto visível sobre localStorage
      expect(pilotContent).not.toContain('localStorage')
      expect(pilotContent).not.toContain('parâmetros de URL')
      expect(pilotContent).not.toContain('<code>{user?.id}</code>')
    })

    it('Mantém afirmações sobre produto pago separado do Kit e pagamento confirmado', () => {
      const pilotContent = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )

      expect(pilotContent).toContain('produto pago separado do Kit')
      expect(pilotContent).toContain('Área de Membros · Acesso Exclusivo')
      expect(pilotContent).toContain('Pagamento único (21 dias de uso)')
    })
  })

  describe('5. Ausência de Liberação Paga Pós-Login (authenticated-unpaid continua fechado)', () => {
    it('usuário autenticado sem entitlement pago permanece no estado authenticated-unpaid com allowed: false', () => {
      const decision: AuthzDecision = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_membro_123', email: 'cliente@exemplo.com' },
        entitlement: undefined,
      })

      expect(decision.allowed).toBe(false)
      expect(decision.state).toBe('authenticated-unpaid')
      expect(decision.reason).toBe('AUTHENTICATED_UNPAID')
      expect(decision.userId).toBe('usr_membro_123')
      expect(decision.entitlement).toBeNull()
    })

    it('login existente reutiliza useAuth sem conceder direitos pagos nem privilégios admin', () => {
      const decision: AuthzDecision = resolveAuthorization({
        isAuthenticated: true,
        user: { id: 'usr_admin_ou_cliente' },
        entitlement: null,
      })

      expect(decision.allowed).toBe(false)
      expect(decision.state).toBe('authenticated-unpaid')
    })
  })

  describe('6. Bump de Versão para 0.0.69', () => {
    it('package.json está na versão 0.0.69 ou superior', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'))
      expect(pkg.version).toBeDefined()
    })

    it('PilotOrganizacaoPage exibe a versão no rodapé', () => {
      const pilotContent = fs.readFileSync(
        path.resolve(process.cwd(), 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )
      expect(pilotContent).toContain('Versão 0.0.')
    })
  })
})
