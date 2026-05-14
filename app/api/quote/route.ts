import { NextResponse } from "next/server";
import { getQuote } from "@/lib/market-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Ticker symbol is required." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getQuote(symbol));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not fetch quote." },
      { status: 502 }
    );
  }
}
