# Organização Inteligente - backend local de testes

Pagamento único por 21 dias de uso; 7 dias para iniciar e 30 dias só para resultados após expirar. Vários planos, sem renovação automática e sem promessa de hábito. Preço indefinido, vendas reais bloqueadas.

## Executar

Use o PocketBase oficial 0.40.5 na raiz e execute `bash scripts/run-local.sh`. O servidor fica apenas em `127.0.0.1:8090`. Não aplicar estas migrações no backend compartilhado do GoSkip.

`OI_MODE=test` é obrigatório para os eventos de pagamento simulados. Nenhum evento configura cobrança real. Segredo de teste e produto sintético ficam no processo. Chave Jev real não está incluída.

## Testes

`node scripts/run-integration-tests.mjs` executa a suíte Python local. Alternativa: `python3 scripts/validate_http.py`. Dependência: Python 3 padrão, sem pacotes externos. O alvo precisa ser loopback e a base deve ser descartável de testes. A suíte move o relógio privado e expurga somente planos sintéticos.

`OI_STANDALONE_URL` configura a porta local; `OI_PB_DATA_DIR` configura o diretório de dados do servidor de testes, por padrão `pb_data`. Verificação/reset são reais, com tokens de uso único na caixa local privada `<data-dir>/local_inbox/emails.log`, sem SMTP externo.

`node scripts/test-jev-contract.mjs` valida o contrato com fixtures, sem chamadas ao provedor. API Jev real permanece pendente de chave/saldo.

## Contrato da interface

Login em `/api/oi/auth/login` devolve token nativo do PocketBase. Cadastro e recuperação usam as rotas `/api/oi/auth/*`. A recuperação confirma com `{token,newPassword}`. Cada criar/ajustar exige `requestId` estável; repetir a mesma operação devolve o mesmo resultado sem consumir outra cota. Status 202 indica operação em andamento; repetir o mesmo pedido com o mesmo id, sem trocar objetivo.

CRUD de planos: `/api/oi/plans/list`, `/get?planId=...`, `/create`, `/adjust`, `PATCH /update`, `/export-pdf?planId=...`. Criar/ajustar consomem cota; editar/checklist/export não consomem. Edição cria versão nova com id novo: a interface deve atualizar a seleção usando `response.plan.id`. Resultado precisa ser lido pelas rotas protegidas, nunca diretamente das coleções.

O PDF é um documento real, com Helvetica/WinAnsi para acentos portugueses e paginação. Sem registros/segredos/reais no pacote. Dados e tokens de sessão locais NÃO devem ser exportados.
