import { usePageTitle } from '@/hooks/use-page-title'

export default function Privacy() {
  usePageTitle('Política de Privacidade')

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Política de Privacidade
        </h1>
        <p className="text-muted-foreground">
          A Organização Inteligente respeita a privacidade dos seus visitantes. Esta política
          descreve como coletamos, usamos e protegemos seus dados.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">1. Dados Coletados</h2>
          <p className="text-muted-foreground leading-relaxed">
            Coletamos as seguintes informações quando você interage com nosso site:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li>
              <strong>Newsletter:</strong> nome (opcional) e endereço de e-mail quando você se
              inscreve para receber nossos materiais.
            </li>
            <li>
              <strong>Formulário de contato:</strong> nome, e-mail e mensagem enviada.
            </li>
            <li>
              <strong>Dados de navegação:</strong> informações técnicas como endereço IP, tipo de
              navegador e páginas visitadas, coletadas automaticamente para melhorar a experiência
              do usuário.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">2. Finalidade da Coleta de Dados</h2>
          <p className="text-muted-foreground leading-relaxed">
            Os dados coletados são utilizados para:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li>Enviar materiais práticos, checklists e novidades para inscritos na newsletter.</li>
            <li>
              Responder a dúvidas, sugestões e solicitações enviadas pelo formulário de contato.
            </li>
            <li>Melhorar o conteúdo, a navegação e o desempenho do site.</li>
            <li>Cumprir obrigações legais e regulatórias quando aplicável.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">
            3. Compartilhamento com Ferramentas de Terceiros
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Para operar a plataforma e entregar nossos serviços, utilizamos ferramentas de terceiros
            que podem ter acesso a dados limitados:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li>
              <strong>Serviços de hospedagem e backend:</strong> para armazenar e processar os dados
              de inscrição e contato de forma segura.
            </li>
            <li>
              <strong>Ferramentas de e-mail marketing:</strong> para gerenciar o envio da newsletter
              e permitir o cancelamento de inscrição.
            </li>
            <li>
              <strong>Programas de afiliados:</strong> quando você clica em links de afiliados, o
              parceiro pode registrar um cookie para identificar a origem da indicação.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Não vendemos nem alugamos seus dados pessoais a terceiros.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">4. Procedimentos de Opt-out (Cancelamento)</h2>
          <p className="text-muted-foreground leading-relaxed">
            Você pode cancelar a inscrição na newsletter a qualquer momento clicando no link de
            cancelamento presente em todos os e-mails enviados. Para solicitar a exclusão completa
            dos seus dados de nossos sistemas, envie um e-mail para
            contato@organizacaointeligente.com.br e processaremos sua solicitação em até 30 dias.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">5. Segurança dos Dados</h2>
          <p className="text-muted-foreground leading-relaxed">
            Adotamos medidas técnicas e organizacionais razoáveis para proteger seus dados contra
            acesso não autorizado, perda ou alteração. No entanto, nenhum método de transmissão pela
            internet é 100% seguro, e não podemos garantir segurança absoluta.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">6. Alterações nesta Política</h2>
          <p className="text-muted-foreground leading-relaxed">
            Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos que você
            revise esta página regularmente para se manter informado sobre como protegemos seus
            dados.
          </p>
        </div>
      </div>
    </div>
  )
}
