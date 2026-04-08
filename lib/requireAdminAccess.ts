import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function requireAdminAccess(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const token = authorization.replace("Bearer ", "").trim();

  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { data: officeByUserId } = await supabase
    .from("offices")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: officeByEmail } = user.email
    ? await supabase
        .from("offices")
        .select("id")
        .eq("email", user.email)
        .maybeSingle()
    : { data: null };

  if (officeByUserId || officeByEmail) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  return null;
}