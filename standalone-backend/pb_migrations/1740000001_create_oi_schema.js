// standalone-backend/pb_migrations/1740000001_create_oi_schema.js
/**
 * Migração Standalone do PocketBase para a Ferramenta de IA da Organização Inteligente (OI).
 * Criada exclusivamente para o ambiente ISOLADO do proprietário.
 * NUNCA aplicar no PocketBase compartilhado.
 */

migrate(
  (app) => {
    // 1. Criar coleção oi_memberships (Auth collection para membros da OI)
    let membershipsCol
    try {
      membershipsCol = app.findCollectionByNameOrId('oi_memberships')
    } catch (_) {
      membershipsCol = new Collection({
        name: 'oi_memberships',
        type: 'auth',
        // Cliente autenticado pode ver seus próprios dados de membership
        listRule: "@request.auth.id != '' && id = @request.auth.id",
        viewRule: "@request.auth.id != '' && id = @request.auth.id",
        // BLOQUEIO TOTAL DE CRUD DIRETO PELO CLIENTE:
        // createRule: null -> impede criação direta via SDK/REST; cadastro SOMENTE via /api/oi/auth/signup com role='member' fixo no servidor.
        // updateRule: null -> impede modificação direta de campos sensíveis (role, verified, tokenKey, email, etc.) pelo cliente.
        // deleteRule: null -> impede deleção direta pelo cliente.
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'name', type: 'text', required: false },
          {
            name: 'role',
            type: 'select',
            values: ['member', 'admin'],
            maxSelect: 1,
            required: true,
          },
          { name: 'phone', type: 'text', required: false },
        ],
        indexes: ['CREATE INDEX idx_oi_memberships_role ON oi_memberships (role)'],
      })
      app.save(membershipsCol)
    }

    // 2. Criar coleção oi_orders (Compras / Pedidos Kiwify)
    // CLIENTE NÃO TEM ESCRITA (create/update/delete null). Somente hooks/servidor escreve.
    let ordersCol
    try {
      ordersCol = app.findCollectionByNameOrId('oi_orders')
    } catch (_) {
      ordersCol = new Collection({
        name: 'oi_orders',
        type: 'base',
        // Cliente autenticado pode listar/ver somente seus próprios pedidos
        listRule: "@request.auth.id != '' && member = @request.auth.id",
        viewRule: "@request.auth.id != '' && member = @request.auth.id",
        createRule: null, // Sem escrita por cliente
        updateRule: null, // Sem escrita por cliente
        deleteRule: null, // Sem escrita por cliente
        fields: [
          { name: 'order_id', type: 'text', required: true },
          { name: 'product_id', type: 'text', required: true },
          { name: 'product_name', type: 'text', required: false },
          {
            name: 'member',
            type: 'relation',
            collectionId: membershipsCol.id,
            required: false,
            maxSelect: 1,
            cascadeDelete: false,
          },
          { name: 'customer_email', type: 'email', required: true },
          { name: 'customer_name', type: 'text', required: false },
          {
            name: 'status',
            type: 'select',
            values: ['approved', 'refunded', 'chargedback', 'pending', 'rejected'],
            maxSelect: 1,
            required: true,
          },
          { name: 'amount_cents', type: 'number', required: false },
          { name: 'approved_at', type: 'date', required: false },
          { name: 'refunded_at', type: 'date', required: false },
          { name: 'raw_payload', type: 'json', required: false },
          { name: 'is_test', type: 'bool', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_oi_orders_order_id ON oi_orders (order_id)',
          'CREATE INDEX idx_oi_orders_member ON oi_orders (member)',
          'CREATE INDEX idx_oi_orders_status ON oi_orders (status)',
          'CREATE INDEX idx_oi_orders_email ON oi_orders (customer_email)',
        ],
      })
      app.save(ordersCol)
    }

    // 3. Criar coleção oi_cycles (Ciclos de 21 dias de uso)
    // CLIENTE NÃO TEM ESCRITA DIRETA (create/update/delete null). Alterações apenas via rotas controladas do servidor.
    let cyclesCol
    try {
      cyclesCol = app.findCollectionByNameOrId('oi_cycles')
    } catch (_) {
      cyclesCol = new Collection({
        name: 'oi_cycles',
        type: 'base',
        listRule: "@request.auth.id != '' && member = @request.auth.id",
        viewRule: "@request.auth.id != '' && member = @request.auth.id",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'member',
            type: 'relation',
            collectionId: membershipsCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: false,
          },
          {
            name: 'order',
            type: 'relation',
            collectionId: ordersCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: false,
          },
          { name: 'plan_id', type: 'text', required: true }, // ex.: "oi-21-standard"
          {
            name: 'status',
            type: 'select',
            values: ['waiting_start', 'active', 'expired', 'revoked', 'purged'],
            maxSelect: 1,
            required: true,
          },
          { name: 'approved_at', type: 'date', required: true },
          { name: 'auto_start_at', type: 'date', required: true }, // approved_at + 7 dias
          { name: 'started_at', type: 'date', required: false }, // preenchido quando inicia
          { name: 'expires_at', type: 'date', required: false }, // started_at + 21 dias
          { name: 'retention_until', type: 'date', required: false }, // expires_at + 30 dias
          { name: 'revoked_at', type: 'date', required: false },
          { name: 'revocation_reason', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_oi_cycles_member ON oi_cycles (member)',
          'CREATE INDEX idx_oi_cycles_status ON oi_cycles (status)',
          'CREATE INDEX idx_oi_cycles_order ON oi_cycles (order)',
        ],
      })
      app.save(cyclesCol)
    }

    // 4. Criar coleção oi_quotas (Controle estrito e atômico de cotas de IA)
    // Até 5 criações/ajustes por dia e 50 por ciclo.
    // CLIENTE NÃO TEM ESCRITA DIRETA.
    let quotasCol
    try {
      quotasCol = app.findCollectionByNameOrId('oi_quotas')
    } catch (_) {
      quotasCol = new Collection({
        name: 'oi_quotas',
        type: 'base',
        listRule: "@request.auth.id != '' && member = @request.auth.id",
        viewRule: "@request.auth.id != '' && member = @request.auth.id",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'cycle',
            type: 'relation',
            collectionId: cyclesCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'member',
            type: 'relation',
            collectionId: membershipsCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'day_bucket', type: 'text', required: true }, // ex.: "2025-05-10" UTC
          { name: 'daily_used', type: 'number', required: true },
          { name: 'cycle_used', type: 'number', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_oi_quotas_cycle_day ON oi_quotas (cycle, day_bucket)',
          'CREATE INDEX idx_oi_quotas_member ON oi_quotas (member)',
        ],
      })
      app.save(quotasCol)
    }

    // 5. Criar coleção oi_plans (Planos de Organização gerados e editáveis)
    // Dono pode ler seus planos. Criação e ajuste são feitos via endpoint do servidor para contabilizar cota.
    // Edição direta de campos de checklist/status é permitida para o dono sem chamar IA.
    let plansCol
    try {
      plansCol = app.findCollectionByNameOrId('oi_plans')
    } catch (_) {
      plansCol = new Collection({
        name: 'oi_plans',
        type: 'base',
        listRule: "@request.auth.id != '' && member = @request.auth.id",
        viewRule: "@request.auth.id != '' && member = @request.auth.id",
        createRule: null, // Criação somente via endpoint /api/oi/plans/create (para deduzir cota)
        updateRule: "@request.auth.id != '' && member = @request.auth.id", // Edição de checklist/notas pelo dono (não chama IA)
        deleteRule: "@request.auth.id != '' && member = @request.auth.id",
        fields: [
          {
            name: 'member',
            type: 'relation',
            collectionId: membershipsCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'cycle',
            type: 'relation',
            collectionId: cyclesCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'title', type: 'text', required: true },
          {
            name: 'category',
            type: 'select',
            values: ['rotina', 'prioridades', 'documentos', 'organizacao'],
            maxSelect: 1,
            required: true,
          },
          { name: 'objective', type: 'text', required: true },
          {
            name: 'difficulty',
            type: 'select',
            values: ['iniciante', 'intermediario', 'avancado'],
            maxSelect: 1,
            required: true,
          },
          {
            name: 'time_available',
            type: 'select',
            values: ['5m', '10m', '20m', '45m'],
            maxSelect: 1,
            required: true,
          },
          { name: 'target_deadline', type: 'text', required: false },
          { name: 'version', type: 'number', required: true },
          { name: 'parent_plan_id', type: 'text', required: false },
          { name: 'model_key', type: 'text', required: true }, // 'priorities' | 'week' | 'steps'
          { name: 'strategy_summary', type: 'text', required: true },
          { name: 'actions_checklist', type: 'json', required: true }, // Array de { id, text, priority, deadline, done }
          { name: 'ai_meta', type: 'json', required: false }, // { provider: 'jev'|'manual', latency_ms, tokens, confidence }
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_oi_plans_member ON oi_plans (member)',
          'CREATE INDEX idx_oi_plans_cycle ON oi_plans (cycle)',
          'CREATE INDEX idx_oi_plans_category ON oi_plans (category)',
        ],
      })
      app.save(plansCol)
    }

    // 6. Criar coleção oi_ai_audit (Auditoria de chamadas de IA e medição de consumo)
    // Apenas servidor grava e lê.
    let auditCol
    try {
      auditCol = app.findCollectionByNameOrId('oi_ai_audit')
    } catch (_) {
      auditCol = new Collection({
        name: 'oi_ai_audit',
        type: 'base',
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'member',
            type: 'relation',
            collectionId: membershipsCol.id,
            required: false,
            maxSelect: 1,
            cascadeDelete: false,
          },
          {
            name: 'cycle',
            type: 'relation',
            collectionId: cyclesCol.id,
            required: false,
            maxSelect: 1,
            cascadeDelete: false,
          },
          { name: 'provider', type: 'text', required: true }, // 'jev-systemone' | 'manual-fallback'
          { name: 'endpoint', type: 'text', required: true },
          { name: 'latency_ms', type: 'number', required: true },
          { name: 'success', type: 'bool', required: true },
          { name: 'input_tokens', type: 'number', required: false },
          { name: 'output_tokens', type: 'number', required: false },
          { name: 'cost_measured', type: 'number', required: false }, // nulo se preço não configurado; nunca inventar custo
          { name: 'error_message', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_oi_ai_audit_created ON oi_ai_audit (created DESC)'],
      })
      app.save(auditCol)
    }
  },
  (app) => {
    const toDelete = [
      'oi_ai_audit',
      'oi_plans',
      'oi_quotas',
      'oi_cycles',
      'oi_orders',
      'oi_memberships',
    ]
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
