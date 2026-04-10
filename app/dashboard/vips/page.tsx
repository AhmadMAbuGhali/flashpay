"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import useDashboardRole from "@/hooks/useDashboardRole";
import useTranslations from "@/hooks/useTranslations";
import { supabase } from "@/lib/supabaseClient";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";

interface VipPerson {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

interface VipForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
}

const initialForm: VipForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  isActive: true,
};

export default function DashboardVipsPage() {
  const router = useRouter();
  const t = useTranslations();
  const { isAdmin, loadingRole } = useDashboardRole();
  const [people, setPeople] = useState<VipPerson[]>([]);
  const [form, setForm] = useState<VipForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingRole && !isAdmin) {
      router.replace("/dashboard/accounts");
    }
  }, [isAdmin, loadingRole, router]);

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

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vips");

      if (!response.ok) {
        throw new Error(t.vips.fetchFailed);
      }

      const data = await response.json();
      setPeople(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : t.common.errorPrefix);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) return;

    setError(null);
    setSaving(true);

    try {
      const headers = await getAuthHeaders();
      const url = editingId ? `/api/vips/${editingId}` : "/api/vips";
      const method = editingId ? "PUT" : "POST";
      const payload = editingId
        ? {
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password || undefined,
            isActive: form.isActive,
          }
        : form;

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || (editingId ? t.vips.updateFailed : t.vips.createFailed));
      }

      resetForm();
      await fetchPeople();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.common.errorPrefix);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (person: VipPerson) => {
    setForm({
      name: person.name,
      email: person.email,
      phone: person.phone,
      password: "",
      isActive: person.isActive,
    });
    setEditingId(person.id);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm(t.vips.confirmDelete)) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/vips/${id}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t.vips.deleteFailed);
      }

      await fetchPeople();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t.common.errorPrefix);
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
        {/* VIP management uses a form-first layout and responsive list fallback instead of desktop-only tables. */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0e1728]/80 p-6 text-slate-200 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <h2 className="text-3xl font-semibold text-white">{t.vips.title}</h2>
          <p className="mt-3 text-sm text-slate-400">{t.vips.description}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="dashboard-stat">
              <p className="text-slate-400">Total VIP users</p>
              <p className="mt-2 text-2xl font-semibold text-white">{people.length}</p>
            </div>
            <div className="dashboard-stat">
              <p className="text-slate-400">Active</p>
              <p className="mt-2 text-2xl font-semibold text-white">{people.filter(person => person.isActive).length}</p>
            </div>
            <div className="dashboard-stat">
              <p className="text-slate-400">Inactive</p>
              <p className="mt-2 text-2xl font-semibold text-white">{people.filter(person => !person.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              value={form.name}
              onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
              placeholder={t.vips.fullNamePlaceholder}
              className="field-input"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
              placeholder={t.vips.emailPlaceholder}
              className="field-input"
              required
            />
            <input
              value={form.phone}
              onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))}
              placeholder={t.vips.phonePlaceholder}
              className="field-input"
              required
            />
            <input
              type="password"
              value={form.password}
              onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))}
              placeholder={editingId ? t.vips.newPasswordPlaceholder : t.vips.passwordPlaceholder}
              className="field-input"
              required={!editingId}
            />
            <label className="inline-flex items-center gap-3 text-sm text-slate-300 md:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={event => setForm(prev => ({ ...prev, isActive: event.target.checked }))}
                className="h-4 w-4 rounded border-white/10 bg-slate-950/80"
              />
              {t.vips.activeAccount}
            </label>
            {error && <p className="text-sm text-rose-300 md:col-span-2">{error}</p>}
            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="primary-button"
              >
                {editingId ? <Pencil className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {saving ? t.common.loading : editingId ? t.vips.updatePerson : t.vips.addPerson}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="secondary-button"
                >
                  {t.common.cancel}
                </button>
              )}
            </div>
          </form>
        </div>

        {people.length === 0 && (
          <div className="empty-state">
            <Users className="mx-auto h-10 w-10 text-[#00D2FF]" />
            <h3 className="mt-4 text-xl font-semibold text-white">No VIP users yet</h3>
            <p className="mt-2 text-sm text-slate-400">Create the first VIP login to give read access to the private dashboard.</p>
          </div>
        )}

        <div className="grid gap-4 md:hidden">
          {people.map(person => (
            <div key={`mobile-${person.id}`} className="glass-panel-strong p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{person.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{person.email}</p>
                  <p className="mt-1 text-sm text-slate-400">{person.phone}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${person.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                  {person.isActive ? t.common.active : t.common.inactive}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleEdit(person)} className="secondary-button flex-1 text-sm">
                  <Pencil className="h-4 w-4" />
                  {t.common.edit}
                </button>
                <button onClick={() => handleDelete(person.id)} className="danger-button flex-1 text-sm">
                  <Trash2 className="h-4 w-4" />
                  {t.common.delete}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-slate-950/10 backdrop-blur-xl md:block">
          <table className="min-w-full border-collapse text-left text-sm text-slate-200">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-6 py-4">{t.vips.tableName}</th>
                <th className="px-6 py-4">{t.vips.tableEmail}</th>
                <th className="px-6 py-4">{t.vips.tablePhone}</th>
                <th className="px-6 py-4">{t.vips.tableStatus}</th>
                <th className="px-6 py-4">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person, index) => (
                <tr key={person.id} className={index % 2 === 0 ? "bg-slate-900/40" : "bg-slate-950/40"}>
                  <td className="border-t border-white/10 px-6 py-4 font-semibold text-white">{person.name}</td>
                  <td className="border-t border-white/10 px-6 py-4">{person.email}</td>
                  <td className="border-t border-white/10 px-6 py-4">{person.phone}</td>
                  <td className="border-t border-white/10 px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${person.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                      {person.isActive ? t.common.active : t.common.inactive}
                    </span>
                  </td>
                  <td className="border-t border-white/10 px-6 py-4">
                    <button
                      onClick={() => handleEdit(person)}
                      className="mr-2 rounded bg-blue-500/15 px-3 py-1 text-xs text-blue-300 hover:bg-blue-500/25"
                    >
                      {t.common.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="rounded bg-rose-500/15 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/25"
                    >
                      {t.common.delete}
                    </button>
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