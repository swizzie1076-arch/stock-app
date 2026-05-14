export type CompanySearchResult = {
  ticker: string;
  companyName: string;
  exchange: string;
  sector: string | null;
};

export type MarketQuote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  latestTradingDay: string | null;
};

export type MarketChartPoint = {
  date: string;
  close: number;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
};

export type MarketChart = {
  symbol: string;
  companyName: string;
  exchange: string | null;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  range: string;
  points: MarketChartPoint[];
};

type AlphaVantageError = {
  Information?: string;
  Note?: string;
  "Error Message"?: string;
};

type AlphaVantageSearchResponse = AlphaVantageError & {
  bestMatches?: Array<{
    "1. symbol"?: string;
    "2. name"?: string;
    "3. type"?: string;
    "4. region"?: string;
    "8. currency"?: string;
  }>;
};

type AlphaVantageQuoteResponse = AlphaVantageError & {
  "Global Quote"?: {
    "01. symbol"?: string;
    "05. price"?: string;
    "07. latest trading day"?: string;
    "09. change"?: string;
    "10. change percent"?: string;
  };
};

type AlphaVantageTimeSeriesResponse = AlphaVantageError & {
  "Meta Data"?: {
    "2. Symbol"?: string;
  };
  "Time Series (5min)"?: Record<string, AlphaVantageSeriesPoint>;
  "Time Series (Daily)"?: Record<string, AlphaVantageSeriesPoint>;
  "Weekly Time Series"?: Record<string, AlphaVantageSeriesPoint>;
};

type AlphaVantageSeriesPoint = {
  "1. open"?: string;
  "2. high"?: string;
  "3. low"?: string;
  "4. close"?: string;
  "5. volume"?: string;
};

const allowedRanges = new Set(["1d", "5d", "1mo", "6mo", "1y", "5y"]);

function getApiKey() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("Missing ALPHA_VANTAGE_API_KEY.");
  }

  return apiKey;
}

async function alphaVantageFetch<T extends AlphaVantageError>(params: Record<string, string>): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL("https://www.alphavantage.co/query");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Alpha Vantage request failed.");
  }

  const payload = (await response.json()) as T;
  const message = payload["Error Message"] ?? payload.Note ?? payload.Information;

  if (message) {
    throw new Error(message);
  }

  return payload;
}

export async function searchCompanies(query: string): Promise<CompanySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const payload = await alphaVantageFetch<AlphaVantageSearchResponse>({
    function: "SYMBOL_SEARCH",
    keywords: trimmed
  });

  return (payload.bestMatches ?? [])
    .filter((match) => match["1. symbol"] && match["3. type"]?.toLowerCase().includes("equity"))
    .slice(0, 6)
    .map((match) => ({
      ticker: match["1. symbol"]!,
      companyName: match["2. name"] ?? match["1. symbol"]!,
      exchange: match["4. region"] ?? "US",
      sector: match["8. currency"] ?? null
    }));
}

export async function getQuote(symbol: string): Promise<MarketQuote> {
  const ticker = symbol.trim().toUpperCase();
  if (!ticker) {
    throw new Error("Ticker symbol is required.");
  }

  const payload = await alphaVantageFetch<AlphaVantageQuoteResponse>({
    function: "GLOBAL_QUOTE",
    symbol: ticker
  });
  const quote = payload["Global Quote"];
  const price = Number(quote?.["05. price"]);
  const change = Number(quote?.["09. change"] ?? 0);

  if (!quote?.["01. symbol"] || !Number.isFinite(price)) {
    throw new Error("Quote unavailable.");
  }

  return {
    symbol: quote["01. symbol"] ?? ticker,
    price,
    change: Number.isFinite(change) ? change : 0,
    changePercent: quote["10. change percent"] ?? "0.00%",
    latestTradingDay: quote["07. latest trading day"] ?? null
  };
}

export async function getChart(symbol: string, range = "6mo"): Promise<MarketChart> {
  const ticker = symbol.trim().toUpperCase();
  const safeRange = allowedRanges.has(range) ? range : "6mo";

  if (!ticker) {
    throw new Error("Ticker symbol is required.");
  }

  const params: Record<string, string> =
    safeRange === "1d"
      ? {
          function: "TIME_SERIES_INTRADAY",
          symbol: ticker,
          interval: "5min",
          outputsize: "compact"
        }
      : {
          function: safeRange === "5y" ? "TIME_SERIES_WEEKLY" : "TIME_SERIES_DAILY",
          symbol: ticker,
          outputsize: "compact"
        };

  const payload = await alphaVantageFetch<AlphaVantageTimeSeriesResponse>(params);
  const rawSeries =
    payload["Time Series (5min)"] ?? payload["Time Series (Daily)"] ?? payload["Weekly Time Series"] ?? {};
  const points = Object.entries(rawSeries)
    .map(([date, point]) => ({
      date: date.includes(" ") ? new Date(date.replace(" ", "T")).toISOString() : new Date(`${date}T16:00:00`).toISOString(),
      close: Number(point["4. close"]),
      open: parseNullableNumber(point["1. open"]),
      high: parseNullableNumber(point["2. high"]),
      low: parseNullableNumber(point["3. low"]),
      volume: parseNullableNumber(point["5. volume"])
    }))
    .filter((point) => Number.isFinite(point.close))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const rangedPoints = trimPointsForRange(points, safeRange);

  if (rangedPoints.length === 0) {
    throw new Error("Chart unavailable.");
  }

  const latestClose = rangedPoints.at(-1)?.close ?? 0;
  const previousClose = rangedPoints.at(0)?.close ?? latestClose;
  const change = latestClose - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    symbol: payload["Meta Data"]?.["2. Symbol"] ?? ticker,
    companyName: ticker,
    exchange: "Alpha Vantage",
    currency: "USD",
    price: latestClose,
    change,
    changePercent,
    range: safeRange,
    points: rangedPoints
  };
}

function parseNullableNumber(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function trimPointsForRange(points: MarketChartPoint[], range: string) {
  if (range === "1d") return points.slice(-78);
  if (range === "5d") return points.slice(-5);
  if (range === "1mo") return points.slice(-23);
  if (range === "6mo") return points.slice(-126);
  if (range === "1y") return points.slice(-252);
  return points.slice(-260);
}
