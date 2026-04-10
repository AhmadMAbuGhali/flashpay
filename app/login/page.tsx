"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck, Building2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import useTranslations from "@/hooks/useTranslations";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      if (!supabase) {
        setError(t.login.errorSupabaseMissing);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
    }
    checkSession();
  }, [router, t.login.errorSupabaseMissing]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError(t.login.errorSupabaseMissing);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message || t.login.errorInvalid);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#08101E] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-[-6rem] h-80 w-80 rounded-full bg-[#00D2FF]/15 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#6a7eaa]/20 blur-3xl" />
        <div className="absolute left-1/2 top-[40%] h-80 w-80 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl">
          <div className="flex items-center justify-between pb-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 shadow-lg shadow-slate-950/20">
              <ShieldCheck className="h-4 w-4 text-[#00D2FF]" />
              {t.login.secureAccess}
            </div>
            <LanguageSwitcher />
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <section className="space-y-8 text-slate-100">
              <div className="space-y-4">
                <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                  {t.login.title}
                </h1>
                <p className="max-w-xl text-lg leading-8 text-slate-300">
                  {t.login.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="dashboard-stat">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t.login.superAdmin}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{t.login.superAdminDetail}</p>
                </div>
                <div className="dashboard-stat">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t.login.officeAccess}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{t.login.officeAccessDetail}</p>
                </div>
              </div>

              <div className="glass-panel p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t.login.publicPortal}</p>
                <p className="mt-3 text-lg text-slate-300">{t.login.publicPortalDetail}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/" className="secondary-button text-sm">
                    {t.login.publicOverview}
                  </Link>
                  <Link href="/register" className="secondary-button text-sm">
                    {t.login.registerVip}
                  </Link>
                </div>
              </div>
            </section>

            <GlassCard className="relative overflow-hidden">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t.login.portalLabel}</p>
                  <h2 className="mt-3 text-3xl font-bold text-white">{t.login.loginHeading}</h2>
                </div>

                <div className="space-y-5">
                  <label className="block text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#00D2FF]" />
                      {t.login.email}
                    </span>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      placeholder={t.login.placeholderEmail}
                      className="field-input mt-3"
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#00D2FF]" />
                      {t.login.password}
                    </span>
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      placeholder={t.login.placeholderPassword}
                      className="field-input mt-3"
                    />
                  </label>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4 text-sm leading-7 text-slate-400">
                    Use the email and password created for an admin or VIP account. New VIP users can be created from the registration page.
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link href="/register" className="font-semibold text-[#00D2FF] hover:text-white">
                        {t.login.registerVip}
                      </Link>
                      <Link href="/" className="font-semibold text-slate-300 hover:text-white">
                        Return to markets
                      </Link>
                    </div>
                  </div>
                </div>

                {error ? <p className="rounded-3xl bg-[#ff0033]/10 px-4 py-3 text-sm text-[#ffb3c7]">{error}</p> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button mt-2 w-full py-4 text-base"
                >
                  <span>{loading ? t.login.signingIn : t.login.continue}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-300">
                  <p className="font-medium text-slate-100">{t.login.optionsTitle}</p>
                  <p className="mt-3 leading-7">{t.login.optionsSummary}</p>
                </div>

                <div className="grid gap-4 pt-2 sm:grid-cols-2">
                  <Link href="/dashboard" className="secondary-button text-sm">
                    <Building2 className="h-4 w-4" />
                    {t.login.adminPreview}
                  </Link>
                  <Link href="/" className="secondary-button text-sm">
                    {t.login.publicOverview}
                  </Link>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
