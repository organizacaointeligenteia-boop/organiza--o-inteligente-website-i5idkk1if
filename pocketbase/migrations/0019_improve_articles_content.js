migrate(
  (app) => {
    var articlesCol = app.findCollectionByNameOrId('articles')

    // Add updatedAt field to articles if not present
    if (!articlesCol.fields.getByName('updatedAt')) {
      articlesCol.fields.add(
        new TextField({
          name: 'updatedAt',
          required: false,
        }),
      )
      app.save(articlesCol)
    }

    // 1. Article: como-organizar-rotina-semanal
    var rotinaContent =
      '<p>Se você olha para a semana que começa e sente que tudo é urgente, você não está sozinho. A maioria das pessoas começa a segunda-feira sem um plano claro, apenas reagindo ao que surge no caminho. O resultado é uma sensação constante de correria e pouco progresso nas coisas que realmente importam. Organizar a rotina semanal não é tentar fazer tudo em ritmo acelerado — é definir com antecedência o que merece seu tempo antes que as urgências consumam todos os seus dias.</p>' +
      '<p>Neste artigo, você vai encontrar um método simples e flexível para planejar sua semana, mesmo com horários irregulares, trabalho em turnos ou responsabilidades com a família.</p>' +
      '<h2>1. Por que olhar para a semana inteira traz mais clareza</h2>' +
      '<p>O planejamento diário costuma ser reativo: você senta na mesa pela manhã e decide na hora o que vai encarar. Já o planejamento semanal permite enxergar o panorama geral antes de começar a execução. Olhando para os próximos sete dias, você consegue identificar com antecedência compromissos fixos, períodos de maior cansaço e conflitos de agenda antes que eles virem dores de cabeça.</p>' +
      '<p>Além disso, planejar a semana permite agrupar tarefas semelhantes — como responder mensagens acumuladas, fazer compras para a casa ou organizar notas — economizando energia mental e reduzindo a dispersão.</p>' +
      '<h2>2. Faça uma revisão rápida da semana anterior</h2>' +
      '<p>Antes de desenhar novos planos, dedique cerca de 15 minutos para entender como foram seus últimos dias. Pergunte-se com honestidade:</p>' +
      '<ul><li>Quais compromissos e tarefas foram concluídos com sucesso?</li>' +
      '<li>O que acabou ficando para trás e qual foi o motivo real?</li>' +
      '<li>Onde houve desperdício involuntário de tempo ou energia?</li>' +
      '<li>Qual atividade gerou o maior avanço prático na sua rotina?</li></ul>' +
      '<p>Essa checagem simples evita repetir erros sucessivos. Se você nota que compromissos no fim da tarde sempre são interrompidos, já sabe que não deve agendar tarefas críticas para esse horário.</p>' +
      '<h2>3. Defina de 1 a 3 prioridades essenciais para a semana</h2>' +
      '<p>Um dos maiores motivos de frustração é montar listas com dezenas de tarefas. Em vez de tentar abraçar o mundo, selecione de uma a três prioridades claras para a semana — aquelas entregas ou ações que realmente fazem diferença se forem cumpridas.</p>' +
      '<p>Escreva cada uma de forma direta e objetiva, como por exemplo: "Revisar relatório financeiro do mês" ou "Agendar consultas preventivas da família". Se a prioridade não puder ser resumida em uma frase simples, divida-a em etapas menores.</p>' +
      '<h2>4. Exemplo fictício: aplicando o método na prática</h2>' +
      '<p>Para entender como transformar intenções em ações viáveis, veja este exemplo de planejamento semanal de uma rotina real:</p>' +
      '<div style="margin:1.5rem 0;padding:1.5rem;border-radius:0.75rem;background:hsl(var(--secondary)/0.5);border:1px solid hsl(var(--border))">' +
      '<h4 style="margin:0 0 0.75rem;font-weight:700">Cenário semanal de exemplo</h4>' +
      '<ul>' +
      '<li><strong>Prioridade 1:</strong> Concluir a minuta da proposta comercial do Cliente A.</li>' +
      '<li><em>Primeira ação:</em> Abrir o modelo padrão e preencher o resumo de requisitos (45 min na terça-feira, das 09h às 09h45).</li>' +
      '<li><em>Duração e bloco:</em> Bloco total de 2 horas na terça-feira pela manhã, com revisão final na quinta-feira à tarde (1 hora).</li>' +
      '<li><strong>Prioridade 2:</strong> Reorganizar os comprovantes fiscais e emitir certidões do trimestre.</li>' +
      '<li><em>Primeira ação:</em> Baixar os PDFs da pasta de downloads e separar por mês (30 min na quarta-feira, das 14h às 14h30).</li>' +
      '<li><em>Duração e bloco:</em> Bloco único de 1h30 na quarta-feira.</li>' +
      '<li><strong>Prioridade 3:</strong> Manter 3 sessões de caminhada de 30 minutos na semana.</li>' +
      '<li><em>Primeira ação:</em> Deixar o calçado e a roupa separados na véspera (segunda, quarta e sexta às 07h).</li>' +
      '<li><em>Margem reservada:</em> Quinta e sexta-feira com a última hora do dia totalmente livre para ajustes e imprevistos.</li>' +
      '</ul>' +
      '</div>' +
      '<h2>5. Como reagendar se você perder um dia inteiro</h2>' +
      '<p>Imprevistos acontecem com todo mundo: um filho adoece, um chamado urgente surge no trabalho ou a exaustão pede repouso. Se você perder um dia ou a rotina desandar, não desista de toda a semana nem tente compensar tudo trabalhando noites em claro. Siga este roteiro simples:</p>' +
      '<ol>' +
      '<li><strong>Pause e aceite o atraso:</strong> Reconheça que imprevistos fazem parte da vida. Não tente encaixar um dia inteiro perdido em poucas horas extras.</li>' +
      '<li><strong>Proteja apenas a prioridade número 1:</strong> Olhe para as 3 prioridades e escolha a mais crítica. Mova o bloco dela para a margem da semana.</li>' +
      '<li><strong>Passe tarefas secundárias para a semana seguinte:</strong> Pendências que não causam impacto grave imediato podem ser adiadas sem culpa.</li>' +
      '<li><strong>Retome no dia seguinte sem culpa:</strong> O valor do planejamento não está em um histórico perfeito, mas na capacidade de se reorientar rapidamente.</li>' +
      '</ol>' +
      '<h2>6. Planejamento flexível para quem trabalha em turnos ou cuida da família</h2>' +
      '<p>Planejamento semanal não precisa de uma grade rígida de 8h às 18h de segunda a sexta. Se você trabalha por escalas, tem plantões noturnos ou divide o tempo com cuidados domésticos e filhos, use estas orientações adaptadas:</p>' +
      '<ul>' +
      '<li><strong>Planeje por janelas de energia, não por horas fixas:</strong> Se o seu sono varia por conta de plantões, identifique quando você costuma estar mais alerta e concentre ali sua primeira ação do dia.</li>' +
      '<li><strong>Use os tempos de revisão como referência, não imposição:</strong> Sugestões de 30 minutos de revisão e 20% de margem livre são apenas pontos de partida. Para muitas pessoas, uma revisão objetiva de 10 minutos já resolve o suficiente. Adapte os números à sua realidade.</li>' +
      '<li><strong>Blocos pequenos funcionam:</strong> Se blocos de duas horas são impossíveis na sua casa, use blocos de 20 a 30 minutos focados. Duas sessões curtas e bem direcionadas avançam mais do que uma lista interminável.</li>' +
      '</ul>' +
      '<h2>Checklist prático: estruturando sua semana</h2>' +
      '<ul>' +
      '<li>[ ] Olhar rapidamente a semana anterior e identificar o que ficou pendente</li>' +
      '<li>[ ] Escolher de 1 a 3 prioridades reais para os próximos dias</li>' +
      '<li>[ ] Definir a primeira ação prática de cada prioridade com duração estimada</li>' +
      '<li>[ ] Alocar blocos de tempo flexíveis na agenda</li>' +
      '<li>[ ] Reservar uma margem livre na semana para acomodar imprevistos e descanso</li>' +
      '<li>[ ] Revisar o plano no momento da semana que fizer mais sentido para a sua rotina</li>' +
      '</ul>' +
      '<h2>Perguntas frequentes (FAQ)</h2>' +
      '<h3>Qual é o melhor dia para planejar a semana?</h3>' +
      '<p>Muitas pessoas preferem o domingo à noite para começar a segunda já com foco, enquanto outras preferem a sexta-feira no final do expediente ou a própria segunda pela manhã. Escolha o horário em que você tem menos interrupções e mente descansada.</p>' +
      '<h3>O que fazer se surgirem novas tarefas urgentes durante a semana?</h3>' +
      '<p>Anote a nova demanda antes de executá-la. Avalie se ela é realmente urgente ou se pode ser encaixada no bloco de margem ou na semana seguinte. Se precisar atender na hora, substitua uma tarefa de menor peso em vez de acumular as duas.</p>' +
      '<h3>Preciso usar aplicativo ou papel?</h3>' +
      '<p>A ferramenta menos importante é a mídia. Caderno de anotações, planner impresso ou aplicativos de calendário funcionam igualmente bem. O essencial é manter o registro visível e consultar com frequência.</p>' +
      '<h2>Conclusão</h2>' +
      '<p>Organizar a rotina semanal é um processo contínuo de adaptação. Pequenos ajustes feitos com consistência ajudam a diminuir a sobrecarga e trazem previsibilidade para o dia a dia. Comece escolhendo uma prioridade principal nesta semana e construa seu ritmo aos poucos. Se quiser uma estrutura para acompanhar suas pendências em diferentes áreas, veja também nosso <a href="/blog/checklist-organizacao-pessoal">checklist de organização pessoal</a>.</p>' +
      '<div style="margin-top:2.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--primary)/0.08);border:1px solid hsl(var(--primary)/0.2);text-align:center">' +
      '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Quer começar com um material gratuito?</h3>' +
      '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">Baixe gratuitamente nossos planners, guias e planilhas para organizar tarefas e hábitos no seu ritmo.</p>' +
      '<a href="/ferramentas-gratuitas" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Ver Ferramentas Gratuitas</a>' +
      '</div>' +
      '<div style="margin-top:1.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--secondary)/0.6);border:1px solid hsl(var(--border));text-align:center">' +
      '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Precisa de um sistema passo a passo completo?</h3>' +
      '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">Conheça o Kit Organização Inteligente por R$ 29,90 à vista: workbook em PDF de 26 páginas com os 7 modelos integrados, apresentação visual e vídeo introdutório na área de membros.</p>' +
      '<a href="/kit-organizacao-inteligente" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Conhecer o Kit (R$ 29,90)</a>' +
      '</div>'

    try {
      var rotinaRecord = app.findFirstRecordByData(
        'articles',
        'slug',
        'como-organizar-rotina-semanal',
      )
      rotinaRecord.set('content', rotinaContent)
      rotinaRecord.set('updatedAt', '2026-07-02 10:00:00.000Z')
      app.save(rotinaRecord)
    } catch (_) {}

    // 2. Article: checklist-organizacao-pessoal
    var checklistContent =
      '<p>A organização pessoal não é um estado permanente ou uma meta que você conclui uma única vez — é uma prática contínua de alinhamento. Conforme os dias passam, compromissos surgem, mensagens se acumulam e documentos chegam. Sem um momento de pausa para rever as áreas da vida, é natural sentir que os detalhes estão escapando pelo controle.</p>' +
      '<p>Diferente de um guia de rotina semanal (que se concentra em montar a agenda de cada dia e alocar blocos de foco), este checklist funciona como uma revisão panorâmica por áreas da vida. A ideia é fazer um inventário consciente de pendências, prazos e prioridades em cada setor, definindo sempre a próxima ação física para manter tudo em ordem e sem sobrecarga.</p>' +
      '<p><em>Nota de transparência:</em> as orientações a seguir têm finalidade prática e educativa sobre organização pessoal. Não constituem aconselhamento médico, psicológico, financeiro ou jurídico, nem prometem resultados milagrosos ou garantidos.</p>' +
      '<h2>1. Revisão de tarefas e projetos abertos</h2>' +
      '<p>Olhe para suas anotações e listas de trabalho ou estudo. Limpe tarefas já finalizadas, reagende prazos desatualizados e identifique projetos paralisados.</p>' +
      '<ul>' +
      '<li><strong>Exemplo de prioridade:</strong> Destravar a entrega do projeto em equipe.</li>' +
      '<li><strong>Próxima ação:</strong> Escrever um e-mail de 3 linhas alinhando quem envia a parte final até quarta-feira às 15h.</li>' +
      '<li><strong>Pergunta guia:</strong> Quais são os 2 projetos que mais exigem atenção prática nesta semana?</li>' +
      '</ul>' +
      '<h2>2. Organização do ambiente físico e espaço de trabalho</h2>' +
      '<p>O espaço físico ao redor influencia diretamente a facilidade de concentração. Dedique uma checagem rápida para organizar as superfícies que você mais utiliza no dia a dia.</p>' +
      '<ul>' +
      '<li><strong>Exemplo de prioridade:</strong> Manter a mesa de trabalho livre de papéis soltos e objetos acumulados.</li>' +
      '<li><strong>Próxima ação:</strong> Recolher xícaras, descartar rascunhos velhos e guardar o material de escritório na gaveta (10 min).</li>' +
      '<li><strong>Pergunta guia:</strong> Há itens espalhados pela casa ou escritório que estão gerando atrito diário?</li>' +
      '</ul>' +
      '<h2>3. Gestão de documentos, arquivos digitais e caixas de entrada</h2>' +
      '<p>Arquivos desorganizados e downloads acumulados tomam tempo precioso quando precisamos encontrar um comprovante ou documento urgente.</p>' +
      '<ul>' +
      '<li><strong>Exemplo de prioridade:</strong> Organizar comprovantes de despesas e esvaziar a pasta temporária de downloads.</li>' +
      '<li><strong>Próxima ação:</strong> Mover os arquivos úteis da semana para a pasta correta na nuvem e apagar os temporários (15 min).</li>' +
      '<li><strong>Pergunta guia:</strong> Há algum documento com prazo de renovação, certidão ou garantia que vence neste mês?</li>' +
      '</ul>' +
      '<h2>4. Revisão financeira de rotina</h2>' +
      '<p>Uma revisão financeira pessoal regular busca apenas trazer previsibilidade para o orçamento, sem fórmulas mágicas ou consultorias de investimento.</p>' +
      '<ul>' +
      '<li><strong>Exemplo de prioridade:</strong> Acompanhar os vencimentos das faturas da semana e verificar lançamentos desconhecidos.</li>' +
      '<li><strong>Próxima ação:</strong> Abrir o aplicativo bancário, agendar pagamentos da semana e registrar no controle pessoal (10 min).</li>' +
      '<li><strong>Pergunta guia:</strong> Existem assinaturas ou serviços recorrentes que você não utiliza mais e pode pausar?</li>' +
      '</ul>' +
      '<h2>5. Cuidados pessoais, descanso e energia</h2>' +
      '<p>Nenhum sistema de organização se sustenta se você estiver operando no limite da exaustão. Avalie como foram seus hábitos de descanso e alimentação básica.</p>' +
      '<ul>' +
      '<li><strong>Exemplo de prioridade:</strong> Proteger horários mínimos de sono e manter hidratação regular.</li>' +
      '<li><strong>Próxima ação:</strong> Definir um horário limite para desligar telas e deixar a garrafa de água abastecida no início do dia.</li>' +
      '<li><strong>Pergunta guia:</strong> Você reservou momentos reais de descanso e lazer sem cobrança nesta semana?</li>' +
      '</ul>' +
      '<h2>6. Relações interpessoais e compromissos familiares</h2>' +
      '<p>Organização pessoal também abrange manter contato com pessoas queridas e acompanhar compromissos familiares sem correria.</p>' +
      '<ul>' +
      '<li><strong>Exemplo de prioridade:</strong> Responder mensagens pendentes de amigos ou familiares.</li>' +
      '<li><strong>Próxima ação:</strong> Enviar uma mensagem curta de retorno para as conversas que ficaram em aberto no final de semana (10 min).</li>' +
      '<li><strong>Pergunta guia:</strong> Há algum aniversário, evento escolar ou compromisso familiar agendado para os próximos dias?</li>' +
      '</ul>' +
      '<h2>Checklist consolidado por áreas para revisão semanal</h2>' +
      '<div style="margin:1.5rem 0;padding:1.5rem;border-radius:0.75rem;background:hsl(var(--secondary)/0.5);border:1px solid hsl(var(--border))">' +
      '<ul style="margin:0;padding-left:1.25rem">' +
      '<li>[ ] <strong>Tarefas:</strong> atualizar status dos projetos e definir a próxima ação física de cada pendência</li>' +
      '<li>[ ] <strong>Ambiente:</strong> organizar a superfície da mesa de trabalho e recolher itens fora do lugar</li>' +
      '<li>[ ] <strong>Documentos:</strong> esvaziar a pasta de downloads e arquivar notas fiscais ou comprovantes importantes</li>' +
      '<li>[ ] <strong>Finanças:</strong> agendar pagamentos da semana e verificar se há cobranças indevidas</li>' +
      '<li>[ ] <strong>Cuidados:</strong> planejar pausas e reservar tempo para descanso ao longo dos dias</li>' +
      '<li>[ ] <strong>Conexões:</strong> responder mensagens importantes que ficaram acumuladas</li>' +
      '</ul>' +
      '</div>' +
      '<h2>Como transformar a revisão em um hábito regular</h2>' +
      '<p>Para que o checklist não se torne mais uma obrigação pesada, adote uma postura gradual: você não precisa revisar todas as seis áreas toda semana com a mesma profundidade. Em semanas mais corridas, escolher duas áreas principais para uma checagem rápida de 15 minutos já é suficiente para evitar que pendências se acumulem.</p>' +
      '<p>Se você deseja planejar como encaixar essas ações nos seus dias com blocos de tempo flexíveis, confira nosso guia sobre como <a href="/blog/como-organizar-rotina-semanal">organizar a rotina semanal do zero</a>.</p>' +
      '<h2>Perguntas frequentes sobre o checklist</h2>' +
      '<h3>Quanto tempo leva para passar por todas as áreas?</h3>' +
      '<p>Geralmente entre 20 e 30 minutos quando você já tem o hábito consolidado. Se estiver começando agora, faça uma área por dia para não gerar sobrecarga mental.</p>' +
      '<h3>O que fazer se uma área estiver totalmente acumulada?</h3>' +
      '<p>Não tente resolver meses de desordem em uma única sessão. Escolha apenas uma próxima ação simples (por exemplo: organizar apenas a gaveta superior ou categorizar apenas as despesas dos últimos 7 dias) e comemore o avanço.</p>' +
      '<h2>Conclusão</h2>' +
      '<p>Revisar a vida por áreas é uma bússola para identificar desequilíbrios antes que virem crises. Com passos realistas e sem expectativas irreais de perfeição, a organização se torna um suporte para o seu bem-estar diário.</p>' +
      '<div style="margin-top:2.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--primary)/0.08);border:1px solid hsl(var(--primary)/0.2);text-align:center">' +
      '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Explore nossas ferramentas gratuitas</h3>' +
      '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">Baixe planners, checklists imprimíveis e planilhas de rotina gratuitos para aplicar hoje mesmo.</p>' +
      '<a href="/ferramentas-gratuitas" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Acessar Ferramentas Gratuitas</a>' +
      '</div>' +
      '<div style="margin-top:1.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--secondary)/0.6);border:1px solid hsl(var(--border));text-align:center">' +
      '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Quer a estrutura completa pronta para usar?</h3>' +
      '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">O Kit Organização Inteligente reúne o workbook em PDF de 26 páginas com 7 modelos integrados, apresentação visual e vídeo introdutório na área de membros por R$ 29,90 à vista.</p>' +
      '<a href="/kit-organizacao-inteligente" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Ver Detalhes do Kit (R$ 29,90)</a>' +
      '</div>'

    try {
      var checkRecord = app.findFirstRecordByData(
        'articles',
        'slug',
        'checklist-organizacao-pessoal',
      )
      checkRecord.set('content', checklistContent)
      checkRecord.set('updatedAt', '2026-07-02 10:00:00.000Z')
      app.save(checkRecord)
    } catch (_) {}
  },
  (app) => {
    // down migration
  },
)
