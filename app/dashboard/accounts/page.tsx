"use client";

import { FormEvent, useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import useDashboardRole from "@/hooks/useDashboardRole";
import useTranslations from "@/hooks/useTranslations";
import { supabase } from "@/lib/supabaseClient";

interface Account {
  id: string;
  accountText: string;
  country: string;
  currency: string;
  isActive: boolean;
  isVip: boolean;
  createdAt: string;
}

interface AccountForm {
  accountText: string;
  country: string;
  currency: string;
  isActive: boolean;
  isVip: boolean;
}

const initialAccountForm: AccountForm = {
  accountText: "",
  country: "",
  currency: "",
  isActive: true,
  isVip: false,
};

interface Country {
  id: string;
  name: string;
  currency: string;
}

export default function DashboardAccountsPage() {
  const t = useTranslations();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AccountForm>(initialAccountForm);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const { isAdmin, isVip, loadingRole } = useDashboardRole();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const accountsResponse = await fetch("/api/accounts");

      if (!accountsResponse.ok) {
        throw new Error(t.accounts.fetchFailed);
      }

      const accountsData = await accountsResponse.json();
      setAccounts(accountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorPrefix);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const countriesResponse = await fetch("/api/countries");
      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json();
        setCountries(countriesData);
      }
    } catch (err) {
      console.error("Failed to fetch countries:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchCountries();
  }, []);

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

  useEffect(() => {
    if (!form.country) return;

    const selected = countries.find(country => country.name === form.country);
    if (selected?.currency) {
      setForm(prev => ({ ...prev, currency: selected.currency }));
    }
  }, [form.country, countries]);

  const handleFormChange = (field: keyof AccountForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditAccount = (account: Account) => {
    setForm({
      accountText: account.accountText,
      country: account.country,
      currency: account.currency,
      isActive: account.isActive,
      isVip: account.isVip,
    });
    setEditingId(account.id);
    setIsEditing(true);
    setIsCreating(true); // reuse the form
  };

  const handleDeleteAccount = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm(t.accounts.confirmDelete)) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error(t.accounts.deleteFailed);
      }

      await fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorPrefix);
    }
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) return;
    setSubmitError(null);
    setSaving(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          accountText: form.accountText,
          country: form.country,
          currency: form.currency,
          isActive: form.isActive,
          isVip: form.isVip,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || t.accounts.createFailed);
      }

      setForm(initialAccountForm);
      setIsCreating(false);
      await fetchAccounts();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.common.errorPrefix);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) return;
    if (!editingId) return;

    setSubmitError(null);
    setSaving(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/accounts/${editingId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          accountText: form.accountText,
          country: form.country,
          currency: form.currency,
          isActive: form.isActive,
          isVip: form.isVip,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || t.accounts.updateFailed);
      }

      setForm(initialAccountForm);
      setIsCreating(false);
      setIsEditing(false);
      setEditingId(null);
      await fetchAccounts();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.common.errorPrefix);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (isEditing) {
      await handleUpdateAccount(event);
    } else {
      await handleCreateAccount(event);
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">{t.common.loading}</div>
        </div>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-400">{t.common.errorPrefix} {error}</div>
        </div>
      </RequireAuth>
    );
  }

  const visibleAccounts = accounts.filter(account => {
    const matchesCountry = selectedCountry ? account.country === selectedCountry : true;
    const matchesSearch = searchTerm
      ? [account.accountText, account.country, account.currency].some(value =>
          value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    return matchesCountry && matchesSearch;
  });

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-[#0e1728]/80 p-6 text-slate-200 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t.accounts.registryTitle}</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{t.accounts.registrySubtitle}</h2>
              <p className="mt-3 text-sm text-slate-400">{t.accounts.pageLead}</p>
            </div>
            <button
              type="button"
              disabled={!isAdmin || loadingRole}
              onClick={() => {
                setIsCreating(prev => !prev);
                if (isEditing) {
                  setIsEditing(false);
                  setEditingId(null);
                  setForm(initialAccountForm);
                }
              }}
              className="rounded-full border border-white/10 bg-[#00D2FF]/10 px-5 py-3 text-sm font-semibold text-[#00D2FF] transition hover:bg-[#00D2FF]/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!isAdmin ? t.accounts.vipViewOnly : isCreating ? t.common.cancel : `+ ${t.accounts.addAccount}`}
            </button>
          </div>
          {isVip && (
            <p className="mt-4 text-sm text-slate-400">
              {t.accounts.vipReadonlyNote}
            </p>
          )}
        </div>

        {isAdmin && isCreating && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-400">{t.accounts.accountTextLabel}</span>
                <input
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
                  value={form.accountText}
                  onChange={event => handleFormChange("accountText", event.target.value)}
                  placeholder={t.accounts.accountTextPlaceholder}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-400">{t.accounts.countryLabel}</span>
                <select
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
                  value={form.country}
                  onChange={event => handleFormChange("country", event.target.value)}
                  required
                >
                  <option value="">{t.accounts.selectCountry}</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-400">{t.accounts.currencyLabel}</span>
                <input
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
                  value={form.currency}
                  onChange={event => handleFormChange("currency", event.target.value)}
                  placeholder={t.accounts.currencyPlaceholder}
                  required
                  readOnly
                />
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={event => setForm(prev => ({ ...prev, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded border-white/10 bg-slate-950/80"
                />
                <span className="text-sm text-slate-400">{t.accounts.activeAccount}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.isVip}
                  onChange={event => setForm(prev => ({ ...prev, isVip: event.target.checked }))}
                  className="h-4 w-4 rounded border-white/10 bg-slate-950/80"
                />
                <span className="text-sm text-slate-400">{t.accounts.vipAccount}</span>
              </label>
              {submitError && (
                <div className="lg:col-span-2 rounded-3xl bg-rose-500/10 p-4 text-sm text-rose-300">
                  {submitError}
                </div>
              )}
              <div className="lg:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center rounded-3xl bg-[#00D2FF] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#00D2FF]/90 disabled:opacity-50"
                >
                  {saving ? (isEditing ? t.accounts.updatingAccount : t.accounts.addingAccount) : (isEditing ? t.accounts.updateAccount : t.accounts.addAccount)}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm text-slate-400">{t.accounts.filterByCountry}</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-2 text-white outline-none focus:border-[#00D2FF]/60"
            >
              <option value="">{t.accounts.allCountries}</option>
              {countries.map(country => (
                <option key={country.id} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder={t.accounts.searchPlaceholder}
              className="min-w-[260px] rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-2 text-white outline-none focus:border-[#00D2FF]/60"
            />
          </div>

          <table className="min-w-full border-collapse text-left text-sm text-slate-200">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-6 py-4">{t.accounts.tableAccount}</th>
                <th className="px-6 py-4">{t.accounts.tableCountry}</th>
                <th className="px-6 py-4">{t.accounts.tableCurrency}</th>
                <th className="px-6 py-4">{t.accounts.tableActive}</th>
                <th className="px-6 py-4">{t.accounts.tableVip}</th>
                <th className="px-6 py-4">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {visibleAccounts.map((account, index) => (
                <tr key={account.id} className={index % 2 === 0 ? "bg-slate-900/40" : "bg-slate-950/40"}>
                  <td className="border-t border-white/10 px-6 py-4 font-semibold text-white">{account.accountText}</td>
                  <td className="border-t border-white/10 px-6 py-4">{account.country}</td>
                  <td className="border-t border-white/10 px-6 py-4">{account.currency}</td>
                  <td className="border-t border-white/10 px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${account.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                      {account.isActive ? t.common.active : t.common.inactive}
                    </span>
                  </td>
                  <td className="border-t border-white/10 px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${account.isVip ? "bg-purple-500/15 text-purple-300" : "bg-gray-500/15 text-gray-300"}`}>
                      {account.isVip ? "VIP" : t.accounts.publicLabel}
                    </span>
                  </td>
                  <td className="border-t border-white/10 px-6 py-4">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="mr-2 rounded bg-blue-500/15 px-3 py-1 text-xs text-blue-300 hover:bg-blue-500/25"
                        >
                          {t.common.edit}
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="rounded bg-rose-500/15 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/25"
                        >
                          {t.common.delete}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">{t.common.viewOnly}</span>
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
