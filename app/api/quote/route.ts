import { NextResponse } from "next/server";
import { getQuote } from "@/lib/market-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Ticker symbol is required." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getQuote(symbol));
  } catch (error) {
    return NextResponse.json({
      symbol,
      price: null,
      change: 0,
      changePercent: "0.00%",
      latestTradingDay: null,
      error: error instanceof Error ? error.message : "Could not fetch quote."
    });
  }
}
