import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/requireAdminAccess";
import { supabase } from "@/lib/supabaseClient";
import type { Locale } from "@/lib/translations";

const supportedLocales: Locale[] = ["ar", "en"];

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("ui_content_overrides")
      .select("locale, content");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const overrides = supportedLocales.reduce<Record<Locale, Record<string, unknown>>>((accumulator, locale) => {
      accumulator[locale] = {};
      return accumulator;
    }, { ar: {}, en: {} });

    for (const row of data || []) {
      if (supportedLocales.includes(row.locale as Locale)) {
        overrides[row.locale as Locale] = (row.content as Record<string, unknown>) || {};
      }
    }

    return NextResponse.json(overrides);
  } catch (error) {
    console.error("Error in GET /api/content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResponse = await requireAdminAccess(request);
    if (authResponse) return authResponse;

    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
    }

    const body = await request.json();
    const { locale, content } = body as { locale?: Locale; content?: Record<string, unknown> };

    if (!locale || !supportedLocales.includes(locale)) {
      return NextResponse.json({ error: "A valid locale is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("ui_content_overrides")
      .upsert({ locale, content: content || {} }, { onConflict: "locale" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}