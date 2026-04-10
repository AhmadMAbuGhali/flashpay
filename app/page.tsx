"use client";

import Link from "next/link";
import CountryCard from "@/components/public/CountryCard";
import PublicNavbar from "@/components/public/PublicNavbar";
import { ArrowRight, Crown, Search, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import useTranslations from "@/hooks/useTranslations";

interface Country {
  id: string;
  name: string;
  currency: string;
  slug: string;
  flagEmoji?: string | null;
  flagIconUrl?: string | null;
  currencies: string[];
  publicAccountCount: number;
}

interface CurrencyOption {
  code: string;
  name: string;
}

export default function HomePage() {
  const t = useTranslations();
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [countriesResponse, currenciesResponse] = await Promise.all([
          fetch("/api/countries"),
          fetch("/api/currencies"),
        ]);

        if (countriesResponse.ok) {
          const countriesData = await countriesResponse.json();
          setCountries(countriesData);
        }

        if (currenciesResponse.ok) {
          const currenciesData = await currenciesResponse.json();
          setCurrencies(currenciesData.currencies || []);
        }
      } catch (error) {
        console.error("Error fetching public data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  // Search keeps the growing country directory usable without falling back to a flat list.
  const visibleCountries = countries.filter(country => {
    const haystack = `${country.name} ${country.currencies.join(" ")}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const featuredCountries = countries.slice(0, 4);
  const totalAccounts = countries.reduce((total, country) => total + country.publicAccountCount, 0);
  const totalCurrencies = new Set(countries.flatMap(country => country.currencies)).size;

  return (
    <main className="noise-overlay relative min-h-screen overflow-hidden bg-[#08101E] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,210,255,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(106,126,170,0.18),_transparent_35%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <PublicNavbar />

        {/* Hero section sets the luxurious tone and highlights the new country-driven UX. */}
        <section className="premium-panel mb-12 overflow-hidden p-6 sm:p-8">
          <div className="editorial-grid items-start">
            <div>
              <div className="accent-kicker">
                <Sparkles className="h-4 w-4" />
                {t.home.badge}
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                {t.home.heroTitle}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                {t.home.heroDescription}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#markets" className="inline-flex items-center gap-2 rounded-full bg-[#00D2FF] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                  {t.home.exploreMarkets}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#00D2FF]/60 hover:text-[#00D2FF]">
                  {t.home.adminAccess}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="metric-chip text-sm text-slate-200">
                  {countries.length} {t.home.statsCountries}
                </div>
                <div className="metric-chip text-sm text-slate-200">
                  {totalAccounts} {t.home.statsAccounts}
                </div>
                <div className="metric-chip text-sm text-slate-200">
                  {totalCurrencies} {t.home.statsCurrencies}
                </div>
              </div>

              {featuredCountries.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {featuredCountries.map(country => (
                    <Link key={`featured-${country.id}`} href={`/country/${country.slug}`} className="secondary-button text-sm">
                      {country.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_30px_90px_-60px_rgba(106,126,170,0.65)]">
              <div className="flex items-center gap-3 text-[#00D2FF]">
                <Crown className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.26em]">{t.home.marketSnapshot}</p>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="surface-label">{t.home.spotlightTitle}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{t.home.spotlightDescription}</p>
                <div className="subtle-divider mt-4" />
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="dashboard-stat">
                    <p className="surface-label">{t.home.statsCountries}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{countries.length}</p>
                  </div>
                  <div className="dashboard-stat">
                    <p className="surface-label">{t.home.statsAccounts}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{totalAccounts}</p>
                  </div>
                  <div className="dashboard-stat">
                    <p className="surface-label">{t.home.statsCurrencies}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{totalCurrencies}</p>
                  </div>
                </div>
              </div>
              {featuredCountries.length > 0 ? (
                <div className="mt-6 space-y-4 text-slate-300">
                  {featuredCountries.map((country, index) => (
                    <Link
                      key={`hero-market-${country.id}`}
                      href={`/country/${country.slug}`}
                      className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:border-[#00D2FF]/45 hover:bg-white/[0.08]"
                    >
                      <div>
                        <p className="text-sm text-slate-500">#{index + 1} {t.home.marketRank}</p>
                        <p className="mt-1 text-lg font-semibold text-white">{country.name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {country.publicAccountCount} public accounts · {country.currencies.join(", ")}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#00D2FF]" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                  {t.home.noMarkets}
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="markets" className="mb-12">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="surface-label">{t.home.directoryEyebrow}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{t.home.chooseMarket}</h2>
              {!loading && (
                <p className="mt-2 text-sm text-slate-400">{visibleCountries.length} {t.home.results}</p>
              )}
            </div>
            <label className="flex w-full items-center gap-3 rounded-full border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-slate-300 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.55)] md:w-auto">
              <Search className="h-4 w-4 text-[#00D2FF]" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 md:w-[280px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300 backdrop-blur-xl">
              {t.home.loadingMarkets}
            </div>
          ) : (
            <>
              {visibleCountries.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleCountries.map(country => (
                    <CountryCard
                      key={country.id}
                      name={country.name}
                      slug={country.slug}
                      flagEmoji={country.flagEmoji}
                      flagIconUrl={country.flagIconUrl}
                      currencies={country.currencies}
                      accountCount={country.publicAccountCount}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-panel p-8 text-center text-slate-300">
                  {t.home.noMatches}
                </div>
              )}
            </>
          )}
        </section>

        {/* Currency Converter Section */}
        <section className="glass-panel p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="surface-label">{t.home.converterEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{t.home.converterTitle}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              {t.home.converterDescription}
            </p>
          </div>
          <CurrencyConverter currencies={currencies} />
        </section>
      </div>
    </main>
  );
}

function CurrencyConverter({ currencies }: { currencies: CurrencyOption[] }) {
  const t = useTranslations();
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const currencyOptions: CurrencyOption[] = currencies.length
    ? currencies
    : [
        { code: "USD", name: "US Dollar" },
        { code: "EUR", name: "Euro" },
        { code: "GBP", name: "British Pound" },
        { code: "JPY", name: "Japanese Yen" },
      ];

  useEffect(() => {
    if (currencyOptions.length > 0) {
      setFromCurrency(prev => prev || currencyOptions[0].code);
      setToCurrency(prev => prev || (currencyOptions[1]?.code ?? currencyOptions[0].code));
    }
  }, [currencyOptions]);

  const convert = async () => {
    if (!fromCurrency || !toCurrency || amount <= 0) {
      setRateError("Enter a valid amount and select both currencies.");
      setResult(null);
      return;
    }

    setLoading(true);
    setRateError(null);
    try {
      const response = await fetch(
        `/api/exchange-rates?base=${encodeURIComponent(fromCurrency)}&symbols=${encodeURIComponent(toCurrency)}`
      );
      const data = await response.json();

      if (!response.ok || !data?.rates?.[toCurrency]) {
        throw new Error(data?.error || "Conversion failed");
      }

      setResult(amount * data.rates[toCurrency]);
      setUpdatedAt(data.updatedAt || null);
    } catch (error) {
      console.error("Conversion error:", error);
      setRateError(error instanceof Error ? error.message : "Conversion failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Converter layout is split into controls and result so it feels like a feature, not an afterthought.
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
      <p className="surface-label">{t.home.quickAmountLabel}</p>
      <div className="flex flex-wrap gap-2">
        {[1, 100, 1000].map(preset => (
          <button
            key={`preset-${preset}`}
            type="button"
            onClick={() => setAmount(preset)}
            className="secondary-button px-4 py-2 text-sm"
          >
            {preset}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="field-input"
          placeholder="Amount"
        />
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          className="field-select"
        >
          {currencyOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name} ({option.code})
            </option>
          ))}
        </select>
        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          className="field-select"
        >
          {currencyOptions.map((option) => (
            <option key={`${option.code}-to`} value={option.code}>
              {option.name} ({option.code})
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={convert}
          disabled={loading}
          className="primary-button"
        >
          {loading ? t.home.converting : t.home.convert}
        </button>
        <button
          onClick={() => {
            setFromCurrency(toCurrency);
            setToCurrency(fromCurrency);
            setResult(null);
          }}
          type="button"
          className="secondary-button"
        >
          {t.home.swapCurrencies}
        </button>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          {t.home.liveRates}
        </p>
      </div>
      {rateError && <p className="text-sm text-rose-300">{rateError}</p>}
      </div>

      <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/62 p-5 shadow-[0_24px_80px_-45px_rgba(0,0,0,0.6)]">
        <p className="surface-label">{t.home.resultEyebrow}</p>
        {result !== null ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-slate-400">{t.home.resultSummary}</p>
            <p className="text-3xl font-semibold text-white">
              {result.toFixed(2)} {toCurrency}
            </p>
            <p className="text-sm leading-7 text-slate-300">
              {amount} {fromCurrency} converted into {toCurrency} using the latest fetched rate.
            </p>
            {updatedAt && <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{t.home.updatedLabel}: {updatedAt}</p>}
          </div>
        ) : (
          <div className="mt-5 space-y-3 text-slate-400">
            <p className="text-lg font-medium text-white">{t.home.readyTitle}</p>
            <p className="text-sm leading-7">
              {t.home.readyDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
