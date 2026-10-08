/**
 * Cliente TypeScript estrito para o Backend Standalone Isolado da OI.
 * Usado pelo frontend (MemberLoginPage, PilotOrganizacaoPage) e pela suíte de integração.
 *
 * Não utiliza nem depende do PocketBase compartilhado na nuvem.
 * Permanece fail-closed caso a URL não esteja configurada.
 */

export interface OiMembershipUser {
  id: string
  email: string
  name?: string
  role: 'member' | 'admin'
  verified?: boolean
}

export interface OiCycleStatusResponse {
  hasCycle: boolean
  cycleId?: string
  status: 'none' | 'waiting_start' | 'active' | 'expired' | 'revoked' | 'purged'
  approvedAt?: string
  autoStartAt?: string
  startedAt?: string
  expiresAt?: string
  retentionUntil?: string
  daysRemaining?: number
  canStartNow?: boolean
  canCreatePlans?: boolean
  isDownloadOnly?: boolean
  quotas?: {
    dailyUsed: number
    dailyLimit: number
    dailyRemaining: number
    cycleUsed: number
    cycleLimit: number
    cycleRemaining: number
  }
}

export interface OiPlanAction {
  id: string
  text: string
  priority: 'alta' | 'media' | 'baixa'
  deadline: string
  done: boolean
}

export interface OiPlan {
  id: string
  title: string
  category: 'rotina' | 'prioridades' | 'documentos' | 'habitos' | 'organizacao'
  objective: string
  difficulty: string
  time_available: string
  target_deadline?: string
  version: number
  modelKey?: string
  strategySummary: string
  actionsChecklist: OiPlanAction[]
  created?: string
}

export interface OiCreatePlanInput {
  category: 'rotina' | 'prioridades' | 'documentos' | 'habitos' | 'organizacao'
  objective: string
  difficulty?: 'iniciante' | 'intermediario' | 'avancado'
  timeAvailable?: '5m' | '10m' | '20m' | '45m'
  targetDeadline?: string
  customNotes?: string
  requestId: string
  manual?: boolean
}

const STANDALONE_STORAGE_KEY = 'oi_standalone_auth_session'

export class StandaloneOiClient {
  private baseUrl: string
  private token: string | null = null
  private currentUser: OiMembershipUser | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    // Restaurar sessão persistida do localStorage se disponível
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STANDALONE_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && parsed.token && parsed.user) {
            this.token = parsed.token
            this.currentUser = parsed.user
          }
        }
      } catch {
        /* intentionally ignored */
      }
    }
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.baseUrl.trim().length > 0)
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  clearSession(): void {
    this.token = null
    this.currentUser = null
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STANDALONE_STORAGE_KEY)
      } catch {
        /* intentionally ignored */
      }
    }
  }

  setToken(token: string | null, user: OiMembershipUser | null = null) {
    this.token = token
    this.currentUser = user
    if (typeof window !== 'undefined') {
      try {
        if (token && user) {
          localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify({ token, user }))
        } else {
          localStorage.removeItem(STANDALONE_STORAGE_KEY)
        }
      } catch {
        /* intentionally ignored */
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  getCurrentUser(): OiMembershipUser | null {
    return this.currentUser
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = this.token.startsWith('Bearer ')
        ? this.token
        : `Bearer ${this.token}`
    }
    return headers
  }

  /**
   * Login do membro no endpoint isolado:
   * Tenta primeiro a rota segura /api/oi/auth/login (que valida verified=true)
   * com fallback transparente para auth-with-password.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{
    success: boolean
    token?: string
    user?: OiMembershipUser
    error?: string
    unverified?: boolean
  }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Endpoint isolado da OI não configurado' }
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/oi/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 403 && data.unverified) {
          return {
            success: false,
            unverified: true,
            error: data.error || 'Conta não verificada. Por favor confirme seu e-mail.',
          }
        }
        return { success: false, error: data.error || data.message || 'Falha de login' }
      }
      this.setToken(data.token, {
        id: data.record.id,
        email: data.record.email,
        name: data.record.name,
        role: data.record.role || 'member',
        verified: data.record.verified,
      })
      return { success: true, token: this.token || undefined, user: this.currentUser || undefined }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  /**
   * Cadastro de membro via endpoint complementar /api/oi/auth/signup
   * Cria conta com verified=false e gera token no inbox local
   */
  async signup(
    email: string,
    password: string,
    name?: string,
  ): Promise<{ success: boolean; message?: string; error?: string; verified?: boolean }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Endpoint isolado não configurado' }
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/oi/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: data.error || 'Falha no cadastro' }
      }
      return {
        success: true,
        message: data.message,
        verified: data.verified,
      }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  /**
   * Verificar e-mail com token de uso único
   */
  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Endpoint isolado não configurado' }
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/oi/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: data.error || 'Falha ao verificar token' }
      }
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  /**
   * Solicitar recuperação de senha (inbox local privado de testes)
   */
  async requestPasswordReset(
    email: string,
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Endpoint isolado não configurado' }
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/oi/auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: data.error || 'Falha ao solicitar reset' }
      }
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  /**
   * Confirmar redefinição de senha com token
   */
  async confirmPasswordReset(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Endpoint isolado não configurado' }
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/oi/auth/reset-password-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: data.error || 'Falha ao redefinir senha' }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  /**
   * Logout do membro: invalida a sessão localmente e no servidor
   */
  async logout(): Promise<void> {
    if (this.isConfigured() && this.token) {
      try {
        await fetch(`${this.baseUrl}/api/oi/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders(),
        })
      } catch {
        /* intentionally ignored */
      }
    }
    this.setToken(null, null)
  }

  /**
   * Consultar estado do ciclo de 21 dias
   */
  async getCycleStatus(): Promise<OiCycleStatusResponse> {
    if (!this.isConfigured() || !this.token) {
      return { hasCycle: false, status: 'none' }
    }
    const res = await fetch(`${this.baseUrl}/api/oi/cycle/status`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    return await res.json().catch(() => ({ hasCycle: false, status: 'none' }))
  }

  /**
   * Iniciar ciclo atomicamente ("Começar meus 21 dias")
   */
  async startCycle(): Promise<{
    success: boolean
    error?: string
    cycleId?: string
    status?: string
    daysRemaining?: number
  }> {
    if (!this.isConfigured() || !this.token) {
      return { success: false, error: 'Membro não autenticado' }
    }
    const res = await fetch(`${this.baseUrl}/api/oi/cycle/start`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    return await res.json().catch(() => ({ success: false, error: 'Erro de comunicação' }))
  }

  /**
   * Criar plano via servidor
   * Suporta repetição idempotente com o mesmo requestId em caso de 202 pending.
   */
  async createPlan(input: OiCreatePlanInput): Promise<{
    success: boolean
    pending?: boolean
    requestId?: string
    plan?: OiPlan
    quotas?: unknown
    error?: string
  }> {
    if (!this.isConfigured() || !this.token) {
      return { success: false, error: 'Membro não autenticado' }
    }
    const res = await fetch(`${this.baseUrl}/api/oi/plans/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(input),
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 202) {
      return { success: false, pending: true, requestId: data.requestId || input.requestId }
    }
    if (!res.ok) {
      return { success: false, error: data.message || data.error || 'Falha ao criar plano' }
    }
    return {
      success: true,
      plan: data.plan,
      quotas: data.quotas,
      requestId: data.requestId || input.requestId,
    }
  }

  /**
   * Ajustar plano existente (cria nova versão v+1 com ID novo e deduz cota)
   */
  async adjustPlan(
    planId: string,
    instructions: string,
    requestId: string,
    manual?: boolean,
  ): Promise<{
    success: boolean
    pending?: boolean
    requestId?: string
    plan?: OiPlan
    quotas?: unknown
    error?: string
  }> {
    if (!this.isConfigured() || !this.token) {
      return { success: false, error: 'Membro não autenticado' }
    }
    const res = await fetch(`${this.baseUrl}/api/oi/plans/adjust`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ planId, instructions, requestId, manual }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 202) {
      return { success: false, pending: true, requestId: data.requestId || requestId }
    }
    if (!res.ok) {
      return { success: false, error: data.message || data.error || 'Falha ao ajustar plano' }
    }
    return {
      success: true,
      plan: data.plan,
      quotas: data.quotas,
      requestId: data.requestId || requestId,
    }
  }

  /**
   * Listar planos do membro via rota server-side controlada (respeitando purga/expiração)
   */
  async listPlans(): Promise<OiPlan[]> {
    if (!this.isConfigured() || !this.token) {
      return []
    }
    const res = await fetch(`${this.baseUrl}/api/oi/plans/list`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    if (!res.ok) return []
    const data = await res.json().catch(() => ({}))
    return (data.items || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      title: item.title as string,
      category: item.category as OiPlan['category'],
      objective: item.objective as string,
      difficulty: item.difficulty as string,
      time_available: item.time_available as string,
      target_deadline: item.target_deadline as string,
      version: Number(item.version || 1),
      strategySummary: (item.strategySummary || item.strategy_summary || '') as string,
      actionsChecklist: (item.actionsChecklist || item.actions_checklist || []) as OiPlanAction[],
      created: item.created as string,
    }))
  }

  /**
   * Atualizar dados editáveis de um plano (checklist, prioridades, prazos) via rota server-side
   */
  async updatePlanChecklist(
    planId: string,
    actionsChecklist: OiPlanAction[],
    targetDeadline?: string,
    title?: string,
    version?: number,
  ): Promise<{ success: boolean; plan?: OiPlan; error?: string }> {
    if (!this.isConfigured() || !this.token)
      return { success: false, error: 'Membro não autenticado' }
    const res = await fetch(`${this.baseUrl}/api/oi/plans/update`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ planId, actionsChecklist, targetDeadline, title, version }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { success: false, error: data.message || data.error || 'Falha ao atualizar plano' }
    }
    return { success: true, plan: data.plan }
  }

  /**
   * Exportar PDF do plano
   */
  async exportPlanPdf(
    planId: string,
  ): Promise<{ success: boolean; pdfText?: string; error?: string }> {
    if (!this.isConfigured() || !this.token) {
      return { success: false, error: 'Membro não autenticado' }
    }
    const res = await fetch(
      `${this.baseUrl}/api/oi/plans/export-pdf?planId=${encodeURIComponent(planId)}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      },
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha no download do PDF' }))
      return { success: false, error: err.error }
    }
    const text = await res.text()
    return { success: true, pdfText: text }
  }

  /**
   * Disparar evento simulado no webhook Kiwify
   */
  async triggerKiwifyWebhook(
    token: string,
    payload: unknown,
  ): Promise<{ status: number; body: unknown }> {
    const res = await fetch(
      `${this.baseUrl}/api/oi/webhook/kiwify?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )
    const body = await res.json().catch(() => ({}))
    return { status: res.status, body }
  }
}
