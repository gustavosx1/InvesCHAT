import os
import requests
from datetime import date
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# ── Funções reais que chamam as APIs ──────────────────────────────────────────


def get_stock_price(ticker: str) -> dict:
    """Busca cotação na brapi.dev (sem token pras ações de teste)"""
    url = f"https://brapi.dev/api/quote/{ticker.upper()}"
    resp = requests.get(url, timeout=5)
    data = resp.json()
    if "results" in data and data["results"]:
        r = data["results"][0]
        return {
            "ticker": r["symbol"],
            "preco": r["regularMarketPrice"],
            "variacao_pct": r["regularMarketChangePercent"],
            "abertura": r["regularMarketOpen"],
            "max_dia": r["regularMarketDayHigh"],
            "min_dia": r["regularMarketDayLow"],
        }
    return {"erro": "Ação não encontrada"}


def get_selic() -> dict:
    """Busca a SELIC atual na API do Banco Central (sem autenticação)"""
    url = (
        "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json"
    )
    resp = requests.get(url, timeout=5)
    data = resp.json()
    if data:
        return {
            "taxa_selic_diaria": data[0]["valor"],
            "data": data[0]["data"],
        }
    return {"erro": "Não foi possível obter a SELIC"}


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


# ── Declaração das funções pro Gemini ─────────────────────────────────────────

tools = [
    types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="get_stock_price",
                description="Busca o preço atual e variação de uma ação da B3 pelo ticker",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "ticker": types.Schema(
                            type="STRING",
                            description="Ticker da ação. Disponíveis sem token: PETR4, VALE3, MGLU3, ITUB4",
                        )
                    },
                    required=["ticker"],
                ),
            ),
            types.FunctionDeclaration(
                name="get_selic",
                description="Retorna a taxa SELIC diária atual do Banco Central",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
            types.FunctionDeclaration(
                name="get_ipca",
                description="Retorna o IPCA do último mês (inflação oficial do Brasil)",
                parameters=types.Schema(type="OBJECT", properties={}),
            ),
        ]
    )
]

SYSTEM_PROMPT = """
Você é um assistente especializado em investimentos no mercado brasileiro.
Responda apenas sobre: ações, renda fixa, FIIs, Tesouro Direto, SELIC, CDI, IPCA e carteiras.
Use as ferramentas disponíveis para buscar dados reais antes de responder.
Sempre avise que suas respostas são educativas e não constituem recomendação profissional.
"""

# ── Mapa de funções disponíveis ───────────────────────────────────────────────

FUNCOES = {
    "get_stock_price": get_stock_price,
    "get_selic": get_selic,
    "get_ipca": get_ipca,
}

# ── Loop de execução ──────────────────────────────────────────────────────────


def chamar_gemini(pergunta: str, historico: list) -> str:
    historico.append(types.Content(role="user", parts=[types.Part(text=pergunta)]))

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=historico,
        config=types.GenerateContentConfig(
            tools=tools,
            system_instruction=SYSTEM_PROMPT,
        ),
    )

    # Verifica se o modelo quer chamar alguma função
    tool_calls = [p for p in response.candidates[0].content.parts if p.function_call]

    if tool_calls:
        # Executa todas as funções solicitadas
        result_parts = []
        for part in tool_calls:
            fc = part.function_call
            resultado = FUNCOES[fc.name](**fc.args)
            result_parts.append(
                types.Part(
                    function_response=types.FunctionResponse(
                        name=fc.name, response=resultado
                    )
                )
            )

        # Devolve os resultados pro Gemini finalizar a resposta
        historico.append(response.candidates[0].content)
        historico.append(types.Content(role="user", parts=result_parts))

        final = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=historico,
            config=types.GenerateContentConfig(
                tools=tools,
                system_instruction=SYSTEM_PROMPT,
            ),
        )
        resposta = final.text
        historico.append(types.Content(role="model", parts=[types.Part(text=resposta)]))
        return resposta

    resposta = response.text
    historico.append(types.Content(role="model", parts=[types.Part(text=resposta)]))
    return resposta


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    historico = []
    print("Bot de investimentos iniciado. Digite 'sair' para encerrar.\n")
    while True:
        pergunta = input("Você: ")
        if pergunta.lower() == "sair":
            break
        resposta = chamar_gemini(pergunta, historico)
        print(f"\nBot: {resposta}\n")
