import planilhaHabitos8SemanasUrl from '@/assets/planilha-habitos-8-semanas-2ab0c.xlsx?url'
import guiaMenteOrganizadaUrl from '@/assets/guia-da-mente-organizada-abe68.pdf?url'
import controleHabitosMensalUrl from '@/assets/controle-habitos-mensal-d3da1.xlsx?url'
import planejamentoSemanalInteligenteUrl from '@/assets/planejamento-semanal-inteligente-ae25b.pdf?url'
import checklistRotinaMatinalIdealUrl from '@/assets/checklist-rotina-matinal-ideal-b3214.pdf?url'

export interface FreeDownloadFile {
  title: string
  aliases?: string[]
  description: string
  filename: string
  /** Direct URL to a real file served locally (e.g. an imported asset). */
  publicUrl?: string
  /** MIME type of the file. Defaults to `application/pdf`. */
  mime?: string
  /** Optional explicit label for the download button. */
  buttonLabel?: string
}

export interface DownloadUrl {
  url: string
  filename: string
  mime: string
}

export const freeDownloadFiles: FreeDownloadFile[] = [
  {
    title: 'Planilha de Hábitos - 8 Semanas',
    description:
      'Planilha editável para criar até 6 hábitos, registrar 8 semanas e acompanhar consistência com painel e gráficos.',
    filename: 'planilha-habitos-8-semanas.xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    publicUrl: planilhaHabitos8SemanasUrl,
  },
  {
    title: 'Ebook: O Guia da Mente Organizada',
    aliases: ['O Guia da Mente Organizada', 'Ebook O Guia da Mente Organizada'],
    description:
      'Guia prático de 41 páginas com método de organização, exercícios e plano de 30 dias.',
    filename: 'guia-da-mente-organizada.pdf',
    mime: 'application/pdf',
    publicUrl: guiaMenteOrganizadaUrl,
  },
  {
    title: 'Controle de Hábitos Mensal',
    description:
      'Planilha editável para acompanhar até 12 hábitos, com metas mensais, validações, consistência automática, relatório e gráficos.',
    filename: 'controle-habitos-mensal.xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    publicUrl: controleHabitosMensalUrl,
  },
  {
    title: 'Planejamento Semanal Inteligente',
    aliases: ['Template de Planejamento Semanal', 'Planner Semanal'],
    description:
      'Planner reutilizável de 15 páginas com sistema de 5 passos, mapa semanal, blocos de tempo e revisão.',
    filename: 'planejamento-semanal-inteligente.pdf',
    mime: 'application/pdf',
    publicUrl: planejamentoSemanalInteligenteUrl,
    buttonLabel: 'Baixar planner',
  },
  {
    title: 'Checklist da Rotina Matinal Ideal',
    description:
      'Guia imprimível de 12 páginas com 4 pilares, versões de 5, 15 e 30 minutos e desafio de 14 dias.',
    filename: 'checklist-rotina-matinal-ideal.pdf',
    mime: 'application/pdf',
    publicUrl: checklistRotinaMatinalIdealUrl,
    buttonLabel: 'Baixar checklist',
  },
]

/**
 * Resolve a `FreeDownloadFile` into a downloadable URL.
 *
 * Items must declare a `publicUrl` pointing to a real imported asset.
 */
export function getDownloadUrl(file: FreeDownloadFile): DownloadUrl {
  return {
    url: file.publicUrl ?? '',
    filename: file.filename,
    mime: file.mime ?? 'application/pdf',
  }
}

/** Human-friendly label for the download button based on the file type. */
export function getDownloadLabel(file: FreeDownloadFile): string {
  if (file.buttonLabel) {
    return file.buttonLabel
  }
  const mime = file.mime ?? ''
  if (mime.includes('spreadsheet') || file.filename.endsWith('.xlsx')) {
    return 'Baixar planilha'
  }
  if (file.publicUrl && mime === 'application/pdf') {
    return 'Baixar e-book'
  }
  return 'Baixar PDF'
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function findFreeDownloadFile(title: string): FreeDownloadFile | undefined {
  const normalized = normalizeTitle(title)
  return freeDownloadFiles.find(
    (f) =>
      normalizeTitle(f.title) === normalized ||
      (f.aliases && f.aliases.some((a) => normalizeTitle(a) === normalized)),
  )
}
