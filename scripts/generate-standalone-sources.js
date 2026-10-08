// scripts/generate-standalone-sources.js
/**
 * Script Node.js que lê TODOS os arquivos de standalone-backend/ em disco
 * e gera o módulo TypeScript `src/pilot/standaloneSources.ts`.
 *
 * Isso garante que todos os arquivos (pb_hooks, pb_migrations, scripts, config, fixtures, README)
 * estejam 100% sincronizados e embutidos no bundle Vite sem nenhum truncamento,
 * pronto para download direto via Blob ou inspeção auditável em <pre>.
 */

import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const standaloneDir = path.join(rootDir, 'standalone-backend')
const outputFile = path.join(rootDir, 'src/pilot/standaloneSources.ts')

function readDirRecursive(dir, baseDir = '') {
  let files = {}
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      const subFiles = readDirRecursive(fullPath, relativePath)
      files = { ...files, ...subFiles }
    } else if (entry.isFile()) {
      // Ignorar possíveis arquivos temporários do SO
      if (entry.name === '.DS_Store' || entry.name.endsWith('.tmp')) continue
      const content = fs.readFileSync(fullPath, 'utf-8')
      files[relativePath] = content
    }
  }

  return files
}

const filesMap = readDirRecursive(standaloneDir)
const sortedKeys = Object.keys(filesMap).sort()

console.log(`Lendo diretório standalone-backend/: encontrados ${sortedKeys.length} arquivos.`)

const jsonPayload = {
  version: '0.0.71',
  generatedAt: new Date().toISOString(),
  totalFiles: sortedKeys.length,
  files: filesMap,
}

const fileHeader = `// src/pilot/standaloneSources.ts
/**
 * Módulo de Exportação Completa dos Fontes do Backend Standalone OI.
 * Auto-gerado a partir de standalone-backend/ em disco.
 * 
 * Permite que a preview emita o download do pacote como Blob JSON
 * ou exiba a auditoria completa em elemento <pre aria-label="Código do pacote standalone">
 * sem depender do servidor estático de public/ nem truncamento.
 */

export interface StandalonePackageBundle {
  version: string
  generatedAt: string
  totalFiles: number
  files: Record<string, string>
}

export const STANDALONE_PACKAGE_BUNDLE: StandalonePackageBundle = ${JSON.stringify(jsonPayload, null, 2)}
`

fs.writeFileSync(outputFile, fileHeader, 'utf-8')
console.log(
  `Módulo gerado com sucesso em ${outputFile} (${(fileHeader.length / 1024).toFixed(1)} KB).`,
)
