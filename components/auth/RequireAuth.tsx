"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useTranslations from "@/hooks/useTranslations";

interface RequireAuthProps {
  children: ReactNode;
}

interface VipUserRecord {
  id: string;
  userId: string | null;
  email: string;
  isActive: boolean;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const t = useTranslations();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (!supabase) {
        router.push("/login");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/vips");

        if (response.ok) {
          const vipUsers = (await response.json()) as VipUserRecord[];
          const currentUser = data.session.user;
          const matchedVipUser = vipUsers.find(
            vipUser => vipUser.userId === currentUser.id || vipUser.email.toLowerCase() === (currentUser.email || "").toLowerCase()
          );

          if (matchedVipUser && !matchedVipUser.isActive) {
            await supabase.auth.signOut();
            router.replace("/");
            return;
          }
        }
      } catch {
        router.push("/login");
        return;
      }

      setChecking(false);
    }

    verifySession();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08101E] text-white">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <p className="text-base font-semibold">{t.common.authChecking}</p>
          <p className="mt-3 text-sm text-slate-400">{t.common.authRedirecting}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
