"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import { useLanguage } from "@/components/LanguageProvider";
import useDashboardRole from "@/hooks/useDashboardRole";
import useTranslations from "@/hooks/useTranslations";
import { supabase } from "@/lib/supabaseClient";
import { translations, type Locale } from "@/lib/translations";
import { buildTranslationOverride, deepMergeTranslations, flattenTranslationTree } from "@/lib/uiContent";
import { Search } from "lucide-react";

type ContentEntry = {
  key: string;
  value: string;
};

export default function DashboardContentPage() {
  const router = useRouter();
  const t = useTranslations();
  const { refreshContent } = useLanguage();
  const { isAdmin, loadingRole } = useDashboardRole();
  const [selectedLocale, setSelectedLocale] = useState<Locale>("ar");
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingRole && !isAdmin) {
      router.replace("/dashboard/accounts");
    }
  }, [isAdmin, loadingRole, router]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/content", { cache: "no-store" });
        const overrides = response.ok ? await response.json() : { ar: {}, en: {} };
        const merged = deepMergeTranslations(translations[selectedLocale], overrides[selectedLocale] || {});
        setEntries(flattenTranslationTree(merged));
      } catch {
        setError(t.content.loadFailed);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [selectedLocale, t.content.loadFailed]);

  const visibleEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return entries;
    }

    return entries.filter(entry => entry.key.toLowerCase().includes(query) || entry.value.toLowerCase().includes(query));
  }, [entries, search]);

  const updateEntry = (key: string, value: string) => {
    setEntries(currentEntries => currentEntries.map(entry => (entry.key === key ? { ...entry, value } : entry)));
  };

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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const headers = await getAuthHeaders();

      const response = await fetch("/api/content", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          locale: selectedLocale,
          content: buildTranslationOverride(entries),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t.content.saveFailed);
      }

      await refreshContent();
      setSuccess(t.content.saveSuccess);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t.content.saveFailed);
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
          <h2 className="text-3xl font-semibold text-white">{t.content.title}</h2>
          <p className="mt-3 text-sm text-slate-400">{t.content.description}</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto] lg:items-end">
            <label className="space-y-2">
              <span className="text-sm text-slate-400">{t.content.localeLabel}</span>
              <select value={selectedLocale} onChange={event => setSelectedLocale(event.target.value as Locale)} className="field-select">
                <option value="ar">Arabic</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm text-slate-400"><Search className="h-4 w-4 text-[#00D2FF]" />{t.content.searchLabel}</span>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={t.content.searchPlaceholder}
                className="field-input"
              />
            </label>
            <button type="button" onClick={handleSave} disabled={saving} className="primary-button lg:mb-[1px]">
              {saving ? t.content.saving : t.content.save}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
          {success && <p className="mt-4 text-sm text-emerald-300">{success}</p>}

          {visibleEntries.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {visibleEntries.map(entry => (
                <label key={entry.key} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
                  <span className="block text-xs uppercase tracking-[0.28em] text-slate-500">{entry.key}</span>
                  <textarea
                    value={entry.value}
                    onChange={event => updateEntry(entry.key, event.target.value)}
                    rows={3}
                    className="field-input mt-3 min-h-24 resize-y"
                  />
                </label>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-6">
              <h3 className="text-xl font-semibold text-white">{t.content.noResults}</h3>
              <p className="mt-2 text-sm text-slate-400">{t.content.noResultsDescription}</p>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}