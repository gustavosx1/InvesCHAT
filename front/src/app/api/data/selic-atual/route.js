/**
 * GET /api/data/selic-atual - Busca a SELIC efetiva do mercado
 */

import { getSelicEfetiva } from "@/app/lib/services/dataService";

export const GET = async () => {
  try {
    const resultado = await getSelicEfetiva();

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
      { erro: `Erro ao buscar SELIC: ${error.message}` },
      { status: 500 }
    );
  }
};
