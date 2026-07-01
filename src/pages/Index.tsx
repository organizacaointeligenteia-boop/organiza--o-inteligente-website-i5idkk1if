import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { usePageTitle } from '@/hooks/use-page-title'
import { useToast } from '@/hooks/use-toast'
import { getArticles, type Article } from '@/services/articles'
import { getDownloads, type Download, trackDownload } from '@/services/downloads'
import pb from '@/lib/pocketbase/client'
import {
  ArrowRight,
  Download as DownloadIcon,
  InboxIcon,
  Eye,
  Target,
  Zap,
  CheckCircle2,
  ClipboardList,
  CalendarDays,
  FileText,
  Wallet,
  RefreshCw,
} from 'lucide-react'

export default function Index() {
  usePageTitle('Organização Inteligente | Rotina, foco e execução para profissionais ocupados')
  const { toast } = useToast()

  const [articles, setArticles] = useState<Article[]>([])
  const [tools, setTools] = useState<Download[]>([])
  const [loading, setLoading] = useState(true)
  const newsletterEmailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      getArticles(4, 0).then(setArticles),
      getDownloads().then((data) => setTools(data.slice(0, 4))),
    ])
      .finally(() => setLoading(false))
      .catch(console.error)
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    try {
      const res = await pb.send('/backend/v1/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: formData.get('email'), name: formData.get('name') }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.success) {
        toast({
          title: 'Tudo pronto!',
          description: 'Inscrição realizada com sucesso',
          className: 'bg-green-600 text-white border-none',
        })
        ;(e.target as HTMLFormElement).reset()
      }
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.response?.message || 'Erro ao processar',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = async (tool: Download) => {
    try {
      await trackDownload(tool.id)
      toast({ title: 'Download iniciado', description: 'O arquivo está sendo baixado.' })
      const url = pb.files.getURL(
        { collectionId: 'free_downloads', id: tool.id } as any,
        tool.fileUrl,
      )
      window.open(url, '_blank')
    } catch (err) {
      toast({ title: 'Erro ao baixar', variant: 'destructive' })
    }
  }

  const scrollToNewsletter = () => {
    document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => newsletterEmailRef.current?.focus(), 600)
  }

  const valueCards = [
    {
      icon: Eye,
      title: 'Clareza',
      description:
        'Tire as tarefas da cabeça e coloque em um sistema confiável que você consegue revisar em minutos.',
    },
    {
      icon: Target,
      title: 'Prioridade',
      description:
        'Separe o que realmente importa do urgente e concentre sua energia nas poucas tarefas que movem a agulha.',
    },
    {
      icon: Zap,
      title: 'Execução',
      description:
        'Use blocos de foco e checklists para transformar intenções em ações concretas, dia após dia.',
    },
  ]

  const kitItems = [
    { icon: CalendarDays, label: 'Planner semanal' },
    { icon: ClipboardList, label: 'Checklist de documentos' },
    { icon: Wallet, label: 'Mapa financeiro' },
    { icon: RefreshCw, label: 'Revisão de domingo' },
  ]

  return (
    <div className="flex flex-col gap-20 pb-12">
      <section className="relative text-center py-24 md:py-32 px-6 md:px-12 animate-fade-in bg-gradient-to-br from-primary to-primary-light text-white rounded-[24px] overflow-hidden shadow-medium mx-auto w-full">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center justify-center max-w-[800px] mx-auto space-y-8">
          <span className="inline-block bg-white/15 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-medium animate-fade-in-up stagger-1">
            Para profissionais ocupados que precisam sair do caos
          </span>
          <h1 className="text-[40px] md:text-[64px] font-bold tracking-tight text-white leading-[1.1] animate-fade-in-up stagger-2">
            Organize sua rotina e execute o que importa
          </h1>
          <p className="text-[18px] md:text-[22px] text-primary-foreground/90 max-w-[650px] leading-relaxed animate-fade-in-up stagger-3">
            Guias, checklists e ferramentas para transformar tarefas soltas em um sistema simples de
            planejamento, foco e acompanhamento semanal.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto animate-fade-in-up stagger-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto"
            >
              <Link to="/blog">Ver guias práticos</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-white/30 hover:bg-white/10 w-full sm:w-auto font-medium"
              onClick={scrollToNewsletter}
            >
              Receber checklist gratuito
            </Button>
          </div>
        </div>
      </section>

      <section className="animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {valueCards.map((card) => (
            <Card
              key={card.title}
              className="bg-card border-border p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{card.title}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                {card.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-10 animate-fade-in-up stagger-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Artigos em Destaque</h2>
          <Button
            variant="ghost"
            asChild
            className="hidden sm:inline-flex text-primary hover:bg-primary/10"
          >
            <Link to="/blog">
              Explorar todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-secondary/50 rounded-[24px] border border-dashed">
            <InboxIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">Nenhum artigo ainda</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Em breve teremos novos conteúdos disponíveis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="group flex flex-col overflow-hidden bg-card border-border transition-all duration-300 hover:-translate-y-2 hover:shadow-medium"
              >
                <div className="h-48 overflow-hidden bg-secondary relative">
                  {article.featuredImage ? (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center" />
                  )}
                  <div className="absolute top-4 left-4 bg-primary/10 backdrop-blur-md text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {article.category}
                  </div>
                </div>
                <CardHeader className="flex-1 px-5 pt-5 pb-2">
                  <CardTitle className="text-xl leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-3 text-[15px]">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="px-5 pb-5 pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-0 h-auto font-semibold text-primary hover:text-primary hover:bg-transparent"
                    asChild
                  >
                    <Link to={`/blog/${article.slug}`}>
                      Ler completo <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        <div className="sm:hidden flex justify-center">
          <Button variant="outline" asChild className="w-full text-primary border-primary">
            <Link to="/blog">Explorar todos os artigos</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-10 bg-secondary -mx-4 md:-mx-8 px-4 md:px-8 py-20 rounded-[32px]">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Ferramentas Gratuitas</h2>
          <p className="text-muted-foreground text-lg">
            Baixe checklists, planners e modelos para aplicar o método imediatamente.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-2xl" />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12">
            <InboxIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhuma ferramenta disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <Card
                key={tool.id}
                className="flex flex-col bg-background border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
              >
                <CardHeader className="flex-1 p-6">
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription className="mt-3 text-[15px]">{tool.description}</CardDescription>
                </CardHeader>
                <CardFooter className="p-6 pt-0">
                  <Button
                    variant="default"
                    className="w-full gap-2 font-semibold"
                    onClick={() => handleDownload(tool)}
                  >
                    <DownloadIcon className="h-[18px] w-[18px]" /> Baixar Arquivo
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        <div className="text-center pt-8">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Link to="/ferramentas-gratuitas">Acessar biblioteca completa</Link>
          </Button>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary to-primary-light text-white rounded-[32px] p-8 md:p-16 space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Kit Organização Inteligente
          </h2>
          <p className="text-lg text-primary-foreground/90 leading-relaxed">
            O primeiro produto pago pode reunir checklist da vida organizada, planner semanal,
            controle de documentos, mapa financeiro básico e rotina de revisão de domingo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {kitItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                <CheckCircle2 className="h-5 w-5 ml-auto flex-shrink-0 text-white/80" />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
              onClick={scrollToNewsletter}
            >
              Entrar na lista de espera
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-white/30 hover:bg-white/10 font-medium"
            >
              <Link to="/recomendados">Ver ferramentas recomendadas</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="newsletter" className="py-10 flex justify-center">
        <div className="bg-card rounded-[32px] p-8 md:p-16 max-w-[900px] text-center space-y-6 w-full shadow-elevation border border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Receba o Checklist da Vida Organizada
          </h2>
          <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
            Entre na lista para receber materiais práticos sobre rotina, foco, documentos, finanças
            pessoais e planejamento semanal.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-[550px] mx-auto pt-6"
          >
            <Input
              name="name"
              type="text"
              placeholder="Seu nome (opcional)"
              className="bg-background flex-1 shadow-sm"
            />
            <Input
              name="email"
              type="email"
              placeholder="E-mail principal"
              required
              className="bg-background flex-1 shadow-sm"
              ref={newsletterEmailRef}
            />
            <Button
              type="submit"
              size="lg"
              className="whitespace-nowrap w-full sm:w-auto shadow-sm"
            >
              Quero receber
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
