// src/pilot/standaloneSources.ts
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

// Importações raw de todos os arquivos de standalone-backend
import readmeContent from '../../standalone-backend/README.md?raw'
import configContent from '../../standalone-backend/config/standalone.config.json?raw'
import kiwifyEventsContent from '../../standalone-backend/fixtures/kiwifyEvents.json?raw'
import syntheticSuiteContent from '../../standalone-backend/fixtures/syntheticTestSuite.json?raw'
import authRoutesContent from '../../standalone-backend/pb_hooks/oi_auth_routes.pb.js?raw'
import cycleRoutesContent from '../../standalone-backend/pb_hooks/oi_cycle_routes.pb.js?raw'
import plansRoutesContent from '../../standalone-backend/pb_hooks/oi_plans_routes.pb.js?raw'
import webhookKiwifyContent from '../../standalone-backend/pb_hooks/oi_webhook_kiwify.pb.js?raw'
import schemaMigrationContent from '../../standalone-backend/pb_migrations/1740000001_create_oi_schema.js?raw'
import seedMigrationContent from '../../standalone-backend/pb_migrations/1740000002_seed_standalone_demo.js?raw'
import runLocalShContent from '../../standalone-backend/scripts/run-local.sh?raw'
import runLocalBatContent from '../../standalone-backend/scripts/run-local.bat?raw'
import runIntegrationShContent from '../../standalone-backend/scripts/run-integration-tests.sh?raw'
import runIntegrationMjsContent from '../../standalone-backend/scripts/run-integration-tests.mjs?raw'

const standaloneFilesMap: Record<string, string> = {
  'README.md': readmeContent,
  'config/standalone.config.json': configContent,
  'fixtures/kiwifyEvents.json': kiwifyEventsContent,
  'fixtures/syntheticTestSuite.json': syntheticSuiteContent,
  'pb_hooks/oi_auth_routes.pb.js': authRoutesContent,
  'pb_hooks/oi_cycle_routes.pb.js': cycleRoutesContent,
  'pb_hooks/oi_plans_routes.pb.js': plansRoutesContent,
  'pb_hooks/oi_webhook_kiwify.pb.js': webhookKiwifyContent,
  'pb_migrations/1740000001_create_oi_schema.js': schemaMigrationContent,
  'pb_migrations/1740000002_seed_standalone_demo.js': seedMigrationContent,
  'scripts/run-local.sh': runLocalShContent,
  'scripts/run-local.bat': runLocalBatContent,
  'scripts/run-integration-tests.sh': runIntegrationShContent,
  'scripts/run-integration-tests.mjs': runIntegrationMjsContent,
}

export const STANDALONE_PACKAGE_BUNDLE: StandalonePackageBundle = {
  version: '0.0.72',
  generatedAt: new Date().toISOString(),
  totalFiles: Object.keys(standaloneFilesMap).length,
  files: standaloneFilesMap,
}
