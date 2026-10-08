// scripts/generate-standalone-archive.js
/**
 * Script utilitário em Node.js para empacotar o diretório standalone-backend/
 * em um arquivo .tar.gz localizado em public/standalone-backend.tar.gz
 * permitindo que o proprietário baixe o pacote diretamente pela preview.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const rootDir = process.cwd()
const standaloneDir = path.join(rootDir, 'standalone-backend')
const publicDir = path.join(rootDir, 'public')
const targetFile = path.join(publicDir, 'oi-standalone-backend.tar.gz')

console.log('Gerando pacote compactado em public/oi-standalone-backend.tar.gz...')

if (!fs.existsSync(standaloneDir)) {
  console.error('Diretório standalone-backend não encontrado.')
  process.exit(1)
}

try {
  // Criar tar.gz usando o utilitário nativo tar
  execSync(`tar -czf "${targetFile}" -C "${rootDir}" standalone-backend`, { stdio: 'inherit' })
  const stats = fs.statSync(targetFile)
  console.log(`Pacote gerado com sucesso! Tamanho: ${(stats.size / 1024).toFixed(2)} KB`)
} catch (err) {
  console.error('Falha ao gerar o arquivo tar.gz:', err)
  process.exit(1)
}
