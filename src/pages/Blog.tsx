import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePageTitle } from '@/hooks/use-page-title'
import { getArticlesList, type Article } from '@/services/articles'
import { useRealtime } from '@/hooks/use-realtime'
import { ArrowRight, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  'Todos',
  'Organização Pessoal',
  'Produtividade',
  'Hábitos',
  'Planejamento',
  'Desenvolvimento Pessoal',
]
const PER_PAGE = 12

export default function Blog() {
  usePageTitle('Blog | Organização Inteligente')

  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat = searchParams.get('cat') || 'Todos'

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(initialCat)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchContent = () => {
    let filter = ''
    if (activeCategory !== 'Todos') {
      filter = `category = '${activeCategory}'`
    }
    if (search) {
      const searchFilter = `(title ~ '${search}' || excerpt ~ '${search}')`
      filter = filter ? `${filter} && ${searchFilter}` : searchFilter
    }

    setLoading(true)
    getArticlesList(page, PER_PAGE, filter)
      .then((res) => {
        setArticles(res.items)
        setTotalPages(res.totalPages || 1)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchContent()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, activeCategory])

  useEffect(() => {
    fetchContent()
  }, [page])

  useRealtime('articles', () => {
    fetchContent()
  })

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      <div className="space-y-6 border-b pb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">Nosso Blog</h1>
        <p className="text-lg text-muted-foreground">
          Artigos diretos ao ponto sobre produtividade, hábitos e organização.
        </p>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full sm:w-auto overflow-x-auto"
          >
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-auto">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="whitespace-nowrap px-3">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar artigos..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
          <h3 className="text-xl font-medium mb-2">Nenhum artigo encontrado</h3>
          <p className="text-muted-foreground mb-6">
            Não encontramos resultados para seus filtros atuais.
          </p>
          <Button
            onClick={() => {
              setSearch('')
              setActiveCategory('Todos')
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="flex flex-col overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-elevation"
            >
              <div className="h-48 overflow-hidden bg-muted relative group">
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-primary">
                  {article.category}
                </div>
              </div>
              <CardHeader className="flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                </div>
                <CardTitle className="text-xl leading-snug hover:text-primary transition-colors">
                  <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                </CardTitle>
                <CardDescription className="line-clamp-3 mt-3">{article.excerpt}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto font-medium text-primary hover:bg-transparent"
                  asChild
                >
                  <Link to={`/blog/${article.slug}`}>
                    Ler artigo completo <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-8">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
