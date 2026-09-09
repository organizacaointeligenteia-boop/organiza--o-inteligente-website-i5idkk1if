import type { Article } from '@/services/articles'
import type { Download } from '@/services/downloads'
import type { AffiliateLink } from '@/services/affiliates'

/**
 * Static fallback catalog used ONLY when the Skip Cloud backend is in cold
 * start, unavailable, or returns an empty result.
 *
 * Nothing here touches the backend — it is pure presentational data so the
 * public pages never render an empty state during a backend blip.
 */

export interface StaticDownload extends Download {
  /** Button label, e.g. "Baixar planilha". Never "Baixar PDF". */
  label: string
  /** Exact asset filename, e.g. "guia-da-mente-organizada.pdf". */
  file: string
  /** MIME type of the file. */
  mime: string
}

const now = new Date().toISOString()

const staticDownloads: StaticDownload[] = [
  {
    id: 'static-planilha-habitos',
    title: 'Planilha de Hábitos - 8 Semanas',
    description:
      'Planilha editável para criar até 6 hábitos, registrar 8 semanas e acompanhar consistência com painel e gráficos.',
    downloadCount: 2,
    label: 'Baixar planilha',
    file: 'planilha-habitos-8-semanas.xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileUrl: '',
    created: now,
    updated: now,
  },
  {
    id: 'static-guia-mente',
    title: 'Ebook: O Guia da Mente Organizada',
    description:
      'Guia prático de 41 páginas com método de organização, exercícios e plano de 30 dias.',
    downloadCount: 187,
    label: 'Baixar e-book',
    file: 'guia-da-mente-organizada.pdf',
    mime: 'application/pdf',
    fileUrl: '',
    created: now,
    updated: now,
  },
  {
    id: 'static-controle-habitos',
    title: 'Controle de Hábitos Mensal',
    description:
      'Planilha editável para acompanhar até 12 hábitos, com metas mensais, validações, consistência automática, relatório e gráficos.',
    downloadCount: 422,
    label: 'Baixar planilha',
    file: 'controle-habitos-mensal.xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileUrl: '',
    created: now,
    updated: now,
  },
  {
    id: 'static-planejamento',
    title: 'Planejamento Semanal Inteligente',
    description:
      'Planner reutilizável de 15 páginas com sistema de 5 passos, mapa semanal, blocos de tempo e revisão.',
    downloadCount: 316,
    label: 'Baixar planner',
    file: 'planejamento-semanal-inteligente.pdf',
    mime: 'application/pdf',
    fileUrl: '',
    created: now,
    updated: now,
  },
  {
    id: 'static-checklist',
    title: 'Checklist da Rotina Matinal Ideal',
    description:
      'Guia imprimível de 12 páginas com 4 pilares, versões de 5, 15 e 30 minutos e desafio de 14 dias.',
    downloadCount: 502,
    label: 'Baixar checklist',
    file: 'checklist-rotina-matinal-ideal.pdf',
    mime: 'application/pdf',
    fileUrl: '',
    created: now,
    updated: now,
  },
]

const staticArticles: Article[] = [
  {
    id: 'static-0',
    title:
      'Como organizar documentos digitais em pastas: um sistema simples para encontrar arquivos',
    slug: 'como-organizar-documentos-digitais-em-pastas',
    excerpt:
      'Organize documentos digitais com um modelo de pastas, nomes de arquivos, exemplos práticos e uma rotina de dez minutos para manter tudo em ordem.',
    category: 'Organização Pessoal',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=documents%20organization&dpr=2',
    content: '',
    publishedAt: '2026-09-08T12:00:00.000Z',
    createdAt: now,
    readingTime: 7,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-1',
    title: 'Como Criar Hábitos Duradouros: O Guia Completo',
    slug: 'como-criar-habitos',
    excerpt:
      'Aprenda o método comprovado pela ciência para construir hábitos que duram a vida toda, sem depender de motivação ou força de vontade.',
    category: 'Hábitos',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=habits&dpr=2',
    content: '',
    publishedAt: '2026-07-01T11:57:10.865Z',
    createdAt: now,
    readingTime: 12,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-2',
    title: 'Guia de Produtividade para 2026: Sistemas que Funcionam',
    slug: 'guia-produtividade-2026',
    excerpt:
      'Descubra os sistemas, ferramentas e princípios que vão definir sua produtividade em 2026. Pare de trocar tarefas — comece a construir um sistema.',
    category: 'Produtividade',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=workspace&dpr=2',
    content: '',
    publishedAt: '2026-07-01T11:57:10.864Z',
    createdAt: now,
    readingTime: 11,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-3',
    title: 'Como criar uma rotina matinal produtiva sem acordar 5h da manhã',
    slug: 'rotina-matinal-produtiva',
    excerpt:
      'Aprenda como criar uma rotina matinal produtiva, realista e leve, sem precisar acordar 5h da manhã ou seguir regras impossíveis.',
    category: 'Hábitos',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=morning%20routine%20peaceful&dpr=2',
    content: '',
    publishedAt: '2026-06-30T17:51:22.876Z',
    createdAt: now,
    readingTime: 7,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-4',
    title: 'Checklist de organização pessoal: o que revisar toda semana',
    slug: 'checklist-organizacao-pessoal',
    excerpt:
      'Veja um checklist de organização pessoal para revisar tarefas, documentos, finanças, rotina e prioridades toda semana.',
    category: 'Organização Pessoal',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=personal%20organization&dpr=2',
    content: '',
    publishedAt: '2026-06-29T17:51:22.876Z',
    createdAt: now,
    updatedAt: '08/09/2026',
    readingTime: 8,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-5',
    title: 'Como organizar a rotina semanal do zero: um método simples para sair do caos',
    slug: 'como-organizar-rotina-semanal',
    excerpt:
      'Aprenda como organizar a rotina semanal do zero com um método simples para definir prioridades, planejar tarefas e executar melhor durante a semana.',
    category: 'Planejamento',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=weekly%20planning&dpr=2',
    content: '',
    publishedAt: '2026-06-28T17:51:22.876Z',
    createdAt: now,
    updatedAt: '08/09/2026',
    readingTime: 9,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-6',
    title: 'Minimalismo Digital: Organize Sua Vida Online',
    slug: 'minimalismo-digital-organize-vida-online',
    excerpt:
      'Caixa de entrada com 5.000 e-mails? 200 abas abertas? Aprenda a simplificar sua vida digital e recuperar o foco no que importa.',
    category: 'Organização Pessoal',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=digital%20minimalism&dpr=2',
    content: '',
    publishedAt: '2026-06-16T11:06:40.731Z',
    createdAt: now,
    readingTime: 10,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-7',
    title: 'Sistema de Metas SMART: Alcance Seus Objetivos',
    slug: 'sistema-metas-smart-alcance-objetivos',
    excerpt:
      'Transforme desejos vagos em metas concretas com o framework SMART e aumente drasticamente suas chances de sucesso.',
    category: 'Planejamento',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=goal%20setting&dpr=2',
    content: '',
    publishedAt: '2026-05-30T11:06:40.731Z',
    createdAt: now,
    readingTime: 10,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-8',
    title: 'Como Construir Disciplina sem Depender de Motivação',
    slug: 'construir-disciplina-sem-motivacao',
    excerpt:
      'A motivação é volátil. A disciplina é confiável. Aprenda a construir sistemas que mantêm você no caminho mesmo sem vontade.',
    category: 'Desenvolvimento Pessoal',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=discipline%20grit&dpr=2',
    content: '',
    publishedAt: '2026-05-15T11:06:40.731Z',
    createdAt: now,
    readingTime: 7,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-9',
    title: 'Mindfulness para Produtividade: Foco no Presente',
    slug: 'mindfulness-para-produtividade-foco-presente',
    excerpt:
      'Como práticas de mindfulness melhoram o foco, reduzem o estresse e aumentam a qualidade do seu trabalho.',
    category: 'Desenvolvimento Pessoal',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=mindfulness%20meditation&dpr=2',
    content: '',
    publishedAt: '2026-04-30T11:06:40.731Z',
    createdAt: now,
    readingTime: 6,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-10',
    title: 'Método GTD: Como Organizar Tarefas e Projetos',
    slug: 'metodo-gtd-organizar-tarefas-projetos',
    excerpt:
      'O Getting Things Done de David Allen explicado de forma simples: um sistema para esvaziar a mente e nunca mais esquecer nada.',
    category: 'Planejamento',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=gtd%20method&dpr=2',
    content: '',
    publishedAt: '2026-04-15T11:06:40.731Z',
    createdAt: now,
    readingTime: 8,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-11',
    title: 'Organização Financeira Pessoal: Do Zero ao Controle',
    slug: 'organizacao-financeira-pessoal-zero-controle',
    excerpt:
      'Um guia prático para assumir o controle das suas finanças, mesmo que você nunca tenha feito um orçamento antes.',
    category: 'Organização Pessoal',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=finance%20planning&dpr=2',
    content: '',
    publishedAt: '2026-03-30T11:06:40.731Z',
    createdAt: now,
    readingTime: 11,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-12',
    title: 'Hábitos Atômicos: Pequenas Mudanças, Grandes Resultados',
    slug: 'habitos-atomicos-pequenas-mudancas',
    excerpt:
      'Os princípios do best-seller de James Clear aplicados na prática: como melhorar 1% por dia e transformar sua vida.',
    category: 'Hábitos',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=habits%20book&dpr=2',
    content: '',
    publishedAt: '2026-03-15T11:06:40.731Z',
    createdAt: now,
    readingTime: 10,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-13',
    title: 'Como Eliminar Procrastinação de Uma Vez por Todas',
    slug: 'eliminar-procrastinacao-definitivamente',
    excerpt:
      'Entenda as causas reais da procrastinação e aplique estratégias científicas para superá-la de forma permanente.',
    category: 'Produtividade',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=focus%20work&dpr=2',
    content: '',
    publishedAt: '2026-03-02T11:06:40.731Z',
    createdAt: now,
    readingTime: 8,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-14',
    title: 'Produtividade com a Técnica Pomodoro: Guia Definitivo',
    slug: 'produtividade-tecnica-pomodoro-guia',
    excerpt:
      'Aprenda a usar a Técnica Pomodoro para manter o foco profundo, evitar a procrastinação e terminar o dia com energia.',
    category: 'Produtividade',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=pomodoro%20timer&dpr=2',
    content: '',
    publishedAt: '2026-02-15T11:06:40.731Z',
    createdAt: now,
    readingTime: 5,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-15',
    title: 'O Guia Completo do Planejamento Semanal',
    slug: 'guia-completo-planejamento-semanal',
    excerpt:
      'Um sistema passo a passo para planejar sua semana com clareza, priorizando o que realmente importa e eliminando o excesso.',
    category: 'Planejamento',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=weekly%20planner&dpr=2',
    content: '',
    publishedAt: '2026-01-30T11:06:40.731Z',
    createdAt: now,
    readingTime: 9,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-16',
    title: 'Como criar uma rotina matinal produtiva',
    slug: 'como-criar-rotina-matinal-produtiva',
    excerpt:
      'Descubra como construir uma rotina matinal que amplia seu foco, energia e clareza mental para o resto do dia.',
    category: 'Hábitos',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=morning%20routine&dpr=2',
    content: '',
    publishedAt: '2026-01-15T11:06:40.731Z',
    createdAt: now,
    readingTime: 6,
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-17',
    title: '5 Técnicas de Organização para Home Office',
    slug: '5-tecnicas-organizacao-home-office',
    excerpt:
      'Aprenda cinco técnicas comprovadas para organizar seu espaço de trabalho em casa e multiplicar sua produtividade.',
    category: 'Organização Pessoal',
    featuredImage: 'https://img.usecurling.com/p/800/400?q=home%20office&dpr=2',
    content: '',
    publishedAt: '2025-12-30T11:06:40.731Z',
    createdAt: now,
    readingTime: 7,
    created: now,
    updated: now,
  } as Article,
]

const staticAffiliates: AffiliateLink[] = [
  {
    id: 'static-aff-1',
    productName: 'Notion',
    productUrl: 'https://www.notion.so/',
    affiliateUrl: 'https://www.notion.so/',
    category: 'Notas e conhecimento',
    description: 'Ferramenta completa para notas, projetos e bases de conhecimento.',
    created: now,
    updated: now,
  },
  {
    id: 'static-aff-2',
    productName: 'Todoist',
    productUrl: 'https://todoist.com/',
    affiliateUrl: 'https://todoist.com/',
    category: 'Tarefas',
    description: 'Gerenciador de tarefas simples e poderoso para uso pessoal e profissional.',
    created: now,
    updated: now,
  },
  {
    id: 'static-aff-3',
    productName: 'Trello',
    productUrl: 'https://trello.com/',
    affiliateUrl: 'https://trello.com/',
    category: 'Projetos',
    description: 'Quadros visuais para organizar projetos e fluxos de trabalho.',
    created: now,
    updated: now,
  },
  {
    id: 'static-aff-4',
    productName: 'Evernote',
    productUrl: 'https://evernote.com/',
    affiliateUrl: 'https://evernote.com/',
    category: 'Notas e conhecimento',
    description: 'Capture ideias, notas e documentos em um só lugar.',
    created: now,
    updated: now,
  },
  {
    id: 'static-aff-5',
    productName: 'Google Calendar',
    productUrl: 'https://calendar.google.com/',
    affiliateUrl: 'https://calendar.google.com/',
    category: 'Agenda',
    description: 'Agenda integrada para gerenciar compromissos e rotinas.',
    created: now,
    updated: now,
  },
  {
    id: 'static-aff-6',
    productName: 'Forest',
    productUrl: 'https://www.forestapp.cc/',
    affiliateUrl: 'https://www.forestapp.cc/',
    category: 'Foco',
    description: 'App de foco com gamificação que ajuda a manter a concentração.',
    created: now,
    updated: now,
  },
  {
    id: 'static-aff-7',
    productName: 'Pomodoro Timer',
    productUrl: 'https://pomofocus.io/',
    affiliateUrl: 'https://pomofocus.io/',
    category: 'Foco',
    description: 'Timer online gratuito baseado na técnica Pomodoro.',
    created: now,
    updated: now,
  },
  {
    id: 'static-aff-8',
    productName: 'Miro',
    productUrl: 'https://miro.com/',
    affiliateUrl: 'https://miro.com/',
    category: 'Projetos',
    description: 'Lousa digital colaborativa para brainstorming e planejamento visual.',
    created: now,
    updated: now,
  },
]

/** Returns a fresh copy of the static downloads catalog. */
export function getStaticDownloads(): StaticDownload[] {
  return staticDownloads.map((d) => ({ ...d }))
}

/** Returns a fresh copy of the static articles catalog. */
export function getStaticArticles(): Article[] {
  return staticArticles.map((a) => ({ ...a }))
}

/** Returns a fresh copy of the static affiliate links catalog. */
export function getStaticAffiliates(): AffiliateLink[] {
  return staticAffiliates.map((a) => ({ ...a }))
}
