/**
 * GET /api/data/ipca-acumulado - Busca o IPCA acumulado dos últimos 12 meses
 */

import { getIpcaAcumulado } from "@/app/lib/services/dataService";

export const GET = async () => {
  try {
    const resultado = await getIpcaAcumulado();

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
      { erro: `Erro ao buscar IPCA acumulado: ${error.message}` },
      { status: 500 }
    );
  }
};
