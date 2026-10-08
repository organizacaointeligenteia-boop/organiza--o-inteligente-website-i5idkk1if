@echo off
REM standalone-backend/scripts/run-local.bat
REM Script para inicializar o backend PocketBase standalone em Windows

cd /d "%~dp0\.."

echo ==========================================================
echo  Organizacao Inteligente - Backend Standalone (Local Windows)
echo  Ferramenta de IA - 21 Dias de Uso Pago
echo ==========================================================

set PB_BIN=pocketbase.exe
if not exist "%PB_BIN%" (
  echo Executavel pocketbase.exe nao encontrado nesta pasta.
  echo Baixe o executavel Windows em https://pocketbase.io/docs/
  pause
  exit /b 1
)

set OI_KIWIFY_WEBHOOK_SECRET=oi-kiwify-test-secret
set OI_KIWIFY_PRODUCT_ID=oi-ia-tool
set OI_ALLOW_TEST_CLOCK=true

echo Iniciando PocketBase na porta 8090...
"%PB_BIN%" serve --http="127.0.0.1:8090" --dir="pb_data" --migrationsDir="pb_migrations" --hooksDir="pb_hooks"
