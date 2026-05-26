import { Link } from 'react-router-dom'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'
import useArticlesStore from '@/stores/use-articles-store'
import { ArrowRight } from 'lucide-react'

interface Props {
  title: string
}

export default function Category({ title }: Props) {
  usePageTitle(title)
  const { articles } = useArticlesStore()

  const categoryArticles = articles.filter((a) => a.category === title).slice(0, 3)
  const fallbackArticles = articles.slice(0, 3)
  const displayArticles = categoryArticles.length > 0 ? categoryArticles : fallbackArticles

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Descubra nossos melhores conteúdos sobre {title.toLowerCase()}. Comece com pequenos passos
          e transforme sua rotina com inteligência.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayArticles.map((article) => (
          <Card
            key={article.id}
            className="flex flex-col overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-elevation"
          >
            <div className="h-48 overflow-hidden bg-muted">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <CardHeader className="flex-1">
              <CardTitle className="text-xl leading-tight">{article.title}</CardTitle>
              <CardDescription className="line-clamp-3 mt-2">{article.excerpt}</CardDescription>
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

      {categoryArticles.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Exibindo artigos recentes como sugestão.
        </p>
      )}
    </div>
  )
}
