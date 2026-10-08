import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function MemberLoginPage() {
  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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
    document.title = 'Login de Membros · Organização Inteligente'

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

  // If already authenticated, redirect back to the pilot
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/piloto-organizacao', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast({
        title: 'Não foi possível entrar',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } else {
      // Retorno ao piloto (que permanece fechado em authenticated-unpaid)
      navigate('/piloto-organizacao', { replace: true })
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
            Área de Membros
          </span>
        </div>
      </header>

      <main
        id="member-login-content"
        role="main"
        className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6"
      >
        <Card className="w-full max-w-md shadow-lg border-slate-200 bg-white">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="w-11 h-11 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-1 border border-slate-200">
              <Lock className="w-5 h-5 text-slate-700" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Acesso do Membro
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600">
              Entre com o email e a senha da sua conta de cliente para conferir a situação do seu
              acesso.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member-email">Seu email de membro</Label>
                <Input
                  id="member-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-password">Sua senha</Label>
                <Input
                  id="member-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                disabled={loading}
              >
                {loading ? 'Verificando acesso...' : 'Entrar na Área de Membros'}
              </Button>
            </form>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-slate-700" aria-hidden="true" />
                Aviso importante sobre o acesso pago
              </div>
              <p className="leading-relaxed">
                A ferramenta de inteligência artificial é um produto pago separado do Kit. O login
                identifica a sua conta de cliente; a liberação da ferramenta depende de pagamento
                confirmado e segue em preparação.
              </p>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1">
              <AlertCircle
                className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>
                Esta entrada utiliza a autenticação real do sistema. Não há privilégios
                administrativos concedidos a contas de clientes.
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        Organização Inteligente · Login de Membros (Preview)
      </footer>
    </div>
  )
}
