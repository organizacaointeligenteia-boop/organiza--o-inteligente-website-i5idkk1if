import { describe, it, expect, beforeEach } from 'vitest'
import { StandaloneOiClient } from '@/pilot/standaloneClient'
import fs from 'node:fs'
import path from 'node:path'

describe('Preview 0.0.70 - Validação dos Contratos e Regras do Backend Standalone OI', () => {
  const defaultClient = new StandaloneOiClient('')

  describe('1. Fail-Closed e Configuração de Endpoint', () => {
    it('permanece fail-closed e desconfigurado se a URL for vazia', () => {
      expect(defaultClient.isConfigured()).toBe(false)
      expect(defaultClient.getToken()).toBeNull()
      expect(defaultClient.getCurrentUser()).toBeNull()
    })

    it('requisições em cliente não configurado falham de forma segura sem lançar exceções não tratadas', async () => {
      const loginRes = await defaultClient.login('test@exemplo.com', '12345678')
      expect(loginRes.success).toBe(false)
      expect(loginRes.error).toContain('não configurado')

      const cycleRes = await defaultClient.getCycleStatus()
      expect(cycleRes.hasCycle).toBe(false)
      expect(cycleRes.status).toBe('none')

      const createRes = await defaultClient.createPlan({
        category: 'rotina',
        objective: 'Criar rotina',
        difficulty: 'iniciante',
        timeAvailable: '10m',
      })
      expect(createRes.success).toBe(false)
    })
  })

  describe('2. Integridade dos Arquivos do Pacote Standalone', () => {
    const standaloneDir = path.resolve(process.cwd(), 'standalone-backend')

    it('contém a migração de esquema isolada 1740000001_create_oi_schema.js', () => {
      const migrationPath = path.join(standaloneDir, 'pb_migrations/1740000001_create_oi_schema.js')
      expect(fs.existsSync(migrationPath)).toBe(true)
      const content = fs.readFileSync(migrationPath, 'utf-8')
      // Coleções mandatórias
      expect(content).toContain('oi_memberships')
      expect(content).toContain('oi_orders')
      expect(content).toContain('oi_cycles')
      expect(content).toContain('oi_quotas')
      expect(content).toContain('oi_plans')
      expect(content).toContain('oi_ai_audit')
      // Regras de bloqueio de escrita direta por cliente
      expect(content).toContain('createRule: null')
    })

    it('contém a migração de seed demo com duas contas de membros e um admin sintético', () => {
      const seedPath = path.join(standaloneDir, 'pb_migrations/1740000002_seed_standalone_demo.js')
      expect(fs.existsSync(seedPath)).toBe(true)
      const content = fs.readFileSync(seedPath, 'utf-8')
      expect(content).toContain('admin-oi@organizacaointeligente.com.br')
      expect(content).toContain('user1@organizacaointeligente.com.br')
      expect(content).toContain('user2@organizacaointeligente.com.br')
      expect(content).toContain('role: "admin"')
      expect(content).toContain('role: "member"')
    })

    it('contém o hook do webhook Kiwify com proteção contra compra do Kit e ressurreição após refund', () => {
      const webhookPath = path.join(standaloneDir, 'pb_hooks/oi_webhook_kiwify.js')
      expect(fs.existsSync(webhookPath)).toBe(true)
      const content = fs.readFileSync(webhookPath, 'utf-8')
      const webhookRoute = ['/', 'api', 'oi', 'webhook', 'kiwify'].join('/')
      expect(content).toContain(webhookRoute)
      expect(content).toContain('OI_KIWIFY_WEBHOOK_SECRET')
      expect(content).toContain('OI_KIWIFY_PRODUCT_ID')
      expect(content).toContain('ignored_out_of_order_resurrection_prevented')
      expect(content).toContain('Produto diferente da Ferramenta de IA da OI')
    })

    it('contém o hook de ciclo com regras dos 7 dias para início e 21 dias de duração', () => {
      const cyclePath = path.join(standaloneDir, 'pb_hooks/oi_cycle_routes.js')
      expect(fs.existsSync(cyclePath)).toBe(true)
      const content = fs.readFileSync(cyclePath, 'utf-8')
      const cycleStatusRoute = ['/', 'api', 'oi', 'cycle', 'status'].join('/')
      const cycleStartRoute = ['/', 'api', 'oi', 'cycle', 'start'].join('/')
      expect(content).toContain(cycleStatusRoute)
      expect(content).toContain(cycleStartRoute)
      expect(content).toContain('21 * 24 * 60 * 60 * 1000') // 21 dias
      expect(content).toContain('30 * 24 * 60 * 60 * 1000') // 30 dias retenção
      expect(content).toContain('waiting_start')
      expect(content).toContain('retention_until')
      expect(content).toContain('CONTEÚDO PURGADO APÓS 30 DIAS')
    })

    it('contém o hook de planos com controle atômico de cotas (5/dia, 50/ciclo) e PDF seguro', () => {
      const plansPath = path.join(standaloneDir, 'pb_hooks/oi_plans_routes.js')
      expect(fs.existsSync(plansPath)).toBe(true)
      const content = fs.readFileSync(plansPath, 'utf-8')
      const planCreateRoute = ['/', 'api', 'oi', 'plans', 'create'].join('/')
      const planAdjustRoute = ['/', 'api', 'oi', 'plans', 'adjust'].join('/')
      const planPdfRoute = ['/', 'api', 'oi', 'plans', 'export-pdf'].join('/')
      expect(content).toContain(planCreateRoute)
      expect(content).toContain(planAdjustRoute)
      expect(content).toContain(planPdfRoute)
      expect(content).toContain('dailyUsed >= 5')
      expect(content).toContain('cycleUsed >= 50')
      expect(content).toContain('application/pdf')
      expect(content).toContain('OI_JEV_API_KEY')
    })

    it('contém README e scripts prontos de execução local', () => {
      expect(fs.existsSync(path.join(standaloneDir, 'README.md'))).toBe(true)
      expect(fs.existsSync(path.join(standaloneDir, 'scripts/run-local.sh'))).toBe(true)
      expect(fs.existsSync(path.join(standaloneDir, 'scripts/run-local.bat'))).toBe(true)
      expect(fs.existsSync(path.join(standaloneDir, 'fixtures/kiwifyEvents.json'))).toBe(true)
      expect(fs.existsSync(path.join(standaloneDir, 'config/standalone.config.json'))).toBe(true)
    })
  })

  describe('3. Fixtures e Simulação de Eventos Kiwify', () => {
    const fixturesPath = path.resolve(
      process.cwd(),
      'standalone-backend/fixtures/kiwifyEvents.json',
    )
    const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'))

    it('fixture de compra de IA possui status paid e product_id oi-ia-tool', () => {
      const evt = fixtures.approvedAiOrder
      expect(evt.order_status).toBe('paid')
      expect(evt.Product.product_id).toBe('oi-ia-tool')
      expect(evt.Customer.email).toBe('user1@organizacaointeligente.com.br')
    })

    it('fixture de compra do Kit possui product_id de kit diferente de oi-ia-tool', () => {
      const evt = fixtures.kitOrderMismatch
      expect(evt.Product.product_id).toBe('kit-organizacao-inteligente')
      expect(evt.Product.product_id).not.toBe('oi-ia-tool')
    })

    it('fixture de reembolso e chargeback possuem status corretos', () => {
      expect(fixtures.refundAiOrder.order_status).toBe('refunded')
      expect(fixtures.chargebackAiOrder.order_status).toBe('chargeback')
    })
  })
})
