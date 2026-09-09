migrate(
  (app) => {
    // Content-only migration: No schema changes, no hooks, no RD Station logic.
    // 1) Adjustments in "como-organizar-rotina-semanal"
    // 2) Adjustments in "checklist-organizacao-pessoal"
    // 3) Insert 18th article "como-organizar-documentos-digitais-em-pastas"

    var rotinaContent =
      '<p>Se você olha para a semana que começa e sente que tudo é urgente, você não está sozinho. Talvez você comece a segunda-feira sem um plano claro, apenas reagindo ao que surge no caminho. O resultado é uma sensação constante de correria e pouco progresso nas coisas que realmente importam. Organizar a rotina semanal não é tentar fazer tudo em ritmo acelerado — é definir com antecedência o que merece seu tempo antes que as urgências consumam todos os seus dias.</p>' +
      '<p>Neste artigo, você vai encontrar um método simples e flexível para planejar sua semana, mesmo com horários irregulares, trabalho em turnos ou responsabilidades com a família.</p>' +
      '<h2>1. Por que olhar para a semana inteira traz mais clareza</h2>' +
      '<p>Enquanto olhar apenas para o dia isolado pode limitar sua visão aos acontecimentos imediatos, o planejamento semanal permite enxergar o panorama geral antes de começar a execução. Olhando para os próximos sete dias, você consegue identificar com antecedência compromissos fixos, períodos de maior cansaço e conflitos de agenda antes que eles virem dores de cabeça.</p>' +
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
      '<h2>4. Exemplo prático: aplicando o método em um cenário fictício</h2>' +
      '<p>Para entender como transformar intenções em ações viáveis, veja este exemplo de planejamento semanal em um cenário fictício:</p>' +
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
      '<p>Cada formato tem vantagens; o importante é escolher o que você consegue manter de forma consistente no seu dia a dia.</p>' +
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
      rotinaRecord.set('updatedAt', '08/09/2026')
      app.save(rotinaRecord)
    } catch (_) {}

    var checklistContent =
      '<p>A organização pessoal não é um estado permanente ou uma meta que você conclui uma única vez — é uma prática contínua de alinhamento. Conforme os dias passam, compromissos surgem, mensagens se acumulam e documentos chegam. Sem um momento de pausa para rever as áreas da vida, é natural sentir que os detalhes estão escapando pelo controle.</p>' +
      '<p>Diferente de um guia de rotina semanal (que se concentra em montar a agenda de cada dia e alocar blocos de foco), este checklist funciona como uma revisão panorâmica por áreas da vida. A ideia é fazer um inventário consciente de pendências, prazos e prioridades em cada setor, definindo sempre a próxima ação física para manter tudo em ordem e sem sobrecarga.</p>' +
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
      '<li><strong>Próxima ação:</strong> Recolher xícaras, conferir o conteúdo e o backup antes de descartar papéis e guardar o material de escritório na gaveta (10 min).</li>' +
      '<li><strong>Pergunta guia:</strong> Há itens espalhados pela casa ou escritório que estão gerando atrito diário?</li>' +
      '</ul>' +
      '<h2>3. Gestão de documentos, arquivos digitais e caixas de entrada</h2>' +
      '<p>Arquivos desorganizados e downloads acumulados tomam tempo precioso quando precisamos encontrar um comprovante ou documento urgente.</p>' +
      '<ul>' +
      '<li><strong>Exemplo de prioridade:</strong> Organizar comprovantes de despesas e esvaziar a pasta temporária de downloads.</li>' +
      '<li><strong>Próxima ação:</strong> Mover os arquivos úteis da semana para a pasta correta na nuvem e conferir o conteúdo e o backup antes de qualquer exclusão dos temporários (15 min).</li>' +
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
      '<li>[ ] <strong>Documentos:</strong> esvaziar a pasta de downloads, conferir o conteúdo e o backup antes de qualquer exclusão e arquivar comprovantes importantes</li>' +
      '<li>[ ] <strong>Finanças:</strong> agendar pagamentos da semana e verificar se há cobranças indevidas</li>' +
      '<li>[ ] <strong>Cuidados:</strong> planejar pausas e reservar tempo para descanso ao longo dos dias</li>' +
      '<li>[ ] <strong>Conexões:</strong> responder mensagens importantes que ficaram acumuladas</li>' +
      '</ul>' +
      '</div>' +
      '<h2>Como transformar a revisão em um hábito regular</h2>' +
      '<p>Para que o checklist não se torne mais uma obrigação pesada, adote uma postura gradual: você não precisa revisar todas as seis áreas toda semana com a mesma profundidade. Em semanas mais corridas, escolher duas áreas principais para uma checagem rápida de 15 minutos é uma sugestão de duração; ajuste conforme sua semana para manter o ritmo sem cobrança excessiva.</p>' +
      '<p>Se você deseja planejar como encaixar essas ações nos seus dias com blocos de tempo flexíveis, confira nosso guia sobre como <a href="/blog/como-organizar-rotina-semanal">organizar a rotina semanal do zero</a>.</p>' +
      '<h2>Perguntas frequentes sobre o checklist</h2>' +
      '<h3>Quanto tempo leva para passar por todas as áreas?</h3>' +
      '<p>Comece com 20 a 30 minutos como um ponto de partida adaptável e ajuste o tempo conforme sua prática e a complexidade da sua semana.</p>' +
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
      checkRecord.set('updatedAt', '08/09/2026')
      app.save(checkRecord)
    } catch (_) {}

    // 3. Insert 18th article "como-organizar-documentos-digitais-em-pastas"
    var docsContent =
      '<p>Você precisa de um comprovante, mas encontra três versões na pasta Downloads, outra no celular e uma conversa que talvez contenha o arquivo certo. Organizar documentos digitais começa por resolver esse caminho: onde o arquivo entra, onde fica e como será encontrado depois.</p>' +
      '<p>A proposta deste guia é criar poucas pastas, adotar um padrão de nomes e reservar dez minutos para a manutenção. Esse tempo é uma rotina sugerida, não uma promessa de organizar todo o seu acervo em dez minutos. Comece pelos documentos que você usa agora; o restante pode entrar aos poucos. Simplificar a relação com arquivos também faz parte de cultivar uma <a href="/blog/minimalismo-digital-organize-vida-online">vida digital mais leve e organizada</a>.</p>' +
      '<h2>1. Escolha um lugar principal para consultar seus documentos</h2>' +
      '<p>Defina onde ficará seu arquivo de referência: uma pasta no computador ou uma área particular no serviço de armazenamento que você já utiliza. O critério é simples: você consegue acessar esse lugar quando precisa e sabe quem mais tem acesso?</p>' +
      '<p>Chame essa pasta de Documentos pessoais, por exemplo. Evite espalhar a mesma organização entre áreas de trabalho, aplicativos e contas diferentes. Se documentos profissionais precisam permanecer no ambiente da empresa, mantenha-os ali, seguindo as regras dela.</p>' +
      '<p>Antes de mover muitos arquivos, faça uma cópia de segurança. Depois, organize um pequeno grupo e confira se os documentos continuam abrindo. Não é necessário apagar os originais durante essa primeira etapa.</p>' +
      '<h2>2. Crie pastas pelo assunto que você procuraria</h2>' +
      '<p>Pense na pergunta que surge quando precisa do documento. Provavelmente é "onde está o comprovante da internet?" e não "onde estão meus PDFs?". Por isso, comece pelo assunto, não pelo formato do arquivo.</p>' +
      '<p>Este é um exemplo fictício para uma pessoa que cuida da casa e estuda:</p>' +
      '<pre><code>Documentos pessoais/\n' +
      '├── 00_Entrada/\n' +
      '├── Casa/\n' +
      '│   ├── Internet/\n' +
      '│   │   └── 2026/\n' +
      '│   └── Energia/\n' +
      '│       └── 2026/\n' +
      '├── Estudos/\n' +
      '│   └── Curso-de-fotografia/\n' +
      '│       ├── Materiais/\n' +
      '│       └── Certificado/\n' +
      '├── Projetos/\n' +
      '│   └── Reforma-da-cozinha/\n' +
      '│       ├── Orcamentos/\n' +
      '│       └── Comprovantes/\n' +
      '└── Arquivo/\n' +
      '    └── Projetos-concluidos/</code></pre>' +
      '<p>A pasta 00_Entrada recebe os documentos que ainda precisam ser classificados. Ela funciona como uma caixa de entrada temporária. O prefixo serve apenas para você reconhecê-la; não é uma regra obrigatória.</p>' +
      '<p>Crie uma pasta de ano quando isso ajudar a separar documentos recorrentes. Para três arquivos de um curso, talvez uma única pasta seja suficiente. Evite criar categorias vazias para todos os assuntos que poderiam existir.</p>' +
      '<p>Também não precisa copiar exatamente esse modelo. Se você procura tudo pelo projeto, use projetos. Se procura pelas áreas da vida, use áreas. A melhor estrutura é aquela que você consegue explicar sem consultar um manual.</p>' +
      '<h2>3. Dê ao arquivo um nome que conte o que ele é</h2>' +
      '<p>Um padrão inicial possível é: <code>AAAA-MM-DD_assunto_tipo.extensao</code></p>' +
      '<p>Exemplo fictício:</p>' +
      '<pre><code>2026-09-08_internet-casa_comprovante.pdf\n' +
      '2026-09-10_reforma-cozinha_orcamento-fornecedor-a.pdf\n' +
      '2026-09-15_curso-fotografia_certificado.pdf</code></pre>' +
      '<p>Escolha o que a data representa e mantenha essa decisão. Em um comprovante, pode ser a data do pagamento; em um orçamento, a data de emissão. Se a data não for conhecida, não invente: use um nome descritivo sem ela.</p>' +
      '<p>Quando houver versões de um documento em elaboração, use nomes como <code>planejamento-reforma_v01</code> e <code>planejamento-reforma_v02</code>. Evite a sequência <em>final</em>, <em>final-novo</em> e <em>final-agora-vai</em>, que não informa claramente a ordem das revisões.</p>' +
      '<p>Renomeie a parte do nome que identifica o documento, preservando a extensão. E não inclua números de documentos pessoais ou outras informações sensíveis no título quando uma descrição simples já resolve.</p>' +
      '<h2>4. Faça um teste completo com cinco arquivos</h2>' +
      '<p>Antes de aplicar o sistema a centenas de itens, escolha cinco documentos recentes. Abra cada um, confira seu conteúdo, dê um nome claro e coloque-o na pasta escolhida.</p>' +
      '<p>Imagine que chegou o comprovante da internet da casa. No exemplo acima, o caminho seria: <code>Documentos pessoais/Casa/Internet/2026/2026-09-08_internet-casa_comprovante.pdf</code></p>' +
      '<p>Agora feche a pasta e tente localizar o arquivo de duas formas: navegando pelo assunto e buscando as palavras <em>internet</em> e <em>comprovante</em> no aplicativo que você usa. Esse teste mostra se o nome escolhido corresponde à sua maneira de procurar.</p>' +
      '<p>Se você hesitar entre duas pastas, simplifique a estrutura. Não crie uma segunda cópia apenas para resolver a dúvida: primeiro decida qual será o lugar de referência.</p>' +
      '<h2>5. Use uma rotina de dez minutos para manter a organização</h2>' +
      '<p>Reserve um horário semanal, como sexta-feira depois de encerrar as tarefas, ou encaixe na sua <a href="/blog/checklist-organizacao-pessoal">revisão semanal periódica</a>. A divisão abaixo é uma sugestão para lidar com o que chegou recentemente:</p>' +
      '<div style="overflow-x:auto;margin:1.5rem 0;-webkit-overflow-scrolling:touch">' +
      '<table style="width:100%;border-collapse:collapse;text-align:left;font-size:0.95rem;min-width:480px">' +
      '<thead>' +
      '<tr style="border-bottom:2px solid hsl(var(--border));background:hsl(var(--secondary)/0.5)">' +
      '<th style="padding:0.75rem 1rem;font-weight:700">Tempo sugerido</th>' +
      '<th style="padding:0.75rem 1rem;font-weight:700">Ação na rotina</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr style="border-bottom:1px solid hsl(var(--border))">' +
      '<td style="padding:0.75rem 1rem;font-weight:600;white-space:nowrap">2 minutos</td>' +
      '<td style="padding:0.75rem 1rem">Reunir documentos recentes da pasta Downloads e de outros pontos de entrada.</td>' +
      '</tr>' +
      '<tr style="border-bottom:1px solid hsl(var(--border))">' +
      '<td style="padding:0.75rem 1rem;font-weight:600;white-space:nowrap">4 minutos</td>' +
      '<td style="padding:0.75rem 1rem">Abrir, identificar, renomear e classificar os itens mais importantes.</td>' +
      '</tr>' +
      '<tr style="border-bottom:1px solid hsl(var(--border))">' +
      '<td style="padding:0.75rem 1rem;font-weight:600;white-space:nowrap">2 minutos</td>' +
      '<td style="padding:0.75rem 1rem">Conferir possíveis duplicatas, sem apagar arquivos sobre os quais ainda há dúvida.</td>' +
      '</tr>' +
      '<tr>' +
      '<td style="padding:0.75rem 1rem;font-weight:600;white-space:nowrap">2 minutos</td>' +
      '<td style="padding:0.75rem 1rem">Verificar se a cópia de segurança prevista foi concluída e anotar pendências.</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>' +
      '</div>' +
      '<p>Se houver mais documentos do que você consegue tratar, deixe os restantes na Entrada e marque outro bloco. A rotina serve para dar continuidade; não precisa terminar com todas as pastas vazias.</p>' +
      '<p>Para o acervo antigo, separe uma sessão específica. Misturar anos de arquivos com a manutenção semanal pode transformar uma tarefa pequena em uma reorganização interminável.</p>' +
      '<h2>6. Cuide das cópias de segurança</h2>' +
      '<p>Pastas organizadas ajudam na consulta, mas os documentos também precisam de proteção. O CERT.br recomenda manter pelo menos duas cópias dos dados em locais diferentes, automatizar backups conforme a necessidade e testar as cópias periodicamente. Para serviços de nuvem, orienta ativar a verificação em duas etapas. Consulte mais detalhes no <a href="https://cartilha.cert.br/fasciculos/backup/fasciculo-backup.pdf" target="_blank" rel="noopener noreferrer">Fascículo Backup do CERT.br</a>.</p>' +
      '<p>Na prática, acrescente ao seu controle três informações: onde está a cópia, quando foi feita e quando você conferiu se conseguia recuperar um arquivo. Se o processo apresentar erro, registre a pendência para corrigi-la.</p>' +
      '<h2>Erros que costumam complicar o sistema</h2>' +
      '<p><strong>Criar uma pasta para cada arquivo.</strong> Antes de abrir outra categoria, veja se uma pasta existente já descreve bem o assunto.</p>' +
      '<p><strong>Usar Downloads como arquivo definitivo.</strong> Separe os documentos que precisam ser guardados dos arquivos que ainda estão esperando uma decisão.</p>' +
      '<p><strong>Apagar apenas porque o nome parece repetido.</strong> Abra os documentos e compare o conteúdo antes de decidir. Nomes semelhantes podem identificar versões diferentes.</p>' +
      '<p><strong>Mudar o padrão toda semana.</strong> Teste o modelo por algumas semanas. Ajuste o que atrapalha uma busca real, sem reorganizar tudo por preferência estética.</p>' +
      '<p><strong>Confundir digitalização com decisão de descarte.</strong> Organizar uma cópia digital não determina se o documento físico pode ser descartado. Este guia não estabelece prazos de guarda.</p>' +
      '<h2>Checklist para começar hoje</h2>' +
      '<ul>' +
      '<li>[ ] Escolhi um lugar principal para consultar meus documentos.</li>' +
      '<li>[ ] Conferi a cópia de segurança antes de mover o acervo.</li>' +
      '<li>[ ] Criei uma Entrada e poucas pastas por assunto.</li>' +
      '<li>[ ] Defini um padrão de nomes e o significado da data.</li>' +
      '<li>[ ] Organizei cinco arquivos e consegui encontrá-los novamente.</li>' +
      '<li>[ ] Reservei dez minutos para revisar os próximos documentos.</li>' +
      '<li>[ ] Anotei onde está meu backup e quando foi conferido.</li>' +
      '</ul>' +
      '<p>Seu primeiro passo pode ser apenas criar a Entrada e organizar os cinco arquivos do teste. Use o sistema em uma necessidade real antes de expandi-lo para o restante do acervo.</p>' +
      '<div style="margin-top:2.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--primary)/0.08);border:1px solid hsl(var(--primary)/0.2);text-align:center">' +
      '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Explore nossas ferramentas gratuitas</h3>' +
      '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">Baixe planners, checklists imprimíveis e planilhas de rotina gratuitos para apoiar sua organização.</p>' +
      '<a href="/ferramentas-gratuitas" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Acessar Ferramentas Gratuitas</a>' +
      '</div>' +
      '<div style="margin-top:1.5rem;padding:2rem 1.5rem;border-radius:1rem;background:hsl(var(--secondary)/0.6);border:1px solid hsl(var(--border));text-align:center">' +
      '<h3 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:700">Quer um método completo e estruturado?</h3>' +
      '<p style="margin:0 0 1rem;color:hsl(var(--muted-foreground));font-size:1.05rem">Conheça o Kit Organização Inteligente por R$ 29,90 à vista: workbook em PDF de 26 páginas com os modelos integrados, apresentação visual e vídeo introdutório na área de membros.</p>' +
      '<a href="/kit-organizacao-inteligente" style="display:inline-block;padding:0.75rem 1.75rem;border-radius:0.5rem;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-weight:600;text-decoration:none;font-size:1rem">Conhecer o Kit (R$ 29,90)</a>' +
      '</div>'

    var articlesCol = app.findCollectionByNameOrId('articles')

    try {
      // Check if already seeded to be idempotent
      app.findFirstRecordByData('articles', 'slug', 'como-organizar-documentos-digitais-em-pastas')
    } catch (_) {
      var newRecord = new Record(articlesCol)
      newRecord.set(
        'title',
        'Como organizar documentos digitais em pastas: um sistema simples para encontrar arquivos',
      )
      newRecord.set('slug', 'como-organizar-documentos-digitais-em-pastas')
      newRecord.set(
        'excerpt',
        'Organize documentos digitais com um modelo de pastas, nomes de arquivos, exemplos práticos e uma rotina de dez minutos para manter tudo em ordem.',
      )
      newRecord.set('category', 'Organização Pessoal')
      newRecord.set(
        'featuredImage',
        'https://img.usecurling.com/p/800/400?q=documents%20organization&dpr=2',
      )
      newRecord.set('content', docsContent)
      newRecord.set('readingTime', 7)
      newRecord.set('publishedAt', '2026-09-08 09:00:00.000-03:00')
      newRecord.set('updatedAt', '08/09/2026')
      app.save(newRecord)
    }
  },
  (app) => {
    try {
      var record = app.findFirstRecordByData(
        'articles',
        'slug',
        'como-organizar-documentos-digitais-em-pastas',
      )
      app.delete(record)
    } catch (_) {}
  },
)
