# InvesChat - Migração Python → Next.js

## 🎯 Visão Geral

Todo o backend Python foi migrado para JavaScript/Next.js. Agora o projeto roda completamente no frontend com deploy único.

## 📁 Estrutura dos Serviços

### Serviços (`/src/lib/services/`)

- **dataService.js** - Dados econômicos (SELIC, IPCA, CDI) da API do Banco Central
- **investmentService.js** - Investimentos (ações, Bitcoin, câmbio) via BrAPI
- **geminiService.js** - Integração IA com Gemini (chat, function calling)
- **perfilService.js** - Dados de perfil do investidor no Supabase

### API Routes (`/src/app/api/`)

#### Chat
- `POST /api/chat` - Envia pergunta para o assistente
- `POST /api/chat/session` - Cria nova sessão

#### Dados Econômicos
- `GET /api/data/selic-meta` - Meta SELIC do Banco Central
- `GET /api/data/selic-atual` - SELIC efetiva do mercado
- `GET /api/data/ipca` - IPCA do último mês
- `GET /api/data/ipca-acumulado` - IPCA acumulado 12 meses
- `GET /api/data/cdi` - CDI acumulada 12 meses

#### Investimentos
- `POST /api/investments/stock-price` - Preço de ação
- `GET /api/investments/bitcoin` - Preço do Bitcoin
- `POST /api/investments/currency-conversion` - Taxa de câmbio

## 🔧 Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Preencha os valores:

\`\`\`env
# Gemini API (obtém em https://ai.google.dev)
NEXT_PUBLIC_GEMINI_API_KEY=seu_gemini_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key

# BrAPI (opcional, limite gratuito disponível)
NEXT_PUBLIC_BRAPI_API_KEY=sua_key_brapi
\`\`\`

### 2. Instalação de Dependências

\`\`\`bash
npm install
\`\`\`

Já instaladas:
- `@google/generative-ai` - Gemini AI
- `axios` - Requisições HTTP
- `@supabase/supabase-js` - Supabase client

### 3. Executar em Desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Acesse `http://localhost:3000`

## 📝 Exemplos de Uso

### Chat com Gemini

\`\`\`javascript
// Criar nova sessão
const sessionRes = await fetch('/api/chat/session', { method: 'POST' });
const { sessionId } = await sessionRes.json();

// Enviar pergunta
const chatRes = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pergunta: 'Qual é a cotação da PETR4?',
    session_id: sessionId,
    user_id: 'optional-user-uuid'
  })
});

const { resposta } = await chatRes.json();
console.log(resposta);
\`\`\`

### Dados Econômicos Diretos

\`\`\`javascript
// SELIC meta
const selic = await fetch('/api/data/selic-meta').then(r => r.json());

// IPCA acumulado
const ipca = await fetch('/api/data/ipca-acumulado').then(r => r.json());

// CDI
const cdi = await fetch('/api/data/cdi').then(r => r.json());
\`\`\`

### Investimentos

\`\`\`javascript
// Preço de ação
const stock = await fetch('/api/investments/stock-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ticker: 'PETR4' })
}).then(r => r.json());

// Bitcoin
const btc = await fetch('/api/investments/bitcoin').then(r => r.json());

// Câmbio
const usd = await fetch('/api/investments/currency-conversion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ currency: 'USD' })
}).then(r => r.json());
\`\`\`

## 🚀 Deploy

### Vercel (Recomendado)

1. Push do código para GitHub
2. Conecte no Vercel
3. Adicione as variáveis de ambiente no Vercel
4. Deploy automático

\`\`\`bash
vercel env add NEXT_PUBLIC_GEMINI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... etc
vercel deploy
\`\`\`

### Outras Plataformas

Qualquer plataforma que suporte Next.js funciona (Netlify, Railway, etc)

## 📊 Diferenças da Versão Python

| Feature | Python (FastAPI) | JavaScript (Next.js) |
|---------|------------------|---------------------|
| Servidor | Separado na porta 8000 | Integrado no frontend |
| Deploy | 2 apps (Python + UI) | 1 app único |
| Escalabilidade | Horizontal (múltiplas instâncias) | Serverless (Vercel) |
| Cold Start | Minimizado | Otimizado (Edge Functions) |
| Storage de Sessões | Memória do servidor | Memória ou Redis |
| APIs Externas | Requisições internas | Requisições do cliente/servidor |

## 🔄 Armazenamento de Sessões

**Atualmente**: Em memória (Map JavaScript)
- ✅ Perfeito para desenvolvimento
- ⚠️ Perdidas ao reiniciar

**Para produção**: Migre para:
- KV Store (Vercel KV)
- Redis
- Banco de dados (Supabase)

Exemplo com Vercel KV:

\`\`\`javascript
import { kv } from '@vercel/kv';

// Salvar sessão
await kv.hset(\`session:\${sessionId}\`, { historico, user_id });

// Recuperar sessão
const session = await kv.hgetall(\`session:\${sessionId}\`);
\`\`\`

## ✅ Checklist de Desenvolvimento

- [ ] Configurar `.env.local` com as chaves
- [ ] Testar chat básico
- [ ] Testar endpoints de dados
- [ ] Testar integração com Gemini
- [ ] Testar autenticação com Supabase
- [ ] Preparar para deploy

## 📚 Referências

- [Gemini API Docs](https://ai.google.dev/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase JS](https://supabase.com/docs/reference/javascript)
- [BrAPI Docs](https://brapi.dev/docs)
- [BCB API Docs](https://www.bcb.gov.br/en/statistics/inflation)

## 🐛 Troubleshooting

### "GEMINI_API_KEY" undefined

Verifique se está em `.env.local` com o prefixo `NEXT_PUBLIC_`

### Erro ao chamar BrAPI

O limite gratuito é de 100 req/dia. Compre uma chave ou use cache

### Sessões perdidas ao hot reload

Normal em desenvolvimento. Para produção, use KV/Redis

## 📞 Suporte

Para problemas com a integração, verifique:
1. Variáveis de ambiente
2. Logs do servidor (`npm run dev`)
3. Network tab do navegador (DevTools)
4. Documentação de cada API externa
