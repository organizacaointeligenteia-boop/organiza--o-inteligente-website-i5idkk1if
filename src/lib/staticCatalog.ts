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
    id: 'static-1',
    title: '5 sinais de que sua rotina precisa de um reset',
    excerpt:
      'Cansaço constante, tarefas acumuladas e sensação de improdutividade são sinais claros. Veja como identificar e agir.',
    category: 'Rotina',
    featuredImage: '',
    content: '',
    publishedAt: now,
    createdAt: now,
    slug: 'sinais-rotina-reset',
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-2',
    title: 'Como organizar documentos digitais em 3 passos',
    excerpt: 'Um método simples para nomear, classificar e encontrar qualquer arquivo em segundos.',
    category: 'Documentos',
    featuredImage: '',
    content: '',
    publishedAt: now,
    createdAt: now,
    slug: 'organizar-documentos-digitais',
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-3',
    title: 'O método Ivy Lee para prioridades diárias',
    excerpt:
      'A técnica centenária que ajuda executivos a focarem no que realmente importa todos os dias.',
    category: 'Prioridades',
    featuredImage: '',
    content: '',
    publishedAt: now,
    createdAt: now,
    slug: 'metodo-ivy-lee',
    created: now,
    updated: now,
  } as Article,
  {
    id: 'static-4',
    title: 'Checklist: sua mesa está sabotando seu foco?',
    excerpt:
      'O ambiente físico afeta sua capacidade de concentração. Use este checklist para avaliar e corrigir.',
    category: 'Foco',
    featuredImage: '',
    content: '',
    publishedAt: now,
    createdAt: now,
    slug: 'mesa-sabotando-foco',
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
