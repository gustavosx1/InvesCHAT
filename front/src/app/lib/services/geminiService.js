/**
 * Serviço de integração com Gemini AI
 * Gerencia chat, function calling e histórico de conversa
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dataService from "./dataService";
import * as investmentService from "./investmentService";
import * as perfilService from "./perfilService";
import * as newsService from "./newsService";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const SYSTEM_PROMPT = `
Você é um assistente especializado em investimentos no mercado brasileiro. Lembre-se, VOCÊ É UM FACILITADOR DE EDUCAÇÃO, SEJA CLARO E BREVE (NÃO SE EXTENDA EM MAIS DE 150 CARACTERES), como se estivesse ensinando menores de idade.
Responda apenas sobre: ações, renda fixa, FIIs, Tesouro Direto, SELIC, CDI, IPCA, carteiras e rendimentos reais de ações e títulos públicos, única excessão é ensinar sobre criptomoedas e informações sobre bitcoin.
Use as ferramentas disponíveis para buscar dados reais antes de responder.
Sempre avise que suas respostas são educativas e não constituem recomendação profissional.
Evite jargões técnicos e seja didático, explicando conceitos de forma simples.
Evite caracteres especias (*, _, etc) para não atrapalhar a leitura.
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

**Agressivo e Muito agressivo**
- Renda fixa: 20–35%
- Multimercado/FII: 10–15%
- Renda variável: 40–60%
- Produtos compatíveis: Opções/Derivativos, Ações small caps, Criptoativos, Fundos long & short, COE, FIP/Venture capital
`;

// Mapear funções para seus respectivos handlers
const FUNCOES = {
  get_data_atual: dataService.getDataAtual,
  get_selic_meta: dataService.getSelicMeta,
  get_selic_efetiva: dataService.getSelicEfetiva,
  get_cdi_acumulada: dataService.getCdiAcumulada,
  get_ipca: dataService.getIpca,
  get_ipca_acumulado: dataService.getIpcaAcumulado,
  get_stock_price: investmentService.getStockPrice,
  get_bitcoin_info: investmentService.getBitcoinInfo,
  get_currency_conversion: investmentService.getCurrencyConversion,
  get_perfil_investidor: perfilService.getPerfilInvestidor,
  get_latest_news: newsService.getNewsletters,
};

// Declaração das funções para o Gemini
const tools = [
  {
    functionDeclarations: [
      {
        name: "get_latest_news",
        description: "Busca a última newsletter 'Mercado em 5 minutos' para fornecer notícias atualizadas sobre o mercado financeiro mundial",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_data_atual",
        description: "Retorna a data atual para o prompt do Gemini",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_selic_meta",
        description:
          "Retorna a meta da Selic definida pelo Banco Central e COPOM para referência de investimentos em renda fixa",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_selic_efetiva",
        description:
          "Retorna a taxa Selic efetiva do mercado para calcular rendimentos reais de investimentos",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_cdi_acumulada",
        description:
          "Busca a taxa CDI atual acumulada para calcular rendimentos reais de investimentos",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_ipca",
        description: "Retorna o IPCA do último mês (inflação oficial do Brasil)",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_ipca_acumulado",
        description:
          "Retorna o IPCA acumulado dos últimos 12 meses (inflação oficial do Brasil)",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_stock_price",
        description: "Busca o preço atual e variação de uma ação da B3 ou FII pelo ticker",
        parameters: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Ticker da ação (ex: PETR4, VALE3, VISC11)",
            },
          },
          required: ["ticker"],
        },
      },
      {
        name: "get_bitcoin_info",
        description:
          "Busca o preço atual do Bitcoin para referência de investimentos em criptomoedas",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_currency_conversion",
        description: "Busca a taxa de conversão de moedas (USD, EUR, GBP) para BRL",
        parameters: {
          type: "object",
          properties: {
            currency: {
              type: "string",
              description: "Código da moeda: USD, EUR, GBP, etc",
            },
          },
          required: ["currency"],
        },
      },
      {
        name: "get_perfil_investidor",
        description: "Busca o perfil do investidor no banco de dados pelo ID",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description:
                "ID do investidor no banco de dados em uuid4. Exemplo: 'xxxx-xxxx-xxxx'",
            },
          },
          required: ["id"],
        },
      },
    ],
  },
];

/**
 * Armazena sessões em memória
 * Em produção, usar um banco de dados
 */
const sessions = new Map();

export const createSession = (userId = null) => {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    historico: [],
    user_id: userId,
    criada_em: new Date().toISOString(),
  });

  return {
    sessionId,
    criada_em: new Date().toISOString(),
    user_id: userId,
  };
};

/**
 * Processa function calls do Gemini
 */
const processFunctionCall = async (toolName, toolInput) => {
  const func = FUNCOES[toolName];

  if (!func) {
    return { erro: `Função ${toolName} não encontrada` };
  }

  try {
    return await func(toolInput);
  } catch (error) {
    return { erro: `Erro ao executar ${toolName}: ${error.message}` };
  }
};

/**
 * Chama o Gemini e processa responses com function calling
 */
export const chatWithGemini = async (pergunta, sessionId, userId) => {
  try {
    // Obter ou criar sessão
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        historico: [],
        user_id: userId,
        criada_em: new Date().toISOString(),
      };
      sessions.set(sessionId, session);
    }

    // Preparar pergunta com contexto de usuário
    let perguntaComContexto = pergunta;
    if (userId) {
      perguntaComContexto = `Usuário ID: ${userId}. ${pergunta}`;
    }

    // Adicionar pergunta ao histórico
    session.historico.push({
      role: "user",
      parts: [{ text: perguntaComContexto }],
    });

    // Inicializar o modelo com as ferramentas
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      tools: tools,
    });

    // Primeira chamada ao Gemini
    let response = await model.generateContent({
      contents: session.historico,
    });

    // Loop para processar function calls até o modelo retornar texto final
    while (true) {
      const candidate = response.response.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];
      const functionCallPart = parts.find((p) => p.functionCall);

      // Se não há function call, o modelo terminou — sai do loop
      if (!functionCallPart) break;

      const { name, args } = functionCallPart.functionCall;
      console.log(`[Gemini] Chamando função: ${name}`, args);

      const resultado = await processFunctionCall(name, args);
      console.log(`[Gemini] Resultado de ${name}:`, resultado);

      // Adiciona a chamada da função ao histórico (papel do modelo)
      session.historico.push({
        role: "model",
        parts: [{ functionCall: { name, args } }],
      });

      // Adiciona o resultado da função ao histórico (papel do user/tool)
      session.historico.push({
        role: "user",
        parts: [{ functionResponse: { name, response: resultado } }],
      });

      // Nova chamada com o resultado da função incluído no histórico
      response = await model.generateContent({
        contents: session.historico,
      });
    }

    // Extrai o texto final da resposta
    const resposta = response.response.text();

    // Adicionar resposta final ao histórico
    session.historico.push({
      role: "model",
      parts: [{ text: resposta }],
    });

    return {
      sessionId,
      pergunta,
      resposta,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Gemini] Erro:", error);
    return {
      erro: `Erro ao processar pergunta: ${error.message}`,
    };
  }
};

export const getSession = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  return {
    sessionId,
    criada_em: session.criada_em,
    historico_length: session.historico.length,
  };
};