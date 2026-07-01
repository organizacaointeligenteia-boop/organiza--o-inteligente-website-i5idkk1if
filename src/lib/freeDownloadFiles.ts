export interface FreeDownloadFile {
  title: string
  aliases?: string[]
  description: string
  filename: string
  base64: string
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
    title: 'Planilha de Hábitos',
    aliases: ['Planilha de Controle de Hábitos Mensal'],
    description: 'Acompanhe seus hábitos diários de forma visual e simples.',
    filename: 'controle-de-habitos-mensal.pdf',
    base64: buildPdfBase64(
      'Controle de Habitos Mensal',
      'Acompanhe seus habitos diarios de forma visual e simples.',
    ),
  },
  {
    title: 'Ebook: O Guia da Mente Organizada',
    aliases: ['O Guia da Mente Organizada', 'Ebook O Guia da Mente Organizada'],
    description: 'Guia completo para organizar sua mente, seu tempo e suas prioridades.',
    filename: 'guia-da-mente-organizada.pdf',
    base64: buildPdfBase64(
      'O Guia da Mente Organizada',
      'Guia completo para organizar sua mente, seu tempo e suas prioridades.',
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
