// Standards-compliant, paginated PDF with WinAnsi hex text (Portuguese accents).
function hex(value) {
  const extra = {
    8364: 128,
    8218: 130,
    402: 131,
    8222: 132,
    8230: 133,
    8224: 134,
    8225: 135,
    710: 136,
    8240: 137,
    352: 138,
    8249: 139,
    338: 140,
    381: 142,
    8216: 145,
    8217: 146,
    8220: 147,
    8221: 148,
    8226: 149,
    8211: 150,
    8212: 151,
    732: 152,
    8482: 153,
    353: 154,
    8250: 155,
    339: 156,
    382: 158,
    376: 159,
  }
  let out = ''
  for (let i = 0; i < value.length; i++) {
    let n = value.charCodeAt(i)
    n = n <= 255 ? n : extra[n] || 63
    out += ('0' + n.toString(16)).slice(-2)
  }
  return out
}
function render(plan) {
  const lines = [
    'Organização Inteligente',
    'Plano de ação - versão ' + plan.version,
    '',
    plan.title,
    'Objetivo: ' + plan.objective,
    'Categoria: ' + plan.category,
    'Prazo: ' + (plan.target_deadline || 'Definido no plano'),
    '',
    'Estratégia',
    plan.strategySummary,
    '',
    'Ações e acompanhamento',
  ]
  for (let i = 0; i < plan.actionsChecklist.length; i++) {
    const a = plan.actionsChecklist[i]
    lines.push(
      (a.done ? '[X] ' : '[ ] ') + (i + 1) + '. ' + a.text,
      'Prioridade: ' + (a.priority || 'media') + ' | Prazo: ' + (a.deadline || 'A definir'),
      '',
    )
  }
  lines.push('Continue usando este plano após o encerramento do acesso.')
  const wrapped = []
  for (const line of lines) {
    let part = ''
    for (const word of String(line)
      .replace(/[\r\n]+/g, ' ')
      .split(' ')) {
      if (part.length + word.length > 80) {
        wrapped.push(part)
        part = ''
      }
      if (word.length > 80) {
        if (part) wrapped.push(part)
        part = ''
        for (let i = 0; i < word.length; i += 80) wrapped.push(word.slice(i, i + 80))
      } else part += (part ? ' ' : '') + word
    }
    wrapped.push(part)
  }
  const pageCount = Math.max(1, Math.ceil(wrapped.length / 44)),
    objects = []
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] =
    '<< /Type /Pages /Count ' +
    pageCount +
    ' /Kids [' +
    Array.from({ length: pageCount }, (_, i) => 4 + i * 2 + ' 0 R').join(' ') +
    '] >>'
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  for (let p = 0; p < pageCount; p++) {
    const id = 4 + p * 2
    let stream = 'BT /F1 11 Tf 15 TL 48 785 Td\n'
    for (const line of wrapped.slice(p * 44, p * 44 + 44)) stream += '<' + hex(line) + '> Tj T*\n'
    stream +=
      'ET\nBT /F1 9 Tf 48 35 Td <' +
      hex('Organização Inteligente - ' + (p + 1) + ' / ' + pageCount) +
      '> Tj ET\n'
    objects[id] =
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ' +
      (id + 1) +
      ' 0 R >>'
    objects[id + 1] = '<< /Length ' + stream.length + ' >>\nstream\n' + stream + 'endstream'
  }
  let pdf = '%PDF-1.4\n',
    offsets = [0]
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = pdf.length
    pdf += i + ' 0 obj\n' + objects[i] + '\nendobj\n'
  }
  const xref = pdf.length
  pdf += 'xref\n0 ' + objects.length + '\n0000000000 65535 f \n'
  for (let i = 1; i < objects.length; i++)
    pdf += ('0000000000' + offsets[i]).slice(-10) + ' 00000 n \n'
  pdf += 'trailer\n<< /Size ' + objects.length + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n'
  return pdf.split('').map((c) => c.charCodeAt(0))
}
module.exports = { render }
