import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/requireAdminAccess";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { data: offices, error } = await supabase
      .from("offices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching offices:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transformedOffices = offices?.map(office => ({
      id: office.id,
      userId: office.user_id || null,
      name: office.name,
      email: office.email,
      phone: office.phone,
      isActive: office.is_active,
    })) || [];

    return NextResponse.json(transformedOffices);
  } catch (error) {
    console.error("Error in GET /api/offices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const body = await request.json();
    const { name, email, phone, password, userId = null, isActive = true } = body;
    const hasAdminAuth = request.headers.get("authorization")?.startsWith("Bearer ") ?? false;

    if (hasAdminAuth) {
      const authResponse = await requireAdminAccess(request);
      if (authResponse) return authResponse;
    }

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone" },
        { status: 400 }
      );
    }

    let resolvedUserId = userId;

    if (hasAdminAuth) {
      if (!password) {
        return NextResponse.json({ error: "Password is required when creating a VIP user from the dashboard" }, { status: 400 });
      }

      if (!supabaseAdmin) {
        return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY for VIP user creation" }, { status: 500 });
      }

      const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone, role: "vip" },
      });

      if (createUserError) {
        return NextResponse.json({ error: createUserError.message }, { status: 500 });
      }

      resolvedUserId = createdUser.user.id;
    } else if (!resolvedUserId) {
      return NextResponse.json({ error: "User registration requires a valid userId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("offices")
      .insert({
        user_id: resolvedUserId,
        name,
        email,
        phone,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) {
      if (hasAdminAuth && resolvedUserId && supabaseAdmin) {
        await supabaseAdmin.auth.admin.deleteUser(resolvedUserId);
      }
      console.error("Error creating office:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/offices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}