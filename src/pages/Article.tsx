import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/use-page-title'
import { getArticleBySlug, getArticles, type Article } from '@/services/articles'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react'
import NotFound from './NotFound'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null | undefined>(undefined)
  const [related, setRelated] = useState<Article[]>([])
  const { toast } = useToast()

  usePageTitle(article?.title || 'Artigo não encontrado')

  useEffect(() => {
    if (slug) {
      getArticleBySlug(slug)
        .then(setArticle)
        .catch(() => setArticle(null))
    }
  }, [slug])

  useEffect(() => {
    if (article) {
      getArticles()
        .then((data) => setRelated(data.filter((a) => a.id !== article.id).slice(0, 3)))
        .catch(console.error)
    }
  }, [article])

  if (article === undefined) return <div className="py-20 text-center">Carregando...</div>
  if (article === null) return <NotFound />

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
            {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          {article.title}
        </h1>
      </header>

      {article.featuredImage && (
        <div className="aspect-[21/9] overflow-hidden rounded-xl bg-muted">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none">
        {article.excerpt && <p className="lead text-xl text-muted-foreground">{article.excerpt}</p>}
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
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

      {related.length > 0 && (
        <section className="pt-8 space-y-6">
          <h3 className="text-2xl font-bold">Artigos Relacionados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((rel) => (
              <Card key={rel.id} className="flex flex-col hover:shadow-md transition-shadow">
                <div className="h-32 overflow-hidden bg-muted rounded-t-lg">
                  {rel.featuredImage && (
                    <img
                      src={rel.featuredImage}
                      alt={rel.title}
                      className="w-full h-full object-cover"
                    />
                  )}
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
      )}
    </article>
  )
}
