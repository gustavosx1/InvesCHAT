/**
 * GET /api/data/ipca - Busca o IPCA do último mês
 */

import { getIpca } from "@/app/lib/services/dataService";

export const GET = async () => {
  try {
    const resultado = await getIpca();

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
      { erro: `Erro ao buscar IPCA: ${error.message}` },
      { status: 500 }
    );
  }
};
