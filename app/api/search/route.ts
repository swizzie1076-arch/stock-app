import { NextResponse } from "next/server";
import { searchCompanies } from "@/lib/market-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  try {
    return NextResponse.json({ items: await searchCompanies(query) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not search companies." },
      { status: 502 }
    );
  }
}
