### **Projeto de ChatBot de educação financeira**

Como rodar o código:
- npm i
- npm run dev

**.env (Variáveis de ambiente):
NEXT_PUBLIC_GEMINI_API_KEY = X
SUPABASE_URL =  X
SUPABASE_KEY =  X
BRAPI_API_KEY =  X
NEXT_PUBLIC_SUPABASE_URL =  X
NEXT_PUBLIC_SUPABASE_ANON_KEY =  X

### 1. Pages (Frontend)

| Arquivo | Linha | Alteração |
|---------|-------|-----------|
| `src/app/Chat/page.jsx` | 29 | `http://localhost:8000/api/new-session` → `/api/chat/session` |
| `src/app/Chat/page.jsx` | 48 | `http://localhost:8000/api/chat` → `/api/chat` |
| `src/app/InvestPage/page.jsx` | 91-104 | `https://api.bcb.gov.br/...` → `/api/data/cdi` e `/api/data/selic-atual` |

### 2. API Routes

| Arquivo | Correção |
|---------|----------|
| `src/app/api/perfil/route.js` | Variáveis de ambiente: `SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL` |
| `src/app/api/perfil/route.js` | Variáveis de ambiente: `SUPABASE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `src/app/api/perfil/[id]/route.js` | Removido import de arquivo inexistente, usando `createClient` direto |

---

## 📁 Estrutura Atualizada

```
front/
├── src/
│   ├── app/
│   │   ├── api/                    ← Todas as APIs aqui
│   │   │   ├── chat/
│   │   │   ├── data/
│   │   │   ├── investments/
│   │   │   └── perfil/
│   │   ├── Chat/page.jsx           ✅ Atualizado
│   │   ├── InvestPage/page.jsx     ✅ Atualizado
│   │   └── PerfilForm/page.jsx     ✅ Funcionando
│   ├── lib/services/               ← Serviços de dados para o gemini buscar dados em tempo real
│   └── components/

```
**Data:** Abril 29, 2026  
**Status:** ✅ Pronto para Produção