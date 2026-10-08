/**
 * Cliente TypeScript estrito para o Backend Standalone Isolado da OI.
 * Usado pelo frontend e pela suíte de validação/testes automatizados.
 *
 * Não utiliza nem depende do PocketBase compartilhado.
 * Se a URL isolada não for fornecida (string vazia), permanece fail-closed.
 */

export interface OiMembershipUser {
  id: string
  email: string
  name?: string
  role: 'member' | 'admin'
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
  category: 'rotina' | 'prioridades' | 'documentos' | 'habitos'
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
  category: 'rotina' | 'prioridades' | 'documentos' | 'habitos'
  objective: string
  difficulty: 'iniciante' | 'intermediario' | 'avancado'
  timeAvailable: '5m' | '10m' | '20m' | '45m'
  targetDeadline?: string
  customNotes?: string
}

export class StandaloneOiClient {
  private baseUrl: string
  private token: string | null = null
  private currentUser: OiMembershipUser | null = null
  private customTestTimeMs: number | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.baseUrl.trim().length > 0)
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  setToken(token: string | null, user: OiMembershipUser | null = null) {
    this.token = token
    this.currentUser = user
  }

  getToken(): string | null {
    return this.token
  }

  getCurrentUser(): OiMembershipUser | null {
    return this.currentUser
  }

  setTestClockMs(timeMs: number | null) {
    this.customTestTimeMs = timeMs
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = this.token
    }
    if (this.customTestTimeMs !== null) {
      headers['x-oi-test-time-ms'] = String(this.customTestTimeMs)
    }
    return headers
  }

  /**
   * Login do membro na coleção auth 'oi_memberships'
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; token?: string; user?: OiMembershipUser; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Endpoint isolado da OI não configurado' }
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/collections/oi_memberships/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.message || 'Falha de login' }
      }
      this.token = data.token
      this.currentUser = {
        id: data.record.id,
        email: data.record.email,
        name: data.record.name,
        role: data.record.role || 'member',
      }
      return { success: true, token: this.token || undefined, user: this.currentUser }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  /**
   * Cadastro de membro via endpoint complementar /api/oi/auth/signup
   */
  async signup(
    email: string,
    password: string,
    name?: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Endpoint isolado não configurado' }
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/oi/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Falha no cadastro' }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  /**
   * Solicitar recuperação de senha (simulada/inbox local)
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Endpoint isolado não configurado' }
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/oi/auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Falha ao solicitar reset' }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  logout() {
    this.token = null
    this.currentUser = null
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
    return await res.json()
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
    return await res.json()
  }

  /**
   * Criar plano via servidor
   */
  async createPlan(
    input: OiCreatePlanInput,
  ): Promise<{ success: boolean; plan?: OiPlan; quotas?: unknown; error?: string }> {
    if (!this.isConfigured() || !this.token) {
      return { success: false, error: 'Membro não autenticado' }
    }
    const res = await fetch(`${this.baseUrl}/api/oi/plans/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(input),
    })
    return await res.json()
  }

  /**
   * Ajustar plano existente (cria nova versão v+1 e deduz cota)
   */
  async adjustPlan(
    planId: string,
    instructions: string,
  ): Promise<{ success: boolean; plan?: OiPlan; quotas?: unknown; error?: string }> {
    if (!this.isConfigured() || !this.token) {
      return { success: false, error: 'Membro não autenticado' }
    }
    const res = await fetch(`${this.baseUrl}/api/oi/plans/adjust`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ planId, instructions }),
    })
    return await res.json()
  }

  /**
   * Listar planos do membro
   */
  async listPlans(): Promise<OiPlan[]> {
    if (!this.isConfigured() || !this.token || !this.currentUser) {
      return []
    }
    const res = await fetch(
      `${this.baseUrl}/api/collections/oi_plans/records?filter=(member='${this.currentUser.id}')&sort=-created`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      },
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.items || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      title: item.title as string,
      category: item.category as OiPlan['category'],
      objective: item.objective as string,
      difficulty: item.difficulty as string,
      time_available: item.time_available as string,
      target_deadline: item.target_deadline as string,
      version: Number(item.version || 1),
      strategySummary: (item.strategy_summary || '') as string,
      actionsChecklist: (item.actions_checklist || []) as OiPlanAction[],
      created: item.created as string,
    }))
  }

  /**
   * Atualizar checklist/status de um plano sem chamar IA (edição local)
   */
  async updatePlanChecklist(planId: string, actionsChecklist: OiPlanAction[]): Promise<boolean> {
    if (!this.isConfigured() || !this.token) return false
    const res = await fetch(`${this.baseUrl}/api/collections/oi_plans/records/${planId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ actions_checklist: actionsChecklist }),
    })
    return res.ok
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
