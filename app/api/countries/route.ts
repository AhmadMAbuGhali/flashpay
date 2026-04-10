import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/requireAdminAccess";
import { getCountryFlag, slugifyCountryName } from "@/lib/countryMetadata";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const requestedSlug = request.nextUrl.searchParams.get("slug")?.trim().toLowerCase() || null;

    const { data: countries, error } = await supabase
      .from("countries")
      .select("*")
      .order("name", { ascending: true });

    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("country_id, country, currency, is_active, is_vip");

    if (error) {
      console.error("Error fetching countries:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (accountsError) {
      console.error("Error fetching accounts for countries:", accountsError);
      return NextResponse.json({ error: accountsError.message }, { status: 500 });
    }

    const publicAccounts = (accounts || []).filter(account => account.is_active && !account.is_vip);
    const normalizedCountries = (countries || []).map(country => {
      const slug = slugifyCountryName(country.slug || country.name);
      const countryAccounts = publicAccounts.filter(account => {
        if (account.country_id) {
          return account.country_id === country.id;
        }

        return String(account.country || "").toLowerCase() === String(country.name).toLowerCase();
      });
      const currencies = Array.from(
        new Set([
          ...countryAccounts.map(account => account.currency).filter(Boolean),
          country.currency,
        ])
      ).filter(Boolean);

      return {
        ...country,
        slug,
        flagEmoji: getCountryFlag(country.name, country.flag_emoji),
        flagIconUrl: country.flag_icon_url || null,
        currencies,
        publicAccountCount: countryAccounts.length,
      };
    });

    const filteredCountries = requestedSlug
      ? normalizedCountries.filter(country => country.slug === requestedSlug)
      : normalizedCountries;

    return NextResponse.json(filteredCountries);
  } catch (error) {
    console.error("Error in GET /api/countries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResponse = await requireAdminAccess(request);
    if (authResponse) return authResponse;

    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const body = await request.json();
    const { name, currency, flagEmoji = null, flagIconUrl = null } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = slugifyCountryName(name);
    const normalizedCurrency = String(currency || "").trim().toUpperCase();

    const { data: country, error } = await supabase
      .from("countries")
      .insert([{ name, slug, currency: normalizedCurrency, flag_emoji: flagEmoji, flag_icon_url: flagIconUrl }])
      .select()
      .single();

    if (error) {
      console.error("Error creating country:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(country, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/countries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}