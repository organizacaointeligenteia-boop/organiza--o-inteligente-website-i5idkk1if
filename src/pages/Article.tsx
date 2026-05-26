import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/use-page-title'
import useArticlesStore from '@/stores/use-articles-store'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react'
import NotFound from './NotFound'

export default function Article() {
  const { slug } = useParams<{ slug: string }>()
  const { articles } = useArticlesStore()
  const { toast } = useToast()

  const article = articles.find((a) => a.slug === slug)
  usePageTitle(article?.title || 'Artigo não encontrado')

  if (!article) {
    return <NotFound />
  }

  const related = articles.filter((a) => a.id !== article.id).slice(0, 3)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: 'Link copiado!',
      description: 'O link foi copiado para a área de transferência.',
    })
  }

  return (
    <article className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
      <Button variant="ghost" asChild className="-ml-4 mb-4 text-muted-foreground">
        <Link to="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Blog
        </Link>
      </Button>

      <header className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-primary font-medium">
          <span>{article.category}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {new Date(article.date).toLocaleDateString('pt-BR')}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">5 min de leitura</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          {article.title}
        </h1>
      </header>

      <div className="aspect-[21/9] overflow-hidden rounded-xl bg-muted">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead text-xl text-muted-foreground">{article.excerpt}</p>
        <div
          dangerouslySetInnerHTML={{
            __html: `<p>${article.content.replace(/\n/g, '</p><p>')}</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed aliquet ullamcorper libero, nec ultrices odio tempor a. Phasellus venenatis nisi at leo dignissim, ut pulvinar massa tristique.</p><h2>Mais Dicas Práticas</h2><p>Curabitur euismod ullamcorper elit, vel commodo mi placerat et. Nunc a vestibulum lacus. In hac habitasse platea dictumst. Morbi condimentum nisi nec orci fringilla fermentum.</p>`,
          }}
        />
      </div>

      <div className="border-y py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-medium flex items-center gap-2">
          <Share2 className="h-4 w-4" /> Compartilhe:
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleCopyLink}>
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleCopyLink}>
            <Facebook className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleCopyLink}>
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleCopyLink} className="gap-2">
            <LinkIcon className="h-4 w-4" /> Copiar Link
          </Button>
        </div>
      </div>

      <section className="pt-8 space-y-6">
        <h3 className="text-2xl font-bold">Artigos Relacionados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {related.map((rel) => (
            <Card key={rel.id} className="flex flex-col hover:shadow-md transition-shadow">
              <div className="h-32 overflow-hidden bg-muted rounded-t-lg">
                <img src={rel.image} alt={rel.title} className="w-full h-full object-cover" />
              </div>
              <CardHeader className="p-4 flex-1">
                <CardTitle className="text-base line-clamp-2">
                  <Link to={`/blog/${rel.slug}`} className="hover:text-primary">
                    {rel.title}
                  </Link>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </article>
  )
}
