#!/usr/bin/env bash
# standalone-backend/scripts/run-integration-tests.sh
# Executa os testes de integração HTTP reais contra o servidor PocketBase local.

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "Executando testes de integração HTTP reais contra o PocketBase local..."
export OI_STANDALONE_URL="${OI_STANDALONE_URL:-http://127.0.0.1:8090}"
export OI_KIWIFY_WEBHOOK_SECRET="${OI_KIWIFY_WEBHOOK_SECRET:-oi-kiwify-test-secret}"

node "$DIR/scripts/run-integration-tests.mjs"
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "FALHA: A suíte de testes de integração falhou com código $TEST_EXIT_CODE."
  exit $TEST_EXIT_CODE
fi

echo "Execução de testes finalizada com sucesso."
