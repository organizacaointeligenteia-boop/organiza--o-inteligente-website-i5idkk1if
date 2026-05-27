import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
      return `<h${level}${attrs} id="${id}" class="scroll-mt-24">${text}</h${level}>`
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

  if (article === undefined)
    return (
      <div className="max-w-[800px] mx-auto py-12 space-y-8">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <div className="space-y-4 pt-8">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-4/6" />
        </div>
      </div>
    )

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
    <article className="max-w-[1000px] mx-auto animate-fade-in pb-20">
      <div className="mb-10">
        <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-primary">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Blog
          </Link>
        </Button>
      </div>

      <header className="space-y-6 max-w-[800px]">
        <div className="flex items-center gap-3 text-[15px] font-semibold text-primary">
          <span className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            {article.category}
          </span>
          <span className="text-muted-foreground font-normal">•</span>
          <span className="text-muted-foreground font-normal">
            {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
          </span>
          {article.readingTime && (
            <>
              <span className="text-muted-foreground font-normal">•</span>
              <span className="text-muted-foreground font-normal">{article.readingTime} min</span>
            </>
          )}
        </div>
        <h1 className="text-4xl md:text-[56px] font-bold tracking-tight leading-[1.1] text-foreground">
          {article.title}
        </h1>
      </header>

      {article.featuredImage && (
        <div className="aspect-[21/9] overflow-hidden rounded-[24px] bg-secondary my-12 shadow-small border border-border">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16 relative">
        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-[1.8] prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 transition-colors prose-img:rounded-2xl">
          {article.excerpt && (
            <p className="lead text-[22px] text-muted-foreground font-medium mb-10">
              {article.excerpt}
            </p>
          )}
          <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />
        </div>

        <aside className="hidden lg:block relative">
          <div className="sticky top-[100px] bg-secondary p-6 rounded-2xl border border-border shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-6 text-sm uppercase tracking-wider text-foreground">
              <ListOrdered className="h-4 w-4" /> Índice
            </h4>
            <ul className="space-y-3 text-[15px]">
              {toc.map((item, i) => (
                <li key={i} className={item.level === '3' ? 'ml-4' : ''}>
                  <a
                    href={`#${item.id}`}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium block"
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

      <div className="border-y border-border mt-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-[800px]">
        <span className="font-semibold flex items-center gap-2 text-[17px]">
          <Share2 className="h-5 w-5 text-primary" /> Compartilhe este artigo
        </span>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 hover:bg-primary hover:text-white"
            asChild
          >
            <a href={shareLinks.twitter} target="_blank" rel="noreferrer">
              <Twitter className="h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 hover:bg-primary hover:text-white"
            asChild
          >
            <a href={shareLinks.facebook} target="_blank" rel="noreferrer">
              <Facebook className="h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 hover:bg-primary hover:text-white"
            asChild
          >
            <a href={shareLinks.linkedin} target="_blank" rel="noreferrer">
              <Linkedin className="h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopyLink}
            className="gap-2 h-12 px-6 rounded-full font-semibold"
          >
            <LinkIcon className="h-4 w-4" /> Copiar Link
          </Button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-16 space-y-8 max-w-[1000px]">
          <h3 className="text-3xl font-bold tracking-tight">Você também pode gostar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((rel) => (
              <Card
                key={rel.id}
                className="group flex flex-col hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-40 overflow-hidden bg-secondary relative">
                  {rel.featuredImage && (
                    <img
                      src={rel.featuredImage}
                      alt={rel.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <CardHeader className="p-5 flex-1">
                  <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
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
