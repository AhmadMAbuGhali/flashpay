"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PublicNavbar from "@/components/public/PublicNavbar";
import { ArrowLeft, Globe2, Search, Sparkles, X } from "lucide-react";
import CopyableAccountCard from "@/components/public/CopyableAccountCard";
import useTranslations from "@/hooks/useTranslations";

interface CountryRecord {
  id: string;
  name: string;
  currency: string;
  slug: string;
  flagEmoji?: string | null;
  flagIconUrl?: string | null;
  currencies: string[];
  publicAccountCount: number;
}

interface AccountRecord {
  id: string;
  accountText: string;
  country: string;
  currency: string;
}

export default function CountryDetailPage() {
  const t = useTranslations();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [country, setCountry] = useState<CountryRecord | null>(null);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountQuery, setAccountQuery] = useState("");

  useEffect(() => {
    const loadCountryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [countriesResponse, accountsResponse] = await Promise.all([
          fetch(`/api/countries?slug=${encodeURIComponent(slug)}`),
          fetch(`/api/accounts?countrySlug=${encodeURIComponent(slug)}&publicOnly=true`),
        ]);

        const countriesData = countriesResponse.ok ? await countriesResponse.json() : [];
        const accountsData = accountsResponse.ok ? await accountsResponse.json() : [];

        const resolvedCountry = countriesData[0] || null;

        if (!resolvedCountry) {
          throw new Error("Country not found");
        }

        setCountry(resolvedCountry);
        setAccounts(accountsData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load country details");
      } finally {
        setLoading(false);
      }
    };

    loadCountryData();
  }, [slug]);

  const filteredAccounts = accounts.filter(account => {
    const haystack = `${account.accountText} ${account.currency}`.toLowerCase();
    return haystack.includes(accountQuery.trim().toLowerCase());
  });
  const hasFilter = accountQuery.trim().length > 0;

  const accountsByCurrency = filteredAccounts.reduce<Record<string, AccountRecord[]>>((accumulator, account) => {
    const key = account.currency;
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(account);
    return accumulator;
  }, {});

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08101E] px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          {t.countryPage.loading}
        </div>
      </main>
    );
  }

  if (error || !country) {
    return (
      <main className="min-h-screen bg-[#08101E] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 text-center backdrop-blur-xl">
          <p className="text-lg font-semibold">{error || t.countryPage.notFound}</p>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-[#00D2FF] px-5 py-3 text-sm font-semibold text-slate-950">
            {t.countryPage.backHome}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="noise-overlay relative min-h-screen overflow-hidden bg-[#08101E] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,210,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(106,126,170,0.24),_transparent_34%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <PublicNavbar />

        {/* The detail header balances identity, navigation, and quick country-level stats. */}
        <div className="editorial-grid">
          <section className="glass-panel p-6 sm:p-8">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-[#00D2FF]/60 hover:text-[#00D2FF]">
              <ArrowLeft className="h-4 w-4" />
              {t.countryPage.backToCountries}
            </Link>

            <div className="mt-8 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border border-white/15 bg-slate-950/60 text-5xl shadow-[0_20px_60px_-35px_rgba(0,210,255,0.5)]">
                  {country.flagIconUrl ? (
                    <img src={country.flagIconUrl} alt={`${country.name} flag`} className="h-16 w-16 rounded-full object-cover" />
                  ) : country.flagEmoji ? (
                    <span>{country.flagEmoji}</span>
                  ) : (
                    <Globe2 className="h-10 w-10 text-[#00D2FF]" />
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.36em] text-[#9db6db]">{t.countryPage.badge}</p>
                  <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{country.name}</h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                    {t.countryPage.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="metric-chip text-sm text-slate-200">{filteredAccounts.length} {t.countryPage.visibleAccounts}</div>
                    <div className="metric-chip text-sm text-slate-200">{country.currencies.length} {t.countryPage.currenciesCount}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-300">
                <div className="flex items-center gap-2 text-[#00D2FF]">
                  <Sparkles className="h-4 w-4" />
                  {t.countryPage.snapshotBadge}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="dashboard-stat">
                    <p className="surface-label">{t.countryPage.visiblePublicAccounts}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{filteredAccounts.length}</p>
                  </div>
                  <div className="dashboard-stat">
                    <p className="surface-label">{t.countryPage.currencyMap}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{country.currencies.length}</p>
                  </div>
                </div>
                <div className="subtle-divider mt-4" />
                <p className="mt-4 text-sm leading-7 text-slate-400">{t.countryPage.noteDescription}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {country.currencies.map(currency => (
                <a key={`${country.slug}-${currency}`} href={`#currency-${currency.toLowerCase()}`} className="rounded-full border border-[#00D2FF]/25 bg-[#00D2FF]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#ccf6ff] transition hover:bg-[#00D2FF]/18">
                  {currency}
                </a>
              ))}
            </div>
          </section>

          <aside className="glass-panel p-6 sm:p-8 xl:sticky xl:top-10 xl:h-fit">
            <p className="surface-label">{t.countryPage.noteTitle}</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">{t.countryPage.noteDescription}</p>
            <div className="subtle-divider mt-5" />
            <p className="mt-5 surface-label">{t.countryPage.currencyMap}</p>
            <div className="mt-5 space-y-4">
              {country.currencies.map(currency => (
                <div key={`summary-${currency}`} className="rounded-[1.4rem] border border-white/10 bg-slate-950/65 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-semibold text-white">{currency}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {accountsByCurrency[currency]?.length || 0} {t.countryPage.accountsLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="glass-panel mt-8 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="surface-label">{t.countryPage.findAccount}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{t.countryPage.filterTitle}</h2>
            </div>
            <label className="flex w-full items-center gap-3 rounded-full border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-slate-300 lg:max-w-md">
              <Search className="h-4 w-4 text-[#00D2FF]" />
              <input
                value={accountQuery}
                onChange={event => setAccountQuery(event.target.value)}
                placeholder={t.countryPage.filterPlaceholder}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
              {accountQuery && (
                <button type="button" onClick={() => setAccountQuery("")} className="rounded-full p-1 text-slate-400 transition hover:bg-white/5 hover:text-white" aria-label="Clear country search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>
        </section>

        {/* Currency groups give operations a predictable structure and work well on mobile. */}
        <section className="mt-10 space-y-8">
          {Object.keys(accountsByCurrency).length > 0 ? (
            Object.entries(accountsByCurrency).map(([currency, currencyAccounts]) => (
              <div key={currency} id={`currency-${currency.toLowerCase()}`} className="scroll-mt-28 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.34em] text-slate-500">{t.countryPage.currencyGroup}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{currency}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                    {currencyAccounts.length} account{currencyAccounts.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {currencyAccounts.map(account => (
                    <CopyableAccountCard key={account.id} accountText={account.accountText} currency={account.currency} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300 backdrop-blur-xl">
              <p className="text-lg font-semibold text-white">
                {hasFilter ? t.countryPage.noFilterMatchesTitle : t.countryPage.noAccountsTitle}
              </p>
              <p className="mt-3 text-sm text-slate-400">
                {hasFilter ? t.countryPage.noFilterMatchesDescription : t.countryPage.noAccountsDescription}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}