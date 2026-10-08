import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Lock,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Mail,
  UserPlus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StandaloneOiClient } from './standaloneClient'
import {
  getStandaloneApiUrl,
  setCustomStandaloneApiUrl,
  isLoopbackEndpoint,
} from './standaloneConfig'

export default function MemberLoginPage() {
  const navigate = useNavigate()

  // Conexão com o backend isolado da OI (configurado pelo usuário / local)
  const [standaloneUrl, setStandaloneUrl] = useState<string>(getStandaloneApiUrl())
  const [client, setClient] = useState<StandaloneOiClient>(
    () => new StandaloneOiClient(getStandaloneApiUrl()),
  )

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'verify' | 'reset'>('login')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  // Campos de Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Campos de Cadastro (Signup)
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  // Campos de Verificação de Token
  const [verifyToken, setVerifyToken] = useState('')

  // Campos de Recuperação de Senha
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request')

  // Apply noindex, nofollow for this preview route
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
    document.title = 'Login de Membros (Backend Isolado) · Organização Inteligente'

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

  // Atualizar cliente caso a URL seja salva (rejeita não loopback e limpa sessão)
  const handleUpdateUrl = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = standaloneUrl.trim()
    if (trimmed && !isLoopbackEndpoint(trimmed)) {
      setFeedback({
        type: 'error',
        message:
          'Endpoint inválido: apenas endereços locais loopback (127.0.0.1 ou localhost) são permitidos.',
      })
      return
    }
    client.clearSession()
    setCustomStandaloneApiUrl(standaloneUrl)
    const newClient = new StandaloneOiClient(standaloneUrl)
    setClient(newClient)
    setFeedback({
      type: 'success',
      message: `Endpoint isolado atualizado para: ${standaloneUrl || '(vazio)'}. Sessão anterior limpa.`,
    })
  }

  // 1. Processar Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setLoading(true)

    if (!client.isConfigured()) {
      setLoading(false)
      setFeedback({
        type: 'error',
        message:
          'Configure a URL do servidor local isolado antes de entrar (ex: http://127.0.0.1:8090).',
      })
      return
    }

    const res = await client.login(loginEmail, loginPassword)
    setLoading(false)

    if (res.success) {
      navigate('/piloto-organizacao', { replace: true })
    } else {
      if (res.unverified) {
        setFeedback({
          type: 'error',
          message:
            'Conta criada, porém ainda NÃO verificada. Insira o token de verificação na aba "Verificar".',
        })
        setActiveTab('verify')
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Credenciais inválidas.',
        })
      }
    }
  }

  // 2. Processar Cadastro Seguro (Signup com verified=false)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setLoading(true)

    if (!client.isConfigured()) {
      setLoading(false)
      setFeedback({
        type: 'error',
        message: 'Configure a URL do servidor local isolado antes de cadastrar.',
      })
      return
    }

    const res = await client.signup(signupEmail, signupPassword, signupName)
    setLoading(false)

    if (res.success) {
      setFeedback({
        type: 'success',
        message:
          'Cadastro realizado! Sua conta foi criada como NÃO verificada. Um token foi registrado no inbox local de testes (pb_data/local_inbox/emails.log). Cole o token na aba "Verificar" para ativar sua conta.',
      })
      setActiveTab('verify')
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Falha ao cadastrar conta.',
      })
    }
  }

  // 3. Processar Verificação de E-mail
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setLoading(true)

    const res = await client.verifyEmail(verifyToken)
    setLoading(false)

    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'Conta verificada com sucesso! Agora você já pode fazer login normalmente.',
      })
      setVerifyToken('')
      setActiveTab('login')
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Token inválido ou expirado.',
      })
    }
  }

  // 4. Processar Solicitação de Reset
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setLoading(true)

    const res = await client.requestPasswordReset(resetEmail)
    setLoading(false)

    if (res.success) {
      setFeedback({
        type: 'success',
        message:
          'Instruções enviadas! O token de reset foi registrado no inbox local (pb_data/local_inbox/emails.log). Cole-o abaixo junto com sua nova senha.',
      })
      setResetStep('confirm')
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Falha ao solicitar recuperação.',
      })
    }
  }

  // 5. Processar Confirmação de Reset de Senha
  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setLoading(true)

    const res = await client.confirmPasswordReset(resetToken, resetNewPassword)
    setLoading(false)

    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'Senha redefinida com sucesso! Você já pode entrar com a nova senha.',
      })
      setResetStep('request')
      setResetToken('')
      setResetNewPassword('')
      setActiveTab('login')
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Falha ao redefinir senha.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between antialiased selection:bg-slate-200">
      <header className="w-full bg-white border-b border-slate-200 py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            to="/piloto-organizacao"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar à apresentação da ferramenta
          </Link>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Área de Membros (Servidor Isolado)
          </span>
        </div>
      </header>

      <main
        id="member-login-content"
        role="main"
        className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6"
      >
        <Card className="w-full max-w-lg shadow-lg border-slate-200 bg-white">
          <CardHeader className="space-y-2 text-center pb-3">
            <div className="w-11 h-11 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-1 border border-slate-200">
              <Lock className="w-5 h-5 text-slate-700" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Acesso do Membro
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600">
              Autenticação isolada e estrita na coleção <code>oi_memberships</code> do backend
              local.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Configuração de URL do Endpoint Isolado */}
            <form
              onSubmit={handleUpdateUrl}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="backend-url" className="text-[11px] font-semibold text-slate-700">
                  Endpoint do Backend Local (PocketBase 0.40.5):
                </Label>
                <span className="text-[10px] text-slate-500">Isolado</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="backend-url"
                  type="text"
                  placeholder="Ex: http://127.0.0.1:8090"
                  value={standaloneUrl}
                  onChange={(e) => setStandaloneUrl(e.target.value)}
                  className="text-xs h-8 bg-white"
                />
                <Button type="submit" size="sm" variant="outline" className="text-xs h-8 shrink-0">
                  Definir
                </Button>
              </div>
            </form>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 leading-relaxed">{feedback.message}</div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
              <TabsList className="grid grid-cols-4 w-full h-9">
                <TabsTrigger value="login" className="text-xs">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-xs">
                  Cadastrar
                </TabsTrigger>
                <TabsTrigger value="verify" className="text-xs">
                  Verificar
                </TabsTrigger>
                <TabsTrigger value="reset" className="text-xs">
                  Recuperar
                </TabsTrigger>
              </TabsList>

              {/* 1. ABA DE LOGIN */}
              <TabsContent value="login" className="space-y-4 pt-3">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">Email do Membro</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-slate-900 text-white hover:bg-slate-800"
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar na Área de Membros'}
                  </Button>
                </form>

                <div className="pt-2 text-center text-xs text-slate-500">
                  Contas de seed locais: <code>user1@organizacaointeligente.com.br</code> ou{' '}
                  <code>admin-oi@organizacaointeligente.com.br</code> (Senha: <code>Skip@Pass</code>
                  )
                </div>
              </TabsContent>

              {/* 2. ABA DE CADASTRO (SIGNUP COM VERIFIED=FALSE) */}
              <TabsContent value="signup" className="space-y-4 pt-3">
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name">Nome</Label>
                    <Input
                      id="signup-name"
                      placeholder="Seu nome"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Senha (mínimo 8 caracteres)</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-2"
                    disabled={loading}
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                    {loading ? 'Cadastrando...' : 'Criar Conta de Membro'}
                  </Button>
                </form>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  O cadastro cria uma conta <strong>NÃO verificada</strong> e com perfil restrito de
                  membro. O token de verificação é registrado no inbox local privado do servidor.
                </p>
              </TabsContent>

              {/* 3. ABA DE VERIFICAÇÃO DE CONTA */}
              <TabsContent value="verify" className="space-y-4 pt-3">
                <form onSubmit={handleVerify} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="verify-token">Token de Verificação</Label>
                    <Input
                      id="verify-token"
                      required
                      placeholder="Cole aqui o token recebido (ex: vfy_...)"
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                    disabled={loading}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    {loading ? 'Verificando...' : 'Confirmar Verificação de Conta'}
                  </Button>
                </form>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">Inbox local de testes:</div>
                  <p>
                    O token gerado pelo servidor local é gravado no arquivo:{' '}
                    <code>pb_data/local_inbox/emails.log</code>. Copie o campo <code>token</code> de
                    lá para validar.
                  </p>
                </div>
              </TabsContent>

              {/* 4. ABA DE RECUPERAÇÃO DE SENHA */}
              <TabsContent value="reset" className="space-y-4 pt-3">
                {resetStep === 'request' ? (
                  <form onSubmit={handleResetRequest} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-email">Email da sua conta</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        required
                        placeholder="seuemail@exemplo.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-slate-900 text-white hover:bg-slate-800"
                      disabled={loading}
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5" />
                      {loading ? 'Gerando token...' : 'Solicitar Token de Redefinição'}
                    </Button>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setResetStep('confirm')}
                        className="text-xs text-blue-600 underline"
                      >
                        Já possuo um token de reset
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetConfirm} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-token">Token de Redefinição</Label>
                      <Input
                        id="reset-token"
                        required
                        placeholder="Cole o token (ex: rst_...)"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-new-password">Nova Senha (mínimo 8 dígitos)</Label>
                      <Input
                        id="reset-new-password"
                        type="password"
                        required
                        minLength={8}
                        placeholder="••••••••"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-slate-900 text-white hover:bg-slate-800"
                      disabled={loading}
                    >
                      <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                      {loading ? 'Atualizando...' : 'Definir Nova Senha'}
                    </Button>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setResetStep('request')}
                        className="text-xs text-slate-500 hover:text-slate-800 underline"
                      >
                        Voltar para solicitar outro token
                      </button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-slate-700" aria-hidden="true" />
                Segurança e Isolamento Total
              </div>
              <p className="leading-relaxed">
                Esta página conecta exclusivamente à autenticação do backend standalone isolado. O
                PocketBase compartilhado em nuvem não é acessado. Tokens têm uso único e TTL
                rigoroso.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        Organização Inteligente · Login de Membros (Backend Standalone Isolado)
      </footer>
    </div>
  )
}
