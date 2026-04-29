#!/bin/bash
# 🔍 Checklist de Verificação da Migração Python → JavaScript
# Copie e execute este script para validar a migração

echo "════════════════════════════════════════════════════"
echo "  ✓ VERIFICAÇÃO DA MIGRAÇÃO PYTHON → JAVASCRIPT"
echo "════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} Arquivo existe: $1"
    return 0
  else
    echo -e "${RED}✗${NC} Arquivo NÃO encontrado: $1"
    return 1
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} Diretório existe: $1"
    return 0
  else
    echo -e "${RED}✗${NC} Diretório NÃO encontrado: $1"
    return 1
  fi
}

echo "1️⃣  VERIFICANDO SERVIÇOS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "src/lib/services/dataService.js"
check_file "src/lib/services/investmentService.js"
check_file "src/lib/services/geminiService.js"
check_file "src/lib/services/perfilService.js"
echo ""

echo "2️⃣  VERIFICANDO API ROUTES..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "src/app/api/chat/route.js"
check_file "src/app/api/chat/session/route.js"
check_file "src/app/api/data/selic-meta/route.js"
check_file "src/app/api/data/selic-atual/route.js"
check_file "src/app/api/data/ipca/route.js"
check_file "src/app/api/data/ipca-acumulado/route.js"
check_file "src/app/api/data/cdi/route.js"
check_file "src/app/api/investments/stock-price/route.js"
check_file "src/app/api/investments/bitcoin/route.js"
check_file "src/app/api/investments/currency-conversion/route.js"
echo ""

echo "3️⃣  VERIFICANDO COMPONENTES..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "src/components/ChatGemini.jsx"
echo ""

echo "4️⃣  VERIFICANDO DOCUMENTAÇÃO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file ".env.example"
check_file "API_MIGRATION.md"
check_file "CHAT_INTEGRATION.md"
check_file "MIGRATION_SUMMARY.md"
echo ""

echo "5️⃣  VERIFICANDO DEPENDÊNCIAS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "@google/generative-ai" package.json; then
  echo -e "${GREEN}✓${NC} @google/generative-ai instalado"
else
  echo -e "${RED}✗${NC} @google/generative-ai NÃO encontrado"
fi

if grep -q "axios" package.json; then
  echo -e "${GREEN}✓${NC} axios instalado"
else
  echo -e "${RED}✗${NC} axios NÃO encontrado"
fi

if grep -q "@supabase/supabase-js" package.json; then
  echo -e "${GREEN}✓${NC} @supabase/supabase-js instalado"
else
  echo -e "${RED}✗${NC} @supabase/supabase-js NÃO encontrado"
fi
echo ""

echo "6️⃣  VERIFICANDO VARIÁVEIS DE AMBIENTE..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✓${NC} Arquivo .env.local existe"
  
  if grep -q "NEXT_PUBLIC_GEMINI_API_KEY" .env.local; then
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_GEMINI_API_KEY configurada"
  else
    echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_GEMINI_API_KEY não configurada"
  fi
  
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL configurada"
  else
    echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_SUPABASE_URL não configurada"
  fi
else
  echo -e "${YELLOW}⚠${NC} Arquivo .env.local NÃO existe"
  echo "   → Execute: cp .env.example .env.local"
fi
echo ""

echo "7️⃣  ESTATÍSTICAS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

count_js=$(find src/lib/services src/app/api -name "*.js" 2>/dev/null | wc -l)
count_jsx=$(find src/components -name "*.jsx" 2>/dev/null | wc -l)
total_files=$((count_js + count_jsx))

echo "Arquivos JavaScript (Services + Routes): $count_js"
echo "Arquivos JSX (Componentes): $count_jsx"
echo "Total de arquivos: $total_files"
echo ""

echo "════════════════════════════════════════════════════"
echo "  ✓ VERIFICAÇÃO CONCLUÍDA"
echo "════════════════════════════════════════════════════"
echo ""
echo "Próximos passos:"
echo "1. npm install (se não feito)"
echo "2. Configure .env.local com seus dados"
echo "3. npm run dev"
echo "4. Abra http://localhost:3000"
echo ""
echo "Para mais detalhes, leia: API_MIGRATION.md"
