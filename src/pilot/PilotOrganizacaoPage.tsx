import { useEffect, useMemo } from 'react'
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

export default function PilotOrganizacaoPage() {
  const { user, isAuthenticated, loading, signOut } = useAuth()

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
  }, [isAuthenticated, user])

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
            {loading ? (
              <span className="text-xs text-slate-500">Verificando sessão...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 hidden sm:inline truncate max-w-[200px]">
                  {user?.email || 'Usuário logado'}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  aria-label="Sair da sessão"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/piloto-organizacao/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                Fazer login
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
                Direito Pago Confirmado
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Preço e periodicidade ainda serão definidos formalmente pela equipe gestora.
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

            {/* Caso 1: Usuário Anônimo (sem sessão) */}
            {!isAuthenticated && (
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

            {/* Caso 2: Usuário Autenticado, mas sem entitlement pago confirmado (fail-closed) */}
            {isAuthenticated && (
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
                      Conta autenticada: {user?.email || 'Membro'}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sua conta está conectada à área de membros. No entanto,{' '}
                      <strong>o mecanismo de contratação e liberação de acesso pago</strong> ainda
                      está em fase de definição e preparação pela equipe técnica. O preço e a
                      periodicidade do produto ainda serão divulgados.
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
                <strong>Preço e periodicidade a definir:</strong> Nenhuma condição comercial foi
                estipulada de forma definitiva. Valores, planos e formas de pagamento serão
                anunciados nos canais oficiais.
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
          <p>Organização Inteligente · Área Restrita do Piloto de IA (Preview) · Versão 0.0.69</p>
          <p className="text-[11px] text-slate-400">
            Ambiente exclusivo de visualização prévia da área paga.
          </p>
        </footer>
      </main>
    </div>
  )
}
