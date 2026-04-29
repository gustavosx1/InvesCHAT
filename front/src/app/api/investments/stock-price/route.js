/**
 * POST /api/investments/stock-price - Busca o preço de uma ação
 */

import { getStockPrice } from "@/app/lib/services/investmentService";

export const POST = async (request) => {
  try {
    const { ticker } = await request.json();

    if (!ticker) {
      return Response.json(
        { erro: "Ticker é obrigatório" },
        { status: 400 }
      );
    }

    const resultado = await getStockPrice({ ticker });

    if (resultado.erro) {
      return Response.json(
        { erro: resultado.erro },
        { status: 500 }
      );
    }

    return Response.json(
      {
        ticker,
        dados: resultado,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { erro: `Erro ao buscar ação: ${error.message}` },
      { status: 500 }
    );
  }
};
