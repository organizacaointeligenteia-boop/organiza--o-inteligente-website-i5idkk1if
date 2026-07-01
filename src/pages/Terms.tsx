import { usePageTitle } from '@/hooks/use-page-title'

export default function Terms() {
  usePageTitle('Termos de Uso')

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Termos de Uso
        </h1>
        <p className="text-muted-foreground">
          Ao acessar e utilizar o site da Organização Inteligente, você concorda com os termos e
          condições descritos abaixo.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">1. Uso de Conteúdo Educacional</h2>
          <p className="text-muted-foreground leading-relaxed">
            Todo o conteúdo publicado neste site — incluindo artigos, guias, checklists e materiais
            educacionais — é fornecido com finalidade informativa e educacional. Você pode ler,
            compartilhar e aplicar as ideias apresentadas para seu desenvolvimento pessoal e
            profissional. A reprodução do conteúdo para fins comerciais, sem autorização expressa,
            não é permitida.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">2. Uso Pessoal de Downloads</h2>
          <p className="text-muted-foreground leading-relaxed">
            As planilhas, templates e checklists disponibilizados gratuitamente para download são
            licenciados para uso pessoal. Você pode imprimi-los, modificá-los para uso próprio e
            compartilhá-los com pessoas próximas. A revenda, distribuição comercial ou republicação
            desses materiais em outros sites é expressamente proibida.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">3. Divulgação de Links de Afiliados</h2>
          <p className="text-muted-foreground leading-relaxed">
            Algumas recomendações de produtos e serviços contêm links de afiliados. Isso significa
            que, se você realizar uma compra através desses links, a Organização Inteligente pode
            receber uma comissão, sem custo adicional para você. Recomendamos apenas produtos que
            acreditamos agregar valor aos nossos leitores. A decisão de compra é sempre sua.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">4. Alterações Futuras nestes Termos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Reservamo-nos o direito de atualizar ou modificar estes Termos de Uso a qualquer
            momento, para refletir mudanças na legislação, nos serviços oferecidos ou nas práticas
            da plataforma. Recomendamos que você revise esta página periodicamente. O uso continuado
            do site após alterações constitui aceitação dos termos atualizados.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">5. Limitação de Responsabilidade</h2>
          <p className="text-muted-foreground leading-relaxed">
            O conteúdo deste site não substite orientação profissional especializada. Para decisões
            financeiras, jurídicas ou de saúde, consulte um profissional qualificado. A Organização
            Inteligente não se responsabiliza por decisões tomadas com base exclusivamente no
            conteúdo publicado.
          </p>
        </div>
      </div>
    </div>
  )
}
