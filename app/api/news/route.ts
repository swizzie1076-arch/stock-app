import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AlphaVantageNewsItem = {
  title?: string;
  url?: string;
  source?: string;
  time_published?: string;
  overall_sentiment_label?: string;
  summary?: string;
};

type AlphaVantageNewsResponse = {
  feed?: AlphaVantageNewsItem[];
  Information?: string;
  Note?: string;
  "Error Message"?: string;
};

function formatPublishedDate(value?: string) {
  if (!value || value.length < 8) return null;
  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  return `${year}-${month}-${day}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!symbol) {
    return NextResponse.json({ error: "Ticker symbol is required." }, { status: 400 });
  }

  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json({
      items: [],
      error: "Missing ALPHA_VANTAGE_API_KEY. Add it to `.env.local` to fetch company news."
    });
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${encodeURIComponent(
        symbol
      )}&limit=6&apikey=${encodeURIComponent(apiKey)}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      return NextResponse.json({ items: [], error: "Alpha Vantage news request failed." });
    }

    const payload = (await response.json()) as AlphaVantageNewsResponse;
    const feed = payload.feed;

    if (!feed?.length) {
      return NextResponse.json({
        items: [],
        error: payload["Error Message"] ?? payload.Note ?? payload.Information ?? "News unavailable."
      });
    }

    return NextResponse.json({
      items: feed.slice(0, 6).map((item) => ({
        title: item.title ?? "Untitled market story",
        url: item.url ?? null,
        source: item.source ?? "Market news",
        publishedAt: formatPublishedDate(item.time_published),
        sentiment: item.overall_sentiment_label ?? null,
        summary: item.summary ?? null
      }))
    });
  } catch (error) {
    return NextResponse.json({
      items: [],
      error: error instanceof Error ? error.message : "Could not fetch company news."
    });
  }
}
