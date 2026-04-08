import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { data: inventory, error } = await supabase
      .from("inventory")
      .select(`
        *,
        offices:assigned_office_id (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching inventory:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedInventory = inventory?.map(item => ({
      id: item.id,
      itemName: item.item_name,
      category: item.category,
      location: item.location,
      stock: item.stock,
      status: item.status,
      lastUpdated: item.last_updated,
      assignedOffice: item.offices?.name || "Unassigned",
    })) || [];

    return NextResponse.json(transformedInventory);
  } catch (error) {
    console.error("Error in GET /api/inventory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const body = await request.json();
    const { itemName, category, location, stock = 0, status = "In stock", assignedOfficeId } = body;

    if (!itemName || !category || !location) {
      return NextResponse.json(
        { error: "Missing required fields: itemName, category, location" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("inventory")
      .insert({
        item_name: itemName,
        category,
        location,
        stock,
        status,
        assigned_office_id: assignedOfficeId,
        last_updated: new Date().toISOString(),
      })
      .select(`
        *,
        offices:assigned_office_id (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error("Error creating inventory item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the response
    const transformedItem = {
      id: data.id,
      itemName: data.item_name,
      category: data.category,
      location: data.location,
      stock: data.stock,
      status: data.status,
      lastUpdated: data.last_updated,
      assignedOffice: data.offices?.name || "Unassigned",
    };

    return NextResponse.json(transformedItem, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/inventory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}