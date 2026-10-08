import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ShieldCheck,
  Lock,
  UserCheck,
  Clock,
  ArrowRight,
  Info,
  LogOut,
  LogIn,
  AlertTriangle,
  Layers,
  FileCheck2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { resolveAuthorization, type AuthzDecision } from './authContract'
import { getStandaloneApiUrl, setCustomStandaloneApiUrl } from './standaloneConfig'
import { StandaloneOiClient, type OiCycleStatusResponse, type OiPlan } from './standaloneClient'
import {
  Download,
  Terminal,
  Play,
  Plus,
  RefreshCw,
  FileText,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { STANDALONE_PACKAGE_BUNDLE } from './standaloneSources'

export default function PilotOrganizacaoPage() {
  const { user, isAuthenticated, loading, signOut } = useAuth()

  // Suporte à conexão com o backend isolado standalone
  const [standaloneUrlInput, setStandaloneUrlInput] = useState<string>(getStandaloneApiUrl())
  const [standaloneClient, setStandaloneClient] = useState<StandaloneOiClient>(() => {
    return new StandaloneOiClient(getStandaloneApiUrl())
  })
  const [cycleStatus, setCycleStatus] = useState<OiCycleStatusResponse | null>(null)
  const [cycleLoading, setCycleLoading] = useState(false)
  const [plans, setPlans] = useState<OiPlan[]>([])
  const [, setPlansLoading] = useState(false)

  // Formulário de criação de plano guiado
  const [formCategory, setFormCategory] = useState<
    'rotina' | 'prioridades' | 'documentos' | 'habitos'
  >('rotina')
  const [formObjective, setFormObjective] = useState('')
  const [formDifficulty] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante')
  const [formTime, setFormTime] = useState<'5m' | '10m' | '20m' | '45m'>('10m')
  const [formDeadline] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [creatingPlan, setCreatingPlan] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Estados da Área de Testes Recolhida
  const [isTestAreaOpen, setIsTestAreaOpen] = useState(false)
  const [isSourceAuditOpen, setIsSourceAuditOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Geração de download do pacote via Blob no cliente
  const handleDownloadBundleBlob = () => {
    try {
      const jsonStr = JSON.stringify(STANDALONE_PACKAGE_BUNDLE, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `oi-standalone-backend-v${STANDALONE_PACKAGE_BUNDLE.version}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setActionMessage('Download do pacote standalone (JSON completo) iniciado com sucesso!')
    } catch (_) {
      setActionMessage('Não foi possível gerar o download direto pelo navegador.')
    }
  }

  const handleCopyCode = async () => {
    try {
      const jsonStr = JSON.stringify(STANDALONE_PACKAGE_BUNDLE, null, 2)
      await navigator.clipboard.writeText(jsonStr)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      /* intentionally ignored */
    }
  }

  // Atualizar cliente quando a URL for modificada pelo usuário
  const handleConnectEndpoint = (e: React.FormEvent) => {
    e.preventDefault()
    setCustomStandaloneApiUrl(standaloneUrlInput)
    const client = new StandaloneOiClient(standaloneUrlInput.trim())
    setStandaloneClient(client)
    if (standaloneUrlInput.trim()) {
      setActionMessage(`Endpoint isolado configurado: ${standaloneUrlInput.trim()}`)
      if (client.getToken()) {
        refreshCycle()
      }
    } else {
      setCycleStatus(null)
      setPlans([])
      setActionMessage('Endpoint removido. Retornado ao modo fail-closed padrão.')
    }
  }

  // Carregar status do ciclo quando o cliente estiver conectado
  const refreshCycle = async () => {
    if (!standaloneClient || !standaloneClient.getToken()) return
    setCycleLoading(true)
    try {
      const status = await standaloneClient.getCycleStatus()
      setCycleStatus(status)
      const memberPlans = await standaloneClient.listPlans()
      setPlans(memberPlans)
    } catch (_) {
      setActionMessage('Erro ao consultar endpoint isolado.')
    } finally {
      setCycleLoading(false)
    }
  }

  const handleStartCycle = async () => {
    if (!standaloneClient) return
    setCycleLoading(true)
    const res = await standaloneClient.startCycle()
    setCycleLoading(false)
    if (res.success) {
      setActionMessage('Ciclo de 21 dias iniciado com sucesso!')
      await refreshCycle()
    } else {
      setActionMessage(`Não foi possível iniciar o ciclo: ${res.error || 'Erro'}`)
    }
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!standaloneClient) return
    setCreatingPlan(true)
    setActionMessage(null)
    const res = await standaloneClient.createPlan({
      category: formCategory,
      objective: formObjective,
      difficulty: formDifficulty,
      timeAvailable: formTime,
      targetDeadline: formDeadline,
      customNotes: formNotes,
    })
    setCreatingPlan(false)
    if (res.success && res.plan) {
      setActionMessage(`Plano "${res.plan.title}" criado com sucesso!`)
      setFormObjective('')
      setFormNotes('')
      await refreshCycle()
    } else {
      setActionMessage(`Falha ao criar plano: ${res.error || 'Erro desconhecido'}`)
    }
  }

  const handleExportPdf = async (planId: string) => {
    if (!standaloneClient) return
    const res = await standaloneClient.exportPlanPdf(planId)
    if (res.success && res.pdfText) {
      const blob = new Blob([res.pdfText], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plano-oi-${planId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      setActionMessage(`Erro ao exportar PDF: ${res.error || 'Erro'}`)
    }
  }

  const handleToggleChecklist = async (plan: OiPlan, actionId: string) => {
    if (!standaloneClient) return
    const updated = plan.actionsChecklist.map((a) =>
      a.id === actionId ? { ...a, done: !a.done } : a,
    )
    const ok = await standaloneClient.updatePlanChecklist(plan.id, updated)
    if (ok) {
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, actionsChecklist: updated } : p)),
      )
    }
  }

  // Apply noindex, nofollow solely for this route
  useEffect(() => {
    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const originalContent = robotsMeta ? robotsMeta.getAttribute('content') : null

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.setAttribute('name', 'robots')
      document.head.appendChild(robotsMeta)
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow')

    const prevTitle = document.title
    document.title = 'Ferramenta de IA · Organização Inteligente'

    return () => {
      document.title = prevTitle
      if (robotsMeta) {
        if (originalContent) {
          robotsMeta.setAttribute('content', originalContent)
        } else {
          robotsMeta.remove()
        }
      }
    }
  }, [])

  // Resolvedor estrito de autorização:
  // Usa a autenticação real do PocketBase via useAuth.
  // Como não há coleção de entitlements no backend compartilhado e alterações são vedadas,
  // entitlement permanece undefined -> fail-closed com estado honesto (anonymous ou authenticated-unpaid).
  const authzDecision: AuthzDecision = useMemo(() => {
    return resolveAuthorization({
      isAuthenticated,
      user,
      entitlement: undefined, // fail closed: sem fonte real de entitlement no momento
    })
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-slate-200">
      {/* Skip link for keyboard accessibility */}
      <a
        href="#pilot-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-md font-medium shadow-md"
      >
        Pular para o conteúdo da página
      </a>

      {/* Header restrito da ferramenta paga */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-0 min-h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-bold text-base sm:text-xl text-slate-900 tracking-tight shrink-0">
              Organização Inteligente
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
              aria-label="Produto em fase de preparação restrita"
            >
              <Sparkles className="w-3 h-3 text-slate-600 shrink-0" aria-hidden="true" />
              PRODUTO PAGO · ÁREA RESTRITA
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {standaloneClient.getCurrentUser() ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 hidden sm:inline truncate max-w-[200px]">
                  {standaloneClient.getCurrentUser()?.email}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await standaloneClient.logout()
                    setCycleStatus(null)
                    setPlans([])
                    setActionMessage('Sessão encerrada com sucesso.')
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  aria-label="Sair da sessão"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  Sair
                </button>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline truncate max-w-[180px]">
                  {user?.email}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors mr-1"
                >
                  Sair Nuvem
                </button>
                <Link
                  to="/piloto-organizacao/login"
                  className="inline-flex items-center gap-1 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <LogIn className="w-3 h-3" />
                  Login Isolado
                </Link>
              </div>
            ) : loading ? (
              <span className="text-xs text-slate-400">Verificando...</span>
            ) : (
              <Link
                to="/piloto-organizacao/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                Login do Membro
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="pilot-content"
        role="main"
        className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8"
      >
        {/* Banner de transparência e limites */}
        <section
          aria-labelledby="banner-transparency-title"
          className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 text-blue-950 flex items-start gap-3.5 shadow-2xs"
        >
          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <h2 id="banner-transparency-title" className="text-sm font-semibold">
              Ambiente de Apresentação e Demonstração · Nenhuma IA ativa ou conectada em produção
            </h2>
            <p className="text-xs text-blue-800/90 leading-relaxed">
              Esta página apresenta a futura área de acesso à ferramenta de IA de Organização
              Inteligente. Não há envio de dados a provedores externos de IA nem processamento de
              dados não autorizados.
            </p>
          </div>
        </section>

        {/* Seção de Testes e Conexão Standalone (Recolhida e separada da interface de cliente) */}
        <section
          aria-labelledby="standalone-package-title"
          className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Terminal className="w-4 h-4 text-slate-600 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Ambiente Técnico de Testes & Execução Local
                </span>
                <h2
                  id="standalone-package-title"
                  className="text-sm sm:text-base font-bold text-slate-900"
                >
                  Backend Standalone Isolado (Proprietário)
                </h2>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTestAreaOpen(!isTestAreaOpen)}
              className="text-xs h-8 gap-1.5 shrink-0"
              aria-expanded={isTestAreaOpen}
              aria-controls="standalone-test-panel"
            >
              {isTestAreaOpen ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Recolher Área de Testes
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Expandir Área de Testes
                </>
              )}
            </Button>
          </div>

          {isTestAreaOpen && (
            <div id="standalone-test-panel" className="space-y-5 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">
                    Entrega dos Fontes Completos (Vite Module)
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Pacote versão {STANDALONE_PACKAGE_BUNDLE.version} contendo{' '}
                    {STANDALONE_PACKAGE_BUNDLE.totalFiles} arquivos (migrações, hooks, scripts,
                    fixtures e testes HTTP reais).
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadBundleBlob}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-2 rounded-xl h-9"
                >
                  <Download className="w-4 h-4" />
                  Gerar download do pacote
                </Button>
              </div>

              {/* Seção recolhida de auditoria: Código do pacote standalone */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/70 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">
                    Código do pacote standalone
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyCode}
                      className="text-xs h-7 gap-1 text-slate-700"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar JSON
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsSourceAuditOpen(!isSourceAuditOpen)}
                      className="text-xs h-7 gap-1"
                    >
                      {isSourceAuditOpen ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Visualizar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isSourceAuditOpen && (
                  <div className="p-3 bg-slate-950 text-slate-100 overflow-x-auto max-h-[400px]">
                    <pre
                      aria-label="Código do pacote standalone"
                      className="text-[11px] font-mono leading-relaxed select-all"
                    >
                      {JSON.stringify(STANDALONE_PACKAGE_BUNDLE, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Configuração de endpoint local */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-800">
                  Conexão com PocketBase Standalone Local:
                </Label>
                <form
                  onSubmit={handleConnectEndpoint}
                  className="flex flex-wrap sm:flex-nowrap gap-2 items-center"
                >
                  <div className="flex-1 min-w-[240px]">
                    <Input
                      type="text"
                      placeholder="Ex.: http://127.0.0.1:8090 (URL do endpoint isolado local)"
                      value={standaloneUrlInput}
                      onChange={(e) => setStandaloneUrlInput(e.target.value)}
                      className="text-xs h-9 bg-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="text-xs h-9 shrink-0"
                  >
                    {standaloneUrlInput ? 'Conectar Endpoint' : 'Redefinir Padrão'}
                  </Button>
                </form>
              </div>

              {actionMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                  {actionMessage}
                </div>
              )}

              {/* Interface Ativa do Ciclo de 21 Dias se o cliente estiver conectado ao backend standalone */}
              {standaloneClient && cycleStatus && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Ciclo de 21 Dias
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        Status:{' '}
                        <span className="uppercase text-blue-600">{cycleStatus.status}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={refreshCycle}
                      disabled={cycleLoading}
                      className="text-xs"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 mr-1.5 ${cycleLoading ? 'animate-spin' : ''}`}
                      />
                      Atualizar
                    </Button>
                  </div>

                  {cycleStatus.status === 'waiting_start' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Sua compra está confirmada! Você tem até 7 dias para iniciar voluntariamente
                        seu ciclo de 21 dias.
                      </p>
                      <Button
                        onClick={handleStartCycle}
                        disabled={cycleLoading}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                      >
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        Começar meus 21 dias agora
                      </Button>
                    </div>
                  )}

                  {cycleStatus.status === 'active' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <div className="text-[11px] text-slate-500">Dias Restantes</div>
                        <div className="text-lg font-bold text-slate-900">
                          {cycleStatus.daysRemaining} dias
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <div className="text-[11px] text-slate-500">Cota Diária</div>
                        <div className="text-lg font-bold text-slate-900">
                          {cycleStatus.quotas?.dailyRemaining} / 5
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <div className="text-[11px] text-slate-500">Cota do Ciclo</div>
                        <div className="text-lg font-bold text-slate-900">
                          {cycleStatus.quotas?.cycleRemaining} / 50
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <div className="text-[11px] text-slate-500">Expiração</div>
                        <div className="text-xs font-semibold text-slate-700 truncate">
                          {cycleStatus.expiresAt?.substring(0, 10)}
                        </div>
                      </div>
                    </div>
                  )}

                  {cycleStatus.status === 'expired' && (
                    <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                      <div className="font-semibold text-slate-900">
                        Período de 21 Dias Expirado
                      </div>
                      <p>
                        Seu acesso está em modo de somente consulta/exportação de resultados pelos
                        próximos 30 dias.
                      </p>
                    </div>
                  )}

                  {/* Formulário de Criação de Plano se ciclo estiver ativo */}
                  {cycleStatus.canCreatePlans && (
                    <form
                      onSubmit={handleCreatePlan}
                      className="bg-white p-4 rounded-xl border border-slate-200 space-y-3"
                    >
                      <div className="font-semibold text-xs text-slate-900">
                        Criar Novo Plano de Organização
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[11px]">Categoria</Label>
                          <select
                            value={formCategory}
                            onChange={(e) =>
                              setFormCategory(
                                e.target.value as
                                  | 'rotina'
                                  | 'prioridades'
                                  | 'documentos'
                                  | 'habitos',
                              )
                            }
                            className="w-full text-xs h-8 border rounded-md px-2 bg-slate-50"
                          >
                            <option value="rotina">Rotina Diária</option>
                            <option value="prioridades">Prioridades e Foco</option>
                            <option value="documentos">Organização de Documentos</option>
                            <option value="habitos">Estrutura Prática</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-[11px]">Tempo Disponível</Label>
                          <select
                            value={formTime}
                            onChange={(e) =>
                              setFormTime(e.target.value as '5m' | '10m' | '20m' | '45m')
                            }
                            className="w-full text-xs h-8 border rounded-md px-2 bg-slate-50"
                          >
                            <option value="5m">5 minutos</option>
                            <option value="10m">10 minutos</option>
                            <option value="20m">20 minutos</option>
                            <option value="45m">45 minutos</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px]">Objetivo Específico</Label>
                        <Input
                          placeholder="Ex.: Organizar meus recibos de despesas do mês"
                          value={formObjective}
                          onChange={(e) => setFormObjective(e.target.value)}
                          className="text-xs h-8"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={creatingPlan}
                        className="text-xs bg-slate-900 text-white"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        {creatingPlan ? 'Processando...' : 'Gerar Plano com Biblioteca Revisável'}
                      </Button>
                    </form>
                  )}

                  {/* Lista de Planos do Usuário */}
                  {plans.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-bold text-slate-900">
                        Meus Planos ({plans.length})
                      </div>
                      <div className="space-y-2">
                        {plans.map((p) => (
                          <div
                            key={p.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">
                                {p.title} (v{p.version})
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleExportPdf(p.id)}
                                className="text-[11px] h-7"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                PDF
                              </Button>
                            </div>
                            <p className="text-slate-600 text-[11px]">{p.strategySummary}</p>
                            <div className="space-y-1 pt-1">
                              {p.actionsChecklist.map((act) => (
                                <button
                                  key={act.id}
                                  type="button"
                                  onClick={() => handleToggleChecklist(p, act.id)}
                                  className="w-full flex items-center gap-2 text-left hover:bg-slate-50 p-1 rounded"
                                >
                                  {act.done ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span
                                    className={
                                      act.done
                                        ? 'line-through text-slate-400 text-[11px]'
                                        : 'text-slate-700 text-[11px]'
                                    }
                                  >
                                    {act.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Card Principal de Apresentação da Área Paga */}
        <section
          aria-labelledby="product-title"
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              Área de Membros · Acesso Exclusivo
            </div>
            <h1
              id="product-title"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Ferramenta de IA de Organização Inteligente
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              A <strong>ferramenta de IA de Organização Inteligente</strong> é um{' '}
              <strong>produto pago separado do Kit</strong>, acessível exclusivamente pela área de
              membros com login e direito de acesso pago confirmado.
            </p>
          </div>

          {/* Destaques conceituais obrigatórios (sem inventar preço ou periodicidade) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-900">
                <Layers className="w-4 h-4" aria-hidden="true" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Produto Pago Separado
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Totalmente independente do Kit de Organização. A aquisição de um não condiciona nem
                inclui o outro.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-900">
                <UserCheck className="w-4 h-4" aria-hidden="true" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Área de Membros com Login
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Acesso vinculado à conta de usuário com verificação rigorosa de credenciais e
                sessão.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-900">
                <Clock className="w-4 h-4" aria-hidden="true" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Pagamento Único por 21 Dias
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pagamento único por 21 dias de uso da ferramenta (vários planos), sem renovação e
                sem promessa de hábito. Preço ainda será definido formalmente.
              </p>
            </div>
          </div>

          {/* Bloco de Estado de Autorização (Fail-Closed Honesto) */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                Situação do seu acesso
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  authzDecision.state === 'anonymous'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : authzDecision.state === 'authenticated-unpaid'
                      ? 'bg-blue-50 text-blue-900 border border-blue-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <Lock className="w-3 h-3" aria-hidden="true" />
                {authzDecision.state === 'anonymous'
                  ? 'Não autenticado (Login necessário)'
                  : authzDecision.state === 'authenticated-unpaid'
                    ? 'Autenticado · Liberação em preparação'
                    : 'Acesso restrito'}
              </span>
            </div>

            {/* Caso 1: Usuário Anônimo (sem sessão no backend isolado) */}
            {!standaloneClient.getCurrentUser() && (
              <div
                role="region"
                aria-label="Aviso de login necessário"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="w-5 h-5 text-slate-500 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Login e confirmação de acesso necessários
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Para acessar a ferramenta quando disponível, será necessário possuir uma conta
                      na área de membros e confirmação de pagamento ativo. Se você já possui uma
                      conta cadastrada, pode entrar usando o formulário oficial.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to="/piloto-organizacao/login"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    Entrar como membro
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <p className="text-[11px] text-slate-500">
                    Acesso exclusivo para conferência de conta. Não há liberação fictícia ou
                    automática.
                  </p>
                </div>
              </div>
            )}

            {/* Caso 2: Usuário Autenticado no backend isolado */}
            {Boolean(standaloneClient.getCurrentUser()) && (
              <div
                role="region"
                aria-label="Aviso de liberação em preparação"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <FileCheck2
                    className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Conta autenticada: {standaloneClient.getCurrentUser()?.email}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sua conta está conectada ao servidor local de membros. Status do ciclo:{' '}
                      <strong>{cycleStatus?.status || 'consultando...'}</strong>. O produto opera
                      como pagamento único por 21 dias de uso (vários planos, sem renovação e sem
                      promessa de hábito).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    Situação da liberação:
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Sua conta está autenticada com segurança. Inicie seu ciclo para começar a gerar
                    planos pela biblioteca editorial revisável.
                  </p>
                </div>
              </div>
            )}

            {/* Caso 3: Sessão no PocketBase compartilhado (fallback) */}
            {!standaloneClient.getCurrentUser() && isAuthenticated && (
              <div
                role="region"
                aria-label="Aviso de conta na nuvem"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <FileCheck2
                    className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Conta autenticada (Nuvem): {user?.email || 'Membro'}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sua conta está conectada à área de membros. No entanto,{' '}
                      <strong>o mecanismo de contratação e liberação de acesso pago</strong> ainda
                      está em fase de definição e preparação pela equipe técnica. O produto opera
                      como pagamento único por 21 dias de uso (vários planos, sem renovação). O
                      preço ainda será divulgado nos canais oficiais.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    Situação da liberação:
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Sua conta está identificada com sucesso, mas a liberação da ferramenta permanece
                    fechada até a definição formal das regras de acesso pago e checkout.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Informações Institucionais e Políticas de Separação */}
        <section
          aria-labelledby="policy-info-title"
          className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs"
        >
          <h2 id="policy-info-title" className="text-sm font-bold text-slate-900">
            Diretrizes de Acesso e Contratação
          </h2>
          <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <span>
                <strong>Separação completa do Kit:</strong> A compra do Kit de Organização
                Inteligente concede acesso aos seus materiais e apostilas editoriais próprios, não
                concedendo acesso automático à ferramenta de inteligência artificial.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <span>
                <strong>Pagamento único (21 dias de uso):</strong> Produto de pagamento único por 21
                dias de uso da ferramenta (vários planos), sem renovação e sem promessa de hábito.
                Valores e opções de planos serão anunciados nos canais oficiais.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <span>
                <strong>Acesso pago confirmado:</strong> Apenas contas com pagamento confirmado
                terão acesso à ferramenta quando a preparação for concluída.
              </span>
            </li>
          </ul>
        </section>

        {/* Rodapé da página */}
        <footer className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2 text-center">
          <p>Organização Inteligente · Área Restrita do Piloto de IA (Preview) · Versão 0.0.72</p>
          <p className="text-[11px] text-slate-400">
            Ambiente exclusivo de visualização prévia da área paga.
          </p>
        </footer>
      </main>
    </div>
  )
}
