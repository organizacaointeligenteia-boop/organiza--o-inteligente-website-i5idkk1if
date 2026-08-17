import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { usePageTitle } from '@/hooks/use-page-title'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, ArrowRight, CalendarDays, FileText, ListChecks, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

type OptionKey = 'a' | 'b' | 'c' | 'd'

interface Question {
  id: number
  question: string
  options: { key: OptionKey; text: string }[]
  // weight per theme for each option
  weights: Record<OptionKey, Partial<Record<Theme, number>>>
}

type Theme = 'rotina' | 'prioridades' | 'foco' | 'documentos'

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Como você começa seu dia?',
    options: [
      { key: 'a', text: 'Já sei exatamente o que fazer' },
      { key: 'b', text: 'Olho mensagens e e-mails primeiro' },
      { key: 'c', text: 'Começo por qualquer tarefa que aparecer' },
      { key: 'd', text: 'Sinto que o dia já começa bagunçado' },
    ],
    weights: {
      a: { rotina: 0 },
      b: { prioridades: 2, foco: 1 },
      c: { prioridades: 2 },
      d: { rotina: 3, prioridades: 1 },
    },
  },
  {
    id: 2,
    question: 'Como você lida com tarefas e pendências?',
    options: [
      { key: 'a', text: 'Anoto tudo em um sistema que confio' },
      { key: 'b', text: 'Uso notas soltas em papel/celular' },
      { key: 'c', text: 'Tento guardar na cabeça' },
      { key: 'd', text: 'Vou resolvendo conforme aparecem' },
    ],
    weights: {
      a: { prioridades: 0 },
      b: { prioridades: 2 },
      c: { prioridades: 3, foco: 1 },
      d: { prioridades: 2, rotina: 1 },
    },
  },
  {
    id: 3,
    question: 'Com que frequência você é interrompido durante o trabalho?',
    options: [
      { key: 'a', text: 'Quase nunca — protejo meus blocos de foco' },
      { key: 'b', text: 'Algumas vezes — consigo retomar' },
      { key: 'c', text: 'Frequentemente — perco o ritmo' },
      { key: 'd', text: 'O tempo todo — mal consigo começar' },
    ],
    weights: {
      a: { foco: 0 },
      b: { foco: 1 },
      c: { foco: 3 },
      d: { foco: 3, prioridades: 1 },
    },
  },
  {
    id: 4,
    question: 'Como estão seus documentos digitais?',
    options: [
      { key: 'a', text: 'Tudo nomeado, em pastas e fácil de achar' },
      { key: 'b', text: 'Razoavelmente organizado' },
      { key: 'c', text: 'Tenho arquivos espalhados em vários lugares' },
      { key: 'd', text: 'Não sei onde estão meus documentos importantes' },
    ],
    weights: {
      a: { documentos: 0 },
      b: { documentos: 1 },
      c: { documentos: 3 },
      d: { documentos: 3, rotina: 1 },
    },
  },
  {
    id: 5,
    question: 'Você revisa sua semana?',
    options: [
      { key: 'a', text: 'Sim, toda semana tiro 30 minutos para revisar' },
      { key: 'b', text: 'De vez em quando' },
      { key: 'c', text: 'Raramente' },
      { key: 'd', text: 'Nunca — mal dou conta do dia' },
    ],
    weights: {
      a: { rotina: 0 },
      b: { rotina: 2 },
      c: { rotina: 3 },
      d: { rotina: 3, prioridades: 1 },
    },
  },
]

const DIAGNOSIS: Record<
  Theme,
  { title: string; explanation: string; action: string; icon: typeof Target }
> = {
  rotina: {
    title: 'Rotina',
    explanation:
      'Seu dia não tem um ponto de partida claro, o que faz você reagir ao que aparece em vez de executar o que planejou. Sem uma rotina mínima de início e revisão, as tarefas se acumulam e a sensação de desorganização se torna constante.',
    action:
      'Defina um ritual de 10 minutos toda manhã: liste 3 prioridades do dia antes de abrir qualquer mensagem.',
    icon: CalendarDays,
  },
  prioridades: {
    title: 'Prioridades',
    explanation:
      'Você tenta manter tudo na cabeça ou em notas soltas, e acaba confundindo o urgente com o importante. Quando não há um sistema confiável para capturar e priorizar, tarefas relevantes caem no esquecimento e o dia escorre sem progresso real.',
    action:
      'Crie uma lista única de pendências e, a cada dia, escolha apenas 3 itens para avançar antes de qualquer outra coisa.',
    icon: Target,
  },
  foco: {
    title: 'Foco',
    explanation:
      'As interrupções constantes impedem você de terminar o que começa, e cada retomada custa tempo e energia. Sem blocos protegidos de atenção, até tarefas simples se arrastam por horas.',
    action:
      'Reserve um bloco de 60 minutos por dia com notificações desligadas para sua tarefa mais importante.',
    icon: Target,
  },
  documentos: {
    title: 'Documentos',
    explanation:
      'Seus arquivos estão espalhados em vários lugares, o que faz você perder tempo procurando informações essenciais. Essa desorganização digital gera atrasos, retrabalho e insegurança na hora de encontrar algo importante.',
    action:
      'Crie uma pasta raiz chamada "_Essenciais" e mova para lá, ainda esta semana, todos os documentos que você precisaria acessar com urgência.',
    icon: FileText,
  },
}

export default function Diagnostico() {
  usePageTitle('Diagnóstico | Organização Inteligente')
  const { toast } = useToast()

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, OptionKey>>({})
  const [finished, setFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [consent, setConsent] = useState(false)

  const total = QUESTIONS.length
  const question = QUESTIONS[current]
  const selected = answers[question.id]

  const diagnosis = useMemo<Theme>(() => {
    const scores: Record<Theme, number> = {
      rotina: 0,
      prioridades: 0,
      foco: 0,
      documentos: 0,
    }
    for (const q of QUESTIONS) {
      const ans = answers[q.id]
      if (!ans) continue
      const w = q.weights[ans]
      for (const key of Object.keys(w) as Theme[]) {
        scores[key] += w[key] || 0
      }
    }
    let best: Theme = 'rotina'
    let bestScore = -1
    ;(Object.keys(scores) as Theme[]).forEach((k) => {
      if (scores[k] > bestScore) {
        bestScore = scores[k]
        best = k
      }
    })
    return best
  }, [answers])

  const result = DIAGNOSIS[diagnosis]

  const selectOption = (key: OptionKey) => {
    setAnswers((prev) => ({ ...prev, [question.id]: key }))
  }

  const goNext = () => {
    if (current + 1 < total) {
      setCurrent(current + 1)
    } else {
      setFinished(true)
    }
  }

  const goPrev = () => {
    if (current > 0) setCurrent(current - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = (formData.get('email') as string)?.trim() || ''
    const name = (formData.get('name') as string)?.trim() || ''

    if (!consent) {
      toast({
        title: 'Consentimento necessário',
        description: 'Marque a caixa para receber materiais e comunicações.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/backend/v1/diagnosis/subscribe', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, consent: 'granted' }),
      })
      const data = await res.json()
      if (data?.success && data?.consentReceived) {
        setSubscribed(true)
        toast({
          title: 'Tudo pronto!',
          description: 'Seu checklist está a caminho do seu e-mail.',
          className: 'bg-green-600 text-white border-none',
        })
        form.reset()
        setConsent(false)
      } else {
        throw new Error(data?.message || 'Erro ao processar')
      }
    } catch (err: any) {
      toast({
        title: 'Erro na inscrição',
        description:
          err?.response?.message ||
          err?.message ||
          'Serviço indisponível no momento. Tente novamente em instantes.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const progress = Math.round(((current + (finished ? 1 : 0)) / total) * 100)

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:px-6 animate-fade-in">
      <div className="text-center space-y-4 mb-10">
        <span className="inline-block bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-medium">
          Diagnóstico gratuito · 2 minutos
        </span>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary leading-tight">
          Descubra qual ponto está travando sua organização
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Responda 5 perguntas rápidas e identifique o gargalo que mais impacta sua rotina hoje.
        </p>
      </div>

      {/* Progress */}
      {!finished && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Pergunta {current + 1} de {total}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!finished ? (
        <Card className="shadow-medium border-border">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl leading-snug">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((opt) => {
              const isSelected = selected === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => selectOption(opt.key)}
                  className={cn(
                    'w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-3',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-background hover:border-primary/40 hover:bg-secondary/40',
                  )}
                >
                  <span
                    className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/40 text-muted-foreground',
                    )}
                  >
                    {opt.key.toUpperCase()}
                  </span>
                  <span className="text-[15px] md:text-base">{opt.text}</span>
                </button>
              )
            })}

            <div className="flex justify-between items-center pt-4">
              <Button variant="ghost" onClick={goPrev} disabled={current === 0} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <Button onClick={goNext} disabled={!selected} className="gap-2">
                {current + 1 === total ? 'Ver resultado' : 'Avançar'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Result */}
          <Card className="shadow-medium border-border overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-primary-light text-white p-8 md:p-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <ListChecks className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium opacity-90">Seu diagnóstico</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
                Seu ponto de travamento é: {result.title}
              </h2>
              <p className="text-primary-foreground/90 text-base md:text-lg leading-relaxed max-w-2xl">
                {result.explanation}
              </p>
            </div>
            <CardContent className="p-8 space-y-4">
              <div className="flex items-start gap-3 bg-secondary/60 rounded-xl p-5">
                <result.icon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Ação prática recomendada</p>
                  <p className="text-muted-foreground leading-relaxed">{result.action}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kit presentation */}
          <Card className="border-border shadow-sm bg-secondary/40">
            <CardContent className="p-8 space-y-5">
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-foreground text-lg">
                    Kit Organização Inteligente
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Sete PDFs práticos para organizar rotina, prioridades, hábitos e documentos sem
                    começar do zero.
                  </p>
                </div>
              </div>
              <Button asChild className="w-full gap-2">
                <a
                  href="https://pay.kiwify.com.br/qpFPGxF"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quero conhecer o Kit <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Post-result form */}
          <Card className="border-border shadow-sm" id="formulario">
            <CardHeader>
              <CardTitle className="text-2xl">Receba o próximo passo no seu e-mail</CardTitle>
            </CardHeader>
            <CardContent>
              {subscribed ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center">
                    <ListChecks className="h-7 w-7" />
                  </div>
                  <p className="text-lg font-semibold">Pronto!</p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Seu checklist está a caminho. Confira sua caixa de entrada nos próximos minutos.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome (opcional)</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Como podemos te chamar?"
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="seu@email.com"
                      disabled={submitting}
                    />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={consent}
                      onCheckedChange={(v) => setConsent(v === true)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      Aceito receber o Checklist e comunicações da Organização Inteligente. Posso
                      sair da lista quando quiser.
                    </span>
                  </label>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitting || !consent}
                  >
                    {submitting ? 'Enviando...' : 'Quero o checklist'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
