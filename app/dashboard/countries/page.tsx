"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import useDashboardRole from "@/hooks/useDashboardRole";
import useTranslations from "@/hooks/useTranslations";
import { supabase } from "@/lib/supabaseClient";

interface Country {
  id: string;
  name: string;
  currency: string;
}

export default function DashboardCountriesPage() {
  const router = useRouter();
  const t = useTranslations();
  const [countries, setCountries] = useState<Country[]>([]);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCurrency, setEditingCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, loadingRole } = useDashboardRole();

  const getAuthHeaders = async () => {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      throw new Error("Authentication required");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/countries");

      if (!response.ok) {
        throw new Error(t.countries.fetchFailed);
      }

      const data = await response.json();
      setCountries(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : t.common.errorPrefix);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!loadingRole && !isAdmin) {
      router.replace("/dashboard/accounts");
    }
  }, [isAdmin, loadingRole, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) return;

    setError(null);
    setSaving(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/countries", {
        method: "POST",
        headers,
        body: JSON.stringify({ name, currency }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t.countries.createFailed);
      }

      setName("");
      setCurrency("");
      await fetchCountries();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.common.errorPrefix);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm(t.countries.confirmDelete)) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/countries/${id}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t.countries.deleteFailed);
      }

      await fetchCountries();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t.common.errorPrefix);
    }
  };

  const startEditing = (country: Country) => {
    setEditingId(country.id);
    setEditingName(country.name);
    setEditingCurrency(country.currency);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
    setEditingCurrency("");
  };

  const handleUpdate = async (id: string) => {
    if (!isAdmin) return;

    try {
      setSaving(true);
      setError(null);
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/countries/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ name: editingName, currency: editingCurrency.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t.countries.updateFailed);
      }

      cancelEditing();
      await fetchCountries();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t.common.errorPrefix);
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingRole) {
    return (
      <RequireAuth>
        <div className="flex min-h-[320px] items-center justify-center text-white">{t.common.loading}</div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-[#0e1728]/80 p-6 text-slate-200 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <h2 className="text-3xl font-semibold text-white">{t.countries.title}</h2>
          <p className="mt-3 text-sm text-slate-400">{t.countries.description}</p>
        </div>

        {isAdmin && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder={t.countries.countryNamePlaceholder}
                className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
                required
              />
              <input
                value={currency}
                onChange={event => setCurrency(event.target.value.toUpperCase())}
                placeholder={t.countries.currencyCodePlaceholder}
                className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
                required
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-3xl bg-[#00D2FF] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#00D2FF]/90 disabled:opacity-50"
              >
                {saving ? t.common.loading : t.countries.addCountry}
              </button>
            </form>
            {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
          </div>
        )}

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <table className="min-w-full border-collapse text-left text-sm text-slate-200">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-6 py-4">{t.countries.tableCountry}</th>
                <th className="px-6 py-4">{t.countries.tableCurrency}</th>
                <th className="px-6 py-4">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country, index) => (
                <tr key={country.id} className={index % 2 === 0 ? "bg-slate-900/40" : "bg-slate-950/40"}>
                  <td className="border-t border-white/10 px-6 py-4 font-semibold text-white">
                    {editingId === country.id ? (
                      <input
                        value={editingName}
                        onChange={event => setEditingName(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-[#00D2FF]/60"
                      />
                    ) : (
                      country.name
                    )}
                  </td>
                  <td className="border-t border-white/10 px-6 py-4">
                    {editingId === country.id ? (
                      <input
                        value={editingCurrency}
                        onChange={event => setEditingCurrency(event.target.value.toUpperCase())}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-[#00D2FF]/60"
                      />
                    ) : (
                      country.currency
                    )}
                  </td>
                  <td className="border-t border-white/10 px-6 py-4">
                    {editingId === country.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(country.id)}
                          disabled={saving}
                          className="mr-2 rounded bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          {t.common.save}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="rounded bg-slate-500/15 px-3 py-1 text-xs text-slate-300 hover:bg-slate-500/25"
                        >
                          {t.common.cancel}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(country)}
                          className="mr-2 rounded bg-blue-500/15 px-3 py-1 text-xs text-blue-300 hover:bg-blue-500/25"
                        >
                          {t.common.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(country.id)}
                          className="rounded bg-rose-500/15 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/25"
                        >
                          {t.common.delete}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}