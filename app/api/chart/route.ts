import { NextResponse } from "next/server";
import { getChart } from "@/lib/market-data";

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not fetch chart data." },
      { status: 502 }
    );
  }
}
