"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import useTranslations from "@/hooks/useTranslations";

export default function SignOutButton() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      router.replace("/");
      return;
    }
    await supabase.auth.signOut();
    setLoading(false);
    router.replace("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-[#00D2FF] hover:bg-[#0c1b33] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? t.common.signingOut : t.common.signOut}
    </button>
  );
}
