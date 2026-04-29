/**
 * Serviço de dados econômicos do Banco Central do Brasil
 */

export const getDataAtual = () => {
  return new Date().toLocaleDateString("pt-BR");
};

export const getSelicMeta = async () => {
  try {
    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json"
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        taxa_selic_diaria: data[0].valor,
        data: data[0].data,
      };
    }
    return { erro: "Não foi possível obter a SELIC" };
  } catch (error) {
    return { erro: `Erro ao buscar SELIC: ${error.message}` };
  }
};

export const getSelicEfetiva = async () => {
  try {
    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4189/dados/ultimos/1?formato=json"
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        taxa_selic_atual: data[0].valor,
        data: data[0].data,
      };
    }
    return { erro: "Não foi possível obter a SELIC" };
  } catch (error) {
    return { erro: `Erro ao buscar SELIC: ${error.message}` };
  }
};

export const getCdiAcumulada = async () => {
  try {
    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados/ultimos/12?formato=json"
    );
    const data = await response.json();

    if (!data || data.length === 0) {
      return { erro: "Resposta vazia da API" };
    }

    let acumulado = 1;

    for (const item of data) {
      const taxa = parseFloat(item.valor) / 100; // Transforma % em decimal
      acumulado *= 1 + taxa;
    }

    const cdi_12_meses = (acumulado - 1) * 100;

    return {
      cdi_12_meses: parseFloat(cdi_12_meses.toFixed(2)),
      referencia: data[data.length - 1].data,
    };
  } catch (error) {
    return { erro: `Erro na requisição: ${error.message}` };
  }
};

export const getIpca = async () => {
  try {
    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json"
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        ipca_mensal_pct: data[0].valor,
        referencia: data[0].data,
      };
    }
    return { erro: "Não foi possível obter o IPCA" };
  } catch (error) {
    return { erro: `Erro ao buscar IPCA: ${error.message}` };
  }
};

export const getIpcaAcumulado = async () => {
  try {
    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json"
    );
    const data = await response.json();

    if (!data || data.length === 0) {
      return { erro: "Resposta vazia da API" };
    }

    let acumulado = 1;

    for (const item of data) {
      const taxa = parseFloat(item.valor) / 100; // Transforma % em decimal
      acumulado *= 1 + taxa;
    }

    const ipca_12_meses = (acumulado - 1) * 100;

    return {
      ipca_12_meses: parseFloat(ipca_12_meses.toFixed(2)),
      referencia: data[data.length - 1].data,
    };
  } catch (error) {
    return { erro: `Erro ao buscar IPCA: ${error.message}` };
  }
};
