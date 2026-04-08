import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/requireAdminAccess";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { data: countries, error } = await supabase
      .from("countries")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching countries:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(countries || []);
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
    const { name, currency } = body;

    if (!name || !currency) {
      return NextResponse.json({ error: "Name and currency are required" }, { status: 400 });
    }

    const { data: country, error } = await supabase
      .from("countries")
      .insert([{ name, currency }])
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