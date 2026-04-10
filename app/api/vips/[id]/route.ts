import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/requireAdminAccess";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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
    const { data: vipUser, error } = await supabase
      .from("vip_users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!vipUser) {
      return NextResponse.json({ error: "VIP user not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: vipUser.id,
      name: vipUser.name,
      email: vipUser.email,
      phone: vipUser.phone,
      isActive: vipUser.is_active,
      userId: vipUser.user_id || null,
    });
  } catch (error) {
    console.error("Error in GET /api/vips/[id]:", error);
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
    const { name, email, phone, isActive, userId, password } = body;

    const { data: existingVipUser, error: existingVipUserError } = await supabase
      .from("vip_users")
      .select("user_id")
      .eq("id", id)
      .single();

    if (existingVipUserError) {
      return NextResponse.json({ error: existingVipUserError.message }, { status: 500 });
    }

    const authUserId = userId ?? existingVipUser?.user_id ?? null;

    if ((name !== undefined || phone !== undefined || email !== undefined || password !== undefined) && authUserId) {
      if (!supabaseAdmin) {
        return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY for VIP auth updates" }, { status: 500 });
      }

      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        ...(email !== undefined ? { email } : {}),
        ...(password !== undefined ? { password } : {}),
        user_metadata: {
          ...(name !== undefined ? { name } : {}),
          ...(phone !== undefined ? { phone } : {}),
          role: "vip",
        },
      });

      if (updateUserError) {
        return NextResponse.json({ error: updateUserError.message }, { status: 500 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (userId !== undefined) updateData.user_id = userId;

    const { data, error } = await supabase
      .from("vip_users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/vips/[id]:", error);
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
    const { data: existingVipUser, error: existingVipUserError } = await supabase
      .from("vip_users")
      .select("user_id")
      .eq("id", id)
      .single();

    if (existingVipUserError) {
      return NextResponse.json({ error: existingVipUserError.message }, { status: 500 });
    }

    if (existingVipUser?.user_id) {
      if (!supabaseAdmin) {
        return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY for VIP user deletion" }, { status: 500 });
      }

      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(existingVipUser.user_id);

      if (deleteUserError) {
        return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
      }
    }

    const { error } = await supabase.from("vip_users").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "VIP user deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/vips/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}