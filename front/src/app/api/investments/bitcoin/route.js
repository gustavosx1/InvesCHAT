/**
 * GET /api/investments/bitcoin - Busca o preço atual do Bitcoin
 */

import { getBitcoinInfo } from "@/app/lib/services/investmentService";

export const GET = async () => {
  try {
    const resultado = await getBitcoinInfo();

    if (resultado.erro) {
      return Response.json(
        { erro: resultado.erro },
        { status: 500 }
      );
    }

    return Response.json(
      {
        dados: resultado,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { erro: `Erro ao buscar Bitcoin: ${error.message}` },
      { status: 500 }
    );
  }
};
