import { NextRequest, NextResponse } from "next/server";
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
    const { data: item, error } = await supabase
      .from("inventory")
      .select(`
        *,
        offices:assigned_office_id (
          id,
          name
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching inventory item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!item) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    // Transform the data to match the expected format
    const transformedItem = {
      id: item.id,
      itemName: item.item_name,
      category: item.category,
      location: item.location,
      stock: item.stock,
      status: item.status,
      lastUpdated: item.last_updated,
      assignedOffice: item.offices?.name || "Unassigned",
    };

    return NextResponse.json(transformedItem);
  } catch (error) {
    console.error("Error in GET /api/inventory/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();
    const { itemName, category, location, stock, status, assignedOfficeId } = body;

    const updateData: any = {};
    if (itemName !== undefined) updateData.item_name = itemName;
    if (category !== undefined) updateData.category = category;
    if (location !== undefined) updateData.location = location;
    if (stock !== undefined) updateData.stock = stock;
    if (status !== undefined) updateData.status = status;
    if (assignedOfficeId !== undefined) updateData.assigned_office_id = assignedOfficeId;
    updateData.last_updated = new Date().toISOString();

    const { data, error } = await supabase
      .from("inventory")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        offices:assigned_office_id (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error("Error updating inventory item:", error);
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

    return NextResponse.json(transformedItem);
  } catch (error) {
    console.error("Error in PUT /api/inventory/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { id } = await params;
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting inventory item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/inventory/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}