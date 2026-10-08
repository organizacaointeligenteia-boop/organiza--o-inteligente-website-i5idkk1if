#!/usr/bin/env bash
# standalone-backend/scripts/run-local.sh
# Script para inicializar o backend PocketBase standalone da Ferramenta OI em ambiente local.

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=========================================================="
echo " Organização Inteligente - Backend Standalone (Local)"
echo " Ferramenta de IA - 21 Dias de Uso Pago"
echo "=========================================================="

# Checar binário do pocketbase (ex: pocketbase oficial 0.40.5 darwin_arm64 ou linux/amd64)
PB_BIN="./pocketbase"
if [ ! -f "$PB_BIN" ]; then
  if [ -f "./pocketbase_darwin_arm64" ]; then
    PB_BIN="./pocketbase_darwin_arm64"
  elif command -v pocketbase &> /dev/null; then
    PB_BIN="pocketbase"
  else
    echo "Binário do PocketBase não encontrado em ./pocketbase ou ./pocketbase_darwin_arm64."
    echo "Coloque o executável oficial do PocketBase (ex: v0.40.5 darwin_arm64) nesta pasta."
    echo "Download oficial: https://pocketbase.io/docs/"
    exit 1
  fi
fi

# Configurações padrão de ambiente para teste local
export OI_KIWIFY_WEBHOOK_SECRET="${OI_KIWIFY_WEBHOOK_SECRET:-oi-kiwify-test-secret}"
export OI_KIWIFY_PRODUCT_ID="${OI_KIWIFY_PRODUCT_ID:-oi-ia-tool}"
export OI_ALLOW_TEST_CLOCK="${OI_ALLOW_TEST_CLOCK:-true}"
export OI_JEV_API_KEY="${OI_JEV_API_KEY:-}"
export OI_JEV_ENDPOINT="${OI_JEV_ENDPOINT:-https://api.typesafe.ai/v1/systemone}"

PORT="${PORT:-8090}"

echo "Iniciando PocketBase na porta $PORT..."
echo "Diretório de migrações: $DIR/pb_migrations"
echo "Diretório de hooks: $DIR/pb_hooks"
echo "URL do servidor: http://127.0.0.1:$PORT"
echo ""

$PB_BIN serve --http="127.0.0.1:$PORT" --dir="$DIR/pb_data" --migrationsDir="$DIR/pb_migrations" --hooksDir="$DIR/pb_hooks"
