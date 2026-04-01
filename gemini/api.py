import os
import uuid
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

# Importa as funções e configurações do agent_test.py
from chamdas import (
    chamar_gemini,
    get_stock_price,
    get_meta_selic,
    get_selic_real,
    get_ipca,
    get_ipca_acumulado,
    get_perfil_investidor,
    tools,
    SYSTEM_PROMPT,
    FUNCOES,
)

load_dotenv()

# ── Inicializar FastAPI ────────────────────────────────────────────────

app = FastAPI(
    title="InvesChat API",
    description="API para consultar o assistente de investimentos",
    version="1.0.0",
)

# ── CORS (permite requisições de outros apps) ──────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens. Ajuste conforme necessário
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Inicializar cliente Gemini ─────────────────────────────────────────

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# ── Modelos Pydantic ───────────────────────────────────────────────────


class PerguntaRequest(BaseModel):
    pergunta: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None


class PerguntaResponse(BaseModel):
    session_id: str
    pergunta: str
    resposta: str
    timestamp: str


class NovaSessionResponse(BaseModel):
    session_id: str
    criada_em: str
    user_id: Optional[str] = None


class StockPriceRequest(BaseModel):
    ticker: str


class HealthResponse(BaseModel):
    status: str
    timestamp: str


# ── Armazenamento de sessões ───────────────────────────────────────────

sessions = {}  # {session_id: {"historico": [], "user_id": None}}


# ── Funções auxiliares ─────────────────────────────────────────────────


def chamar_gemini(pergunta: str, historico: list, user_id: Optional[str] = None) -> str:
    """Chama Gemini e processa responses com function calling"""
    if user_id:
        pergunta = f"Usuário ID: {user_id}. {pergunta}"
    historico.append(types.Content(role="user", parts=[types.Part(text=pergunta)]))

    response = client.models.generate_content(
        model="gemini-2.5-flash",
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
            model="gemini-2.5-flash",
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


# ── Endpoints ──────────────────────────────────────────────────────────


@app.get("/health", response_model=HealthResponse)
def health():
    """Verifica se a API está rodando"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/new-session", response_model=NovaSessionResponse)
def new_session(user_id: Optional[str] = None):
    """Cria uma nova sessão de conversa"""
    session_id = str(uuid.uuid4())
    sessions[session_id] = {"historico": [], "user_id": user_id}
    return {
        "session_id": session_id,
        "criada_em": datetime.now().isoformat(),
        "user_id": user_id,
    }


@app.post("/api/chat", response_model=PerguntaResponse)
def chat(request: PerguntaRequest):
    """
    Envia uma pergunta para o assistente de investimentos.

    Se não fornecer session_id, uma nova sessão será criada.
    Use o session_id retornado para manter a conversa.
    """
    session_id = request.session_id or str(uuid.uuid4())

    if session_id not in sessions:
        sessions[session_id] = {"historico": [], "user_id": request.user_id}
    elif request.user_id:
        sessions[session_id]["user_id"] = request.user_id

    try:
        resposta = chamar_gemini(request.pergunta, sessions[session_id]["historico"], sessions[session_id]["user_id"])
        return {
            "session_id": session_id,
            "pergunta": request.pergunta,
            "resposta": resposta,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar: {str(e)}")


@app.post("/api/stock-price")
def get_price(request: StockPriceRequest):
    """Busca o preço de uma ação sem necessidade de manter sessão"""
    try:
        resultado = get_stock_price(request.ticker)
        return {
            "ticker": request.ticker,
            "dados": resultado,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar ação: {str(e)}")


@app.get("/api/selic-meta")
def get_selic_meta():
    """Busca a meta SELIC do Banco Central"""
    try:
        resultado = get_meta_selic()
        return {
            "dados": resultado,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar SELIC: {str(e)}")


@app.get("/api/selic-atual")
def get_selic_atual():
    """Busca a SELIC efetiva do mercado"""
    try:
        resultado = get_selic_real()
        return {
            "dados": resultado,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar SELIC: {str(e)}")


@app.get("/api/ipca")
def get_ipca_atual():
    """Busca o IPCA do último mês"""
    try:
        resultado = get_ipca()
        return {
            "dados": resultado,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar IPCA: {str(e)}")


@app.get("/api/ipca-acumulado")
def get_ipca_acum():
    """Busca o IPCA acumulado dos últimos 12 meses"""
    try:
        resultado = get_ipca_acumulado()
        return {
            "dados": resultado,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao buscar IPCA acumulado: {str(e)}"
        )


# ── Executar ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
