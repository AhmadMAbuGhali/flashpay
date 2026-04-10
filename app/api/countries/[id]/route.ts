import { NextRequest, NextResponse } from "next/server";
import { slugifyCountryName } from "@/lib/countryMetadata";
import { supabase } from "@/lib/supabaseClient";
import { requireAdminAccess } from "@/lib/requireAdminAccess";

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
    const { name, currency, flagEmoji = null, flagIconUrl = null } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const normalizedCurrency = typeof currency === "string" ? currency.trim().toUpperCase() : undefined;

    const updateData: {
      name: string;
      slug: string;
      flag_emoji: string | null;
      flag_icon_url: string | null;
      currency?: string;
    } = {
      name,
      slug: slugifyCountryName(name),
      flag_emoji: flagEmoji,
      flag_icon_url: flagIconUrl,
    };

    if (normalizedCurrency !== undefined) {
      updateData.currency = normalizedCurrency;
    }

    const { data, error } = await supabase
      .from("countries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating country:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/countries/[id]:", error);
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
    const { error } = await supabase.from("countries").delete().eq("id", id);

    if (error) {
      console.error("Error deleting country:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Country deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/countries/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}