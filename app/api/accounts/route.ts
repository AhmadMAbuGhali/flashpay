import { NextRequest, NextResponse } from "next/server";
import { slugifyCountryName } from "@/lib/countryMetadata";
import { requireAdminAccess } from "@/lib/requireAdminAccess";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const countrySlug = request.nextUrl.searchParams.get("countrySlug")?.trim().toLowerCase() || null;
    const publicOnly = request.nextUrl.searchParams.get("publicOnly") === "true";

    const { data: accounts, error } = await supabase
      .from("accounts")
      .select(`*
      `)
      .order("created_at", { ascending: false });

    const { data: countries, error: countriesError } = await supabase
      .from("countries")
      .select("id, name, currency, slug");

    if (error) {
      console.error("Error fetching accounts:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (countriesError) {
      console.error("Error fetching countries for accounts:", countriesError);
      return NextResponse.json({ error: countriesError.message }, { status: 500 });
    }

    const countryLookupByName = new Map(
      (countries || []).map(country => [country.name.toLowerCase(), { id: country.id, slug: country.slug || slugifyCountryName(country.name) }])
    );
    const countryLookupById = new Map(
      (countries || []).map(country => [country.id, { name: country.name, slug: country.slug || slugifyCountryName(country.name) }])
    );

    const transformedAccounts = (accounts || [])
      .map(account => {
        const countryMetaById = account.country_id ? countryLookupById.get(account.country_id) : null;
        const countryMetaByName = account.country ? countryLookupByName.get(String(account.country).toLowerCase()) : null;
        const resolvedCountryMeta = countryMetaById || countryMetaByName || null;
        const resolvedCountryName = countryMetaById?.name || account.country;

        return {
          id: account.id,
          accountText: account.account_text,
          country: resolvedCountryName,
          countryId: account.country_id || countryMetaByName?.id || null,
          countrySlug: resolvedCountryMeta?.slug || slugifyCountryName(account.country),
          currency: account.currency,
          isActive: account.is_active,
          isVip: account.is_vip,
          createdAt: account.created_at,
        };
      })
      .filter(account => (publicOnly ? account.isActive && !account.isVip : true))
      .filter(account => (countrySlug ? account.countrySlug === countrySlug : true));

    return NextResponse.json(transformedAccounts);
  } catch (error) {
    console.error("Error in GET /api/accounts:", error);
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
    const { accountText, country, currency, isActive = true, isVip = false } = body;

    if (!accountText || !country || !currency) {
      return NextResponse.json(
        { error: "Missing required fields: accountText, country, currency" },
        { status: 400 }
      );
    }

    const { data: matchedCountry } = await supabase
      .from("countries")
      .select("id, name")
      .ilike("name", country)
      .maybeSingle();

    const { data, error } = await supabase
      .from("accounts")
      .insert({
        account_text: accountText,
        country: matchedCountry?.name || country,
        country_id: matchedCountry?.id || null,
        currency,
        is_active: isActive,
        is_vip: isVip,
      })
      .select(`*
      `)
      .single();

    if (error) {
      console.error("Error creating account:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transformedAccount = {
      id: data.id,
      accountText: data.account_text,
      country: data.country,
      currency: data.currency,
      isActive: data.is_active,
      isVip: data.is_vip,
      createdAt: data.created_at,
    };

    return NextResponse.json(transformedAccount, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}