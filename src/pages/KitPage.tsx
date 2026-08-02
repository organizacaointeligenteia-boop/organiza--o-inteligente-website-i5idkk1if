import { usePageTitle } from '@/hooks/use-page-title'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  CheckCircle2,
  Download,
  Printer,
  ListChecks,
  Target,
  CalendarDays,
  RefreshCw,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
  FileText,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const KIWIFY_CHECKOUT_URL = 'https://pay.kiwify.com.br/qpFPGxF'

const targetAudience = [
  'Para quem sente que a semana começa bagunçada.',
  'Para quem esquece pequenas pendências.',
  'Para quem tem dificuldade de priorizar.',
  'Para quem quer acompanhar hábitos sem complicação.',
  'Para quem precisa organizar documentos e prazos.',
  'Para quem quer um método simples para revisar a vida toda semana.',
]

const kitContents = [
  { icon: CalendarDays, label: 'Planner Semanal Premium' },
  { icon: ListChecks, label: 'Checklist da Vida Organizada Expandido' },
  { icon: RefreshCw, label: 'Controle de Hábitos Mensal' },
  { icon: FileText, label: 'Controle de Documentos e Prazos' },
  { icon: Target, label: 'Mapa de Prioridades' },
  { icon: Clock, label: 'Rotina de Revisão Semanal' },
  { icon: BookOpen, label: 'Guia Rápido de Uso em 7 dias' },
]

const benefits = [
  'Clareza sobre o que realmente importa.',
  'Menos tarefas soltas na cabeça.',
  'Melhor controle de documentos e prazos.',
  'Rotina semanal mais leve.',
  'Acompanhamento simples de hábitos.',
  'Sistema prático para repetir toda semana.',
]

const steps = [
  'Baixe o kit.',
  'Imprima ou use no computador/tablet.',
  'Comece pelo checklist expandido.',
  'Monte suas prioridades.',
  'Organize a semana.',
  'Revise em 30 minutos toda semana.',
]

const faqItems = [
  {
    question: 'Preciso imprimir?',
    answer:
      'Não. O kit funciona tanto impresso quanto em formato digital. Você pode usar no computador, tablet ou celular — escolha o que funciona melhor para você.',
  },
  {
    question: 'Serve para trabalho e vida pessoal?',
    answer:
      'Sim. O Kit Organização Inteligente foi desenhado para cobrir tanto a rotina profissional quanto a pessoal, ajudando a organizar tarefas, documentos, hábitos e prioridades em um só lugar.',
  },
  {
    question: 'É um curso?',
    answer:
      'Não é um curso. É um conjunto de modelos, checklists e planners prontos para usar, acompanhados de um guia rápido de 7 dias para você começar imediatamente.',
  },
  {
    question: 'Recebo na hora?',
    answer:
      'Sim. Após a confirmação da compra, você recebe o link de download com todos os arquivos do kit imediatamente.',
  },
]

export default function KitPage() {
  usePageTitle('Kit Organização Inteligente | Sistema completo de organização')

  return (
    <div className="flex flex-col gap-20 pb-16 animate-fade-in">
      <section className="relative text-center py-20 md:py-28 px-6 md:px-12 bg-gradient-to-br from-primary to-primary-light text-white rounded-[24px] overflow-hidden shadow-medium mx-auto w-full">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center max-w-[800px] mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up">
            <Sparkles className="h-4 w-4" /> Sistema completo de organização
          </span>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-tight text-white leading-[1.1] animate-fade-in-up">
            Kit Organização Inteligente
          </h1>
          <p className="text-[18px] md:text-[22px] text-primary-foreground/90 max-w-[650px] leading-relaxed animate-fade-in-up">
            Organize sua semana, seus documentos, seus hábitos e suas prioridades com um sistema
            simples, pronto para imprimir ou usar digitalmente.
          </p>
          <div className="pt-4 animate-fade-in-up">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8"
            >
              <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
                Quero organizar minha rotina agora
              </a>
            </Button>
          </div>
          <p className="text-sm text-white/80 animate-fade-in-up pt-2">
            Pagamento seguro pela Kiwify • Pix, cartão ou boleto • Garantia de 7 dias
          </p>
        </div>
      </section>

      <section className="space-y-10 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Veja o que você recebe</h2>
          <p className="text-muted-foreground text-lg mt-3 max-w-[600px] mx-auto">
            Sete materiais práticos em formato digital, prontos para usar imediatamente.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
          {kitContents.map((item) => (
            <div
              key={item.label}
              className="flex flex-col bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-small"
            >
              <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 mb-4">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold leading-snug mb-2">{item.label}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                arquivo digital em PDF
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary -mx-4 md:-mx-8 px-4 md:px-8 py-20 rounded-[32px] space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Como você recebe</h2>
          <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
            Veja o passo a passo do que acontece depois da sua compra.
          </p>
        </div>
        <div className="max-w-[700px] mx-auto space-y-4">
          {[
            'Você finaliza a compra com segurança pela Kiwify (Pix, cartão ou boleto).',
            'Após a confirmação do pagamento, você recebe as instruções de acesso por e-mail.',
            'Faça o download dos 7 materiais em PDF e comece a usar imediatamente.',
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-5 bg-card border border-border rounded-xl px-6 py-4"
            >
              <span className="flex-shrink-0 w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </span>
              <span className="text-[16px] font-medium leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground max-w-[500px] mx-auto">
          O acesso é enviado após a confirmação do pagamento. Pagamentos via Pix costumam ser
          confirmados em minutos; boleto pode levar até 2 dias úteis.
        </p>
      </section>

      <section className="max-w-[800px] mx-auto text-center space-y-4 animate-fade-in-up">
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Pare de tentar guardar tudo na cabeça. O Kit Organização Inteligente reúne os principais
          modelos que você precisa para transformar pendências soltas em um plano claro de ação.
        </p>
      </section>

      <section className="space-y-8 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Para quem é</h2>
          <p className="text-muted-foreground text-lg mt-3">
            O kit foi feito para quem quer sair do caos e ter um sistema que funciona.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px] mx-auto">
          {targetAudience.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 bg-card border border-border rounded-xl px-5 py-4 transition-all duration-200 hover:shadow-small"
            >
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-[15px] leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary -mx-4 md:-mx-8 px-4 md:px-8 py-20 rounded-[32px] space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">O que vem no kit</h2>
          <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
            Sete modelos práticos que cobrem toda a sua rotina de organização.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
          {kitContents.map((item) => (
            <Card
              key={item.label}
              className="bg-background border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
            >
              <CardHeader className="flex flex-row items-center gap-4 p-6">
                <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold leading-snug">{item.label}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-8 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Benefícios</h2>
          <p className="text-muted-foreground text-lg mt-3">
            O que muda quando você tem um sistema que funciona.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px] mx-auto">
          {benefits.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 bg-card border border-border rounded-xl px-5 py-4"
            >
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-[15px] leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-10 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Como funciona</h2>
          <p className="text-muted-foreground text-lg mt-3">
            Seis passos simples para começar a usar o kit hoje.
          </p>
        </div>
        <div className="max-w-[700px] mx-auto space-y-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-5 bg-card border border-border rounded-xl px-6 py-4 transition-all duration-200 hover:shadow-small"
            >
              <span className="flex-shrink-0 w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </span>
              <span className="text-[16px] font-medium">{step}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary to-primary-light text-white rounded-[32px] p-8 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-[600px] mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-medium">
            <ShieldCheck className="h-4 w-4" /> Garantia de 7 dias
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Garantia</h2>
          <p className="text-lg text-primary-foreground/90 leading-relaxed">
            Garantia simples de 7 dias. Se você comprar e achar que o material não ajuda sua
            organização, pode pedir reembolso dentro do prazo.
          </p>
        </div>
      </section>

      <section className="max-w-[600px] mx-auto text-center space-y-8 animate-fade-in-up">
        <div className="space-y-3">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider">
            Oferta de lançamento
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl md:text-6xl font-bold tracking-tight text-primary">
              R$ 29,90
            </span>
          </div>
          <p className="text-muted-foreground text-lg">
            Acesso a todos os modelos do kit após confirmação do pagamento.
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto text-base font-semibold px-8 py-6">
          <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
            Quero organizar minha rotina agora
          </a>
        </Button>
        <p className="text-sm text-muted-foreground">
          Pagamento via Pix, cartão ou boleto. Acesso enviado por e-mail após confirmação.
        </p>
      </section>

      <section className="max-w-[800px] mx-auto space-y-8 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Perguntas frequentes</h2>
        </div>
        <Card className="border-border">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <section className="bg-secondary -mx-4 md:-mx-8 px-4 md:px-8 py-16 rounded-[32px] text-center space-y-6">
        <Download className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Pronto para organizar sua vida?
        </h2>
        <p className="text-muted-foreground text-lg max-w-[500px] mx-auto">
          Comece hoje mesmo com o Kit Organização Inteligente e transforme pendências em ação.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button asChild size="lg" className="font-semibold px-8">
            <a href={KIWIFY_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
              Quero organizar minha rotina agora
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-primary text-primary">
            <Link to="/ferramentas-gratuitas">
              Ver ferramentas gratuitas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground pt-2">
          Pagamento seguro pela Kiwify • Pix, cartão ou boleto • Garantia de 7 dias
        </p>
      </section>
    </div>
  )
}
