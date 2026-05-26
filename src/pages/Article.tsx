import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/use-page-title'
import { getArticleBySlug, getArticlesList, type Article } from '@/services/articles'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ListOrdered,
} from 'lucide-react'
import NotFound from './NotFound'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null | undefined>(undefined)
  const [related, setRelated] = useState<Article[]>([])
  const { toast } = useToast()

  usePageTitle(article?.title ? `${article.title} | Organização Inteligente` : 'Carregando...')

  useEffect(() => {
    if (slug) {
      getArticleBySlug(slug)
        .then(setArticle)
        .catch(() => setArticle(null))
    }
  }, [slug])

  useEffect(() => {
    if (article) {
      getArticlesList(1, 4, `category='${article.category}'`)
        .then((res) => setRelated(res.items.filter((a) => a.id !== article.id).slice(0, 3)))
        .catch(console.error)
    }
  }, [article])

  const contentWithIds = useMemo(() => {
    if (!article?.content) return ''
    return article.content.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/g, (match, level, attrs, text) => {
      const id = text
        .replace(/<[^>]+>/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
      return `<h${level}${attrs} id="${id}">${text}</h${level}>`
    })
  }, [article?.content])

  const toc = useMemo(() => {
    if (!article?.content) return []
    const regex = /<h([23])[^>]*>(.*?)<\/h\1>/g
    const matches = [...article.content.matchAll(regex)]
    return matches.map((m) => ({
      level: m[1],
      text: m[2].replace(/<[^>]+>/g, ''),
      id: m[2]
        .replace(/<[^>]+>/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
    }))
  }, [article?.content])

  const schemaOrg = useMemo(() => {
    if (!article) return null
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      image: [article.featuredImage],
      datePublished: article.publishedAt,
      dateModified: article.updated,
      author: [
        {
          '@type': 'Organization',
          name: 'Organização Inteligente',
        },
      ],
    })
  }, [article])

  if (article === undefined) return <div className="py-20 text-center">Carregando...</div>
  if (article === null) return <NotFound />

  const url = window.location.href

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link copiado!',
      description: 'O link foi copiado para a área de transferência.',
    })
  }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(article.title)}`,
  }

  return (
    <article className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {schemaOrg && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaOrg }} />
      )}

      <Button variant="ghost" asChild className="-ml-4 mb-4 text-muted-foreground">
        <Link to="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Blog
        </Link>
      </Button>

      <header className="space-y-4 max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-primary font-medium">
          <span>{article.category}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
          </span>
          {article.readingTime && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{article.readingTime} min de leitura</span>
            </>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          {article.title}
        </h1>
      </header>

      {article.featuredImage && (
        <div className="aspect-[21/9] overflow-hidden rounded-xl bg-muted max-w-4xl mx-auto">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-8">
        <div className="lg:col-span-3 prose prose-lg dark:prose-invert max-w-none">
          {article.excerpt && (
            <p className="lead text-xl text-muted-foreground font-medium">{article.excerpt}</p>
          )}
          <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-muted/30 p-6 rounded-xl">
            <h4 className="font-semibold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              <ListOrdered className="h-4 w-4" /> Índice
            </h4>
            <ul className="space-y-2 text-sm">
              {toc.map((item, i) => (
                <li key={i} className={item.level === '3' ? 'ml-4' : ''}>
                  <a
                    href={`#${item.id}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
              {toc.length === 0 && (
                <li className="text-muted-foreground">Nenhum índice disponível</li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      <div className="border-y py-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
        <span className="font-medium flex items-center gap-2">
          <Share2 className="h-4 w-4" /> Compartilhe:
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" asChild>
            <a href={shareLinks.twitter} target="_blank" rel="noreferrer">
              <Twitter className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={shareLinks.facebook} target="_blank" rel="noreferrer">
              <Facebook className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={shareLinks.linkedin} target="_blank" rel="noreferrer">
              <Linkedin className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" onClick={handleCopyLink} className="gap-2">
            <LinkIcon className="h-4 w-4" /> Copiar Link
          </Button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-8 space-y-6 max-w-4xl mx-auto">
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
