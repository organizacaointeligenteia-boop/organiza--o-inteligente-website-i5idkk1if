migrate(
  (app) => {
    // ── Auth seed (maintain admin user) ──
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'fabricio@ferriferriadv.com.br')
    } catch (_) {
      var users = app.findCollectionByNameOrId('_pb_users_auth_')
      var adminRecord = new Record(users)
      adminRecord.setEmail('fabricio@ferriferriadv.com.br')
      adminRecord.setPassword('Skip@Pass')
      adminRecord.setVerified(true)
      adminRecord.set('name', 'Administrador')
      app.save(adminRecord)
    }

    var now = new Date()
    function dateAgo(months, days) {
      var d = new Date(now)
      d.setMonth(d.getMonth() - months)
      if (days) d.setDate(d.getDate() - days)
      return d.toISOString().replace('T', ' ')
    }

    // ── Articles: clean old, seed 12 new ──
    var articlesCol = app.findCollectionByNameOrId('articles')
    var alreadySeeded = false
    try {
      app.findFirstRecordByData('articles', 'slug', '5-tecnicas-organizacao-home-office')
      alreadySeeded = true
    } catch (_) {}

    if (!alreadySeeded) {
      // Remove old articles
      var oldArticles = app.findRecordsByFilter('articles', "id != ''", '-created', 500, 0)
      for (var i = 0; i < oldArticles.length; i++) {
        app.delete(oldArticles[i])
      }

      var articlesData = [
        {
          title: '5 Técnicas de Organização para Home Office',
          slug: '5-tecnicas-organizacao-home-office',
          category: 'Organização Pessoal',
          readingTime: 7,
          publishedAt: dateAgo(6, 0),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=home%20office&dpr=2',
          excerpt:
            'Aprenda cinco técnicas comprovadas para organizar seu espaço de trabalho em casa e multiplicar sua produtividade.',
          content:
            '<h2>Por que a organização do home office importa</h2><p>Trabalhar de casa oferece flexibilidade incrível, mas sem organização adequada, a produtividade despenca. Estudos mostram que um ambiente desorganizado aumenta o estresse e reduz o foco em até 40%.</p><p>Neste artigo, você vai conhecer cinco técnicas práticas que vão transformar seu espaço de trabalho e sua rotina.</p>' +
            '<h2>1. Zona de Trabalho Dedicada</h2><p>Ter um espaço exclusivo para o trabalho é fundamental. Mesmo que seja um canto pequeno do apartamento, ele precisa ser <strong>exclusivamente seu</strong> e livre de distrações domésticas.</p><p>Invista em uma mesa ergonômica e uma cadeira confortável. Seu corpo agradece.</p>' +
            '<h2>2. Sistema de Arquivamento Digital</h2><p>Organize seus arquivos em pastas lógicas: Projetos, Financeiro, Pessoal e Arquivo. Use nomes padronizados como <code>YYYY-MM-DD_NomeDoArquivo</code> para facilitar buscas.</p>' +
            '<h2>3. Rotina de Início e Fim de Dia</h2><p>Comece o dia revisando suas prioridades e termine organizando a mesa e fechando o notebook. Esse ritual cria separação mental entre trabalho e lazer.</p>' +
            '<h2>4. Iluminação e Ergonomia</h2><p>Uma boa iluminação reduz a fadiga visual. Posicione a tela a 50-70 cm dos olhos e na altura adequada para evitar dores no pescoço.</p>' +
            '<h2>5. Limpeza Semanal</h2><p>Reserve 15 minutos toda sexta-feira para organizar papéis, limpar a mesa e planejar a semana seguinte. Esse hábito simples mantém tudo sob controle.</p>' +
            '<p>Implementando essas cinco técnicas, seu home office se tornará um ambiente de alta performance. Comece por uma técnica por semana e construa o hábito gradualmente.</p>',
        },
        {
          title: 'Como Criar uma Rotina Matinal Produtiva',
          slug: 'como-criar-rotina-matinal-produtiva',
          category: 'Hábitos',
          readingTime: 6,
          publishedAt: dateAgo(5, 15),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=morning%20routine&dpr=2',
          excerpt:
            'Descubra como construir uma rotina matinal que amplia seu foco, energia e clareza mental para o resto do dia.',
          content:
            '<h2>O poder das primeiras horas do dia</h2><p>Como você começa a manhã define o tom de todo o seu dia. Pessoas altamente produtivas compartilham um padrão: têm uma rotina matinal intencional.</p>' +
            '<h2>Por que a maioria falha</h2><p>A maioria das pessoas começa o dia reagindo: checking de e-mails, redes sociais, notícias negativas. Isso coloca o cérebro em modo reativo antes mesmo de pensar nas próprias prioridades.</p>' +
            '<h2>Os 4 pilares de uma manhã produtiva</h2>' +
            '<h3>1. Hidratação imediata</h3><p>Após 7-8 horas de sono, seu corpo está desidratado. Beba 500ml de água assim que acordar. Isso ativa o metabolismo e melhora a clareza mental.</p>' +
            '<h3>2. Movimento</h3><p>5 a 15 minutos de alongamento, yoga ou caminhada são suficientes para circular o sangue e despertar o corpo.</p>' +
            '<h3>3. Reflexão e planejamento</h3><p>Reserve 10 minutos para revisar suas metas, escrever 3 prioridades do dia e praticar gratidão. Esse momento define sua intenção.</p>' +
            '<h3>4. Alimentação consciente</h3><p>Um café da manhã com proteínas e gorduras saudáveis mantém a energia estável. Evite açúcares refinados que causam pico e queda de energia.</p>' +
            '<h2>Como implementar gradualmente</h2><p>Não tente mudar tudo de uma vez. Comece acordando 15 minutos mais cedo na primeira semana. Adicione um hábito por semana até construir sua rotina completa.</p><p>Em 30 dias, você terá uma manhã transformada.</p>',
        },
        {
          title: 'O Guia Completo do Planejamento Semanal',
          slug: 'guia-completo-planejamento-semanal',
          category: 'Planejamento',
          readingTime: 9,
          publishedAt: dateAgo(5, 0),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=weekly%20planner&dpr=2',
          excerpt:
            'Um sistema passo a passo para planejar sua semana com clareza, priorizando o que realmente importa e eliminando o excesso.',
          content:
            '<h2>Por que o planejamento semanal é mais eficaz que o diário</h2><p>O planejamento diário é reativo. Você acorda e decide o que fazer. O planejamento semanal é proativo: você define a direção antes de começar.</p><p>Pesquisas mostram que pessoas que planejam a semana têm 30% mais probabilidade de atingir suas metas.</p>' +
            '<h2>O sistema de 5 passos</h2>' +
            '<h3>Passo 1: Revisão da semana anterior</h3><p>Reserve 30 minutos no domingo à noite. O que funcionou? O que não funcionou? Quais tareças ficaram pendentes?</p>' +
            '<h3>Passo 2: Defina 3 prioridades</h3><p>Escolha as 3 tarefas mais importantes da semana. Estas são suas <strong>pedras grandes</strong> — aquelas que, se completadas, tornam a semana um sucesso.</p>' +
            '<h3>Passo 3: Bloqueio de tempo</h3><p>Atribua blocos de tempo no calendário para cada prioridade. Trate esses blocos como reuniões inegociáveis consigo mesmo.</p>' +
            '<h3>Passo 4: Agrupe tarefas similares</h3><p>Reserve um bloco para e-mails, outro para reuniões, outro para trabalho profundo. Alternar entre contextos diferentes custa energia mental.</p>' +
            '<h3>Passo 5: Deixe espaço para o imprevisto</h3><p>Nunca preencha 100% da semana. Deixe 20% livre para emergências e oportunidades. Se nada surgir, use o tempo para adiantar trabalho.</p>' +
            '<h2>Ferramentas recomendadas</h2><p>Um simples caderno funciona. Se prefere digital, Notion, Todoist ou Google Calendar são excelentes opções. O importante não é a ferramenta, mas a consistência.</p>' +
            '<h2>Erros comuns a evitar</h2><p>Sobrecarregar a semana com tarefas, não revisar o plano diariamente e esquecer de incluir descanso e lazer no planejamento.</p>',
        },
        {
          title: 'Produtividade com a Técnica Pomodoro: Guia Definitivo',
          slug: 'produtividade-tecnica-pomodoro-guia',
          category: 'Produtividade',
          readingTime: 5,
          publishedAt: dateAgo(4, 15),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=pomodoro%20timer&dpr=2',
          excerpt:
            'Aprenda a usar a Técnica Pomodoro para manter o foco profundo, evitar a procrastinação e terminar o dia com energia.',
          content:
            '<h2>O que é a Técnica Pomodoro</h2><p>Criada por Francesco Cirillo nos anos 80, a Técnica Pomodoro é simples: trabalhe em blocos de 25 minutos com foco total, seguidos de 5 minutos de descanso.</p><p>O nome vem do cronômetro em forma de tomate (pomodoro em italiano) que Cirillo usava na universidade.</p>' +
            '<h2>Como funciona na prática</h2><p>1. Escolha uma tarefa. 2. Configure o cronômetro para 25 minutos. 3. Trabalhe com foco total, sem distrações. 4. Ao tocar, descanse 5 minutos. 5. Após 4 ciclos, descanse 15-30 minutos.</p>' +
            '<h2>Por que é tão eficaz</h2><p>O cérebro humano não consegue manter foco profundo por mais de 45-90 minutos. Os blocos curtos criam urgência artificial, combatem a procrastinação e previnem a fadiga mental.</p>' +
            '<h2>Adaptações para diferentes perfis</h2><p>Nem todo mundo funciona bem com 25 minutos. Experimente 50 minutos de trabalho e 10 de descanso, ou 90 minutos e 20. Encontre seu ritmo ideal.</p>' +
            '<h2>Erros que anulam o benefício</h2><p>Verificar o celular durante o descanso, não respeitar o timer e tentar fazer multitarefa dentro do pomodoro. O descanso é sagrado — levante-se, alongue-se, beba água.</p>',
        },
        {
          title: 'Como Eliminar Procrastinação de Uma Vez por Todas',
          slug: 'eliminar-procrastinacao-definitivamente',
          category: 'Produtividade',
          readingTime: 8,
          publishedAt: dateAgo(4, 0),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=focus%20work&dpr=2',
          excerpt:
            'Entenda as causas reais da procrastinação e aplique estratégias científicas para superá-la de forma permanente.',
          content:
            '<h2>Procrastinação não é preguiça</h2><p>A neurociência revela que procrastinação é uma falha na regulação emocional, não de gestão de tempo. Adiamos tarefas porque nos causam desconforto — tédio, ansiedade, medo de falhar.</p>' +
            '<h2>As 5 causas mais comuns</h2>' +
            '<h3>1. Perfeccionismo</h3><p>A crença de que precisa estar perfeito paralisa. A solução: comece com um rascunho ruim. Você pode melhorar depois.</p>' +
            '<h3>2. Tarefas ambíguas</h3><p>"Fazer o relatório" é vago demais. Quebre em passos: abrir modelo, coletar dados, escrever introdução.</p>' +
            '<h3>3. Falta de sentido</h3><p>Se você não entende por que a tarefa importa, é difícil começar. Conecte cada tarefa a um objetivo maior.</p>' +
            '<h3>4. Sobrecarga</h3><p>Quando há muito para fazer, o cérebro congela. Escolha UMA tarefa e esqueça o resto temporariamente.</p>' +
            '<h3>5. Ambiente cheio de gatilhos</h3><p>Notificações, celular na mesa, abas abertas. Cada gatilho é uma oportunidade de fuga.</p>' +
            '<h2>A regra dos 2 minutos</h2><p>Se uma tarefa leva menos de 2 minutos, faça agora. Isso reduz a lista mental e gera momentum.</p>' +
            '<h2>Técnica do 5-minutos</h2><p>Comprometa-se a trabalhar na tarefa por apenas 5 minutos. Geralmente, o mais difícil é começar. Uma vez em movimento, a tendência é continuar.</p>' +
            '<h2>Construa sistemas, não confie em força de vontade</h2><p>Força de vontade é um recurso limitado. Em vez disso, crie ambientes e rotinas que tornem a ação correta a mais fácil.</p>',
        },
        {
          title: 'Hábitos Atômicos: Pequenas Mudanças, Grandes Resultados',
          slug: 'habitos-atomicos-pequenas-mudancas',
          category: 'Hábitos',
          readingTime: 10,
          publishedAt: dateAgo(3, 15),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=habits%20book&dpr=2',
          excerpt:
            'Os princípios do best-seller de James Clear aplicados na prática: como melhorar 1% por dia e transformar sua vida.',
          content:
            '<h2>A matemática do 1%</h2><p>Melhorar 1% por dia parece insignificante. Mas composto ao longo de um ano, equivale a 37 vezes melhor. É o poder dos pequenos hábitos.</p>' +
            '<h2>Você não alcança metas, você alcança sistemas</h2><p>James Clear defende que os resultados não vêm das metas, mas dos sistemas que você constrói. Um jogador de tênis não ganha por focar no troféu, mas por treinar todos os dias.</p>' +
            '<h2>As 4 leis da mudança de comportamento</h2>' +
            '<h3>1. Torne óbvio</h3><p>Deixe gatilhos visíveis. Quer ler mais? Deixe o livro sobre o travesseiro. Quer beber água? Garrafa na mesa de trabalho.</p>' +
            '<h3>2. Torne atraente</h3><p>Empilhe hábitos: depois de [hábito que já tenho], vou fazer [novo hábito]. Ex: depois do café da manhã, vou meditar por 2 minutos.</p>' +
            '<h3>3. Torne fácil</h3><p>Reduza o atrito. Prepare a roupa de academia na noite anterior. Deixe o caderno aberto na página certa. A regra dos 2 minutos: comece com uma versão ridicamente pequena do hábito.</p>' +
            '<h3>4. Torne satisfatório</h3><p>Marque um X no calendário a cada dia que cumprir o hábito. A cadeia de Xs motiva a não quebrar a sequência.</p>' +
            '<h2>Identidade dirige comportamento</h2><p>Não diga "estou tentando parar de fumar". Diga "não sou fumante". A mudança de identidade torna o hábito sustentável a longo prazo.</p>' +
            '<h2>Como aplicar hoje</h2><p>Escolha um hábito. Reduza para 2 minutos. Associe a um hábito existente. Acompanhe por 30 dias. Depois adicione o próximo.</p>',
        },
        {
          title: 'Organização Financeira Pessoal: Do Zero ao Controle',
          slug: 'organizacao-financeira-pessoal-zero-controle',
          category: 'Organização Pessoal',
          readingTime: 7,
          publishedAt: dateAgo(3, 0),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=finance%20planning&dpr=2',
          excerpt:
            'Um guia prático para assumir o controle das suas finanças, mesmo que você nunca tenha feito um orçamento antes.',
          content:
            '<h2>O primeiro passo: diagnóstico</h2><p>Você não pode gerenciar o que não mede. Durante 30 dias, anote absolutamente todos os gastos, do café ao aluguel. Use um app, planilha ou caderno.</p>' +
            '<h2>A regra 50/30/20</h2><p>Divida sua renda em três categorias: 50% para necessidades (moradia, alimentação, transporte), 30% para desejos (lazer, compras) e 20% para poupança e investimentos.</p>' +
            '<h2>Construindo sua reserva de emergência</h2><p>Antes de investir, construa uma reserva de 3 a 6 meses de despesas. Guarde em uma conta separada, de fácil acesso, mas não no banco do dia a dia.</p>' +
            '<h2>Elimine dívidas com a técnica avalanche</h2><p>Liste todas as dívidas pela taxa de juros, da maior para a menor. Pague o mínimo em todas e directing todo o extra para a de maior juros. Eliminada, passe para a próxima.</p>' +
            '<h2>Automação é sua aliada</h2><p>Configure débito automático para contas fixas e transferência automática para poupança no dia do pagamento. O que você não vê, você não gasta.</p>' +
            '<h2>Revisão mensal</h2><p>Reserve 1 hora no final de cada mês para revisar gastos, ajustar o orçamento e planejar o mês seguinte. Esse hábito separa quem controla as finanças de quem é controlado por elas.</p>',
        },
        {
          title: 'Método GTD: Como Organizar Tarefas e Projetos',
          slug: 'metodo-gtd-organizar-tarefas-projetos',
          category: 'Planejamento',
          readingTime: 8,
          publishedAt: dateAgo(2, 15),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=gtd%20method&dpr=2',
          excerpt:
            'O Getting Things Done de David Allen explicado de forma simples: um sistema para esvaziar a mente e nunca mais esquecer nada.',
          content:
            '<h2>A promessa do GTD</h2><p>Sua mente é para ter ideias, não para armazená-las. O GTD propõe um sistema externo confiável que libera sua mente das preocupações com lembretes.</p>' +
            '<h2>Os 5 passos do GTD</h2>' +
            '<h3>1. Capturar</h3><p>Recolha tudo que chama sua atenção em caixas de entrada: e-mails, recados, ideias, tarefas. Não organize ainda, apenas capture.</p>' +
            '<h3>2. Esclarecer</h3><p>Para cada item, pergunte: é acionável? Se não, arquive ou descarte. Se sim, qual a próxima ação?</p>' +
            '<h3>3. Organizar</h3><p>Coloque cada item no lugar certo: Próximas Ações, Projetos, Algum Dia/Talvez, Referência, Aguardando.</p>' +
            '<h3>4. Refletir</h3><p>Revise suas listas semanalmente. O GTD só funciona se você confiar no sistema — e confiança vem da revisão regular.</p>' +
            '<h3>5. Engajar</h3><p>Escolha a próxima ação com base em contexto, tempo disponível, energia e prioridade.</p>' +
            '<h2>A pergunta mágica: qual a próxima ação?</h2><p>Projetos grandes paralisam. "Organizar a festa" não é uma ação. "Ligar para o buffet para pedir orçamento" é. Sempre defina a próxima ação física e específica.</p>' +
            '<h2>Ferramentas para o GTD</h2><p>Todoist, Things, Notion ou até um caderno. A melhor ferramenta é aquela que você usa consistentemente. Comece simples.</p>',
        },
        {
          title: 'Mindfulness para Produtividade: Foco no Presente',
          slug: 'mindfulness-para-produtividade-foco-presente',
          category: 'Desenvolvimento Pessoal',
          readingTime: 6,
          publishedAt: dateAgo(2, 0),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=mindfulness%20meditation&dpr=2',
          excerpt:
            'Como práticas de mindfulness melhoram o foco, reduzem o estresse e aumentam a qualidade do seu trabalho.',
          content:
            '<h2>O que é mindfulness</h2><p>Mindfulness é a prática de prestar atenção ao momento presente, intencionalmente e sem julgamentos. Não é sobre esvaziar a mente, mas sobre observar sem reagir.</p>' +
            '<h2>Por que mindfulness melhora a produtividade</h2><p>Pesquisas da Universidade de Harvard mostram que passamos 47% do tempo acordados pensando em algo diferente do que estamos fazendo. Essa dispersão reduz a felicidade e a performance.</p>' +
            '<h2>3 práticas simples para começar</h2>' +
            '<h3>Respiração consciente (3 minutos)</h3><p>Sente-se confortavelmente. Feche os olhos. Observe a respiração entrando e saindo. Quando a mente divagar (e vai), gentilmente traga de volta. Isso é treinar o músculo da atenção.</p>' +
            '<h3>Body scan (5 minutos)</h3><p>Percorra mentalmente cada parte do corpo, dos pés à cabeça. Observe sensações sem julgar. Excelente para pausas entre tarefas.</p>' +
            '<h3>Trabalho consciente</h3><p>Escolha uma tarefa. Por 10 minutos, faça apenas isso. Quando surgir o impulso de checar o celular, observe-o e volte à tarefa.</p>' +
            '<h2>Mindfulness não é religião</h2><p>Embora tenha raízes em tradições contemplativas, a prática secular de mindfulness é respaldada por mais de 2.000 estudos científicos comprovando seus benefícios.</p>' +
            '<h2>Comece pequeno</h2><p>2 minutos por dia. Todos os dias. Em 8 semanas, estudos mostram mudanças mensuráveis no cérebro, incluindo maior densidade na região ligada ao foco e à regulação emocional.</p>',
        },
        {
          title: 'Como Construir Disciplina sem Depender de Motivação',
          slug: 'construir-disciplina-sem-motivacao',
          category: 'Desenvolvimento Pessoal',
          readingTime: 7,
          publishedAt: dateAgo(1, 15),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=discipline%20grit&dpr=2',
          excerpt:
            'A motivação é volátil. A disciplina é confiável. Aprenda a construir sistemas que mantêm você no caminho mesmo sem vontade.',
          content:
            '<h2>O mito da motivação</h2><p>Esperar sentir vontade para agir é uma armadilha. A motivação é uma emoção — vem e vai. Disciplinados não esperam sentir vontade; eles agem independentemente do humor.</p>' +
            '<h2>Disciplina é treino, não talento</h2><p>O cérebro tem plasticidade. Cada vez que você age contra o impulso de desistir, fortalece o circuito neural da disciplina. É como um músculo: começa fraco e cresce com uso.</p>' +
            '<h2>5 estratégias para construir disciplina</h2>' +
            '<h3>1. Reduza decisões</h3><p>Automação elimina a necessidade de disciplina. Roupas de academia prontas, marmitas feitas no domingo, cronograma pré-definido. Menos decisões, mais execução.</p>' +
            '<h3>2. Compromisso público</h3><p>Diga a alguém o que vai fazer. A pressão social é um motor poderoso. Envie a um amigo: "Vou meditar 5 minutos por 30 dias seguidos."</p>' +
            '<h3>3. Regra de nunca falhar duas vezes</h3><p>Errou um dia? Tudo bem. Nunca erre dois seguidos. Essa regra simples previne que um escorregão vire abandono total.</p>' +
            '<h3>4. Recompensa imediata</h3><p>O cérebro responde a recompensas imediatas, não futuras. Celebre cada vitória pequena com algo que goste — um café especial, um episódio da série.</p>' +
            '<h3>5. Atrito seletivo</h3><p>Torne bons hábitos fáceis e maus hábitos difíceis. Celular longe da cama. Frutas na bancada. Cartão de crédito fora da carteira.</p>' +
            '<h2>A identidade do disciplinado</h2><p>Em vez de "estou tentando ser disciplinado", diga "sou uma pessoa disciplinada". A ação segue a identidade. Cada pequeno ato de disciplina é um voto por quem você está se tornando.</p>',
        },
        {
          title: 'Sistema de Metas SMART: Alcance Seus Objetivos',
          slug: 'sistema-metas-smart-alcance-objetivos',
          category: 'Planejamento',
          readingTime: 6,
          publishedAt: dateAgo(1, 0),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=goal%20setting&dpr=2',
          excerpt:
            'Transforme desejos vagos em metas concretas com o framework SMART e aumente drasticamente suas chances de sucesso.',
          content:
            '<h2>Por que a maioria das metas falha</h2><p>"Quero emagrecer", "quero ser mais produtivo", "quero ler mais". Essas metas são vagas, sem prazo e sem critério de sucesso. O cérebro não sabe como executá-las.</p>' +
            '<h2>O que é SMART</h2><p>SMART é um acrônimo que transforma metas vagas em planos concretos:</p>' +
            '<h3>S — Específica</h3><p>"Ler mais" vira "Ler 12 livros de desenvolvimento pessoal". Quanto mais específica, mais direcionável.</p>' +
            '<h3>M — Mensurável</h3><p>Defina um número. "Economizar dinheiro" vira "Economizar R$ 1.000 por mês". Sem número, não há como saber se chegou.</p>' +
            '<h3>A — Alcançável</h3><p>Desafiadora, mas possível. Ler 100 livros no ano pode ser irreal. 12 é ambicioso e factível. Metas impossíveis desmotivam.</p>' +
            '<h3>R — Relevante</h3><p>Esta meta importa para você? Conecta com seus valores e visão de longo prazo? Metas dos outros não motivam.</p>' +
            '<h3>T — Temporal</h3><p>Defina um prazo. "Até 31 de dezembro". Sem prazo, a meta vira um sonho eterno.</p>' +
            '<h2>Exemplo de transformação</h2><p>Antes: "Quero ser mais organizado." Depois: "Até 30 de junho, implementarei um sistema de planejamento semanal todo domingo, por 12 semanas consecutivas, usando o método GTD."</p>' +
            '<h2>Quebre em marcos</h2><p>Metas anuais são grandes demais. Divida em metas trimestrais, mensais e semanais. Cada semana deve avançar pelo menos 1% em direção à meta.</p>' +
            '<h2>Revisão e ajuste</h2><p>Metas não são estáticas. Revise mensalmente. Ajuste se necessário. Desistir de uma meta irrelevante não é fracasso — é inteligência.</p>',
        },
        {
          title: 'Minimalismo Digital: Organize Sua Vida Online',
          slug: 'minimalismo-digital-organize-vida-online',
          category: 'Organização Pessoal',
          readingTime: 5,
          publishedAt: dateAgo(0, 14),
          featuredImage: 'https://img.usecurling.com/p/800/400?q=digital%20minimalism&dpr=2',
          excerpt:
            'Caixa de entrada com 5.000 e-mails? 200 abas abertas? Aprenda a simplificar sua vida digital e recuperar o foco.',
          content:
            '<h2>O custo do excesso digital</h2><p>Estudos mostram que o brasileiro passa em média 9 horas por dia conectado. O excesso de informação causa ansiedade, redução de foco e dificuldade de concentração.</p>' +
            '<h2>Limpeza da caixa de entrada</h2><p>Use a estratégia do arquivamento em massa: arquive todos os e-mails antigos de uma vez. A partir de agora, processe cada e-mail novo imediatamente: responder, arquivar ou deletar.</p>' +
            '<h2>Organização de arquivos na nuvem</h2><p>Estrutura simples: 01_Pessoal, 02_Trabalho, 03_Financeiro, 04_Referências, 99_Arquivo. Numeração força ordenação. Subpastas apenas quando necessário.</p>' +
            '<h2>Detox de redes sociais</h2><p>Desinstale apps por uma semana. Veja como se sente. Se voltar, configure limites de tempo e desative notificações. Use o celular, não deixe que ele use você.</p>' +
            '<h2>Automações que simplificam</h2><p>Configure filtros de e-mail para boletins, use gerenciador de senhas, agende backups automáticos. Cada automação é uma decisão a menos para tomar.</p>' +
            '<h2>O princípio do menos, porém melhor</h2><p>Não se trata de ter zero arquivos ou zero apps. Trata-se de ter apenas o que agrega valor. Menos distração digital significa mais presença na vida real.</p>',
        },
      ]

      for (var ai = 0; ai < articlesData.length; ai++) {
        var a = articlesData[ai]
        var rec = new Record(articlesCol)
        rec.set('title', a.title)
        rec.set('slug', a.slug)
        rec.set('content', a.content)
        rec.set('excerpt', a.excerpt)
        rec.set('featuredImage', a.featuredImage)
        rec.set('category', a.category)
        rec.set('readingTime', a.readingTime)
        rec.set('publishedAt', a.publishedAt)
        app.save(rec)
      }
    }

    // ── Free Downloads: clean old, seed new ──
    try {
      app.findFirstRecordByData('free_downloads', 'title', 'Ebook: O Guia da Mente Organizada')
    } catch (_) {
      var oldDls = app.findRecordsByFilter('free_downloads', "id != ''", '-created', 500, 0)
      for (var di = 0; di < oldDls.length; di++) {
        app.delete(oldDls[di])
      }

      var downloads = [
        {
          id: 'dl_ebook_mente_org',
          title: 'Ebook: O Guia da Mente Organizada',
          desc: 'Um ebook completo de 80 páginas com técnicas de organização pessoal, sistemas de produtividade e exercícios práticos para transformar sua rotina.',
        },
        {
          id: 'dl_planilha_habitos',
          title: 'Planilha de Controle de Hábitos Mensal',
          desc: 'Planilha interativa para acompanhar até 12 hábitos simultaneamente. Inclui gráficos automáticos, taxa de consistência e relatório mensal.',
        },
        {
          id: 'dl_template_planejamento',
          title: 'Template de Planejamento Semanal',
          desc: 'Modelo pronto para Notion e Google Docs com o sistema de 5 passos do planejamento semanal. Defina prioridades, bloqueie tempo e acompanhe resultados.',
        },
        {
          id: 'dl_checklist_matinal',
          title: 'Checklist da Rotina Matinal Ideal',
          desc: 'Um checklist imprimível com os 4 pilares da manhã produtiva. Comece o dia com clareza, energia e foco usando este guia passo a passo.',
        },
      ]

      for (var dli = 0; dli < downloads.length; dli++) {
        var d = downloads[dli]
        app
          .db()
          .newQuery(
            "INSERT INTO free_downloads (id, title, description, fileUrl, downloadCount, created, updated) VALUES ({:id}, {:title}, {:desc}, '', {:count}, {:time}, {:time})",
          )
          .bind({
            id: d.id,
            title: d.title,
            desc: d.desc,
            count: Math.floor(Math.random() * 500) + 50,
            time: dateAgo(2, 0),
          })
          .execute()
      }
    }

    // ── Affiliate Links: clean old, seed new ──
    try {
      app.findFirstRecordByData('affiliate_links', 'productName', 'Livro: Hábitos Atômicos')
    } catch (_) {
      var oldAffs = app.findRecordsByFilter('affiliate_links', "id != ''", '-created', 500, 0)
      for (var afi = 0; afi < oldAffs.length; afi++) {
        app.delete(oldAffs[afi])
      }

      var affCol = app.findCollectionByNameOrId('affiliate_links')
      var affiliates = [
        {
          productName: 'Livro: Hábitos Atômicos',
          productUrl:
            'https://www.amazon.com.br/habitos-atomicos-resultados-pequenas-mudancas/dp/8584390795',
          category: 'Livros',
          description:
            'O best-seller de James Clear sobre como construir bons hábitos e quebrar os ruins através de pequenas mudanças diárias.',
          affiliateUrl:
            'https://www.amazon.com.br/habitos-atomicos-resultados-pequenas-mudancas/dp/8584390795?tag=orginteligente-20',
          commission: 8,
        },
        {
          productName: 'Livro: A Tríade do Tempo',
          productUrl: 'https://www.amazon.com.br/triade-do-tempo-Christian-Barbosa/dp/8562570011',
          category: 'Livros',
          description:
            'Christian Barbosa ensina o método da Tríade do Tempo para equilibrar vida pessoal e profissional com produtividade.',
          affiliateUrl:
            'https://www.amazon.com.br/triade-do-tempo-Christian-Barbosa/dp/8562570011?tag=orginteligente-20',
          commission: 8,
        },
        {
          productName: 'Planner Diário 2024',
          productUrl:
            'https://www.amazon.com.br/planner-diario-2024-organizacao-pessoal/dp/B0CK3X7PLR',
          category: 'Ferramentas',
          description:
            'Planner anual com sistema de planejamento semanal, controle de hábitos e metas. Capa dura, 365 páginas.',
          affiliateUrl:
            'https://www.amazon.com.br/planner-diario-2024-organizacao-pessoal/dp/B0CK3X7PLR?tag=orginteligente-20',
          commission: 12,
        },
        {
          productName: 'Kit: Canetas Stabilo Boss Original',
          productUrl: 'https://www.amazon.com.br/stabilo-boss-original-canetas-marca/dp/B07MXQ4HVL',
          category: 'Ferramentas',
          description:
            'Kit com 10 marcadores pastel para destaque em planners e cadernos. Cores suaves e ponta biselada.',
          affiliateUrl:
            'https://www.amazon.com.br/stabilo-boss-original-canetas-marca/dp/B07MXQ4HVL?tag=orginteligente-20',
          commission: 10,
        },
        {
          productName: 'Assinatura Notion Pro',
          productUrl: 'https://www.notion.so/pricing',
          category: 'Aplicativos',
          description:
            'O Notion Pro oferece páginas ilimitadas, colaboração em tempo real e integrações avançadas para organizar toda sua vida em um só lugar.',
          affiliateUrl: 'https://www.notion.so/pricing?r=orginteligente',
          commission: 15,
        },
        {
          productName: 'App: Todoist Premium',
          productUrl: 'https://todoist.com/br/premium',
          category: 'Aplicativos',
          description:
            'Gerenciador de tarefas com lembretes inteligentes, projetos ilimitados e integrações. Ideal para implementar o método GTD.',
          affiliateUrl: 'https://todoist.com/br/premium?ref=orginteligente',
          commission: 15,
        },
        {
          productName: 'Curso: Produtividade na Prática',
          productUrl: 'https://www.udemy.com/course/produtividade-na-pratica/',
          category: 'Cursos',
          description:
            'Curso completo com 8 horas de vídeo cobrindo gestão de tempo, foco profundo e sistemas de produtividade. Certificado incluído.',
          affiliateUrl:
            'https://www.udemy.com/course/produtividade-na-pratica/?referralCode=ORGINT',
          commission: 20,
        },
        {
          productName: 'Curso: Organização Pessoal em 30 Dias',
          productUrl: 'https://www.hotmart.com/product/organizacao-pessoal-30-dias',
          category: 'Cursos',
          description:
            'Programa de transformação de 30 dias com aulas diárias, exercícios práticos e comunidade de suporte para reorganizar sua vida do zero.',
          affiliateUrl:
            'https://www.hotmart.com/product/organizacao-pessoal-30-dias?ref=orginteligente',
          commission: 25,
        },
      ]

      for (var affI = 0; affI < affiliates.length; affI++) {
        var aff = affiliates[affI]
        var affRec = new Record(affCol)
        affRec.set('productName', aff.productName)
        affRec.set('productUrl', aff.productUrl)
        affRec.set('category', aff.category)
        affRec.set('description', aff.description)
        affRec.set('affiliateUrl', aff.affiliateUrl)
        affRec.set('commission', aff.commission)
        app.save(affRec)
      }
    }
  },
  (app) => {
    // down not strict
  },
)
