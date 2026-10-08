// standalone-backend/pb_migrations/1740000001_create_oi_schema.js
/**
 * Migração Standalone do PocketBase para a Ferramenta de IA da Organização Inteligente (OI).
 * Criada exclusivamente para o ambiente ISOLADO do proprietário.
 * NUNCA aplicar no PocketBase compartilhado.
 *
 * Segurança rígida:
 * - oi_memberships: createRule, updateRule, deleteRule = null (cadastro/atualização somente por rotas server-side)
 * - oi_orders: createRule, updateRule, deleteRule = null (somente webhook server-side)
 * - oi_cycles: createRule, updateRule, deleteRule = null (somente rotas server-side)
 * - oi_quotas: createRule, updateRule, deleteRule = null (somente rotas server-side)
 * - oi_plans: listRule, viewRule, createRule, updateRule, deleteRule = null!
 *     BLOQUEIO TOTAL DE CRUD DIRETO DE oi_plans. Leituras, edições, checklists e exportações
 *     são 100% controladas por rotas server-side (/api/oi/plans/*) com verificação de dono,
 *     impedindo vazamento ou escrita pós-expiração/revogação/purga.
 * - oi_ai_audit: listRule, viewRule, createRule, updateRule, deleteRule = null (somente servidor)
 * - oi_auth_tokens: tabela interna para tokens reais de verificação e recuperação com TTL e uso único.
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
    // CRUD direto bloqueado (regras nulas)
    let ordersCol
    try {
      ordersCol = app.findCollectionByNameOrId('oi_orders')
    } catch (_) {
      ordersCol = new Collection({
        name: 'oi_orders',
        type: 'base',
        listRule: "@request.auth.id != '' && member = @request.auth.id",
        viewRule: "@request.auth.id != '' && member = @request.auth.id",
        createRule: null,
        updateRule: null,
        deleteRule: null,
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
    // CRUD direto bloqueado (regras nulas)
    let cyclesCol
    try {
      cyclesCol = app.findCollectionByNameOrId('oi_cycles')
    } catch (_) {
      cyclesCol = new Collection({
        name: 'oi_cycles',
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
          { name: 'plan_id', type: 'text', required: true },
          {
            name: 'status',
            type: 'select',
            values: ['waiting_start', 'active', 'expired', 'revoked', 'purged'],
            maxSelect: 1,
            required: true,
          },
          { name: 'approved_at', type: 'date', required: true },
          { name: 'auto_start_at', type: 'date', required: true },
          { name: 'started_at', type: 'date', required: false },
          { name: 'expires_at', type: 'date', required: false },
          { name: 'retention_until', type: 'date', required: false },
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
    // CRUD direto bloqueado (regras nulas)
    let quotasCol
    try {
      quotasCol = app.findCollectionByNameOrId('oi_quotas')
    } catch (_) {
      quotasCol = new Collection({
        name: 'oi_quotas',
        type: 'base',
        listRule: null,
        viewRule: null,
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
          { name: 'day_bucket', type: 'text', required: true },
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

    // 5. Criar coleção oi_plans (Planos de Organização)
    // CRUD direto BLOQUEADO TOTALMENTE (regras nulas):
    // Listar, ver, criar, atualizar e deletar somente via endpoints autenticados do servidor.
    // Isso impede que um membro leia planos após purga/revogação, edite após expiração,
    // ou tente alterar cycle, member ou ai_meta por SDK direto.
    let plansCol
    try {
      plansCol = app.findCollectionByNameOrId('oi_plans')
    } catch (_) {
      plansCol = new Collection({
        name: 'oi_plans',
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
            values: ['rotina', 'prioridades', 'documentos', 'organizacao', 'habitos'],
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
          { name: 'model_key', type: 'text', required: true },
          { name: 'strategy_summary', type: 'text', required: true },
          { name: 'actions_checklist', type: 'json', required: true },
          { name: 'ai_meta', type: 'json', required: false },
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

    // 6. Criar coleção oi_ai_audit (Auditoria de IA e medição de consumo)
    // Servidor apenas
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
          { name: 'provider', type: 'text', required: true },
          { name: 'endpoint', type: 'text', required: true },
          { name: 'latency_ms', type: 'number', required: true },
          { name: 'success', type: 'bool', required: true },
          { name: 'input_tokens', type: 'number', required: false },
          { name: 'output_tokens', type: 'number', required: false },
          { name: 'cost_measured', type: 'number', required: false },
          { name: 'error_message', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_oi_ai_audit_created ON oi_ai_audit (created DESC)'],
      })
      app.save(auditCol)
    }

    // 7. Criar coleção oi_auth_tokens (Tokens de uso único para Verificação de Conta e Reset de Senha)
    // Totalmente protegida no servidor (list/view/create/update/delete nulos)
    let tokensCol
    try {
      tokensCol = app.findCollectionByNameOrId('oi_auth_tokens')
    } catch (_) {
      tokensCol = new Collection({
        name: 'oi_auth_tokens',
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
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'email', type: 'email', required: true },
          {
            name: 'type',
            type: 'select',
            values: ['verify_email', 'reset_password'],
            maxSelect: 1,
            required: true,
          },
          { name: 'token', type: 'text', required: true },
          { name: 'expires_at', type: 'date', required: true },
          { name: 'used_at', type: 'date', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_oi_auth_tokens_token ON oi_auth_tokens (token)',
          'CREATE INDEX idx_oi_auth_tokens_email_type ON oi_auth_tokens (email, type)',
        ],
      })
      app.save(tokensCol)
    }
  },
  (app) => {
    const toDelete = [
      'oi_auth_tokens',
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
