import { NextRequest, NextResponse } from "next/server";
import { topCurrencies, topCurrencyCodes } from "@/lib/topCurrencies";

export async function GET(request: NextRequest) {
  const base = request.nextUrl.searchParams.get("base") || "USD";
  const rawSymbols = request.nextUrl.searchParams.get("symbols");

  const requestedSymbols = rawSymbols
    ? rawSymbols
        .split(",")
        .map(symbol => symbol.trim().toUpperCase())
        .filter(Boolean)
    : topCurrencyCodes;

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 502 });
    }

    const data = await response.json();

    if (!data?.rates) {
      return NextResponse.json({ error: "Invalid exchange rate response" }, { status: 502 });
    }

    const filteredRates = requestedSymbols.reduce<Record<string, number>>((accumulator, symbol) => {
      const rate = data.rates[symbol];
      if (typeof rate === "number") {
        accumulator[symbol] = rate;
      }
      return accumulator;
    }, {});

    const availableCurrencies = topCurrencies.filter(currency => filteredRates[currency.code] !== undefined);

    return NextResponse.json({
      base: data.base_code || base,
      updatedAt: data.time_last_update_utc || null,
      currencies: availableCurrencies,
      rates: filteredRates,
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return NextResponse.json({ error: "Unable to fetch exchange rates" }, { status: 500 });
  }
}