import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/requireAdminAccess";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { data: agents, error } = await supabase
      .from("agents")
      .select(`
        *,
        offices:office_id (
          id,
          name,
          region
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching agents:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedAgents = agents?.map(agent => ({
      id: agent.id,
      name: agent.name,
      phone: agent.phone,
      region: agent.offices?.region || agent.region,
      email: agent.email,
      office: agent.offices?.name || "Unknown Office",
      account: agent.account_number || "",
      status: agent.status,
    })) || [];

    return NextResponse.json(transformedAgents);
  } catch (error) {
    console.error("Error in GET /api/agents:", error);
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
    const { name, phone, region, email, officeId, accountNumber, status = "Pending" } = body;

    if (!name || !phone || !email || !officeId) {
      return NextResponse.json(
        { error: "Missing required fields: name, phone, email, officeId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("agents")
      .insert({
        name,
        phone,
        region,
        email,
        office_id: officeId,
        account_number: accountNumber,
        status,
      })
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
      console.error("Error creating agent:", error);
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

    return NextResponse.json(transformedAgent, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/agents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}