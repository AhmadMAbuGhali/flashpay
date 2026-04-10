"use client";

// Shared public navbar to keep the marketing and country pages visually aligned.
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import useTranslations from "@/hooks/useTranslations";

export default function PublicNavbar() {
  const t = useTranslations();
  return (
    // Navbar collapses cleanly on small screens instead of forcing horizontal overflow.
    <nav className="glass-panel sticky top-4 z-20 mb-8 flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-slate-950/65 shadow-[0_20px_40px_-24px_rgba(0,210,255,0.5)]">
          <Image src="/logo.png" alt="Flash Pay Logo" width={34} height={34} className="rounded-full" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Flash Pay</p>
          <p className="mt-1 text-lg font-semibold text-white">{t.publicNav.subtitle}</p>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 p-1 text-sm text-slate-400">
          <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-white">
            {t.publicNav.home}
          </Link>
          <Link href="/#markets" className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-white">
            {t.publicNav.markets}
          </Link>
        </div>
        <LanguageSwitcher />
        <Link href="/login" className="primary-button px-5 py-2.5 text-sm text-slate-950">
          {t.publicNav.login}
        </Link>
      </div>
    </nav>
  );
}