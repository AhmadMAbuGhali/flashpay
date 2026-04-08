import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/requireAdminAccess";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { id } = await params;
    const { data: account, error } = await supabase
      .from("accounts")
      .select(`*
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching account:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const transformedAccount = {
      id: account.id,
      accountText: account.account_text,
      country: account.country,
      currency: account.currency,
      isActive: account.is_active,
      isVip: account.is_vip,
      createdAt: account.created_at,
    };

    return NextResponse.json(transformedAccount);
  } catch (error) {
    console.error("Error in GET /api/accounts/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResponse = await requireAdminAccess(request);
    if (authResponse) return authResponse;

    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();
    const { accountText, country, currency, isActive, isVip } = body;

    const updateData: any = {};
    if (accountText !== undefined) updateData.account_text = accountText;
    if (country !== undefined) updateData.country = country;
    if (currency !== undefined) updateData.currency = currency;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (isVip !== undefined) updateData.is_vip = isVip;

    const { data, error } = await supabase
      .from("accounts")
      .update(updateData)
      .eq("id", id)
      .select(`*
      `)
      .single();

    if (error) {
      console.error("Error updating account:", error);
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

    return NextResponse.json(transformedAccount);
  } catch (error) {
    console.error("Error in PUT /api/accounts/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResponse = await requireAdminAccess(request);
    if (authResponse) return authResponse;

    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { id } = await params;
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting account:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/accounts/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}