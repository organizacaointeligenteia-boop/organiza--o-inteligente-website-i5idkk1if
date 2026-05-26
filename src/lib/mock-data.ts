export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  date: string
  image: string
  category: string
}

export const mockArticles: Article[] = [
  {
    id: '1',
    title: '5 Hábitos Matinais para Transformar seu Dia',
    slug: '5-habitos-matinais',
    excerpt:
      'Descubra como pequenas mudanças na sua rotina matinal podem aumentar drasticamente sua produtividade e bem-estar ao longo do dia.',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    date: '2026-05-20',
    image: 'https://img.usecurling.com/p/800/400?q=morning%20coffee&dpr=2',
    category: 'Hábitos',
  },
  {
    id: '2',
    title: 'Como Organizar seu Espaço de Trabalho',
    slug: 'como-organizar-espaco-trabalho',
    excerpt:
      'Um ambiente limpo é uma mente limpa. Aprenda técnicas de organização física que impactam diretamente seu foco e clareza mental.',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.',
    date: '2026-05-22',
    image: 'https://img.usecurling.com/p/800/400?q=workspace&dpr=2',
    category: 'Organização Pessoal',
  },
  {
    id: '3',
    title: 'A Regra dos 2 Minutos contra a Procrastinação',
    slug: 'regra-dos-2-minutos',
    excerpt:
      'Se leva menos de dois minutos, faça agora. Conheça a regra de ouro para eliminar pendências rapidamente.',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum suscipit nulla quis orci. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc.',
    date: '2026-05-25',
    image: 'https://img.usecurling.com/p/800/400?q=clock&dpr=2',
    category: 'Produtividade',
  },
  {
    id: '4',
    title: 'Planejamento Semanal Eficiente',
    slug: 'planejamento-semanal',
    excerpt:
      'Reserve 15 minutos no domingo para garantir uma semana inteira de foco e realizações sem estresse.',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ipsum velit, consectetuer eu lobortis ut, dictum at dui. In rutrum. Maecenas aliquet accumsan leo. Nullam dapibus fermentum ipsum. Etiam quis quam. Phasellus aliquet diam id urna.',
    date: '2026-05-26',
    image: 'https://img.usecurling.com/p/800/400?q=planner&dpr=2',
    category: 'Planejamento',
  },
]

export const mockTools = [
  {
    id: '1',
    name: 'Planilha de Hábitos Mensal',
    description: 'Acompanhe seus hábitos diários de forma visual e simples.',
    url: '#',
  },
  {
    id: '2',
    name: 'Template Notion GTD',
    description: 'Sistema completo Get Things Done pronto para usar no Notion.',
    url: '#',
  },
  {
    id: '3',
    name: 'Matriz de Eisenhower (PDF)',
    description: 'Priorize suas tarefas separando o urgente do importante.',
    url: '#',
  },
  {
    id: '4',
    name: 'Checklist de Fim de Dia',
    description: 'Rotina de 5 minutos para encerrar o trabalho com clareza.',
    url: '#',
  },
]
