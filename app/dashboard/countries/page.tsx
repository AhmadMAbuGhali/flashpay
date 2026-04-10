"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import useDashboardRole from "@/hooks/useDashboardRole";
import useTranslations from "@/hooks/useTranslations";
import { supabase } from "@/lib/supabaseClient";
import { Globe2, ImagePlus, Pencil, Save, Trash2, Upload } from "lucide-react";

interface Country {
  id: string;
  name: string;
  currency?: string;
  flagEmoji?: string | null;
  flagIconUrl?: string | null;
}

export default function DashboardCountriesPage() {
  const router = useRouter();
  const t = useTranslations();
  const [countries, setCountries] = useState<Country[]>([]);
  const [name, setName] = useState("");
  const [flagEmoji, setFlagEmoji] = useState("");
  const [flagIconUrl, setFlagIconUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingFlagEmoji, setEditingFlagEmoji] = useState("");
  const [editingFlagIconUrl, setEditingFlagIconUrl] = useState<string | null>(null);
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

  const readFlagFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file for the flag.");
    }

    if (file.size > 512 * 1024) {
      throw new Error("Flag image must be 512KB or smaller.");
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Unable to read flag image."));
      };
      reader.onerror = () => reject(new Error("Unable to read flag image."));
      reader.readAsDataURL(file);
    });
  };

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
        body: JSON.stringify({
          name,
          flagEmoji: flagEmoji || null,
          flagIconUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t.countries.createFailed);
      }

      setName("");
      setFlagEmoji("");
      setFlagIconUrl(null);
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
    setEditingFlagEmoji(country.flagEmoji || "");
    setEditingFlagIconUrl(country.flagIconUrl || null);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
    setEditingFlagEmoji("");
    setEditingFlagIconUrl(null);
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
        body: JSON.stringify({
          name: editingName,
          flagEmoji: editingFlagEmoji || null,
          flagIconUrl: editingFlagIconUrl,
        }),
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
        {/* Country management now previews uploaded flags and stays usable on smaller screens. */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0e1728]/80 p-6 text-slate-200 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <h2 className="text-3xl font-semibold text-white">{t.countries.title}</h2>
          <p className="mt-3 text-sm text-slate-400">{t.countries.description}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="dashboard-stat">
              <p className="text-slate-400">Markets</p>
              <p className="mt-2 text-2xl font-semibold text-white">{countries.length}</p>
            </div>
            <div className="dashboard-stat">
              <p className="text-slate-400">With image flag</p>
              <p className="mt-2 text-2xl font-semibold text-white">{countries.filter(country => Boolean(country.flagIconUrl)).length}</p>
            </div>
            <div className="dashboard-stat">
              <p className="text-slate-400">Emoji fallback</p>
              <p className="mt-2 text-2xl font-semibold text-white">{countries.filter(country => !country.flagIconUrl && country.flagEmoji).length}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[1fr_280px]">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder={t.countries.countryNamePlaceholder}
                  className="field-input"
                  required
                />
                <input
                  value={flagEmoji}
                  onChange={event => setFlagEmoji(event.target.value)}
                  placeholder={t.countries.flagEmojiPlaceholder}
                  className="field-input"
                />
                <label className="flex items-center gap-2 rounded-3xl border border-dashed border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-slate-300 md:col-span-2 xl:col-span-3">
                  <Upload className="h-4 w-4 text-[#00D2FF]" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async event => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    try {
                      setError(null);
                      const fileDataUrl = await readFlagFile(file);
                      setFlagIconUrl(fileDataUrl);
                    } catch (fileError) {
                      setError(fileError instanceof Error ? fileError.message : "Unable to read flag image.");
                    }
                  }}
                />
                <span>{t.countries.uploadFlagImage}</span>
              </label>
              <button
                type="submit"
                disabled={saving}
                className="primary-button md:col-span-2 xl:col-span-3"
              >
                {saving ? t.common.loading : t.countries.addCountry}
              </button>
              </div>
              <div className="glass-panel-strong p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Preview</p>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-slate-900/80 text-3xl">
                    {flagIconUrl ? (
                      <img src={flagIconUrl} alt="Selected flag" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span>{flagEmoji || "🌍"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{name || t.countries.previewCountryName}</p>
                    <p className="text-sm text-slate-400">{t.countries.previewFlagNote}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-400">{t.countries.previewDescription}</p>
                {flagIconUrl && (
                  <button
                    type="button"
                    onClick={() => setFlagIconUrl(null)}
                    className="secondary-button mt-4 w-full text-sm"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {t.countries.removeImage}
                  </button>
                )}
              </div>
            </form>
            {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
          </div>
        )}

        {countries.length === 0 && (
          <div className="empty-state">
            <Globe2 className="mx-auto h-10 w-10 text-[#00D2FF]" />
            <h3 className="mt-4 text-xl font-semibold text-white">{t.countries.emptyTitle}</h3>
            <p className="mt-2 text-sm text-slate-400">{t.countries.emptyDescription}</p>
          </div>
        )}

        <div className="grid gap-4 md:hidden">
          {countries.map(country => (
            <div key={`mobile-${country.id}`} className="glass-panel-strong p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-xl">
                  {country.flagIconUrl ? (
                    <img src={country.flagIconUrl} alt={`${country.name} flag`} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span>{country.flagEmoji || "🌍"}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{country.name}</p>
                  <p className="text-sm text-slate-400">{country.flagIconUrl ? t.countries.imageFlagLabel : country.flagEmoji ? t.countries.emojiFlagLabel : t.countries.noFlagLabel}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => startEditing(country)} className="secondary-button flex-1 text-sm">
                    <Pencil className="h-4 w-4" />
                    {t.common.edit}
                  </button>
                  <button onClick={() => handleDelete(country.id)} className="danger-button flex-1 text-sm">
                    <Trash2 className="h-4 w-4" />
                    {t.common.delete}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-slate-950/10 backdrop-blur-xl md:block">
          <table className="min-w-full border-collapse text-left text-sm text-slate-200">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-6 py-4">{t.countries.tableCountry}</th>
                <th className="px-6 py-4">Flag</th>
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
                      <div className="space-y-3">
                        <input
                          value={editingFlagEmoji}
                          onChange={event => setEditingFlagEmoji(event.target.value)}
                          placeholder={t.countries.flagEmojiPlaceholder}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-[#00D2FF]/60"
                        />
                        <label className="flex items-center rounded-2xl border border-dashed border-white/15 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async event => {
                              const file = event.target.files?.[0];
                              if (!file) return;

                              try {
                                setError(null);
                                const fileDataUrl = await readFlagFile(file);
                                setEditingFlagIconUrl(fileDataUrl);
                              } catch (fileError) {
                                setError(fileError instanceof Error ? fileError.message : "Unable to read flag image.");
                              }
                            }}
                          />
                          <span>{t.countries.chooseImage}</span>
                        </label>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-xl">
                          {editingFlagIconUrl ? (
                            <img src={editingFlagIconUrl} alt="Flag preview" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <span>{editingFlagEmoji || "🌍"}</span>
                          )}
                        </div>
                        {editingFlagIconUrl && (
                          <button
                            type="button"
                            onClick={() => setEditingFlagIconUrl(null)}
                            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-rose-400/50 hover:text-rose-300"
                          >
                            {t.countries.removeImage}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-xl">
                        {country.flagIconUrl ? (
                          <img src={country.flagIconUrl} alt={`${country.name} flag`} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <span>{country.flagEmoji || "🌍"}</span>
                        )}
                      </div>
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
                          <Save className="mr-1 inline h-3 w-3" />
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
                          <Pencil className="mr-1 inline h-3 w-3" />
                          {t.common.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(country.id)}
                          className="rounded bg-rose-500/15 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/25"
                        >
                          <Trash2 className="mr-1 inline h-3 w-3" />
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