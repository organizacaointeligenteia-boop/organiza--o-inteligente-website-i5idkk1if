import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { STANDALONE_PACKAGE_BUNDLE } from '@/pilot/standaloneSources'
import { isPilotHostnameAllowed, PILOT_ALLOWED_HOSTNAME } from '@/pilot/guard'

describe('Preview 0.0.71 - Reentrega do Pacote Standalone via Módulo Vite e Correções de Segurança', () => {
  const rootDir = process.cwd()
  const standaloneDir = path.resolve(rootDir, 'standalone-backend')

  describe('1. Entrega dos Fontes via Módulo Vite (sem arquivo tar em public/)', () => {
    it('o módulo STANDALONE_PACKAGE_BUNDLE contém versão 0.0.73 e estrutura de arquivos válida', () => {
      expect(STANDALONE_PACKAGE_BUNDLE).toBeDefined()
      expect(STANDALONE_PACKAGE_BUNDLE.version).toBe('0.0.73')
      expect(STANDALONE_PACKAGE_BUNDLE.totalFiles).toBe(20)
      expect(typeof STANDALONE_PACKAGE_BUNDLE.files).toBe('object')
    })

    it('o módulo embutido contém TODOS os arquivos em disco de standalone-backend/ com conteúdo exato e sem truncamento', () => {
      const expectedFiles = [
        'README.md',
        'config/standalone.config.json',
        'fixtures/kiwifyEvents.json',
        'fixtures/syntheticTestSuite.json',
        'pb_hooks/oi_access.js',
        'pb_hooks/oi_auth_routes.pb.js',
        'pb_hooks/oi_cycle_routes.pb.js',
        'pb_hooks/oi_pdf.js',
        'pb_hooks/oi_plan_service.js',
        'pb_hooks/oi_plans_routes.pb.js',
        'pb_hooks/oi_webhook_kiwify.pb.js',
        'pb_migrations/1740000001_create_oi_schema.js',
        'pb_migrations/1740000002_seed_standalone_demo.js',
        'pb_migrations/1740000003_runtime_hardening.js',
        'scripts/run-integration-tests.mjs',
        'scripts/run-integration-tests.sh',
        'scripts/run-local.bat',
        'scripts/run-local.sh',
        'scripts/test-jev-contract.mjs',
        'scripts/validate_http.py',
      ]

      expect(Object.keys(STANDALONE_PACKAGE_BUNDLE.files).sort()).toEqual(
        expectedFiles.slice().sort(),
      )

      for (const relPath of expectedFiles) {
        expect(STANDALONE_PACKAGE_BUNDLE.files).toHaveProperty(relPath)
        const diskContent = fs.readFileSync(path.join(standaloneDir, relPath), 'utf-8')
        const bundleContent = STANDALONE_PACKAGE_BUNDLE.files[relPath]
        expect(bundleContent).toBe(diskContent)
        expect(bundleContent.length).toBeGreaterThan(20) // sem truncamento
      }
    })

    it('NENHUM link ou referência ao tar.gz inválido existe em public/ ou no PilotOrganizacaoPage', () => {
      expect(fs.existsSync(path.join(rootDir, 'public/oi-standalone-backend.tar.gz'))).toBe(false)
      expect(fs.existsSync(path.join(rootDir, 'public/standalone-backend.tar.gz'))).toBe(false)

      const pageSource = fs.readFileSync(
        path.join(rootDir, 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )
      expect(pageSource).not.toContain('.tar.gz')
    })

    it('PilotOrganizacaoPage possui botão "Gerar download do pacote" e elemento <pre> com aria-label="Código do pacote standalone"', () => {
      const pageSource = fs.readFileSync(
        path.join(rootDir, 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )
      expect(pageSource).toContain('Gerar download do pacote')
      expect(pageSource).toContain('aria-label="Código do pacote standalone"')
      expect(pageSource).toContain('Código do pacote standalone')
      expect(pageSource).toContain('Recolher Área de Testes')
      expect(pageSource).toContain('Expandir Área de Testes')
    })
  })

  describe('2. Correção de Segurança em oi_memberships e Coleções Financeiras', () => {
    const schemaMigrationPath = path.join(
      standaloneDir,
      'pb_migrations/1740000001_create_oi_schema.js',
    )
    const schemaContent = fs.readFileSync(schemaMigrationPath, 'utf-8')

    it('oi_memberships possui createRule, updateRule e deleteRule NULOS para bloquear CRUD direto do cliente', () => {
      // Analisar o bloco de criação de oi_memberships
      const membershipsBlock = schemaContent.substring(
        schemaContent.indexOf("name: 'oi_memberships'"),
        schemaContent.indexOf("name: 'oi_orders'"),
      )
      expect(membershipsBlock).toContain('createRule: null')
      expect(membershipsBlock).toContain('updateRule: null')
      expect(membershipsBlock).toContain('deleteRule: null')
    })

    it('oi_orders, oi_cycles e oi_quotas mantêm createRule/updateRule nulos impedindo escrita por cliente', () => {
      const ordersBlock = schemaContent.substring(
        schemaContent.indexOf("name: 'oi_orders'"),
        schemaContent.indexOf("name: 'oi_cycles'"),
      )
      expect(ordersBlock).toContain('createRule: null')
      expect(ordersBlock).toContain('updateRule: null')
      expect(ordersBlock).toContain('deleteRule: null')

      const cyclesBlock = schemaContent.substring(
        schemaContent.indexOf("name: 'oi_cycles'"),
        schemaContent.indexOf("name: 'oi_quotas'"),
      )
      expect(cyclesBlock).toContain('createRule: null')
      expect(cyclesBlock).toContain('updateRule: null')

      const quotasBlock = schemaContent.substring(
        schemaContent.indexOf("name: 'oi_quotas'"),
        schemaContent.indexOf("name: 'oi_plans'"),
      )
      expect(quotasBlock).toContain('createRule: null')
      expect(quotasBlock).toContain('updateRule: null')
    })

    it('oi_auth_routes.pb.js fixa role="member" no servidor e não aceita role do cliente no signup', () => {
      const authHooksPath = path.join(standaloneDir, 'pb_hooks/oi_auth_routes.pb.js')
      const authContent = fs.readFileSync(authHooksPath, 'utf-8')

      expect(authContent).toContain("record.set('role', 'member')")
      const updateProfileRoute = ['/', 'api', 'oi', 'auth', 'update-profile'].join('/')
      expect(authContent).toContain(updateProfileRoute)
      expect(authContent).toContain("authRecord.collection().name !== 'oi_memberships'")
    })

    it('cada hook de ciclo e plano valida estritamente oi_memberships e oi_access.js', () => {
      const cyclePath = path.join(standaloneDir, 'pb_hooks/oi_cycle_routes.pb.js')
      const cycleContent = fs.readFileSync(cyclePath, 'utf-8')
      expect(cycleContent).toContain("requireAuth('oi_memberships')")

      const plansPath = path.join(standaloneDir, 'pb_hooks/oi_plans_routes.pb.js')
      const plansContent = fs.readFileSync(plansPath, 'utf-8')
      expect(plansContent).toContain("requireAuth('oi_memberships')")

      const accessPath = path.join(standaloneDir, 'pb_hooks/oi_access.js')
      const accessContent = fs.readFileSync(accessPath, 'utf-8')
      expect(accessContent).toContain("e.auth.collection().name !== 'oi_memberships'")
    })
  })

  describe('3. Atualização de Produto: Pagamento Único por 21 Dias de Uso (sem renovação nem promessa de hábito)', () => {
    it('README do standalone descreve pagamento único por 21 dias e ausência de renovação', () => {
      const readme = fs.readFileSync(path.join(standaloneDir, 'README.md'), 'utf-8')
      expect(readme).toContain('Pagamento único por 21 dias de uso')
      expect(readme).toContain('sem renovação automática e sem promessa de hábito')
    })

    it('config/standalone.config.json define single_payment e recurring: false', () => {
      const config = JSON.parse(
        fs.readFileSync(path.join(standaloneDir, 'config/standalone.config.json'), 'utf-8'),
      )
      expect(config.product.paymentModel).toBe('single_payment')
      expect(config.product.durationDays).toBe(21)
      expect(config.product.recurring).toBe(false)
      expect(config.product.habitPromise).toBe(false)
    })

    it('PilotOrganizacaoPage exibe termos claros de pagamento único sem checkout live de produção', () => {
      const pageSource = fs.readFileSync(
        path.join(rootDir, 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )
      expect(pageSource).toContain('Pagamento Único por 21 Dias')
      expect(pageSource).toContain('sem renovação e sem promessa de hábito')
      // Checkout da Kiwify de produção NÃO deve estar linkado na página da ferramenta de IA
      expect(pageSource).not.toContain('kiwify.com.br/cS6LHAp')
    })
  })

  describe('4. Compatibilidade com PocketBase 0.40.5 e Testes de Integração HTTP', () => {
    it('README e run-local.sh instruem execução de PocketBase 0.40.5', () => {
      const readme = fs.readFileSync(path.join(standaloneDir, 'README.md'), 'utf-8')
      expect(readme).toContain('0.40.5')

      const runScript = fs.readFileSync(path.join(standaloneDir, 'scripts/run-local.sh'), 'utf-8')
      expect(runScript).toContain('pocketbase_darwin_arm64')
      expect(runScript).toContain('http://127.0.0.1:$PORT')
    })

    it('o pacote contém scripts de testes de integração HTTP e contrato Jev cobrindo os cenários validados', () => {
      const testScriptPath = path.join(standaloneDir, 'scripts/run-integration-tests.mjs')
      expect(fs.existsSync(testScriptPath)).toBe(true)
      const validatePyPath = path.join(standaloneDir, 'scripts/validate_http.py')
      expect(fs.existsSync(validatePyPath)).toBe(true)
      const validatePyContent = fs.readFileSync(validatePyPath, 'utf-8')

      // Verificação dos cenários validados na suíte Python (caminhos da API standalone)
      const p = ['/', 'api', 'oi'].join('/')
      expect(validatePyContent).toContain(`${p}/auth/signup`)
      expect(validatePyContent).toContain(`${p}/auth/login`)
      expect(validatePyContent).toContain(`${p}/auth/verify-email`)
      expect(validatePyContent).toContain(`${p}/webhook/kiwify`)
      expect(validatePyContent).toContain(`${p}/cycle/status`)
      expect(validatePyContent).toContain(`${p}/cycle/start`)
      expect(validatePyContent).toContain(`${p}/plans/create`)
      expect(validatePyContent).toContain(`${p}/plans/update`)
      expect(validatePyContent).toContain(`${p}/plans/export-pdf`)
      expect(validatePyContent).toContain('user2@organizacaointeligente.com.br')

      const jevScriptPath = path.join(standaloneDir, 'scripts/test-jev-contract.mjs')
      expect(fs.existsSync(jevScriptPath)).toBe(true)
    })
  })

  describe('5. Preservação das Regras Fundamentais de Segurança e Preview', () => {
    it('mantém allowlist restrita de hostname exatamente organizacao-inteligente-website-943ee--preview.goskip.app', () => {
      expect(isPilotHostnameAllowed(PILOT_ALLOWED_HOSTNAME)).toBe(true)
      expect(isPilotHostnameAllowed('preview.goskip.app')).toBe(false)
      expect(isPilotHostnameAllowed('organizeinteligente.com.br')).toBe(false)
    })

    it('nenhuma nova migração foi adicionada ao PocketBase compartilhado da nuvem (0022+ permanece inexistente)', () => {
      const sharedMigrationsDir = path.resolve(rootDir, 'pocketbase/migrations')
      const files = fs.readdirSync(sharedMigrationsDir)
      const invalidMigrations = files.filter((f) => {
        const match = f.match(/^(\d{4})_/)
        return match && parseInt(match[1], 10) >= 22
      })
      expect(invalidMigrations).toEqual([])
    })

    it('package.json e rodapé estão na versão 0.0.73', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
      expect(pkg.version).toBe('0.0.73')

      const pageSource = fs.readFileSync(
        path.join(rootDir, 'src/pilot/PilotOrganizacaoPage.tsx'),
        'utf-8',
      )
      expect(pageSource).toContain('Versão 0.0.73')
    })
  })
})
