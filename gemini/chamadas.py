import os
import requests
from datetime import date
from dotenv import load_dotenv
from google import genai
from google.genai import types
from supabase import create_client, Client
from datetime import datetime
from brapi import Brapi
data_atual = datetime.now().isoformat(),
load_dotenv()

# ── Funções reais que chamam as APIs ──────────────────────────────────────────
def get_data_atual() -> str:
    """Retorna a data atual para o prompt do Gemini"""
    return datetime.now().strftime("%d-%m-%Y")


def get_perfil_investidor(id: str) -> dict:
    """Busca o perfil do investidor no banco de dados"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    supabase = create_client(url, key)
    response = supabase.table("perfil_teste").select("*").eq("id", id).execute()
    data = response.data
    if data:
        return {
            "perfil": data[0]["perfil"],
        }
    return {"erro": "Perfil não encontrado"}

def get_selic_meta() -> dict:
    """(Meta do Governo) Busca a meta atual da Selic definida pelo Banco central e pelo COPOM"""
    url = (
        "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json"
    )
    response = requests.get(url)
    data = response.json()
    if data:
        return {
            "taxa_selic_diaria": data[0]["valor"],
            "data": data[0]["data"],
        }
    return {"erro": "Não foi possível obter a SELIC"}


def get_selic_efetiva() -> dict:
    """(Selic efetiva no mercado) Busca a SELIC efetiva atual para investidores e calcular rendimentos reais de investimentos"""
    url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4189/dados/ultimos/1?formato=json"
    resp = requests.get(url, timeout=5)
    data = resp.json()
    if data:
        return {
            "taxa_selic_atual": data[0]["valor"],
            "data": data[0]["data"],
        }
    return {"erro": "Não foi possível obter a SELIC"}

def get_cdi_acumulada() -> dict:
    """Busca a taxa CDI atual acumulada para calcular rendimentos reais de investimentos"""
    url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados/ultimos/12?formato=json"
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        acumulado = 1
        if not data:
            return {"erro": "Resposta vazia da API"}
        
        for item in data:
            taxa = float(item["valor"]) / 100  # transforma % em decimal
            acumulado *= 1 + taxa

        cdi_12_meses = (acumulado - 1) * 100
        return {
                "cdi_12_meses": round(cdi_12_meses, 2),
                "referencia": data[-1]["data"],
            }
    except requests.RequestException as e:
        return {"erro": f"Erro na requisição: {e}"}
    except (KeyError, ValueError) as e:
        return {"erro": f"Erro ao processar os dados: {e}"}


def get_ipca() -> dict:
    """Busca o IPCA do último mês na API do Banco Central"""
    url = (
        "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json"
    )
    resp = requests.get(url, timeout=5)
    data = resp.json()
    if data:
        return {
            "ipca_mensal_pct": data[0]["valor"],
            "referencia": data[0]["data"],
        }
    return {"erro": "Não foi possível obter o IPCA"}


def get_ipca_acumulado() -> dict:
    """Busca o IPCA acumulado dos últimos 12 meses (juros compostos)"""
    url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if not data:
            return {"erro": "Resposta vazia da API"}

        acumulado = 1

        for item in data:
            taxa = float(item["valor"]) / 100  # transforma % em decimal
            acumulado *= 1 + taxa

        ipca_12_meses = (acumulado - 1) * 100

        return {
            "ipca_12_meses": round(ipca_12_meses, 2),
            "referencia": data[-1]["data"],
        }
    except requests.RequestException as e:
        return {"erro": f"Erro na requisição: {e}"}
    except (KeyError, ValueError) as e:
        return {"erro": f"Erro ao processar os dados: {e}"}

#Funções do mercado variável (ações, FIIs, etc) usando a API da BrAPI
clientBrapi = Brapi(
    api_key=os.environ.get("BRAPI_API_KEY")
)
 
def get_stock_price(ticker: str) -> dict:
    """Busca o preço atual e variação de uma ação da B3 pelo ticker usando a API da BrAPI"""
    try:
        response = clientBrapi.quote.retrieve(tickers=ticker)
        if response.results and len(response.results) > 0:
            stock_data = response.results[0]
            return {
                "ticker": stock_data.symbol,
                "price": stock_data.regular_market_price,    
                "regular_market_day_high": stock_data.regular_market_day_high,
                "regular_market_day_low": stock_data.regular_market_day_low,
                "fifty_two_week_high": stock_data.fifty_two_week_high,
                "fifty_two_week_low": stock_data.fifty_two_week_low,
                "regular_market_change_percent": stock_data.regular_market_change_percent,
            }
        else:
            return {"erro": f"Ticker {ticker} não encontrado"}
    except Exception as e:
        return {"erro": f"Erro ao buscar preço da ação: {str(e)}"}
    

def get_bitcoin_info() -> dict:
    """Busca o preço atual do Bitcoin usando a API da BrAPI"""
    try:
        response = clientBrapi.crypto.retrieve(coin="BTC")
        if response.currency:
            return {
                "coin": response.coin,
                "price": response.regular_market_price,
                "currency": response.currency,
                "market_cap_rank": getattr(response, 'market_cap_rank', None),
            }
        else:
            return {"erro": "Bitcoin não encontrado"}
    except Exception as e:
        return {"erro": f"Erro ao buscar preço do Bitcoin: {str(e)}"}


def get_currency_conversion(currency: str) -> dict:
    """Busca a taxa de conversão de moeda para BRL usando a API da BrAPI"""
    try:
        currency_pair = f"{currency.upper()}-BRL"
        response = clientBrapi.currency.retrieve(currency=currency_pair)
        if response:
            return {
                "currency_pair": currency_pair,
                "ask": response.ask,
                "bid": response.bid,
                "timestamp": getattr(response, 'timestamp', None),
            }
        else:
            return {"erro": f"Moeda {currency} não encontrada"}
    except Exception as e:
        return {"erro": f"Erro ao buscar conversão de moeda: {str(e)}"}

    
# ── Declaração das funções pro Gemini ─────────────────────────────────────────

tools = [
    types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="get_data_atual",
                description="Retorna a data atual para o prompt do Gemini",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="get_cdi_acumulada",
                description="Busca a taxa CDI atual acumulada para calcular rendimentos reais de investimentos",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
          
            types.FunctionDeclaration(
                name="get_stock_price",
                description="Busca o preço atual e variação de uma ação da B3 pelo ticker",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "ticker": types.Schema(
                            type="STRING",
                            description="Ticker da ação",
                        )
                    },
                    required=["ticker"],
                ),
            ),
            types.FunctionDeclaration(
                name="get_perfil_investidor",
                description="Busca o perfil do investidor no banco de dados pelo ID",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "id": types.Schema(
                            type="STRING",
                            description="ID do investidor no banco de dados em uuid4. Exemplo: 'xxxx-xxxx-xxxx'",
                        )
                    },
                    required=["id"],
                ),
            ),
            types.FunctionDeclaration(
                name="get_selic_efetiva",
                description="Retorna a taxa Selic efetiva do mercado para calcular rendimentos reais de investimentos",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
             types.FunctionDeclaration(
                name="get_selic_meta",
                description="Retorna a meta da Selic definida pelo Banco Central e COPOM para referência de investimentos em renda fixa",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="get_ipca",
                description="Retorna o IPCA do último mês (inflação oficial do Brasil)",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="get_ipca_acumulado",
                description="Retorna o IPCA acumulado dos últimos 12 meses(inflação oficial do Brasil)",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="get_bitcoin_info",
                description="Busca o preço atual do Bitcoin para referência de investimentos em criptomoedas",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="get_currency_conversion",
                description="Busca a taxa de conversão de moedas (USD, EUR, WAN) para BRL",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "currency": types.Schema(
                            type="STRING",
                            description="Código da moeda: USD, EUR ou WAN",
                        )
                    },
                    required=["currency"],
                ),
            )
           
        ]
    )
]

SYSTEM_PROMPT = """
Você é um assistente especializado em investimentos no mercado brasileiro. Lembre-se, você é um facilitador de educação, utilize linguagem simples e clara.
Responda apenas sobre: ações, renda fixa, FIIs, Tesouro Direto, SELIC, CDI, IPCA, carteiras e rendimentos reais de ações e títulos públicos, única excessão é ensinar sobre criptomoedas e informações sobre bitcoin.
Use as ferramentas disponíveis para buscar dados reais antes de responder.
Sempre avise que suas respostas são educativas e não constituem recomendação profissional.

## ALOCAÇÃO RECOMENDADA POR PERFIL (use ao apresentar o resultado)

**Conservador**
- Renda fixa: 90–100%
- Multimercado/FII: 0–5%
- Renda variável: 0%
- Produtos compatíveis: Poupança, CDB com FGC, LCI/LCA, Tesouro Selic, Fundo DI, CRI/CRA rating AAA

**Moderado**
- Renda fixa: 65–75%
- Multimercado/FII: 10–20%
- Renda variável: 5–15%
- Produtos compatíveis: CDB pós-fixado, Tesouro IPCA+, Fundos multimercado, FIIs, Ações blue chips, Debêntures incentivadas

**Arrojado**
- Renda fixa: 40–55%
- Multimercado/FII: 15–20%
- Renda variável: 20–35%
- Produtos compatíveis: Ações diversificadas, Fundos de ações, ETFs, FIIs, Debêntures, BDRs

**Agressivo**
- Renda fixa: 20–35%
- Multimercado/FII: 10–15%
- Renda variável: 40–60%nn
- Produtos compatíveis: Opções/Derivativos, Ações small caps, Criptoativos, Fundos long & short, COE, FIP/Venture capital

---


"""

FUNCOES = {
    "get_data_atual": get_data_atual,
    "get_selic_meta": get_selic_meta,
    "get_cdi_acumulada": get_cdi_acumulada,
    "get_ipca_acumulado": get_ipca_acumulado,
    "get_stock_price": get_stock_price,
    "get_selic_efetiva": get_selic_efetiva,
    "get_ipca": get_ipca,
    "get_perfil_investidor": get_perfil_investidor,
    "get_bitcoin_info": get_bitcoin_info,
    "get_currency_conversion": get_currency_conversion,
}
