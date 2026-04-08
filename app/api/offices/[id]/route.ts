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
    const { data: office, error } = await supabase
      .from("offices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching office:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!office) {
      return NextResponse.json({ error: "Office not found" }, { status: 404 });
    }

    const transformedOffice = {
      id: office.id,
      name: office.name,
      email: office.email,
      phone: office.phone,
      isActive: office.is_active,
      userId: office.user_id || null,
    };

    return NextResponse.json(transformedOffice);
  } catch (error) {
    console.error("Error in GET /api/offices/[id]:", error);
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

    const { data: existingOffice, error: existingOfficeError } = await supabase
      .from("offices")
      .select("user_id")
      .eq("id", id)
      .single();

    if (existingOfficeError) {
      return NextResponse.json({ error: existingOfficeError.message }, { status: 500 });
    }

    const authUserId = userId ?? existingOffice?.user_id ?? null;

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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (userId !== undefined) updateData.user_id = userId;

    const { data, error } = await supabase
      .from("offices")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating office:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/offices/[id]:", error);
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
    const { data: existingOffice, error: existingOfficeError } = await supabase
      .from("offices")
      .select("user_id")
      .eq("id", id)
      .single();

    if (existingOfficeError) {
      return NextResponse.json({ error: existingOfficeError.message }, { status: 500 });
    }

    if (existingOffice?.user_id) {
      if (!supabaseAdmin) {
        return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY for VIP user deletion" }, { status: 500 });
      }

      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(existingOffice.user_id);

      if (deleteUserError) {
        return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
      }
    }

    const { error } = await supabase
      .from("offices")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting office:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Office deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/offices/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}