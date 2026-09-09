import { usePageTitle } from '@/hooks/use-page-title'
import { usePageMeta } from '@/hooks/use-page-meta'
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
  ListChecks,
  Target,
  CalendarDays,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
  FileText,
  Video,
  Presentation,
  Check,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getKiwifyCheckoutUrl } from '@/lib/utm'

const targetAudience = [
  'Para quem sente que a semana começa bagunçada.',
  'Para quem esquece pequenas pendências.',
  'Para quem tem dificuldade de priorizar.',
  'Para quem quer acompanhar hábitos sem complicação.',
  'Para quem precisa organizar documentos e prazos.',
  'Para quem quer um método simples para revisar a vida toda semana.',
]

const mainDeliverables = [
  {
    icon: FileText,
    title: 'Workbook Premium em PDF',
    badge: '26 páginas',
    description:
      'Material principal completo com método passo a passo e todos os 7 modelos práticos integrados, pronto para imprimir ou usar aplicativo de anotação compatível.',
  },
  {
    icon: Presentation,
    title: 'Apresentação Visual',
    badge: 'Slides explicativos',
    description:
      'Guia visual com os conceitos, fluxos e visão geral do método de organização para consulta rápida sempre que precisar.',
  },
  {
    icon: Video,
    title: 'Vídeo Introdutório',
    badge: 'Boas-vindas e orientações',
    description:
      'Orientações diretas ao ponto sobre como navegar pelos materiais e começar a aplicar o sistema na sua rotina com clareza.',
  },
]

const workbookModels = [
  {
    icon: CalendarDays,
    name: 'Planner semanal',
    desc: 'Planejamento visual da semana com blocos de foco',
  },
  {
    icon: ListChecks,
    name: 'Checklist da vida organizada',
    desc: 'Inventário completo de pendências e rotinas',
  },
  {
    icon: RefreshCw,
    name: 'Controle de hábitos',
    desc: 'Acompanhamento de consistência diária e mensal',
  },
  {
    icon: FileText,
    name: 'Controle de documentos e prazos',
    desc: 'Centralização de vencimentos e arquivos importantes',
  },
  {
    icon: Target,
    name: 'Mapa de prioridades',
    desc: 'Matriz prática para focar no que realmente gera resultado',
  },
  {
    icon: Clock,
    name: 'Revisão semanal',
    desc: 'Roteiro de 30 minutos para zerar a mente e planejar o próximo ciclo',
  },
  {
    icon: CalendarDays,
    name: 'Plano de implantação em 14 dias',
    desc: 'Passo a passo guiado para instalar o sistema sem sobrecarga',
  },
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
  'Conclua seu pedido na página segura de pagamento da Kiwify.',
  'Aguarde a confirmação do pagamento e confira seu e-mail com os dados de acesso.',
  'Acesse a área de membros da Kiwify.',
  'Assista ao vídeo introdutório e consulte a apresentação visual.',
  'Abra o workbook premium em PDF (26 páginas com os 7 modelos integrados).',
  'Siga o plano de implantação em 14 dias: você pode imprimir ou usar aplicativo de anotação compatível.',
]

const faqItems = [
  {
    question: 'Como funciona o formato do material? Preciso imprimir?',
    answer:
      'O workbook vem em formato PDF com 26 páginas. Você pode imprimir as páginas que desejar ou usar aplicativo de anotação compatível no tablet, celular ou computador (o material não possui campos preenchíveis automáticos).',
  },
  {
    question: 'Serve para trabalho e vida pessoal?',
    answer:
      'Sim. O Kit Organização Inteligente foi desenhado para apoiar a organização tanto da rotina profissional quanto da pessoal, auxiliando no registro de tarefas, prazos, hábitos e prioridades.',
  },
  {
    question: 'É um curso em vídeo longo?',
    answer:
      'Não. É um kit prático composto por 3 materiais complementares: o workbook em PDF (26 páginas), uma apresentação visual e um vídeo introdutório com instruções essenciais para guiar a aplicação do plano em 14 dias.',
  },
  {
    question: 'Como e quando recebo o acesso ao Kit?',
    answer:
      'O acesso é liberado pela área de membros da Kiwify após a confirmação do pagamento. Você receberá um e-mail com as instruções de entrada — basta conferir a caixa de entrada (e pasta de spam) do endereço informado na compra.',
  },
  {
    question: 'O Kit garante resultados na minha organização?',
    answer:
      'O material fornece uma estrutura prática, modelos e um plano de 14 dias para guiar sua rotina. A implementação e o aproveitamento dependem da sua dedicação e constância pessoal — não há promessa de resultado garantido.',
  },
]

export default function KitPage() {
  usePageTitle('Kit — Sistema completo de organização')
  usePageMeta({
    path: '/kit-organizacao-inteligente',
    description:
      'Organize sua semana, seus documentos, seus hábitos e suas prioridades com um sistema prático de 3 materiais, pronto para imprimir ou usar aplicativo de anotação compatível.',
  })

  return (
    <div className="flex flex-col gap-12 md:gap-20 pb-16 animate-fade-in">
      <section className="relative text-center py-20 md:py-28 px-6 md:px-12 bg-gradient-to-br from-primary to-primary-light text-white rounded-[24px] overflow-hidden shadow-medium mx-auto w-full">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center max-w-[800px] mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up">
            <Sparkles className="h-4 w-4" /> Kit prático de organização
          </span>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-tight text-white leading-[1.1] animate-fade-in-up">
            Kit Organização Inteligente
          </h1>
          <p className="text-[18px] md:text-[22px] text-primary-foreground/90 max-w-[650px] leading-relaxed animate-fade-in-up">
            Organize sua semana, seus documentos, seus hábitos e suas prioridades. 3 materiais
            complementares, prontos para imprimir ou usar aplicativo de anotação compatível.
          </p>
          <div className="pt-4 flex flex-col items-center gap-3 animate-fade-in-up">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              R$ 29,90 à vista
            </span>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 py-6 shadow-medium"
            >
              <a
                href={getKiwifyCheckoutUrl('pagina_kit')}
                target="_blank"
                rel="noopener noreferrer"
              >
                Comprar o Kit
              </a>
            </Button>
          </div>
          <p className="text-sm text-white/80 animate-fade-in-up pt-1">
            R$ 29,90 à vista • Pagamento seguro pela Kiwify • Pix, cartão ou boleto • Garantia de 7
            dias
          </p>
          <p className="text-xs text-white/70">
            Acesso pela área de membros da Kiwify após confirmação do pagamento (conferir e-mail).
          </p>
        </div>
      </section>

      {/* Seção curta: Materiais Gratuitos Avulsos vs. Sequência Integrada do Kit */}
      <section className="max-w-[900px] mx-auto animate-fade-in-up">
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="text-center space-y-2">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Entenda a diferença
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Materiais gratuitos avulsos vs. O Kit integrado
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              Nosso site oferece materiais gratuitos úteis, mas cada um resolve apenas uma parte
              isolada.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-secondary/40 border border-border/70 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/60" />
                Materiais Gratuitos Avulsos
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <strong>Foco pontual:</strong> cada checklist ou planilha atende uma necessidade
                    específica de forma isolada.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <strong>Sem conexão:</strong> você precisa definir sozinho como encaixar cada
                    arquivo na sua rotina.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>Ideal para resolver um detalhe rápido do dia a dia.</span>
                </li>
              </ul>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Kit Organização Inteligente
              </h3>
              <ul className="text-sm text-foreground/90 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Sequência integrada:</strong> os 7 modelos práticos reunidos dentro de
                    um único workbook de 26 páginas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Plano guiado em 14 dias:</strong> método passo a passo com apresentação
                    visual e vídeo introdutório.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Acesso direto pela área de membros da Kiwify por R$ 29,90 à vista.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-10 animate-fade-in-up">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Veja o que você recebe</h2>
          <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
            A entrega real do produto: um kit prático composto por 3 materiais complementares,
            acessados diretamente na área de membros.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1050px] mx-auto">
          {mainDeliverables.map((item) => (
            <div
              key={item.title}
              className="flex flex-col bg-card border border-border rounded-2xl p-6 transition-all duration-200 hover:shadow-medium hover:border-primary/40 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold leading-snug mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary px-6 md:px-10 py-16 md:py-20 rounded-[32px] space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Como você recebe o acesso
          </h2>
          <p className="text-muted-foreground text-lg max-w-[650px] mx-auto">
            O comprador acessa os três materiais pela área de membros da Kiwify depois da
            confirmação do pagamento.
          </p>
        </div>
        <div className="max-w-[700px] mx-auto space-y-4">
          {[
            'Você finaliza o pedido com segurança pela Kiwify no valor de R$ 29,90 à vista (Pix, cartão ou boleto).',
            'Após a confirmação do pagamento, as instruções e dados de login são enviados para o seu e-mail cadastrado (lembre-se de conferir sua caixa de entrada e spam).',
            'Acesse os três materiais (workbook em PDF de 26 páginas, apresentação visual e vídeo introdutório) diretamente na área de membros da Kiwify.',
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-5 bg-card border border-border rounded-xl px-6 py-4 shadow-subtle"
            >
              <span className="flex-shrink-0 w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </span>
              <span className="text-[16px] font-medium leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground max-w-[550px] mx-auto">
          Acesso liberado pela área de membros da Kiwify após confirmação do pagamento. Você pode
          imprimir ou usar aplicativo de anotação compatível.
        </p>
      </section>

      <section className="max-w-[800px] mx-auto text-center space-y-4 animate-fade-in-up">
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Pare de tentar guardar tudo na cabeça. O Kit Organização Inteligente reúne tudo o que você
          precisa em um workbook completo, acompanhado de apresentação visual e vídeo introdutório
          para você transformar pendências em um plano claro de ação.
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

      <section className="bg-secondary px-6 md:px-10 py-16 md:py-20 rounded-[32px] space-y-10">
        <div className="text-center space-y-4">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            Conteúdo do Workbook (26 páginas)
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Os 7 modelos reunidos dentro do workbook
          </h2>
          <p className="text-muted-foreground text-lg max-w-[650px] mx-auto">
            Todos os sete modelos práticos estão organizados e integrados dentro do workbook em PDF
            de 26 páginas, acompanhados do plano de implantação em 14 dias:
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
          {workbookModels.map((item) => (
            <Card
              key={item.name}
              className="bg-background border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
            >
              <CardHeader className="p-5 space-y-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold leading-snug">
                    {item.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="max-w-[700px] mx-auto bg-card border border-border rounded-xl p-5 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            Reunidos em um único PDF premium de 26 páginas
          </p>
          Você encontra: planner semanal, checklist da vida organizada, controle de hábitos,
          controle de documentos e prazos, mapa de prioridades, revisão semanal e plano de
          implantação em 14 dias. Pronto para imprimir ou usar aplicativo de anotação compatível.
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
            Investimento único
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl md:text-6xl font-bold tracking-tight text-primary">
              R$ 29,90 à vista
            </span>
          </div>
          <p className="text-muted-foreground text-lg">
            Acesso aos 3 materiais do Kit pela área de membros da Kiwify após confirmação do
            pagamento.
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto text-base font-semibold px-8 py-6">
          <a href={getKiwifyCheckoutUrl('pagina_kit')} target="_blank" rel="noopener noreferrer">
            Comprar o Kit
          </a>
        </Button>
        <p className="text-sm text-muted-foreground">
          R$ 29,90 à vista via Pix, cartão ou boleto. Acesso pela área de membros da Kiwify após
          confirmação (conferir e-mail).
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

      <section className="bg-secondary px-6 md:px-10 py-14 md:py-16 rounded-[32px] text-center space-y-6">
        <Download className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Pronto para organizar sua vida?
        </h2>
        <p className="text-muted-foreground text-lg max-w-[500px] mx-auto">
          Adquira o Kit Organização Inteligente com os 3 materiais práticos para estruturar sua
          rotina.
        </p>
        <p className="text-xl font-bold text-primary">R$ 29,90 à vista</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button asChild size="lg" className="font-semibold px-8">
            <a href={getKiwifyCheckoutUrl('pagina_kit')} target="_blank" rel="noopener noreferrer">
              Comprar o Kit
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-primary text-primary">
            <Link to="/ferramentas-gratuitas">
              Ver ferramentas gratuitas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground pt-2">
          R$ 29,90 à vista • Pagamento seguro pela Kiwify • Garantia de 7 dias • Acesso pela área de
          membros após confirmação do pagamento (conferir e-mail).
        </p>
      </section>
    </div>
  )
}
