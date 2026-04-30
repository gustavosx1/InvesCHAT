# 💰 **InvesCHAT** - Assistente de Investimentos com IA

Um chatbot inteligente de educação financeira que combina inteligência artificial, integração de dados em tempo real e análise de perfil de investidor para fornecer recomendações personalizadas.

---

## 🎯 **Características Principais**

### 1. **Chat de IA Inteligente** 💬
- Assistente baseado em **Google Gemini API** com acesso a dados em tempo real
- Sugestões rápidas de perguntas sobre investimentos (carrossel interativo)
- Histórico de conversa persistente por sessão
- Respostas contextualizadas com informações financeiras atualizadas

### 2. **Simulador de Investimentos** 📊
- Cálculo de projeção de rendimentos com juros compostos
- Suporte a taxa CDI ou SELIC como referência
- Aportes mensais configuráveis
- Visualização em 6 cards de métricas (capital inicial, aportes, taxa efetiva, rendimento estimado, valor final)
- Integração em tempo real com taxas do Banco Central

### 3. **Perfil de Investidor** 👤
- Questionário com 10 questões determinando perfil de risco
- Categorias: Conservador, Moderado, Agressivo, Muito Agressivo
- Persistência de dados com Supabase
- Pontuação baseada em resposta (A=1, B=2, C=3, D=4 pontos)

### 4. **Integração com Dados Reais em Tempo Real** 🔄
- **Preços de Ações** - BrAPI v1 (`/quote/` endpoint)
- **Bitcoin** - BrAPI v2 com autenticação
- **Conversão de Moedas** - BrAPI v2 com autenticação
- **Taxa CDI Atual** - Banco Central Brasil
- **Taxa SELIC** - Banco Central Brasil

### 5. **Design Responsivo** 📱
- Sticky headers e footers que permanecem visíveis ao rolar
- Botões e texto adaptáveis para mobile/tablet/desktop
- Grid layouts responsivos (1 coluna mobile → 2 colunas desktop)
- Padding e spacing ajustados automaticamente

---

## 🚀 **Como Começar**

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Variáveis de ambiente configuradas (ver seção abaixo)

### **Instalação Local**

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente (copiar .env.example para .env.local)
cp .env.example .env.local

# 3. Editar .env.local com suas credenciais
# (ver detalhes na seção "Variáveis de Ambiente")

# 4. Rodar desenvolvimento
npm run dev

# 5. Acessar em http://localhost:3000
```

### **Build para Produção**

```bash
npm run build
npm run start
```

---

## 🔐 **Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto `front/`:

```env
# Google Gemini AI (obrigatório)
NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_gemini_aqui

# Supabase (obrigatório para perfil e autenticação)
NEXT_PUBLIC_SUPABASE_URL=sua_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_anon_key
SUPABASE_URL=sua_supabase_url
SUPABASE_KEY=sua_supabase_service_key

# BrAPI (opcional - necessário para Bitcoin/Conversão de Moeda)
BRAPI_API_KEY=sua_brapi_key
# Nota: Preços de ações funcionam sem autenticação com endpoint v1
```

### **Como obter as credenciais:**

- **Gemini API**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Supabase**: [Console Supabase](https://app.supabase.com)
- **BrAPI**: [Portal BrAPI](https://brapi.dev/)

---

## 📁 **Estrutura do Projeto**

```
front/
├── src/
│   ├── app/
│   │   ├── api/                           # Next.js API routes
│   │   │   ├── chat/
│   │   │   │   ├── route.js               # Chat com Gemini
│   │   │   │   └── session/route.js       # Gerenciar sessões
│   │   │   ├── data/                      # Dados financeiros
│   │   │   │   ├── cdi/route.js           # Taxa CDI atual
│   │   │   │   ├── ipca/route.js
│   │   │   │   ├── selic-atual/route.js   # Taxa SELIC atual
│   │   │   │   └── selic-meta/route.js
│   │   │   ├── investments/               # Dados de investimentos
│   │   │   │   ├── stock-price/route.js   # Preço de ações (BrAPI)
│   │   │   │   ├── bitcoin/route.js       # Preço Bitcoin (BrAPI)
│   │   │   │   └── currency-conversion/route.js  # Câmbio (BrAPI)
│   │   │   └── perfil/                    # Gerenciar perfil do investidor
│   │   │
│   │   ├── Chat/page.jsx                  # 💬 Página principal de chat
│   │   ├── PerfilForm/page.jsx            # 👤 Formulário 10 questões
│   │   ├── InvestPage/page.jsx            # 📊 Simulador de investimentos
│   │   ├── login/page.jsx                 # 🔐 Login
│   │   ├── layout.js                      # Layout global
│   │   ├── page.jsx                       # Home
│   │   ├── globals.css                    # Estilos globais
│   │   └── api/
│   │
│   ├── lib/
│   │   ├── services/
│   │   │   ├── geminiService.js           # Interface com Google Gemini
│   │   │   ├── investmentService.js       # Dados de investimentos (BrAPI)
│   │   │   ├── dataService.js             # Dados econômicos (Banco Central)
│   │   │   └── perfilService.js           # Gerenciar perfil Supabase
│   │   └── supabase.js                    # Cliente Supabase
│   │
│   └── components/
│       └── AuthProvider.js                # Context de autenticação
│
├── public/                                # Assets estáticos
├── package.json                           # Dependências
├── next.config.mjs                        # Configuração Next.js
├── tailwind.config.js                     # Tailwind CSS config
├── postcss.config.mjs                     # PostCSS config
└── .env.example                           # Template de variáveis
```

---

## 🛠️ **Stack Tecnológico**

| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| **Framework** | Next.js | 16.2.2 |
| **UI Framework** | React | 19.2.4 |
| **Styling** | Tailwind CSS | 4.x |
| **Icons** | Lucide React | - |
| **AI/ML** | Google Gemini API | v1.5 |
| **Database** | Supabase (PostgreSQL) | - |
| **Financial Data** | BrAPI | v1/v2 |
| **Economic Data** | Banco Central Brasil | - |
| **Deployment** | Vercel | - |

---

## 🔄 **Fluxo de Dados**

```
┌─────────────────┐
│  Chat Interface │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Gemini  │  (Processamento de IA)
    └────┬─────┘
         │
    ┌────▼──────────────────────────────┐
    │  Investment Services              │
    │  ├─ getStockPrice()               │
    │  ├─ getBitcoinInfo()              │
    │  └─ getCurrencyConversion()       │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │  External APIs                │
    │  ├─ BrAPI (stocks/crypto)     │
    │  ├─ Banco Central (CDI/SELIC) │
    │  └─ Supabase (profiles)       │
    └───────────────────────────────┘
```

---

## 📊 **Perfis de Investidor**

| Perfil | Pontuação Média | Características |
|--------|-----------------|-----------------|
| **Conservador** | 1.0 - 1.75 | Baixo risco, preservação de capital |
| **Moderado** | 1.75 - 2.5 | Risco equilibrado, crescimento moderado |
| **Agressivo** | 2.5 - 3.25 | Risco médio-alto, crescimento agressivo |
| **Muito Agressivo** | 3.25 - 4.0 | Alto risco, máximo crescimento |

---

## 🐛 **Troubleshooting**

### "Erro ao buscar preço de ações"
- Verifique se o ticker está em formato válido (ex: VALE3, PETR4)
- Preços de ações usam endpoint v1 (não requer token)
- Teste: `curl https://brapi.dev/api/quote/VALE3`

### "Bitcoin/Conversão de Moeda não funciona"
- **Solução**: Configure `BRAPI_API_KEY` no `.env.local`
- Esses endpoints requerem autenticação BrAPI v2
- Sem token, retorna mensagem de erro clara

### "Supabase connection error"
- Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Confirme que o projeto Supabase está ativo e a chave não expirou
- Teste conexão: Acesse Profile → Salvar Perfil

### "Chat não responde"
- Verifique `NEXT_PUBLIC_GEMINI_API_KEY`
- Teste chave em [Google AI Studio](https://aistudio.google.com/app/apikey)
- Verifique limite de requisições da API Gemini

---

## 🚀 **Deploy no Vercel**

O projeto está configurado para fazer deploy automático via Vercel. Veja [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) para detalhes.

**Resumo rápido:**
```bash
# 1. Push para GitHub
git push origin main

# 2. Vercel fará build automáticamente
# 3. Acesse seu domínio em https://seu-projeto.vercel.app
```

**Monorepo Configuration**: 
- O `vercel.json` na raiz aponta para o diretório `front/`
- Todas as variáveis de ambiente devem ser definidas no painel Vercel

---

## 📝 **Mudanças Recentes**

### ✅ Versão 1.5 (Atual)
- [x] Corrigidos endpoints BrAPI (stock v1, crypto/currency v2)
- [x] Adicionado carrossel de sugestões de perguntas no Chat
- [x] Headers e footers sticky (fixos ao rolar)
- [x] Design totalmente responsivo para mobile/tablet/desktop
- [x] Botões e texto com tamanhos adaptativos
- [x] Deployment Vercel monorepo funcionando

### 📚 Documentação Adicional
- [BRAPI_FIXES.md](./BRAPI_FIXES.md) - Detalhes das correções de API
- [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) - Guia de deployment
- [API_MIGRATION.md](./API_MIGRATION.md) - Histórico de migrações

---

## 🤝 **Contribuindo**

Para melhorias e correções:
1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Faça commit das mudanças: `git commit -m "Descrição"`
3. Envie para GitHub: `git push origin feature/sua-feature`
4. Abra um Pull Request

---

## 📄 **Licença**

Este projeto está em desenvolvimento. Consulte a licença do repositório.

---

## 📧 **Suporte**

Para dúvidas, problemas ou sugestões:
- Abra uma issue no GitHub
- Verifique a documentação em arquivos `.md`
- Consulte os logs de deployment no Vercel

---

**Última atualização:** Janeiro 2025  
**Status:** ✅ Pronto para Produção  
**Versão:** 1.5