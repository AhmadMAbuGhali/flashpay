import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/requireAdminAccess";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { data: accounts, error } = await supabase
      .from("accounts")
      .select(`*
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching accounts:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transformedAccounts = accounts?.map(account => ({
      id: account.id,
      accountText: account.account_text,
      country: account.country,
      currency: account.currency,
      isActive: account.is_active,
      isVip: account.is_vip,
      createdAt: account.created_at,
    })) || [];

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

    const { data, error } = await supabase
      .from("accounts")
      .insert({
        account_text: accountText,
        country,
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