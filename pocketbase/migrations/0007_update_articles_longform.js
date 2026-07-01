migrate(
  (app) => {
    var articlesData = [
      {
        slug: 'como-criar-habitos',
        title: 'Como Criar Hábitos Duradouros: O Guia Completo',
        excerpt:
          'Aprenda o método comprovado pela ciência para construir hábitos que duram a vida toda, sem depender de motivação ou força de vontade.',
        readingTime: 12,
        content:
          '<p>Criar hábitos duradouros é o desejo de milhões de pessoas. Todos nós já tentamos começar uma academia, ler mais, meditar ou comer melhor — apenas para desistir semanas depois. A boa notícia? Não é falta de força de vontade. É falta de método.</p>' +
          '<p>Neste guia completo, você vai entender a ciência por trás da formação de hábitos e aprender um sistema passo a passo para construir comportamentos que persistem.</p>' +
          '<h2>A Ciência dos Hábitos</h2>' +
          '<p>Hábitos são automáticos. Pesquisas do MIT mostram que 40-45% das nossas ações diárias não são decisões conscientes, mas padrões automatizados gravados nos gânglios basais do cérebro. Quando um comportamento se torna hábito, ele consome menos energia mental — é por isso que dirigir um carro familiar parece fácil, mas aprender a dirigir foi exaustivo.</p>' +
          '<p>O pesquisador Charles Duhigg, autor de "O Poder do Hábito", identificou que todo hábito segue um loop de três etapas: <strong>deixa</strong>, <strong>rotina</strong> e <strong>recompensa</strong>. James Clear, em "Hábitos Atômicos", ampliou esse modelo para quatro leis. Vamos explorar ambos.</p>' +
          '<h2>O Loop do Hábito Explicado</h2>' +
          '<h3>1. Deiva (O Gatilho)</h3>' +
          '<p>A deiva é o que dispara o comportamento. Pode ser externa (um horário, um local, uma pessoa) ou interna (uma emoção, um pensamento). Para criar um novo hábito, você precisa de uma deiva clara e consistente.</p>' +
          '<p><strong>Exemplo prático:</strong> Quer beber mais água? Coloque um copo cheio ao lado da sua cama toda noite. Ao acordar, a visão do copo é a deiva.</p>' +
          '<h3>2. Ansiedade (O Desejo)</h3>' +
          '<p>A ansiedade é a motivação por trás do hábito. É a expectativa da recompensa. Sem ansiedade, não há ação. Por isso, conectar o hábito a algo que você realmente deseja é crucial.</p>' +
          '<p><strong>Exemplo:</strong> Não é sobre "ir à academia". É sobre "sentir-se energizado e confiante". Conecte o hábito à identidade que você quer construir.</p>' +
          '<h3>3. Rotina (A Ação)</h3>' +
          '<p>A rotina é o comportamento em si — a execução. Quanto mais simples e rápida for a rotina, mais fácil será mantê-la. Reduza o atrito ao máximo.</p>' +
          '<h3>4. Recompensa (A Satisfação)</h3>' +
          '<p>A recompensa fecha o loop. É o que faz o cérebro querer repetir o comportamento. Pode ser intrínseca (sensação de accomplismento) ou extrínseca (marcar um X no calendário).</p>' +
          '<h2>As 4 Leis da Mudança de Comportamento</h2>' +
          '<p>James Clear sintetizou a ciência dos hábitos em quatro leis práticas:</p>' +
          '<ul><li><strong>Torne óbvio:</strong> Deixe as deivas visíveis e claras. Ambiente design > força de vontade.</li>' +
          '<li><strong>Torne atraente:</strong> Empilhe hábitos novos sobre os existentes. "Depois do café da manhã, vou meditar por 2 minutos."</li>' +
          '<li><strong>Torne fácil:</strong> Comece com a regra dos 2 minutos. Reduza o hábito a algo tão pequeno que seja impossível falhar.</li>' +
          '<li><strong>Torne satisfatório:</strong> Acompanhe visualmente. Marque cada dia. A cadeia de Xs motiva a não quebrar.</li></ul>' +
          '<h2>Estratégias Práticas para Manter Hábitos</h2>' +
          '<h3>Empilhamento de Hábitos</h3>' +
          '<p>Conecte um novo hábito a um que já existe: "Depois de [hábito atual], vou fazer [novo hábito]". Exemplo: "Depois de escovar os dentes, vou fazer 10 agachamentos." O cérebro já tem o gatilho automático do hábito existente — basta anexar o novo.</p>' +
          '<h3>Implementação de Intenções</h3>' +
          '<p>Estudos mostram que pessoas que especificam <em>quando</em> e <em>onde</em> vão agir têm 2-3x mais chance de sucesso. Formato: "Vou fazer [hábito] às [horário] em [local]."</p>' +
          '<h3>A Regra de Nunca Falhar Duas Vezes</h3>' +
          '<p>Errou um dia? Tudo bem. A vida acontece. Mas nunca erre dois dias seguidos. Essa regra simples previne que um escorregão se transforme em abandono total.</p>' +
          '<h2>Erros Comuns que Destroem Hábitos</h2>' +
          '<ul><li><strong>Começar grande demais:</strong> Querer meditar 30 minutos no primeiro dia. Comece com 2.</li>' +
          '<li><strong>Depender de motivação:</strong> Motivação é emoção — vem e vai. Sistemas são confiáveis.</li>' +
          '<li><strong>Ambiente hostil:</strong> Tentar ler com o celular na mesa. O ambiente sempre vence a força de vontade.</li>' +
          '<li><strong>Não acompanhar progresso:</strong> O que não é medido não é gerenciado.</li></ul>' +
          '<h2>Checklist Prático: Construa Seu Primeiro Hábito em 30 Dias</h2>' +
          '<ul><li>Escolha UM hábito apenas (não tente mudar tudo de uma vez)</li>' +
          '<li>Reduza-o para algo que leve menos de 2 minutos</li>' +
          '<li>Conecte a um hábito existente usando empilhamento</li>' +
          '<li>Defina quando e onde vai acontecer</li>' +
          '<li>Prepare o ambiente na noite anterior</li>' +
          '<li>Acompanhe diariamente (papel, app ou calendário)</li>' +
          '<li>Nunca falhe dois dias seguidos</li>' +
          '<li>Ao final de 30 dias, aumente gradualmente a duração/intensidade</li></ul>' +
          '<h2>Conclusão e Próximos Passos</h2>' +
          '<p>Hábitos não são sobre perfeição, mas sobre consistência. Você não precisa ser perfeito todo dia — precisa aparecer. Pequenos passos, repetidos diariamente, compõem resultados extraordinários ao longo do tempo.</p>' +
          '<p>Pronto para começar? Escolha um hábito agora, reduza para 2 minutos e comece hoje. E se quiser um sistema completo de acompanhamento, baixe nosso <strong>Checklist da Rotina Matinal Ideal</strong> na seção de Ferramentas Gratuitas.</p>',
      },
      {
        slug: 'guia-produtividade-2026',
        title: 'Guia de Produtividade para 2026: Sistemas que Funcionam',
        excerpt:
          'Descubra os sistemas, ferramentas e princípios que vão definir sua produtividade em 2026. Pare de trocar tarefas — comece a construir um sistema.',
        readingTime: 11,
        content:
          '<p>A cada novo ano, milhões de pessoas fazem promessas de "ser mais produtivo". Mas sem um sistema, produtividade é apenas uma intenção. Este guia te dá o framework completo para 2026 — não mais listas intermináveis, mas um sistema que funciona com seu cérebro, não contra ele.</p>' +
          '<h2>O Cenário de 2026: Por que a Produtividade Mudou</h2>' +
          '<p>Vivemos na era da atenção fragmentada. Notificações, IA, mensagens instantâneas e reuniões em vídeo competem por nosso foco a cada minuto. A produtividade não é mais sobre fazer mais coisas — é sobre fazer as coisas certas com menos desperdício de energia.</p>' +
          '<p>Em 2026, a diferença entre profissionais de alta performance não é o número de horas trabalhadas, mas a <strong>qualidade da atenção</strong> dedicada às tarefas que importam.</p>' +
          '<h2>Princípios Fundamentais de Produtividade</h2>' +
          '<h3>1. Foco Profundo (Deep Work)</h3>' +
          '<p>Cal Newport popularizou o conceito de "trabalho profundo": a capacidade de focar sem distração em uma tarefa cognitivamente exigente. É a habilidade mais valiosa do século XXI. Reserve blocos de 60-90 minutos para trabalho profundo, sem celular, sem e-mail, sem notificações.</p>' +
          '<h3>2. A Lei de Pareto (80/20)</h3>' +
          '<p>80% dos resultados vêm de 20% dos esforços. Identifique quais tarefas são seus 20% e elimine, delegue ou automatize o resto. Pergunte-se: "Se eu só pudesse fazer 3 coisas hoje, quais seriam?"</p>' +
          '<h3>3. Gestão de Energia, Não de Tempo</h3>' +
          '<p>Você tem 24 horas, mas não 24 horas de energia. Identifique seus picos de energia (para a maioria, manhã cedo) e reserve-os para trabalho profundo. Use os vales de energia para tarefas administrativas.</p>' +
          '<h2>Sistemas e Ferramentas para 2026</h2>' +
          '<h3>O Sistema de 3 Listas</h3>' +
          '<p>Mantenha apenas três listas. Mais que isso gera ansiedade e paralisia:</p>' +
          '<ul><li><strong>Projetos:</strong> Resultados que precisam de mais de uma ação para serem concluídos.</li>' +
          '<li><strong>Próximas Ações:</strong> O próximo passo físico e concreto de cada projeto.</li>' +
          '<li><strong>Algum Dia/Talvez:</strong> Ideias que você quer explorar, mas não agora.</li></ul>' +
          '<h3>Bloqueio de Tempo (Time Blocking)</h3>' +
          '<p>Atribua blocos específicos no calendário para cada tipo de tarefa. Exemplo: 9h-11h para trabalho profundo, 11h-12h para e-mails, 14h-15h para reuniões. Trate cada bloco como um compromisso inegociável consigo mesmo.</p>' +
          '<h3>Ferramentas Recomendadas</h3>' +
          '<ul><li><strong>Todoist:</strong> Gestão de tarefas simples e poderosa.</li>' +
          '<li><strong>Notion:</strong> Base de conhecimento e projetos.</li>' +
          '<li><strong>Google Calendar:</strong> Bloqueio de tempo e compromissos.</li>' +
          '<li><strong>Pomofocus:</strong> Timer para técnica Pomodoro.</li></ul>' +
          '<h2>A Rotina de Alta Performance</h2>' +
          '<h3>Manhã (6h-9h): Ativação</h3>' +
          '<p>Acordar, hidratar, movimentar o corpo e definir 3 prioridades do dia. Nada de celular nos primeiros 30 minutos — comece o dia no controle, não reagindo.</p>' +
          '<h3>Meio-dia (9h-12h): Trabalho Profundo</h3>' +
          '<p>Seu pico de energia cognitiva. Reserve para a tarefa mais importante do dia. Feche abas, silencie notificações, use fones com ruído branco.</p>' +
          '<h3>Tarde (13h-17h): Colaboração e Administração</h3>' +
          '<p>Reuniões, e-mails, calls. A energia natural diminui após o almoço — perfeito para tarefas interativas e de menor exigência cognitiva.</p>' +
          '<h3>Noite (18h-21h): Revisão e Recuperação</h3>' +
          '<p>Revise o dia, planeje o próximo e desconecte. O descanso de qualidade é parte do sistema — sem recuperação, não há performance sustentável.</p>' +
          '<h2>Checklist: Implemente Seu Sistema em 7 Dias</h2>' +
          '<ul><li>Dia 1: Escreva todas as tarefas da cabeça para o papel (esvaziamento mental)</li>' +
          '<li>Dia 2: Separe em Projetos, Próximas Ações e Algum Dia/Talvez</li>' +
          '<li>Dia 3: Identifique suas 3 prioridades da semana</li>' +
          '<li>Dia 4: Configure bloqueio de tempo no calendário</li>' +
          '<li>Dia 5: Crie um ambiente de foco (sem celular, fones, água)</li>' +
          '<li>Dia 6: Estabeleça rotina matinal e noturna</li>' +
          '<li>Dia 7: Revise a semana e ajuste o sistema</li></ul>' +
          '<h2>Conclusão</h2>' +
          '<p>Produtividade não é sobre fazer mais — é sobre fazer o que importa com presença e intenção. Em 2026, o diferencial não será quem trabalha mais horas, mas quem protege melhor sua atenção. Comece com um hábito, construa o sistema gradualmente e lembre: consistência vence intensidade.</p>' +
          '<p>Quer um sistema pronto para começar hoje? Baixe nosso <strong>Template de Planejamento Semanal</strong> gratuito e organize sua primeira semana com clareza.</p>',
      },
      {
        slug: 'minimalismo-digital-organize-vida-online',
        title: 'Minimalismo Digital: Organize Sua Vida Online',
        excerpt:
          'Caixa de entrada com 5.000 e-mails? 200 abas abertas? Aprenda a simplificar sua vida digital e recuperar o foco no que importa.',
        readingTime: 10,
        content:
          '<p>Você já sentiu aquela ansiedade ao olhar para a tela do celular? Notificações acumuladas, e-mails não lidos, abas que você "vai ler depois". O excesso digital é uma das maiores fontes de estresse do mundo moderno — e a solução não é mais tecnologia, mas menos.</p>' +
          '<p>O minimalismo digital não é sobre ter zero arquivos ou viver offline. É sobre <strong>ter apenas o que agrega valor</strong> e eliminar o resto. Neste guia, você vai aprender a fazer uma faxina completa na sua vida digital.</p>' +
          '<h2>O Custo do Excesso Digital</h2>' +
          '<p>O brasileiro passa em média 9 horas por dia conectado. Cada notificação interrompe o foco e custa até 23 minutos para recuperar a concentração total, segundo pesquisas da Universidade da Califórnia. O resultado? Ansiedade, redução de foco, insônia e a sensação constante de "estou sempre atrás".</p>' +
          '<p>Mas há uma saída. O minimalismo digital é a prática de intencionalmente curar e simplificar seu ambiente digital para que a tecnologia sirva você — não o contrário.</p>' +
          '<h2>Passo 1: Limpeza da Caixa de Entrada</h2>' +
          '<p>Sua caixa de entrada não é uma lista de tarefas. É um canal de comunicação. Se há mais de 50 e-mails não lidos, você está usando errado.</p>' +
          '<h3>A Estratégia do Arquivamento em Massa</h3>' +
          '<p>Arquive TODOS os e-mails antigos de uma vez. Sim, todos. Se algo for realmente importante, alguém vai perguntar de novo. A partir de agora, processe cada e-mail novo imediatamente:</p>' +
          '<ul><li><strong>Responder:</strong> Se leva menos de 2 minutos, responda agora.</li>' +
          '<li><strong>Arquivar:</strong> É só informativo? Arquive.</li>' +
          '<li><strong>Agendar:</strong> Precisa de uma resposta elaborada? Adicione à sua lista de tarefas e arquive.</li></ul>' +
          '<h3>Filtros Automáticos</h3>' +
          '<p>Crie filtros para newsletters, notificações de redes sociais e recibo. Eles vão direto para pastas específicas, sem poluir a caixa principal.</p>' +
          '<h2>Passo 2: Organização de Arquivos na Nuvem</h2>' +
          '<p>Quantos arquivos você tem espalhados entre Google Drive, Dropbox, OneDrive e Downloads? A desorganização digital custa em média 2 horas por semana apenas procurando arquivos.</p>' +
          '<h3>A Estrutura Simples</h3>' +
          '<p>Use numeração para forçar ordenação e mantenha no máximo 5-7 pastas principais:</p>' +
          '<ul><li>01_Pessoal</li>' +
          '<li>02_Trabalho</li>' +
          '<li>03_Financeiro</li>' +
          '<li>04_Referências</li>' +
          '<li>99_Arquivo (tudo que não é mais ativo)</li></ul>' +
          '<p>Use nomes padronizados: <code>YYYY-MM-DD_NomeDoArquivo</code>. Isso facilita buscas e ordenação cronológica.</p>' +
          '<h2>Passo 3: Detox de Redes Sociais</h2>' +
          '<p>Redes sociais são projetadas para viciar. Notificações, scroll infinito e algoritmos de recomendação são engenharia comportamental pura — não uma coincidência.</p>' +
          '<h3>Auditoria de Apps</h3>' +
          '<p>Liste todos os apps de redes sociais no seu celular. Para cada um, pergunte: "Este app me ajuda a alcançar meus objetivos ou me distrai deles?" Se a resposta for distração, desinstale por uma semana.</p>' +
          '<h3>Configurações de Proteção</h3>' +
          '<ul><li>Desative TODAS as notificações de redes sociais.</li>' +
          '<li>Configure limites de tempo (Screen Time no iOS, Digital Wellbeing no Android).</li>' +
          '<li>Mude a tela do celular para escala de cinza — reduz o apelo visual dos apps.</li>' +
          '<li>Apague os apps do celular e acesse apenas pelo navegador.</li></ul>' +
          '<h2>Passo 4: Automações que Simplificam</h2>' +
          '<p>Toda decisão que você pode automatizar é energia mental recuperada para o que importa.</p>' +
          '<ul><li><strong>Senhas:</strong> Use um gerenciador (Bitwarden, 1Password). Uma senha mestra para tudo.</li>' +
          '<li><strong>Backups:</strong> Configure backup automático para fotos e documentos.</li>' +
          '<li><strong>Pagamentos:</strong> Débito automático para contas fixas.</li>' +
          '<li><strong>E-mails:</strong> Filtros para categorizar automaticamente.</li></ul>' +
          '<h2>Passo 5: Higiene Digital Diária</h2>' +
          '<p>O minimalismo digital não é um evento — é uma prática. Implemente estes hábitos:</p>' +
          '<ul><li><strong>Regra dos 30 minutos:</strong> Sem celular nos primeiros 30 minutos após acordar e nos últimos 30 antes de dormir.</li>' +
          '<li><strong>Zona livre de tecnologia:</strong> Quarto e mesa de refeições sem dispositivos.</li>' +
          '<li><strong>Revisão semanal:</strong> 15 minutos toda sexta para limpar downloads, fechar abas e arquivar e-mails.</li>' +
          '<li><strong>Domingo offline:</strong> Um dia por semana sem redes sociais.</li></ul>' +
          '<h2>Checklist: Limpeza Digital em 1 Final de Semana</h2>' +
          '<ul><li>Sábado manhã: Arquivar todos os e-mails antigos e configurar filtros</li>' +
          '<li>Sábado tarde: Reorganizar arquivos na nuvem com a estrutura numerada</li>' +
          '<li>Domingo manhã: Auditoria de apps e desinstalar os que não agregam</li>' +
          '<li>Domingo tarde: Configurar gerenciador de senhas e backups automáticos</li>' +
          '<li>Domingo noite: Definir limites de tempo e desativar notificações</li></ul>' +
          '<h2>Conclusão</h2>' +
          '<p>Menos distração digital significa mais presença na vida real. Você não precisa abandonar a tecnologia — precisa usá-la com intenção. Comece com um passo deste guia hoje. Em poucas semanas, você vai sentir a diferença: menos ansiedade, mais foco, mais tempo para o que realmente importa.</p>' +
          '<p>Para te ajudar nessa jornada, baixe nosso <strong>Template de Planejamento Semanal</strong> gratuito e comece a organizar não só sua vida digital, mas sua rotina completa.</p>',
      },
      {
        slug: 'sistema-metas-smart-alcance-objetivos',
        title: 'Sistema de Metas SMART: Alcance Seus Objetivos',
        excerpt:
          'Transforme desejos vagos em metas concretas com o framework SMART e aumente drasticamente suas chances de sucesso.',
        readingTime: 10,
        content:
          '<p>"Quero emagrecer." "Quero ler mais." "Quero ser mais organizado." Essas frases soam familiares? O problema não é a intenção — é a falta de clareza. Metas vagas produzem resultados vagos. O framework SMART é a ferramenta mais eficaz do mundo para transformar desejos em conquistas.</p>' +
          '<p>Neste guia, você vai aprender a aplicar o método SMART passo a passo, com exemplos práticos e um sistema de acompanhamento que funciona.</p>' +
          '<h2>Por que a Maioria das Metas Falha</h2>' +
          '<p>Estudos da Universidade de Scranton mostram que apenas 8% das pessoas alcançam suas metas de ano novo. Os 92% que falham compartilham padrões comuns:</p>' +
          '<ul><li><strong>Metas vagas:</strong> "Ser mais produtivo" não é uma meta — é um desejo.</li>' +
          '<li><strong>Sem prazo:</strong> Sem data limite, não há urgência. A meta vira "algum dia".</li>' +
          '<li><strong>Sem plano:</strong> Ter a meta sem definir os passos é como ter um destino sem mapa.</li>' +
          '<li><strong>Irrealista:</strong> "Ler 100 livros em um ano" pode ser impossível e desmotiva.</li></ul>' +
          '<p>O framework SMART resolve todos esses problemas de uma vez.</p>' +
          '<h2>O Que é SMART: O Framework Completo</h2>' +
          '<p>SMART é um acrônimo onde cada letra representa um critério essencial para uma meta bem definida:</p>' +
          '<h3>S — Específica</h3>' +
          '<p>Sua meta deve responder: O quê exatamente? Quem está envolvido? Onde? Por quê? Quanto mais específica, mais direcionável.</p>' +
          '<p><strong>Antes:</strong> "Quero ler mais."<br><strong>Depois:</strong> "Quero ler 12 livros de desenvolvimento pessoal em 2026."</p>' +
          '<h3>M — Mensurável</h3>' +
          '<p>Como você vai saber que alcançou? Defina um número, um indicador. Sem número, não há critério de sucesso.</p>' +
          '<p><strong>Antes:</strong> "Quero economizar dinheiro."<br><strong>Depois:</strong> "Quero economizar R$ 1.000 por mês, totalizando R$ 12.000 no ano."</p>' +
          '<h3>A — Alcançável</h3>' +
          '<p>Desafiadora, mas possível. Metas impossíveis desmotivam. Metas fáceis não inspiram. Encontre o ponto ideal de dificuldade.</p>' +
          '<p>Ler 100 livros pode ser irreal. 12 é ambicioso e factível — um por mês.</p>' +
          '<h3>R — Relevante</h3>' +
          '<p>Esta meta importa para você? Conecta com seus valores e visão de longo prazo? Metas dos outros não motivam. A resposta ao "por quê" precisa ser sua.</p>' +
          '<h3>T — Temporal</h3>' +
          '<p>Defina um prazo. Sem prazo, a meta vira um sonho eterno. O prazo cria urgência e foco.</p>' +
          '<p><strong>Antes:</strong> "Quero ser mais organizado."<br><strong>Depois:</strong> "Até 30 de junho de 2026, implementarei um sistema de planejamento semanal todo domingo, por 12 semanas consecutivas."</p>' +
          '<h2>Exemplos Práticos de Transformação</h2>' +
          '<h3>Exemplo 1: Saúde</h3>' +
          '<p><strong>Vago:</strong> "Quero emagrecer."<br><strong>SMART:</strong> "Perder 8 kg até 31 de dezembro de 2026, perdendo aproximadamente 1 kg por mês, através de exercício 4x por semana e dieta com déficit calórico de 500 kcal/dia."</p>' +
          '<h3>Exemplo 2: Carreira</h3>' +
          '<p><strong>Vago:</strong> "Quero crescer profissionalmente."<br><strong>SMART:</strong> "Conquistar uma promoção para Senior Developer até dezembro de 2026, completando 3 certificações técnicas e liderando 2 projetos de ponta a ponta."</p>' +
          '<h3>Exemplo 3: Finanças</h3>' +
          '<p><strong>Vago:</strong> "Quero sair das dívidas."<br><strong>SMART:</strong> "Quitar todas as 3 dívidas (R$ 15.000 total) até outubro de 2026, alocando R$ 2.500/mês usando o método avalanche, começando pela dívida de maior juros."</p>' +
          '<h2>Quebrando Metas em Marcos</h2>' +
          '<p>Metas anuais são grandes demais para o cérebro processar diariamente. Quebre em marcos menores:</p>' +
          '<ul><li><strong>Meta anual:</strong> Ler 12 livros em 2026.</li>' +
          '<li><strong>Meta trimestral:</strong> Ler 3 livros por trimestre.</li>' +
          '<li><strong>Meta mensal:</strong> Ler 1 livro por mês.</li>' +
          '<li><strong>Meta semanal:</strong> Ler 7 capítulos por semana (1 por dia).</li>' +
          '<li><strong>Meta diária:</strong> Ler 20 páginas por dia.</li></ul>' +
          '<p>Cada nível fica mais concreto e acionável. O cérebro entende "ler 20 páginas hoje" — "ler 12 livros no ano" é abstrato demais.</p>' +
          '<h2>Revisão e Ajuste: O Sistema de Acompanhamento</h2>' +
          '<p>Metas não são estáticas. Precisam de revisão regular para permanecerem relevantes.</p>' +
          '<h3>Revisão Semanal (15 minutos)</h3>' +
          '<ul><li>Quantos capítulos li esta semana?</li>' +
          '<li>Estou no ritmo para atingir a meta do mês?</li>' +
          '<li>Que obstáculo impediu o progresso?</li>' +
          '<li>O que vou fazer diferente na próxima semana?</li></ul>' +
          '<h3>Revisão Mensal (30 minutos)</h3>' +
          '<ul><li>Concluí o livro do mês?</li>' +
          '<li>A meta ainda é relevante para mim?</li>' +
          '<li>Preciso ajustar o prazo ou o escopo?</li></ul>' +
          '<h3>Revisão Trimestral (1 hora)</h3>' +
          '<ul><li>Estou no caminho para a meta anual?</li>' +
          '<li>Quais hábitos estão funcionando? Quais não?</li>' +
          '<li>Desistir de uma meta irrelevante não é fracasso — é inteligência.</li></ul>' +
          '<h2>Checklist: Defina Sua Primeira Meta SMART Hoje</h2>' +
          '<ul><li>Escolha UMA área prioritária (saúde, carreira, finanças, relacionamentos)</li>' +
          '<li>Escreva sua meta no formato SMART (todos os 5 critérios)</li>' +
          '<li>Quebre em metas trimestrais, mensais e semanais</li>' +
          '<li>Defina a meta diária — o passo de hoje</li>' +
          '<li>Agende revisões semanais no calendário</li>' +
          '<li>Crie um tracker visual (papel ou app)</li>' +
          '<li>Compartilhe a meta com alguém de confiança</li>' +
          '<li>Celebre cada marco conquistado</li></ul>' +
          '<h2>Conclusão</h2>' +
          '<p>Metas SMART não são sobre perfeição — são sobre clareza e direção. Quando você sabe exatamente o que quer, quando quer e como vai medir, as chances de sucesso multiplicam. Comece com uma meta hoje. Escreva. Quebre em passos. Acompanhe. E lembre: o melhor momento para começar não é amanhã — é agora.</p>' +
          '<p>Precisa de ajuda para estruturar seu planejamento? Baixe nosso <strong>Template de Planejamento Semanal</strong> gratuito e comece a transformar metas em resultados.</p>',
      },
      {
        slug: 'organizacao-financeira-pessoal-zero-controle',
        title: 'Organização Financeira Pessoal: Do Zero ao Controle',
        excerpt:
          'Um guia prático para assumir o controle das suas finanças, mesmo que você nunca tenha feito um orçamento antes.',
        readingTime: 11,
        content:
          '<p>Dinheiro é um dos maiores causadores de estresse do mundo moderno. Se você nunca fez um orçamento, não sabe para onde seu dinheiro vai ou vive "apertado" no fim do mês, este guia é para você. Não importa sua renda — a organização financeira não é sobre quanto você ganha, mas sobre como gerencia o que tem.</p>' +
          '<p>Vamos do zero ao controle total, passo a passo, sem jargões técnicos.</p>' +
          '<h2>Passo 1: O Diagnóstico Financeiro</h2>' +
          '<p>Você não pode gerenciar o que não mede. O primeiro passo é conhecer exatamente para onde seu dinheiro está indo. A maioria das pessoas subestima seus gastos em 20-30%.</p>' +
          '<h3>O Raio-X dos 30 Dias</h3>' +
          '<p>Durante 30 dias, anote absolutamente todos os gastos — do café de R$ 5 ao aluguel. Use um app (Mobills, Organizze), uma planilha ou um caderno. O método não importa; a consistência sim.</p>' +
          '<p>No final do mês, categorize tudo:</p>' +
          '<ul><li><strong>Moradia:</strong> Aluguel, condomínio, IPTU, utilities</li>' +
          '<li><strong>Alimentação:</strong> Supermercado, restaurantes, delivery</li>' +
          '<li><strong>Transporte:</strong> Combustível, ônibus, Uber, manutenção</li>' +
          '<li><strong>Saúde:</strong> Plano, medicamentos, consultas</li>' +
          '<li><strong>Lazer:</strong> Streaming, hobbies, saídas</li>' +
          '<li><strong>Dívidas:</strong> Cartão, empréstimos, financiamentos</li>' +
          '<li><strong>Outros:</strong> Tudo que não se encaixa acima</li></ul>' +
          '<p>O choque de realidade é normal. A maioria das pessoas descobre que gasta 2x mais em delivery e lazer do que imaginava. Esse diagnóstico é a base de tudo.</p>' +
          '<h2>Passo 2: A Regra 50/30/20</h2>' +
          '<p>Criada pela senadora Elizabeth Warren, a regra 50/30/20 é o framework mais simples e eficaz para distribuir sua renda:</p>' +
          '<h3>50% — Necessidades</h3>' +
          '<p>Tudo que você precisa para viver: moradia, alimentação básica, transporte, saúde, seguros. Se suas necessidades ultrapassam 50%, há duas opções: aumentar a renda ou reduzir custos fixos (mudar para um imóvel menor, renegociar planos).</p>' +
          '<h3>30% — Desejos</h3>' +
          '<p>Tudo que é opcional: restaurantes, streaming, hobbies, viagens, compras não essenciais. É o "tempero" da vida — sem ele, o orçamento fica insustentável a longo prazo.</p>' +
          '<h3>20% — Poupança e Investimentos</h3>' +
          '<p>O seu futuro. Reserva de emergência, investimentos, aposentadoria, quitação de dívidas. Se você está começando do zero, pode parecer muito — mas mesmo 5% é melhor que 0%.</p>' +
          '<h3>Exemplo Prático</h3>' +
          '<p>Renda mensal: R$ 5.000</p>' +
          '<ul><li>Necessidades (50%): R$ 2.500</li>' +
          '<li>Desejos (30%): R$ 1.500</li>' +
          '<li>Poupança (20%): R$ 1.000</li></ul>' +
          '<h2>Passo 3: Construindo a Reserva de Emergência</h2>' +
          '<p>Antes de investir em ações ou criptomoedas, construa sua reserva de emergência. É o fundo que te protege de imprevistos: demissão, doença, reparos urgentes.</p>' +
          '<h3>Quanto Guardar?</h3>' +
          '<ul><li><strong>Solteiro sem dependentes:</strong> 3 meses de despesas</li>' +
          '<li><strong>Casal sem filhos:</strong> 4-5 meses</li>' +
          '<li><strong>Com filhos ou renda variável:</strong> 6-12 meses</li></ul>' +
          '<h3>Onde Guardar?</h3>' +
          '<p>A reserva deve ser <strong>líquida e segura</strong>. Não em ações ou cripto. Use:</p>' +
          '<ul><li>Tesouro Selic (mais seguro e rentável que poupança)</li>' +
          '<li>CDB com liquidez diária</li>' +
          '<li>Conta remunerada de corretoras</li></ul>' +
          '<p>Guarde em uma conta separada do dia a dia. O que você não vê, você não gasta.</p>' +
          '<h2>Passo 4: Eliminando Dívidas</h2>' +
          '<p>Dívidas são o maior sabotador da liberdade financeira. Juros de cartão de crédito podem chegar a 12% ao mês — mais de 300% ao ano. Cada mês que passa, você trabalha para o banco.</p>' +
          '<h3>O Método Avalanche (Recomendado)</h3>' +
          '<p>Liste todas as dívidas pela taxa de juros, da maior para a menor:</p>' +
          '<ul><li>1. Cartão de crédito — 12% a.m. — R$ 3.000</li>' +
          '<li>2. Cheque especial — 8% a.m. — R$ 1.500</li>' +
          '<li>3. Empréstimo pessoal — 3% a.m. — R$ 5.000</li></ul>' +
          '<p>Pague o mínimo em todas e direcione TODO o extra para a de maior juros (cartão). Eliminada, passe para a próxima. Matematicamente, este método economiza mais dinheiro.</p>' +
          '<h3>O Método Bola de Neve (Para Motivação)</h3>' +
          '<p>Se você precisa de vitórias rápidas para se manter motivado, pague a menor dívida primeiro. O impacto psicológico de eliminar uma dívida cria momentum.</p>' +
          '<h2>Passo 5: Automação é Sua Aliada</h2>' +
          '<p>A maior inimiga das finanças é a força de vontade — porque ela se esgota. Automatize tudo que puder:</p>' +
          '<ul><li><strong>Débito automático:</strong> Contas fixas (aluguel, luz, água, internet).</li>' +
          '<li><strong>Transferência automática:</strong> No dia do pagamento, transfira 20% para a conta de poupança/investimento.</li>' +
          '<li><strong>Investimento automático:</strong> Configure aportes mensais automáticos no Tesouro Direto ou CDB.</li></ul>' +
          '<p>A regra é simples: pague-se primeiro. Antes de gastar com qualquer coisa, 20% já foi para o seu futuro.</p>' +
          '<h2>Passo 6: A Revisão Mensal</h2>' +
          '<p>Reserve 1 hora no último dia de cada mês para:</p>' +
          '<ul><li>Comparar gastos reais vs. orçamento planejado</li>' +
          '<li>Identificar categorias que estouraram</li>' +
          '<li>Ajustar o orçamento do mês seguinte</li>' +
          '<li>Verificar o crescimento da reserva de emergência</li>' +
          '<li>Celebrar vitórias (mesmo as pequenas)</li></ul>' +
          '<p>Esse hábito separa quem controla as finanças de quem é controlado por elas.</p>' +
          '<h2>Checklist: Do Zero ao Controle em 30 Dias</h2>' +
          '<ul><li>Semana 1: Anotar todos os gastos por 7 dias (início do diagnóstico)</li>' +
          '<li>Semana 2: Categorizar gastos e calcular percentual por categoria</li>' +
          '<li>Semana 3: Aplicar a regra 50/30/20 e criar o orçamento mensal</li>' +
          '<li>Semana 4: Configurar automações (débito automático e transferência para poupança)</li>' +
          '<li>listar todas as dívidas e escolher o método (avalanche ou bola de neve)</li>' +
          '<li>Definir meta para reserva de emergência (valor e prazo)</li>' +
          '<li>Agendar revisão mensal no calendário</li></ul>' +
          '<h2>Conclusão</h2>' +
          '<p>Organização financeira não é sobre restrição — é sobre liberdade. Quando você controla seu dinheiro, ele para de controlar você. Comece com o diagnóstico de 30 dias. O simples ato de saber para onde o dinheiro vai já muda comportamento. E lembre: não precisa ser perfeito. Precisa ser consistente.</p>' +
          '<p>Para te ajudar nesse processo, baixe nosso <strong>Mapa Financeiro</strong> gratuito na seção de Ferramentas Gratuitas e comece a organizar suas finanças hoje.</p>',
      },
    ]

    for (var i = 0; i < articlesData.length; i++) {
      var a = articlesData[i]
      try {
        var record = app.findFirstRecordByData('articles', 'slug', a.slug)
        record.set('title', a.title)
        record.set('excerpt', a.excerpt)
        record.set('content', a.content)
        record.set('readingTime', a.readingTime)
        app.save(record)
      } catch (_) {}
    }
  },
  (app) => {
    // down: not strict
  },
)
