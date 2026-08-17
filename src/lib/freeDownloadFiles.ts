export interface FreeDownloadFile {
  title: string
  aliases?: string[]
  description: string
  filename: string
  /** Base64-encoded synthetic PDF (legacy). Used when no `publicUrl` is present. */
  base64?: string
  /** Direct URL to a real file served locally (e.g. an imported asset). */
  publicUrl?: string
  /** MIME type of the file. Defaults to `application/pdf` for legacy base64 items. */
  mime?: string
}

export interface DownloadUrl {
  url: string
  filename: string
  mime: string
}

function buildPdfBase64(title: string, description: string): string {
  const safeTitle = title.replace(/[^a-zA-Z0-9 ]/g, '')
  const safeDesc = description.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 80)
  const stream = `BT /F1 24 Tf 72 720 Td (${safeTitle}) Tj 0 -36 Td /F1 14 Tf (${safeDesc}) Tj ET`

  const objs = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  for (const obj of objs) {
    offsets.push(pdf.length)
    pdf += obj + '\n'
  }

  const xrefOffset = pdf.length
  pdf += 'xref\n'
  pdf += `0 ${objs.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (const offset of offsets) {
    pdf += String(offset).padStart(10, '0') + ' 00000 n \n'
  }
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\n`
  pdf += `startxref\n${xrefOffset}\n`
  pdf += '%%EOF'

  return btoa(pdf)
}

export const freeDownloadFiles: FreeDownloadFile[] = [
 {
   title: 'Planilha de Hábitos - 8 Semanas',
   description:
     'Planilha editável para criar até 6 hábitos, registrar 8 semanas e acompanhar consistência com painel e gráficos.',
   filename: 'planilha-habitos-8-semanas.xlsx',
   mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   // Real file served from public/downloads/. Resolved at runtime relative to
   // the deployed app's base URL via new URL(..., import.meta.url).
   publicUrl: new URL(
     '../../public/downloads/planilha-habitos-8-semanas.xlsx',
     import.meta.url,
   ).href,
 },
 {
   title: 'Ebook: O Guia da Mente Organizada',
   aliases: ['O Guia da Mente Organizada', 'Ebook O Guia da Mente Organizada'],
   description: 'Guia prático de 41 páginas com método de organização, exercícios e plano de 30 dias.',
   filename: 'guia-da-mente-organizada.pdf',
   mime: 'application/pdf',
   publicUrl: new URL(
     '../../public/downloads/guia-da-mente-organizada.pdf',
     import.meta.url,
   ).href,
 },
 {
   title: 'Controle de Hábitos Mensal',
   description:
     'Planilha editável para acompanhar até 12 hábitos, com metas mensais, validações, consistência automática, relatório e gráficos.',
   filename: 'controle-habitos-mensal.xlsx',
   mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   publicUrl: new URL(
     '../../public/downloads/controle-habitos-mensal.xlsx',
     import.meta.url,
   ).href,
 },  {
    title: 'Checklist da Vida Organizada',
    description: 'Checklist principal para mapear pendências, documentos e prioridades da semana.',
    filename: 'checklist-da-vida-organizada.pdf',
    base64: buildPdfBase64(
      'Checklist da Vida Organizada',
      'Checklist principal para mapear pendencias, documentos e prioridades da semana.',
    ),
  },
  {
    title: 'Planner Semanal',
    aliases: ['Template de Planejamento Semanal'],
    description: 'Planeje sua semana em 15 minutos com blocos de foco e prioridades claras.',
    filename: 'planner-semanal-inteligente.pdf',
    base64: buildPdfBase64(
      'Planner Semanal Inteligente',
      'Planeje sua semana em 15 minutos com blocos de foco e prioridades claras.',
    ),
  },
  {
    title: 'Checklist da Rotina Matinal Ideal',
    description: 'Roteiro prático para uma rotina matinal que potencializa seu dia.',
    filename: 'checklist-rotina-matinal-ideal.pdf',
    base64: buildPdfBase64(
      'Checklist da Rotina Matinal Ideal',
      'Roteiro pratico para uma rotina matinal que potencializa seu dia.',
    ),
  },
  {
    title: 'Checklist de Documentos',
    description: 'Organize e mantenha seus documentos pessoais sempre atualizados e acessíveis.',
    filename: 'checklist-de-documentos.pdf',
    base64: buildPdfBase64(
      'Checklist de Documentos',
      'Organize e mantenha seus documentos pessoais sempre atualizados e acessiveis.',
    ),
  },
  {
    title: 'Mapa Financeiro',
    description: 'Controle suas finanças pessoais com um mapa simples de receitas e despesas.',
    filename: 'mapa-financeiro.pdf',
    base64: buildPdfBase64(
      'Mapa Financeiro',
      'Controle suas financas pessoais com um mapa simples de receitas e despesas.',
    ),
  },
  {
    title: 'Rotina de Revisão de Domingo',
    description: 'Roteiro de 30 minutos para revisar a semana e preparar a próxima com clareza.',
    filename: 'rotina-revisao-domingo.pdf',
    base64: buildPdfBase64(
      'Rotina de Revisao de Domingo',
      'Roteiro de 30 minutos para revisar a semana e preparar a proxima com clareza.',
    ),
  },
]

export function createPdfBlobUrl(base64: string): string {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

/**
 * Resolve a `FreeDownloadFile` into a downloadable URL.
 *
 * - Items with `publicUrl` (real files imported as assets) return the direct
 *   asset path — no Blob URL is created.
 * - Legacy items with `base64` return a Blob URL generated by `createPdfBlobUrl`.
 */
export function getDownloadUrl(file: FreeDownloadFile): DownloadUrl {
  if (file.publicUrl) {
    return {
      url: file.publicUrl,
      filename: file.filename,
      mime: file.mime ?? 'application/pdf',
    }
  }
  return {
    url: createPdfBlobUrl(file.base64 ?? ''),
    filename: file.filename,
    mime: 'application/pdf',
  }
}

export function downloadPdfFromBase64(base64: string, filename: string) {
  const url = createPdfBlobUrl(base64)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Human-friendly label for the download button based on the file type. */
export function getDownloadLabel(file: FreeDownloadFile): string {
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
