"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import useTranslations from "@/hooks/useTranslations";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterOfficePage() {
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

    const officeResponse = await fetch("/api/offices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        userId,
      }),
    });

    if (!officeResponse.ok) {
      const officeError = await officeResponse.json();
      setError(officeError?.error || t.register.failed);
      setLoading(false);
      return;
    }

    setSuccessMessage(t.register.success);
    setLoading(false);
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[#08101E] text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
          <h1 className="text-3xl font-bold">{t.register.title}</h1>
          <p className="mt-3 text-slate-400">{t.register.description}</p>

          <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm text-slate-400">{t.register.fullName}</span>
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
                required
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm text-slate-400">{t.register.email}</span>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
                required
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm text-slate-400">{t.register.password}</span>
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
                required
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm text-slate-400">{t.register.phone}</span>
              <input
                value={phone}
                onChange={event => setPhone(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
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
                className="inline-flex w-full items-center justify-center rounded-3xl bg-[#00D2FF] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#00D2FF]/90 disabled:opacity-50"
              >
                {loading ? t.register.submitting : t.register.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
