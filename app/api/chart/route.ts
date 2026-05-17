import { NextResponse } from "next/server";
import { getChart } from "@/lib/market-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();
  const range = searchParams.get("range")?.trim() ?? "6mo";

  if (!symbol) {
    return NextResponse.json({ error: "Ticker symbol is required." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getChart(symbol, range));
  } catch (error) {
    return NextResponse.json({
      symbol,
      companyName: symbol,
      exchange: "Alpha Vantage",
      currency: "USD",
      price: 0,
      change: 0,
      changePercent: 0,
      range,
      points: [],
      error: error instanceof Error ? error.message : "Could not fetch chart data."
    });
  }
}
