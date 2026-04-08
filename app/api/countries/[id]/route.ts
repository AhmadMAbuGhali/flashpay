import { NextRequest, NextResponse } from "next/server";
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
    const { name, currency } = body;

    if (!name || !currency) {
      return NextResponse.json({ error: "Name and currency are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("countries")
      .update({ name, currency })
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