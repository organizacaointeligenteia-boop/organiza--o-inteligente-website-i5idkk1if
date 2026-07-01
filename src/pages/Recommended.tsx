import { useEffect, useState } from 'react'
import { usePageTitle } from '@/hooks/use-page-title'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getAffiliates, type AffiliateLink } from '@/services/affiliates'
import { useRealtime } from '@/hooks/use-realtime'
import { ExternalLink, InboxIcon, ShoppingBag } from 'lucide-react'

export default function Recommended() {
  usePageTitle('Recomendados | Organização Inteligente')
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)

  const loadAffiliates = () => {
    getAffiliates()
      .then(setAffiliates)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAffiliates()
  }, [])

  useRealtime('affiliate_links', () => {
    loadAffiliates()
  })

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      <div className="space-y-4 text-center py-8">
        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">
          Ferramentas Recomendadas
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Selecionamos livros, cursos, aplicativos e ferramentas que ajudam a organizar sua rotina e
          potencializar sua produtividade.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[220px] w-full rounded-2xl" />
          ))}
        </div>
      ) : affiliates.length === 0 ? (
        <div className="text-center py-16 bg-secondary/50 rounded-[24px] border border-dashed">
          <InboxIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-medium mb-2">Nenhuma recomendação disponível</h3>
          <p className="text-muted-foreground">
            Em breve traremos novas recomendações de ferramentas para você.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {affiliates.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation"
            >
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-xl leading-snug">{item.productName}</CardTitle>
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {item.category}
                  </Badge>
                </div>
                {item.description && (
                  <CardDescription className="mt-2 text-[15px] leading-relaxed">
                    {item.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardFooter className="flex items-center justify-between gap-2">
                {item.commission != null && item.commission > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Comissão de até {item.commission}%
                  </span>
                )}
                {item.affiliateUrl ? (
                  <Button className="ml-auto gap-2" size="sm" asChild>
                    <a href={item.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored">
                      <ExternalLink className="h-4 w-4" /> Acessar
                    </a>
                  </Button>
                ) : (
                  <span className="ml-auto text-sm text-muted-foreground italic">
                    Link em breve
                  </span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-secondary rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Alguns links podem gerar comissão para a Organização Inteligente, sem custo adicional para
          você.
        </p>
      </div>
    </div>
  )
}
