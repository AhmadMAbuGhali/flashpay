import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawSupabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

const hasPlaceholderValue = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes("your-service-role") ||
    normalized.includes("service-role-secret-key") ||
    normalized.includes("replace-me") ||
    normalized.includes("placeholder")
  );
};

const supabaseServiceRoleKey =
  rawSupabaseServiceRoleKey && !hasPlaceholderValue(rawSupabaseServiceRoleKey)
    ? rawSupabaseServiceRoleKey
    : undefined;

let adminClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabaseAdmin = adminClient;
export const hasSupabaseAdmin = Boolean(supabaseUrl && supabaseServiceRoleKey);