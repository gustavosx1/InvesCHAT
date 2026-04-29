/**
 * Serviço de dados de investimentos via BrAPI
 */

const BRAPI_BASE_URL = "https://brapi.dev/api";
const BRAPI_KEY =  process.env.BRAPI_API_KEY;

// Helper para fazer requisições na BrAPI
const fetchBrapi = async (path, params = {}) => {
  console.log("[DEBUG] BRAPI_API_KEY:", process.env.BRAPI_API_KEY);
  console.log("[DEBUG] NEXT_PUBLIC:", process.env.NEXT_PUBLIC_BRAPI_API_KEY);
  try {
    const url = new URL(`${BRAPI_BASE_URL}${path}`);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const headers = {};
    if (BRAPI_KEY) {
      headers.Authorization = `Bearer ${BRAPI_KEY}`;
    }

    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      return { erro: `Erro na requisição BrAPI: ${response.status}` };
    }
    
    return await response.json();
  } catch (error) {
    return { erro: `Erro ao buscar dados: ${error.message}` };
  }
};

export const getStockPrice = async ({ticker}) => {
  try {
    const data = await fetchBrapi(`/quote/${ticker.toUpperCase()}`);

    if (data.results && data.results.length > 0) {
      const stock = data.results[0];
      return {
        ticker: stock.symbol,
        price: stock.regularMarketPrice,
        regular_market_day_high: stock.regularMarketDayHigh,
        regular_market_day_low: stock.regularMarketDayLow,
        fifty_two_week_high: stock.fiftyTwoWeekHigh,
        fifty_two_week_low: stock.fiftyTwoWeekLow,
        regular_market_change_percent: stock.regularMarketChangePercent,
      };
    }

    return { erro: `Ticker ${ticker} não encontrado` };
  } catch (error) {
    return { erro: `Erro ao buscar preço da ação: ${error.message}` };
  }
};

export const getBitcoinInfo = async () => {
  try {
    const response = await fetch("https://blockchain.info/ticker");

    if (!response.ok) {
      return { erro: `Erro na requisição Blockchain.info: ${response.status}` };
    }

    const data = await response.json();

    if (!data?.BRL || !data?.USD) {
      return { erro: "Resposta inesperada da API de Bitcoin" };
    }

    const brl = data["BRL"];
    const usd = data["USD"];

    return {
      price_brl: brl.last,
      price_usd: usd.last,
      buy_brl: brl.buy,
      sell_brl: brl.sell,
    };
  } catch (error) {
    return { erro: `Erro ao buscar preço do Bitcoin: ${error.message}` };
  }
};

export const getCurrencyConversion = async ({ currency }) => {
  try {
    const upperCurrency = currency.toUpperCase();
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rates?base=${upperCurrency}&quotes=BRL`
    );

    console.log("[DEBUG] Frankfurter API URL:", `https://api.frankfurter.dev/v2/rates?base=${upperCurrency}&quotes=BRL`);
    console.log("[DEBUG] Frankfurter API Response Status:", response.status);
    if (!response.ok) {
      return { erro: `Erro na requisição Frankfurter: ${response.status}` };
    }

    const data = await response.json();
    const resp = data[0]
    if (!resp) {
      return { erro: "Resposta inesperada da API de conversão de moeda" };
    }

    return {
      currency_pair: `${upperCurrency}-BRL`,
      rate: resp.rate,
      date: resp.date,
    };
  } catch (error) {
    return { erro: `Erro ao buscar conversão de moeda: ${error.message}` };
  }
};
