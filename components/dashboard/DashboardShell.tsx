"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/auth/SignOutButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import useDashboardRole from "@/hooks/useDashboardRole";
import useTranslations from "@/hooks/useTranslations";
import { CreditCard, Globe2, LayoutDashboard, Users } from "lucide-react";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const { isAdmin, loadingRole, userName } = useDashboardRole();

  const navItemClassName = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center gap-3 rounded-3xl border px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "border-white/10 bg-[#0f1725] text-white"
        : "border-white/10 bg-white/5 text-slate-200 hover:bg-[#111b2d]"
    }`;
  };

  return (
    <div className="min-h-screen bg-[#08101E] text-white">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#6a7eaa]/30 via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/40 px-6 py-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/15 bg-[#00D2FF]/10 text-[#00D2FF] shadow-[0_20px_50px_-30px_#00D2FF]">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t.dashboard.title}</p>
              <h1 className="text-2xl font-semibold text-white">{t.dashboard.title}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 shadow-lg shadow-slate-950/20">
              {t.dashboard.roleLabel}{" "}
              <span className="font-semibold text-white">
                {loadingRole ? "..." : isAdmin ? t.dashboard.roleValue : userName || t.dashboard.vipFallback}
              </span>
            </div>
            <SignOutButton />
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t.dashboard.navigation}</p>
              <nav className="space-y-2">
                <Link href="/dashboard/accounts" className={navItemClassName("/dashboard/accounts")}>
                  <CreditCard className="h-4 w-4 text-[#00D2FF]" />
                  {t.dashboard.navAccounts}
                </Link>
                {isAdmin && (
                  <Link href="/dashboard/vips" className={navItemClassName("/dashboard/vips")}>
                    <Users className="h-4 w-4 text-slate-300" />
                    {t.dashboard.navVips}
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/dashboard/countries" className={navItemClassName("/dashboard/countries")}>
                    <Globe2 className="h-4 w-4 text-slate-300" />
                    {t.dashboard.navCountries}
                  </Link>
                )}
              </nav>
            </div>
          </aside>

          <main className="space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
