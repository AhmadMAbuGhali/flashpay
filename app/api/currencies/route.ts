import { NextResponse } from "next/server";
import { topCurrencies } from "@/lib/topCurrencies";

export async function GET() {
  return NextResponse.json({
    source: "curated-top-100",
    count: topCurrencies.length,
    currencies: topCurrencies,
  });
}