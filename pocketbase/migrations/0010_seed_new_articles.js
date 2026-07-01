migrate(
  (app) => {
    var now = new Date()
    function dateAgo(days) {
      var d = new Date(now)
      d.setDate(d.getDate() - days)
      return d.toISOString().replace('T', ' ')
    }

    var articlesCol = app.findCollectionByNameOrId('articles')

    var articlesData = [
      {
        title: 'Como organizar a rotina semanal do zero: um metodo simples para sair do caos',
        slug: 'como-organizar-rotina-semanal',
        category: 'Planejamento',
        readingTime: 9,
        publishedAt: dateAgo(3),
        featuredImage: 'https://img.usecurling.com/p/800/400?q=weekly%20planning&dpr=2',
        excerpt:
          'Aprenda como organizar a rotina semanal do zero com um metodo simples para definir prioridades, planejar tarefas e executar melhor durante a semana.',
        content:
          '<p>Se voce olha para a semana que comeca e sente que tudo e urgente, voce nao esta sozinho. A maioria das pessoas comeca a segunda-feira sem um plano claro, reagindo ao que aparece. O resultado e uma semana que parece corrida, mas que no sabado deixou pouco progresso real. Organizar a rotina semanal nao e sobre fazer mais — e sobre fazer o que importa antes que o imprevisto tome o tempo todo.</p>' +
          '<p>Neste artigo voce vai encontrar um metodo simples, passo a passo, para sair do caos e construir uma semana que funciona — mesmo que voce nunca tenha planejado antes.</p>' +
          '<h2>1. Por que planejar a semana inteira</h2>' +
          '<p>O planejamento diario e reativo: voce acerta e decide o que fazer. O planejamento semanal e proativo: voce define a direcao antes de comecar. Pessoas que planejam a semana inteira tendem a concluir mais tarefas importantes e sentem menos ansiedade, porque sabem que ha espaco reservado para cada coisa.</p>' +
          '<p>Quando voce planeja sete dias de uma vez, enxerga conflitos de agenda antes que eles virem problemas. Ve tambem onde pode agrupar tarefas similares — como responder e-mails, fazer compras ou estudar — para economizar energia mental.</p>' +
          '<h2>2. Faca um raio-X da semana anterior</h2>' +
          '<p>Antes de planejar a proxima semana, reserve 15 minutos para revisar a que terminou. Pergunte-se:</p>' +
          '<ul><li>Quais tarefas foram concluidas?</li>' +
          '<li>Quais ficaram pendentes e por quê?</li>' +
          '<li>Onde perdi mais tempo sem querer?</li>' +
          '<li>Qual foi a atividade que mais agregou valor?</li></ul>' +
          '<p>Esse raio-X evita o erro de repetir os mesmos padroes. Se toda semana voce percebe que gasta duas horas em redes sociais a noite, ja sabe onde agir.</p>' +
          '<h2>3. Defina de 1 a 3 prioridades da semana</h2>' +
          '<p>O maior erro do planejamento e querer fazer tudo. Escolha de uma a tres prioridades — aquelas que, se concluidas, tornam a semana um sucesso. Nao sao tarefas quaisquer; sao objetivos que movem sua vida ou trabalho para frente.</p>' +
          '<p>Escreva cada prioridade em uma frase curta, por exemplo: "Finalizar a proposta do projeto X" ou "Reorganizar as financas pessoais". Se nao consegue resumir em uma frase, a prioridade ainda esta confusa.</p>' +
          '<h2>4. Bloqueie tempo no calendario</h2>' +
          '<p>Para cada prioridade, reserve um bloco de tempo no calendario. Trate esse bloco como uma reuniao inegociavel consigo mesmo. Se alguem perguntar se voce esta livre naquele horario, a resposta e nao.</p>' +
          '<p>O bloco de tempo transforma uma prioridade abstrata em uma acao concreta. "Estudar ingles" vira "Estudar ingles terca e quinta, das 19h as 20h". O cerebro executa muito melhor quando ha um quando e um onde.</p>' +
          '<h2>5. Agrupe tarefas similares</h2>' +
          '<p>Alternar entre contextos diferentes custa energia mental. Em vez de responder um e-mail, depois fazer uma ligacao, depois escrever um texto e depois responder outro e-mail, agrupe: reserve um bloco so para e-mails, outro para ligacoes, outro para trabalho profundo.</p>' +
          '<p>Esse agrupamento — chamado de <em>batching</em> — reduz a fadiga e libera espaco mental para o que exige foco.</p>' +
          '<h2>6. Deixe espaco para o imprevisto</h2>' +
          '<p>Nunca preencha 100% da semana. Deixe pelo menos 20% livre para emergencias e oportunidades. Se nada surgir, use esse tempo para adiantar trabalho ou descansar — algo que tambem e produtivo.</p>' +
          '<p>Uma semana sem margem e uma semana fragil: um imprevisto derruba todo o plano. A margem e o que mantem o sistema funcionando quando a realidade nao obedece.</p>' +
          '<h2>7. Revise e ajuste no domingo a noite</h2>' +
          '<p>Reserve 30 minutos no domingo para revisar o plano da semana. Confira se as prioridades ainda fazem sentido, se os blocos de tempo estao marcados e se ha algo esquecido. E o momento de ajustar antes que a semana comece.</p>' +
          '<p>Durante essa revisao, vale conferir tambem o seu <a href="/blog/checklist-organizacao-pessoal">checklist de organizacao pessoal semanal</a> — ele ajuda a garantir que nada importante ficou para tras em tarefas, documentos, financas e rotina.</p>' +
          '<h2>Checklist rapido: sua semana em 7 passos</h2>' +
          '<ul><li>Revise a semana anterior (15 min)</li>' +
          '<li>Escolha de 1 a 3 prioridades</li>' +
          '<li>Bloqueie tempo no calendario para cada uma</li>' +
          '<li>Agrupe tarefas similares (e-mails, ligacoes, estudo)</li>' +
          '<li>Deixe 20% da agenda livre para imprevistos</li>' +
          '<li>Defina um horario fixo de revisao no domingo</li>' +
          '<li>Comece a segunda-feira ja sabendo as 3 primeiras acoes do dia</li></ul>' +
          '<h2>Conclusao</h2>' +
          '<p>Organizar a rotina semanal nao exige ferramentas complexas nem horas de planejamento. Exige clareza sobre o que importa, disciplina para reservar tempo e margem para o que foge do controle. Comece com uma prioridade nesta semana. Na proxima, adicione outra. Em poucos semanas, voce tera um sistema que funciona de verdade. E se quiser um ponto de partida pratico, confira tambem o nosso <a href="/blog/checklist-organizacao-pessoal">checklist de organizacao pessoal</a> para revisar tudo o que precisa estar em ordem.</p>' +
          '<div style="margin-top:2.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--primary)/0.08);border:1px solid hsl(var(--primary)/0.2);text-align:center">' +
          '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Baixe o Planner Semanal Inteligente gratuito</h3>' +
          '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">Aplique este metodo hoje com um template pronto para uso.</p>' +
          '<a href="/ferramentas-gratuitas" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Baixar Planner Semanal</a>' +
          '</div>',
      },
      {
        title: 'Checklist de organizacao pessoal: o que revisar toda semana',
        slug: 'checklist-organizacao-pessoal',
        category: 'Organização Pessoal',
        readingTime: 8,
        publishedAt: dateAgo(2),
        featuredImage: 'https://img.usecurling.com/p/800/400?q=personal%20organization&dpr=2',
        excerpt:
          'Veja um checklist de organizacao pessoal para revisar tarefas, documentos, financas, rotina e prioridades toda semana.',
        content:
          '<p>A organizacao pessoal nao e um estado permanente — e uma pratica. Por mais que voce arrume tudo em um dia, a vida segue acontecendo: tarefas se acumulam, contas chegam, compromissos surgem. A unica forma de manter o controle e revisar com regularidade. E o intervalo ideal para essa revisao e a semana.</p>' +
          '<p>Este checklist reune o que mais impacta a organizacao pessoal quando revisado toda semana. Nao precisa fazer tudo de uma vez — comece com uma secao e adicione as outras ao longo do tempo.</p>' +
          '<h2>1. Tarefas e compromissos</h2>' +
          '<p>Antes de qualquer coisa, olhe para sua lista de tarefas. Remova o que ja foi feito, atualize prazos e identifique o que ficou parado ha mais de duas semanas — provavelmente nao e tao importante ou precisa ser reagendado com intencao.</p>' +
          '<ul><li>Quantas tarefas ficaram pendentes?</li>' +
          '<li>Qual e a proxima acao de cada projeto aberto?</li>' +
          '<li>Ha compromissos fixos que precisam ser confirmados?</li></ul>' +
          '<h2>2. Escolha o que precisa ser resolvido</h2>' +
          '<p>Nem toda pendencia merece atencao imediata. Separe o que e urgente do que so parece urgente. Se voce tem dificuldade em definir prioridades dentro de uma semana cheia, vale conferir como <a href="/blog/como-organizar-rotina-semanal">organizar a rotina semanal do zero</a> — la voce encontra um metodo simples para escolher as prioridades certas e bloquear tempo para cada uma.</p>' +
          '<p>A pergunta-chave e: "Se eu so pudesse resolver tres coisas esta semana, quais seriam?" Escolha essas tres e coloque-as no topo da lista.</p>' +
          '<h2>3. Documentos e arquivos</h2>' +
          '<p>Dedique 10 minutos para organizar documentos — fisicos e digitais. arquive o que foi processado, delete o que nao serve mais e verifique se ha documentos importantes vencendo (contratos, certidoes, garantias).</p>' +
          '<ul><li>Ha contas ou boletos para pagar esta semana?</li>' +
          '<li>Existem arquivos na area de trabalho ou na pasta de downloads que precisam ser organizados?</li>' +
          '<li>Alguns documentos precisam ser digitalizados ou guardados?</li></ul>' +
          '<h2>4. Financas</h2>' +
          '<p>Revisar as financas toda semana evita surpresas no fim do mes. Confira os gastos da semana, compare com o orcamento planejado e ajuste se necessario.</p>' +
          '<ul><li>Quanto foi gasto ate agora?</li>' +
          '<li>Ha assinaturas ou servicos que nao uso mais e posso cancelar?</li>' +
          '<li>Ja separei o valor da poupanca deste mes?</li></ul>' +
          '<p>Esse habito simples de 10 minutos por semana e mais eficaz do que passar horas organizando tudo de uma vez no fim do mes.</p>' +
          '<h2>5. Rotina e habitos</h2>' +
          '<p>A organizacao pessoal tambem envolve cuidar de si. Revise como estao seus habitos: sono, alimentacao, exercicio, tempo de tela. Nao para cobrar perfeicao, mas para identificar o que esta desalinhado com seus objetivos.</p>' +
          '<ul><li>Quantas noites dormi bem esta semana?</li>' +
          '<li>Estou fazendo alguma atividade fisica regular?</li>' +
          '<li>O tempo de tela esta prejudicando meu sono?</li></ul>' +
          '<h2>6. Casa e ambiente</h2>' +
          '<p>Um ambiente organizado reduz o estresse visual e mental. Faca uma checagem rapida dos espacos que mais usamos: cozinha, quarto e area de trabalho.</p>' +
          '<ul><li>Ha algo quebrado que precisa ser consertado?</li>' +
          '<li>A geladeira precisa ser limpa ou abastecida?</li>' +
          '<li>Existe acumulo de coisas que podem ser doadas ou descartadas?</li></ul>' +
          '<h2>7. Relacionamentos e bem-estar</h2>' +
          '<p>Organizacao pessoal nao e so tarefas e documentos. Envolve tambem manter conexoes e cuidar da saude mental.</p>' +
          '<ul><li>Ha alguem que eu preciso ligar ou responder?</li>' +
          '<li>Reservei tempo para lazer ou descanso esta semana?</li>' +
          '<li>Estou me sentindo sobrecarregado? Preciso pedir ajuda?</li></ul>' +
          '<h2>8. Revisao e planejamento da proxima semana</h2>' +
          '<p>Para fechar o checklist, reserve 15 minutos para planejar a proxima semana. Defina as prioridades, bloqueie tempo no calendario e confira se ha conflitos de agenda. Esse pequeno habito no domingo a noite transforma a forma como a semana comeca.</p>' +
          '<h2>Checklist rapido para imprimir ou salvar</h2>' +
          '<ul><li>[ ] Revisar tarefas pendentes e atualizar prazos</li>' +
          '<li>[ ] Escolher 3 prioridades da semana</li>' +
          '<li>[ ] Organizar documentos fisicos e digitais</li>' +
          '<li>[ ] Conferir gastos e pagar contas da semana</li>' +
          '<li>[ ] Avaliar habitos: sono, alimentacao, exercicio</li>' +
          '<li>[ ] Limpar e organizar um ambiente da casa</li>' +
          '<li>[ ] Responder mensagens importantes</li>' +
          '<li>[ ] Reservar tempo para lazer</li>' +
          '<li>[ ] Planejar a proxima semana (15 min no domingo)</li></ul>' +
          '<h2>Conclusao</h2>' +
          '<p>Revisar a organizacao pessoal toda semana nao e sobre perfeicao — e sobre consistencia. Pequenas revisoes de 20 a 30 minutos, feitas regularmente, impedem que o caos se instale. Comece com uma secao deste checklist e adicione as outras aos poucos. Em poucas semanas, a pratica se torna automatica e voce sente a diferenca.</p>' +
          '<div style="margin-top:2.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--primary)/0.08);border:1px solid hsl(var(--primary)/0.2);text-align:center">' +
          '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Baixe o Checklist da Vida Organizada gratuito</h3>' +
          '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">Revise suas pendencias com clareza usando um template pronto.</p>' +
          '<a href="/ferramentas-gratuitas" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Baixar Checklist da Vida Organizada</a>' +
          '</div>',
      },
      {
        title: 'Como criar uma rotina matinal produtiva sem acordar 5h da manha',
        slug: 'rotina-matinal-produtiva',
        category: 'Hábitos',
        readingTime: 7,
        publishedAt: dateAgo(1),
        featuredImage: 'https://img.usecurling.com/p/800/400?q=morning%20routine%20peaceful&dpr=2',
        excerpt:
          'Aprenda como criar uma rotina matinal produtiva, realista e leve, sem precisar acordar 5h da manha ou seguir regras impossiveis.',
        content:
          '<p>Existe um mito de que toda pessoa produtiva acorda as 5h da manha, medita por uma hora, corre 10 km e toma um smoothie verde antes de comecar a trabalhar. A verdade e que a maioria das pessoas nao funciona assim — e tentar seguir essa formula so gera frustracao e cansaco.</p>' +
          '<p>Uma rotina matinal produtiva nao depende de acordar cedo demais. Depende de comecar o dia com intencao, fazendo algumas coisas simples que preparam o corpo e a mente para o que vem a seguir. Neste artigo voce vai montar uma rotina realista, leve e eficaz.</p>' +
          '<h2>1. Comece definindo o por que</h2>' +
          '<p>Antes de escolher o que fazer de manha, pergunte-se: por que quero uma rotina matinal? Quer ter mais energia? Reduzir a ansiedade? Comecar o dia ja sabendo o que fazer? O seu "por que" define quais habitos fazem sentido para voce.</p>' +
          '<p>Quem quer mais energia pode priorizar movimento e hidratacao. Quem quer menos ansiedade pode priorizar respiracao e planejamento. Nao copie a rotina de outra pessoa — desenhe a sua a partir do seu objetivo.</p>' +
          '<h2>2. Hidrate-se antes de qualquer coisa</h2>' +
          '<p>Apos 7 a 8 horas de sono, o corpo esta desidratado. Beber um copo de agua (300 a 500 ml) assim que acordar e o habito mais simples e mais impactante de uma rotina matinal. Ativa o metabolismo, melhora a clareza mental e da energia imediata — tudo isso em 30 segundos.</p>' +
          '<p>Deixe um copo de agua ao lado da cama na noite anterior. E o gatilho perfeito: assim que sentar na cama, beba.</p>' +
          '<h2>3. Movimento leve, nao treino intenso</h2>' +
          '<p>Voce nao precisa ir a academia de manha para ter uma rotina produtiva. Cinco a dez minutos de alongamento, yoga ou uma caminhada curta ja sao suficientes para circular o sangue e despertar o corpo.</p>' +
          '<p>O objetivo nao e queimar calorias — e sinalizar ao cerebro que o dia comecou. Movimento leve faz isso sem o desgaste de um treino intenso, deixando energia para o resto do dia.</p>' +
          '<h2>4. Defina as prioridades do dia</h2>' +
          '<p>Reserve de 5 a 10 minutos para revisar o que precisa ser feito. Escreva as 3 prioridades do dia — nao uma lista de 20 tarefas, so tres. Se voce tem dificuldade em escolher tres, vale conferir como <a href="/blog/como-organizar-rotina-semanal">organizar a rotina semanal do zero</a> — la voce encontra um metodo para definir prioridades com clareza e bloquear tempo para cada uma.</p>' +
          '<p>Esse momento de planejamento e o que transforma uma manha intencional em um dia produtivo. Em vez de reagir ao que aparece, voce comeca sabendo o que importa.</p>' +
          '<h2>5. Evite o celular nos primeiros 30 minutos</h2>' +
          '<p>O maior sabotador da rotina matinal nao e a preguica — e o celular. Assim que voce abre as redes sociais ou o e-mail, o cerebro entra em modo reativo. Voce passa a responder demandas dos outros antes de pensar nas suas proprias prioridades.</p>' +
          '<p>Experimente deixar o celular longe da cama e nao toca-lo nos primeiros 30 minutos apos acordar. Se precisar de alarme, use um relogio ou coloque o celular em outro comodo.</p>' +
          '<h2>Erros comuns que destroem a rotina matinal</h2>' +
          '<ul><li><strong>Comecar grande demais:</strong> Querer acordar 1h mais cedo, meditar 30 min, treinar e ler. Comece com 10 minutos.</li>' +
          '<li><strong>Nao ter um plano:</strong> Acordar e decidir na hora o que fazer torna tudo mais dificil. Defina a rotina na noite anterior.</li>' +
          '<li><strong>Comparar com os outros:</strong> A rotina de um CEO nao serve para voce. Sirva-se do seu contexto, horario e energia.</li>' +
          '<li><strong>Desistir apos um dia ruim:</strong> Errou um dia? Tudo bem. Nunca erre dois seguidos. A consistencia e mais importante que a perfeicao.</li></ul>' +
          '<h2>Conclusao</h2>' +
          '<p>Uma rotina matinal produtiva nao precisa ser longa, intensa ou madrugadora. Precisa ser intencional. Hidratar, mover o corpo, definir prioridades e evitar o celular nos primeiros 30 minutos ja sao suficientes para transformar a forma como o dia comeca. Comece com um habito de 5 minutos esta semana. Na proxima, adicione outro. Em poucas semanas, voce tera uma manha que funciona — sem acordar 5h.</p>' +
          '<div style="margin-top:2.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--primary)/0.08);border:1px solid hsl(var(--primary)/0.2);text-align:center">' +
          '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Baixe o Checklist da Rotina Matinal Ideal gratuito</h3>' +
          '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">Comece com uma rotina simples usando um template pronto para usar.</p>' +
          '<a href="/ferramentas-gratuitas" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Baixar Checklist da Rotina Matinal</a>' +
          '</div>',
      },
    ]

    for (var i = 0; i < articlesData.length; i++) {
      var a = articlesData[i]
      try {
        app.findFirstRecordByData('articles', 'slug', a.slug)
      } catch (_) {
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
  },
  (app) => {
    var slugs = [
      'como-organizar-rotina-semanal',
      'checklist-organizacao-pessoal',
      'rotina-matinal-produtiva',
    ]
    for (var i = 0; i < slugs.length; i++) {
      try {
        var record = app.findFirstRecordByData('articles', 'slug', slugs[i])
        app.delete(record)
      } catch (_) {}
    }
  },
)
