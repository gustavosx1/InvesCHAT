/**
 * POST /api/investments/currency-conversion - Busca a taxa de conversão de moeda para BRL
 */

import { getCurrencyConversion } from "@/app/lib/services/investmentService";

export const POST = async (request) => {
  try {
    const { currency } = await request.json();

    if (!currency) {
      return Response.json(
        { erro: "Currency é obrigatório" },
        { status: 400 }
      );
    }

    const resultado = await getCurrencyConversion({ currency });

    if (resultado.erro) {
      return Response.json(
        { erro: resultado.erro },
        { status: 500 }
      );
    }

    return Response.json(
      {
        currency,
        dados: resultado,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { erro: `Erro ao buscar conversão: ${error.message}` },
      { status: 500 }
    );
  }
};
