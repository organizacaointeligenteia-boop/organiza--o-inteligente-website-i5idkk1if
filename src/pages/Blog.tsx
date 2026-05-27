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
import { ArrowRight, Calendar, Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

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
  usePageTitle('Blog Premium | Organização Inteligente')

  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat = searchParams.get('cat') || 'Todos'

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(initialCat)
  const [searchInput, setSearchInput] = useState('')
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
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [activeCategory])

  useEffect(() => {
    fetchContent()
  }, [page, search, activeCategory])

  useRealtime('articles', () => {
    fetchContent()
  })

  return (
    <div className="space-y-12 animate-fade-in pb-16">
      <div className="space-y-8 border-b pb-10">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Blog</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Artigos diretos ao ponto sobre produtividade, hábitos e organização em alto nível.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-max">
              <TabsList className="inline-flex h-12 items-center justify-start rounded-xl bg-secondary p-1">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="whitespace-nowrap px-5 py-2.5 text-[15px] font-medium rounded-lg"
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="relative w-full md:w-[320px] flex-shrink-0">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar artigos..."
              className="pl-11 h-[48px] rounded-xl bg-background"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[220px] w-full rounded-2xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24 bg-secondary/50 rounded-[32px] border border-dashed">
          <Inbox className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Nenhum artigo encontrado</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
            Não encontramos resultados para seus filtros atuais.
          </p>
          <Button
            size="lg"
            onClick={() => {
              setSearchInput('')
              setActiveCategory('Todos')
            }}
          >
            Limpar todos os filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="group flex flex-col overflow-hidden bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-medium"
            >
              <div className="h-[220px] overflow-hidden bg-secondary relative">
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute top-4 left-4 bg-primary/10 backdrop-blur-md text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {article.category}
                </div>
              </div>
              <CardHeader className="flex-1 p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                </div>
                <CardTitle className="text-2xl leading-tight group-hover:text-primary transition-colors">
                  <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                </CardTitle>
                <CardDescription className="line-clamp-3 mt-4 text-[16px] leading-relaxed">
                  {article.excerpt}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto font-semibold text-primary hover:bg-transparent hover:text-primary/80"
                  asChild
                >
                  <Link to={`/blog/${article.slug}`}>
                    Ler artigo completo <ArrowRight className="ml-2 h-[18px] w-[18px]" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-10">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-[15px] font-semibold text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
