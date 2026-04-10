"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, Lock, Mail, Phone, ShieldCheck, User2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import useTranslations from "@/hooks/useTranslations";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterVipPage() {
  const router = useRouter();
  const t = useTranslations();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!supabase) {
      setError(t.register.supabaseMissing);
      return;
    }

    if (!name || !email || !password || !phone) {
      setError(t.register.fillAllFields);
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id || null;

    const vipResponse = await fetch("/api/vips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        userId,
      }),
    });

    if (!vipResponse.ok) {
      const vipError = await vipResponse.json();
      setError(vipError?.error || t.register.failed);
      setLoading(false);
      return;
    }

    setSuccessMessage(t.register.success);
    setLoading(false);
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[#08101E] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-4rem] top-10 h-80 w-80 rounded-full bg-[#00D2FF]/12 blur-3xl" />
        <div className="absolute right-[-2rem] top-1/3 h-[26rem] w-[26rem] rounded-full bg-[#6a7eaa]/18 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <ShieldCheck className="h-4 w-4 text-[#00D2FF]" />
            VIP onboarding
          </div>
          <LanguageSwitcher />
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{t.register.title}</h1>
              <p className="max-w-xl text-lg leading-8 text-slate-300">{t.register.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="dashboard-stat">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Access</p>
                <p className="mt-3 text-xl font-semibold text-white">Private dashboard visibility</p>
              </div>
              <div className="dashboard-stat">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Workflow</p>
                <p className="mt-3 text-xl font-semibold text-white">Direct VIP account creation</p>
              </div>
            </div>

            <div className="glass-panel p-6">
              <div className="space-y-4 text-slate-200">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-1 h-5 w-5 text-[#00D2FF]" />
                  <p>Use a real email address so the user can sign in immediately after the account is created.</p>
                </div>
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-1 h-5 w-5 text-[#00D2FF]" />
                  <p>VIP users can review all public and VIP account entries without getting admin mutation access.</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login" className="secondary-button">
                  Existing user login
                </Link>
                <Link href="/" className="secondary-button">
                  Back to markets
                </Link>
              </div>
            </div>
          </section>

          <GlassCard className="overflow-visible">
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="sm:col-span-2">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Flash Pay access</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Create a VIP login</h2>
              </div>

              <label className="space-y-2 sm:col-span-2">
                <span className="flex items-center gap-2 text-sm text-slate-300"><User2 className="h-4 w-4 text-[#00D2FF]" />{t.register.fullName}</span>
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  className="field-input"
                  required
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Mail className="h-4 w-4 text-[#00D2FF]" />{t.register.email}</span>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="field-input"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Lock className="h-4 w-4 text-[#00D2FF]" />{t.register.password}</span>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="field-input"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Phone className="h-4 w-4 text-[#00D2FF]" />{t.register.phone}</span>
                <input
                  value={phone}
                  onChange={event => setPhone(event.target.value)}
                  className="field-input"
                  required
                />
              </label>

              {error && (
                <div className="sm:col-span-2 rounded-3xl bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>
              )}
              {successMessage && (
                <div className="sm:col-span-2 rounded-3xl bg-emerald-500/10 p-4 text-sm text-emerald-300">{successMessage}</div>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button w-full"
                >
                  {loading ? t.register.submitting : t.register.submit}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
