import { usePageTitle } from '@/hooks/use-page-title'
import { Target, Zap, Clock } from 'lucide-react'

export default function About() {
  usePageTitle('Sobre Nós')

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in py-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
          Sobre a Organização Inteligente
        </h1>
        <p className="text-xl text-muted-foreground">
          Nascemos com um propósito simples: tornar a produtividade acessível para quem não tem
          tempo a perder.
        </p>
      </div>

      <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
        <img
          src="https://img.usecurling.com/p/1200/600?q=teamwork&dpr=2"
          alt="Equipe trabalhando"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>A Nossa Missão</h2>
        <p>
          Acreditamos que a verdadeira organização não é sobre fazer mais coisas, mas sim sobre
          fazer as coisas certas com menos esforço. Nossa missão é destilar teorias complexas de
          gestão de tempo e neurociência comportamental em micro-guias práticos e aplicáveis.
        </p>
        <p>
          Você não precisa ler um livro de 300 páginas para mudar um hábito. Precisa da informação
          certa, no momento certo, com passos claros.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="text-center space-y-3 p-6 bg-secondary rounded-xl">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Direto ao Ponto</h3>
          <p className="text-muted-foreground text-sm">
            Sem jargões ou enrolação. Conteúdo desenhado para leitura rápida e aplicação imediata.
          </p>
        </div>
        <div className="text-center space-y-3 p-6 bg-secondary rounded-xl">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Ciência e Prática</h3>
          <p className="text-muted-foreground text-sm">
            Baseamos nossos guias em estudos reais de neurociência e psicologia comportamental.
          </p>
        </div>
        <div className="text-center space-y-3 p-6 bg-secondary rounded-xl">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Respeito ao seu Tempo</h3>
          <p className="text-muted-foreground text-sm">
            Cada artigo indica o tempo exato de leitura e os minutos necessários para aplicar a
            dica.
          </p>
        </div>
      </div>
    </div>
  )
}
