import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePageTitle } from '@/hooks/use-page-title'
import { useToast } from '@/hooks/use-toast'
import { getArticles, type Article } from '@/services/articles'
import { getDownloads, type Download, trackDownload } from '@/services/downloads'
import pb from '@/lib/pocketbase/client'
import { ArrowRight, Download as DownloadIcon } from 'lucide-react'

export default function Index() {
  usePageTitle('Organização Inteligente | Micro-guias de Produtividade')
  const { toast } = useToast()

  const [articles, setArticles] = useState<Article[]>([])
  const [tools, setTools] = useState<Download[]>([])

  useEffect(() => {
    getArticles(4, 0).then(setArticles).catch(console.error)
    getDownloads()
      .then((data) => setTools(data.slice(0, 4)))
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
        toast({ title: 'Tudo pronto!', description: 'Inscrição realizada com sucesso' })
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
  }

  return (
    <div className="flex flex-col gap-16 pb-8">
      <section className="text-center space-y-6 py-12 md:py-24 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
          Organize Sua Vida de Forma Inteligente
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[700px] mx-auto">
          Micro-guias práticos para pessoas sem tempo. Transforme sua rotina diária e alcance seus
          objetivos com menos estresse.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link to="/blog">Comece Agora</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base"
            onClick={scrollToNewsletter}
          >
            Baixar Ebook Gratuito
          </Button>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl md:text-3xl font-bold">Artigos em Destaque</h2>
          <Button variant="link" asChild className="hidden md:flex">
            <Link to="/blog">
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="flex flex-col overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-elevation"
            >
              <div className="h-48 overflow-hidden bg-muted">
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                )}
              </div>
              <CardHeader className="flex-1">
                <div className="text-xs text-primary font-medium mb-2">{article.category}</div>
                <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">{article.excerpt}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto font-medium text-primary hover:text-primary/80 hover:bg-transparent"
                  asChild
                >
                  <Link to={`/blog/${article.slug}`}>
                    Ler mais <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-8 bg-secondary -mx-4 md:-mx-8 px-4 md:px-8 py-16 rounded-3xl">
        <h2 className="text-2xl md:text-3xl font-bold">Ferramentas Gratuitas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="flex flex-col bg-background transition-all duration-200 hover:-translate-y-1 hover:shadow-elevation"
            >
              <CardHeader className="flex-1">
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription className="mt-2">{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() => handleDownload(tool)}
                >
                  <DownloadIcon className="h-4 w-4" /> Baixar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center pt-4">
          <Button asChild variant="outline">
            <Link to="/ferramentas-gratuitas">Ver todas as ferramentas</Link>
          </Button>
        </div>
      </section>

      <section id="newsletter" className="py-12 flex justify-center">
        <div className="bg-primary/5 rounded-3xl p-8 md:p-12 max-w-[800px] text-center space-y-6 w-full border border-primary/10">
          <h2 className="text-2xl md:text-3xl font-bold">Não perca nenhuma dica</h2>
          <p className="text-muted-foreground">
            Junte-se a milhares de pessoas que organizam a vida de forma mais inteligente.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-[500px] mx-auto"
          >
            <Input
              name="name"
              type="text"
              placeholder="Seu nome (opcional)"
              className="bg-background"
            />
            <Input
              name="email"
              type="email"
              placeholder="Seu email"
              required
              className="bg-background"
            />
            <Button type="submit" size="lg" className="whitespace-nowrap">
              Receber Dicas
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
