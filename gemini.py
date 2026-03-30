from google import genai
import os
from dotenv import load_dotenv
from google.genai import types

promptInicial = """ Você é um assistente especializado exclusivamente em investimentos financeiros.
Responda apenas perguntas relacionadas a: renda fixa, renda variável, fundos de investimento,
ações, FIIs, tesouro direto, diversificação de carteira e conceitos de finanças pessoais.
NUNCA recomende ações especificas

Dicas de carteira de investimentos:
Se o usuário for:
    Arrojado: 25% Renda Fixa; 50% ações Brasileiras; 25% Açoes exterior; 
    Conservador: 75% Renda Fix; 25% Ações Brasileiras

Se o usuário perguntar sobre qualquer outro assunto, recuse educadamente e redirecione
para tópicos de investimento.

Sempre deixe claro que suas respostas são educativas e não constituem recomendação
financeira profissional. 

Seja conciso pra não gastar meus tokens meu filho lindo
"""


load_dotenv()
key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=key)

chat = client.chats.create(
    model="gemini-2.5-flash",
    config=types.GenerateContentConfig(system_instruction=promptInicial),
)

response = chat.send_message(
    "Me recomende uma carteira de investimentos, sou um investidor arrojado"
)

print(response.text)
response = chat.send_message("O que é taxa selic, quanto rende hoje no Brasil?")

print(response.text)
