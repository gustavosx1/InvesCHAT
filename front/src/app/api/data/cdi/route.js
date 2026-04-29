/**
 * GET /api/data/cdi - Busca a taxa CDI acumulada dos últimos 12 meses
 */

import { getCdiAcumulada } from "@/app/lib/services/dataService";

export const GET = async () => {
  try {
    const resultado = await getCdiAcumulada();

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
      { erro: `Erro ao buscar CDI: ${error.message}` },
      { status: 500 }
    );
  }
};
