# Correções da API BrAPI

## Problemas Identificados

1. **Stock Price (Ações)**: Estava usando endpoint `/v2/quote?symbols=PETR4` que não existe. 
   - ✅ Corrigido para: `/quote/PETR4` (v1 funciona sem token)

2. **Bitcoin**: Endpoint `/v2/crypto` requer token BrAPI
   - ✅ Adicionado validação se token existe
   - Sem token: retorna mensagem informativa

3. **Câmbio (Currency)**: Endpoint `/v2/currency` requer token BrAPI
   - ✅ Adicionado validação se token existe
   - Sem token: retorna mensagem informativa

4. **Passagem de Parâmetros**: As API routes estavam passando strings direto em vez de objetos
   - ✅ Corrigido `getStockPrice(ticker)` → `getStockPrice({ ticker })`
   - ✅ Corrigido `getCurrencyConversion(currency)` → `getCurrencyConversion({ currency })`

## Testes Realizados

```bash
# Stock Price funciona
curl https://brapi.dev/api/quote/PETR4
# Retorna: { results: [...], requestedAt, took }

# Bitcoin precisa de token
curl https://brapi.dev/api/v2/crypto?coin=BTC
# Retorna: { error: true, message: "Token de autenticação não fornecido" }

# Moedas precisam de token
curl https://brapi.dev/api/v2/currency?currency=USD-BRL
# Retorna: { error: true, message: "Token de autenticação não fornecido" }
```

## Como Usar

### Sem Token (Ações Gratuitas)

```javascript
// Funciona diretamente
const stock = await fetch('/api/investments/stock-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ticker: 'PETR4' })
}).then(r => r.json());

// Ações gratuitas disponíveis: PETR4, MGLU3, VALE3, ITUB4
```

### Com Token (Todas as Ações, Bitcoin e Moedas)

1. Crie account em https://brapi.dev/dashboard
2. Gere sua chave de API
3. Configure no `.env`:
   ```
   NEXT_PUBLIC_BRAPI_API_KEY=sua_chave_aqui
   ```

Então funciona:
```javascript
// Bitcoin
const btc = await fetch('/api/investments/bitcoin').then(r => r.json());

// Câmbio
const usd = await fetch('/api/investments/currency-conversion', {
  method: 'POST',
  body: JSON.stringify({ currency: 'USD' })
}).then(r => r.json());
```

## Arquivos Modificados

- `src/app/lib/services/investmentService.js` - Endpoints da API corrigidos
- `src/app/api/investments/stock-price/route.js` - Passagem de parâmetros corrigida
- `src/app/api/investments/currency-conversion/route.js` - Passagem de parâmetros corrigida
- `.env.example` - Documentação de configuração adicionada
