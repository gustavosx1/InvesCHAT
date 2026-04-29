/**
 * GET /api/data/selic-meta - Busca a meta SELIC do Banco Central
 */

import { getSelicMeta } from "@/app/lib/services/dataService";

export const GET = async () => {
  try {
    const resultado = await getSelicMeta();

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
