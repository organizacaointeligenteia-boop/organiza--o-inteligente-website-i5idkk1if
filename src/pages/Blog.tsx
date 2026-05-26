import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'
import useArticlesStore from '@/stores/use-articles-store'
import { ArrowRight, Calendar } from 'lucide-react'

export default function Blog() {
  usePageTitle('Blog')
  const { articles } = useArticlesStore()

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="space-y-4 border-b pb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">Nosso Blog</h1>
        <p className="text-lg text-muted-foreground">
          Artigos diretos ao ponto sobre produtividade, hábitos e organização.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <Card
            key={article.id}
            className="flex flex-col overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-elevation"
          >
            <div className="h-48 overflow-hidden bg-muted relative group">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-primary">
                {article.category}
              </div>
            </div>
            <CardHeader className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="h-3 w-3" />
                {new Date(article.date).toLocaleDateString('pt-BR')}
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

      <div className="flex justify-center items-center py-8">
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm font-medium text-muted-foreground">
            Página 1 de 3
          </span>
          <Button variant="outline">Próxima</Button>
        </div>
      </div>
    </div>
  )
}
