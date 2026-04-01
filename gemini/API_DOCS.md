# 📡 InvesChat API - Documentação

## Visão Geral

API REST para integrar o assistente de investimentos com outros aplicativos. Mantém sessões de conversa e permite acesso direto às ferramentas de dados.

## Instalação

1. Instale as dependências adicionais:
```bash
pip install fastapi uvicorn
```

Ou use o arquivo de requirements:
```bash
pip install -r requirements-api.txt
```

2. Execute a API:
```bash
python api.py
```

A API estará disponível em: `http://localhost:8000`

Documentação interativa: `http://localhost:8000/docs`

---

## Endpoints

### 🏥 Health Check

**GET** `/health`

Verifica se a API está rodando.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-03-31T10:30:00.000000"
}
```

---

### 💬 Chat com Gemini

**POST** `/api/chat`

Envia uma pergunta para o assistente e recebe resposta. Mantém histórico de conversa.

**Request:**
```json
{
  "pergunta": "Qual é a cotação atual da PETR4?",
  "session_id": "opcional-use-para-continuar-conversa"
}
```

**Response (200):**
```json
{
  "session_id": "uuid-da-sessao",
  "pergunta": "Qual é a cotação atual da PETR4?",
  "resposta": "De acordo com os dados atuais... (resposta do Gemini)",
  "timestamp": "2025-03-31T10:30:00.000000"
}
```

**Exemplo cURL:**
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "pergunta": "Qual é a taxa SELIC atual?",
    "session_id": null
  }'
```

---

### 🆔 Criar Nova Sessão

**POST** `/api/new-session`

Cria uma nova sessão de conversa vazia.

**Response (200):**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "criada_em": "2025-03-31T10:30:00.000000"
}
```

**Exemplo:**
```bash
curl -X POST "http://localhost:8000/api/new-session"
```

---

### 📈 Cotação de Ações

**POST** `/api/stock-price`

Busca a cotação de uma ação sem necessidade de manter sessão.

**Request:**
```json
{
  "ticker": "PETR4"
}
```

**Response (200):**
```json
{
  "ticker": "PETR4",
  "dados": {
    "ticker": "PETR4",
    "preco": 28.50,
    "variacao_pct": 1.25,
    "abertura": 28.10,
    "max_dia": 28.75,
    "min_dia": 28.00
  },
  "timestamp": "2025-03-31T10:30:00.000000"
}
```

**Ações disponíveis (sem token):** PETR4, VALE3, MGLU3, ITUB4

---

### 🎯 Meta SELIC

**GET** `/api/selic-meta`

Busca a meta SELIC definida pelo Banco Central.

**Response (200):**
```json
{
  "dados": {
    "taxa_selic_diaria": 10.50,
    "data": "31/03/2025"
  },
  "timestamp": "2025-03-31T10:30:00.000000"
}
```

---

### 💰 SELIC Atual (Efetiva)

**GET** `/api/selic-atual`

Busca a taxa SELIC efetiva no mercado para investidores.

**Response (200):**
```json
{
  "dados": {
    "taxa_selic_atual": 10.50,
    "data": "31/03/2025"
  },
  "timestamp": "2025-03-31T10:30:00.000000"
}
```

---

### 📊 IPCA Mensal

**GET** `/api/ipca`

Busca o IPCA (inflação) do último mês.

**Response (200):**
```json
{
  "dados": {
    "ipca_mensal_pct": 0.45,
    "referencia": "31/03/2025"
  },
  "timestamp": "2025-03-31T10:30:00.000000"
}
```

---

### 📈 IPCA Acumulado 12 Meses

**GET** `/api/ipca-acumulado`

Busca a inflação acumulada dos últimos 12 meses.

**Response (200):**
```json
{
  "dados": {
    "ipca_12_meses": 4.82,
    "referencia": "31/03/2025"
  },
  "timestamp": "2025-03-31T10:30:00.000000"
}
```

---

## Exemplos de Uso

### JavaScript/Fetch

```javascript
// Criar nova sessão
const sessionRes = await fetch('http://localhost:8000/api/new-session', {
  method: 'POST'
});
const { session_id } = await sessionRes.json();

// Fazer pergunta
const chatRes = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pergunta: "Como está o mercado hoje?",
    session_id: session_id
  })
});
const { resposta } = await chatRes.json();
console.log(resposta);
```

### Python

```python
import requests

# Criar nova sessão
resp = requests.post('http://localhost:8000/api/new-session')
session_id = resp.json()['session_id']

# Fazer pergunta
resp = requests.post('http://localhost:8000/api/chat', json={
    "pergunta": "Qual é o preço da VALE3?",
    "session_id": session_id
})
resultado = resp.json()
print(resultado['resposta'])
```

### cURL

```bash
# Cotação de ação
curl -X POST "http://localhost:8000/api/stock-price" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "PETR4"}'

# IPCA acumulado
curl -X GET "http://localhost:8000/api/ipca-acumulado"

# Chat com sessão
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "Recomenda investir em FII?", "session_id": "sua-session-id"}'
```

---

## Notas Importantes

- ✅ A API **não modifica** o código original (`agent_test.py`)
- ✅ **Mantém sessões em memória** - histórico é perdido ao reiniciar
- ⚠️ Para produção, considere adicionar um banco de dados para persistência
- ⚠️ A API está com CORS aberto (`*`) - ajuste conforme necessário
- ⚠️ Certifique-se que `GEMINI_API_KEY` está configurada no `.env`

---

## Integração com Seu App

1. Inicie a API em um terminal:
   ```bash
   python api.py
   ```

2. Do seu aplicativo, faça requisições para `http://localhost:8000/api/*`

3. Use a documentação interativa em `http://localhost:8000/docs` para testar

---

## Status Codes

- `200`: Sucesso
- `422`: Validação falhou nos dados enviados
- `500`: Erro interno do servidor (confira os logs)

---

## Sistema de Sessões

Cada conversa tem um `session_id`:

1. **Sem session_id**: Uma nova sessão é criada automaticamente
2. **Com session_id**: A conversa continua no histórico anterior
3. **Histórico em memória**: Reiniciar a API limpa todas as sessões

Exemplo de conversa multi-turn:
```bash
# Criar sessão
SESSION_ID=$(curl -s -X POST http://localhost:8000/api/new-session | jq -r '.session_id')

# Pergunta 1
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d "{\"pergunta\": \"Qual a SELIC?\", \"session_id\": \"$SESSION_ID\"}"

# Pergunta 2 (continua conversando)
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d "{\"pergunta\": \"E o IPCA?\", \"session_id\": \"$SESSION_ID\"}"
```
