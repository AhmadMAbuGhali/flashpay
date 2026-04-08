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
    const { data: agent, error } = await supabase
      .from("agents")
      .select(`
        *,
        offices:office_id (
          id,
          name,
          region
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching agent:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Transform the data to match the expected format
    const transformedAgent = {
      id: agent.id,
      name: agent.name,
      phone: agent.phone,
      region: agent.offices?.region || agent.region,
      email: agent.email,
      office: agent.offices?.name || "Unknown Office",
      account: agent.account_number || "",
      status: agent.status,
    };

    return NextResponse.json(transformedAgent);
  } catch (error) {
    console.error("Error in GET /api/agents/[id]:", error);
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
    const { name, phone, region, email, officeId, accountNumber, status } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (region !== undefined) updateData.region = region;
    if (email !== undefined) updateData.email = email;
    if (officeId !== undefined) updateData.office_id = officeId;
    if (accountNumber !== undefined) updateData.account_number = accountNumber;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("agents")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        offices:office_id (
          id,
          name,
          region
        )
      `)
      .single();

    if (error) {
      console.error("Error updating agent:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the response
    const transformedAgent = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      region: data.offices?.region || data.region,
      email: data.email,
      office: data.offices?.name || "Unknown Office",
      account: data.account_number || "",
      status: data.status,
    };

    return NextResponse.json(transformedAgent);
  } catch (error) {
    console.error("Error in PUT /api/agents/[id]:", error);
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
      .from("agents")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting agent:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/agents/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}