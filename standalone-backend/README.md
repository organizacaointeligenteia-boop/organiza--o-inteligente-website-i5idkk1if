# Backend Standalone Executável · Ferramenta de IA de Organização Inteligente (OI)

Este pacote contém o backend completo e isolado para execução LOCAL e controlada pelo proprietário do produto pago "Ferramenta de IA da Organização Inteligente" (pagamento único por 21 dias de uso da ferramenta, sem renovação e sem promessa de hábito).

> **Aviso de Isolamento:** Este backend NUNCA deve ser misturado com o PocketBase compartilhado do website público ou do Kit. Ele roda em sua própria instância e armazena os dados localmente no diretório `pb_data/`.

---

## 1. Conteúdo do Pacote

- `pb_migrations/`:
  - `1740000001_create_oi_schema.js`: Criação das coleções `oi_memberships` (auth), `oi_orders`, `oi_cycles`, `oi_quotas`, `oi_plans` e `oi_ai_audit`.
  - `1740000002_seed_standalone_demo.js`: Seed idempotente de admin sintético e dois usuários sintéticos para testes.
- `pb_hooks/`:
  - `oi_webhook_kiwify.js`: Webhook autenticado com token, correlação de produto e conta, prevenção de ressurreição após refund/chargeback, ignorando compras do Kit.
  - `oi_cycle_routes.js`: Gestão atômica do ciclo de 21 dias (`GET /api/oi/cycle/status`, `POST /api/oi/cycle/start`), regras de expiração e expurgo após 30 dias.
  - `oi_plans_routes.js`: Criação e ajuste de planos (`POST /api/oi/plans/create`, `POST /api/oi/plans/adjust`), controle de cotas (5/dia e 50/ciclo), integração oficial Jev (`/v1/systemone`) ou modo manual honesto, e exportação segura de PDF (`GET /api/oi/plans/export-pdf`).
  - `oi_auth_routes.js`: Rotas complementares de cadastro com allowlist estrita e role='member' fixo, atualização segura de perfil e reset local sem envio real de emails.
- `config/`: Configurações e parâmetros operacionais (pagamento único por 21 dias, sem renovação).
- `scripts/`: Scripts para inicialização (`run-local.sh`, `run-local.bat`) e testes de integração HTTP reais (`run-integration-tests.sh`, `run-integration-tests.mjs`).
- `fixtures/`: Payloads sintéticos de teste para simulação Kiwify e Jev.

---

## 2. Como Executar Localmente

### Pré-requisitos
1. Baixar o executável oficial do PocketBase (compatível com a versão 0.40.5 darwin_arm64 ou compatível com seu sistema operacional) em:
   https://pocketbase.io/docs/
2. Colocar o arquivo executável (`pocketbase` no Linux/macOS ou `pocketbase.exe` no Windows) dentro desta pasta raiz do pacote `standalone-backend/`.

### No macOS / Linux (ARM64 / x86_64):
```bash
chmod +x ./pocketbase
chmod +x ./scripts/run-local.sh
chmod +x ./scripts/run-integration-tests.sh
./scripts/run-local.sh
```

### No Windows:
```cmd
scripts\run-local.bat
```

O servidor iniciará em `http://127.0.0.1:8090`. O painel de administração local estará disponível em `http://127.0.0.1:8090/_/`.
Aviso de honestidade: o servidor NÃO roda nem rodou em nuvem/neste ambiente; ele é exclusivamente executado de forma local pelo proprietário.

---

## 3. Contas Sintéticas Disponíveis para Testes

- **Administrador:**
  - Email: `admin-oi@organizacaointeligente.com.br`
  - Senha: `Skip@Pass`
  - Role: `admin`

- **Membro de Teste 1:**
  - Email: `user1@organizacaointeligente.com.br`
  - Senha: `Skip@Pass`
  - Role: `member`

- **Membro de Teste 2:**
  - Email: `user2@organizacaointeligente.com.br`
  - Senha: `Skip@Pass`
  - Role: `member`

---

## 4. Testando o Webhook Kiwify Localmente

Simular compra aprovada da Ferramenta de IA (produto `oi-ia-tool`):
```bash
curl -X POST "http://127.0.0.1:8090/api/oi/webhook/kiwify?token=oi-kiwify-test-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test_order_001",
    "order_status": "paid",
    "order_amount": 9700,
    "Product": {
      "product_id": "oi-ia-tool",
      "product_name": "Ferramenta de IA OI (21 Dias)"
    },
    "Customer": {
      "email": "user1@organizacaointeligente.com.br",
      "full_name": "Cliente 1 Sintético"
    }
  }'
```

Simular compra do Kit (que NÃO libera a ferramenta de IA):
```bash
curl -X POST "http://127.0.0.1:8090/api/oi/webhook/kiwify?token=oi-kiwify-test-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "kit_order_999",
    "order_status": "paid",
    "Product": {
      "product_id": "kit-organizacao-inteligente",
      "product_name": "Kit de Organização Inteligente"
    },
    "Customer": {
      "email": "user1@organizacaointeligente.com.br"
    }
  }'
# Retorno esperado: {"received":true,"ignored":true,"reason":"Produto diferente da Ferramenta de IA da OI..."}
```

Simular Reembolso (revoga acesso imediatamente):
```bash
curl -X POST "http://127.0.0.1:8090/api/oi/webhook/kiwify?token=oi-kiwify-test-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test_order_001",
    "order_status": "refunded",
    "Product": {
      "product_id": "oi-ia-tool"
    }
  }'
# Ciclo é imediatamente marcado como 'revoked'
```

---

## 5. Como Conectar o Frontend da Preview ao Servidor Local

No frontend do projeto React:
Defina a variável `VITE_STANDALONE_OI_API_URL` para o endereço do seu backend local (ex: `http://127.0.0.1:8090`).
Se essa variável estiver vazia ou não configurada, o frontend permanece no modo **fail closed** (apresentação restrita com aviso honesto de que a ferramenta está em preparação).
