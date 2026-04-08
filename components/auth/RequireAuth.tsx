"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useTranslations from "@/hooks/useTranslations";

interface RequireAuthProps {
  children: ReactNode;
}

interface OfficeRecord {
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
        const response = await fetch("/api/offices");

        if (response.ok) {
          const offices = (await response.json()) as OfficeRecord[];
          const currentUser = data.session.user;
          const matchedOffice = offices.find(
            office => office.userId === currentUser.id || office.email.toLowerCase() === (currentUser.email || "").toLowerCase()
          );

          if (matchedOffice && !matchedOffice.isActive) {
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
