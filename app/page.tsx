"use client";

import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import useTranslations from "@/hooks/useTranslations";
import { useEffect, useState } from "react";

interface Country {
  id: string;
  name: string;
  currency: string;
}

interface CurrencyOption {
  code: string;
  name: string;
}

interface Account {
  id: string;
  accountText: string;
  country: string;
  currency: string;
  isActive: boolean;
  isVip: boolean;
  createdAt: string;
}

export default function HomePage() {
  const t = useTranslations();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicAccounts = async () => {
      try {
        const [accountsResponse, countriesResponse, currenciesResponse] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/countries"),
          fetch("/api/currencies"),
        ]);

        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          setAccounts(accountsData.filter((acc: Account) => !acc.isVip && acc.isActive));
        }

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

    fetchPublicAccounts();
  }, []);

  const filteredAccounts = selectedCountry
    ? accounts.filter(account => account.country === selectedCountry)
    : accounts;

  const publicAccountCountByCountry = accounts.reduce<Record<string, number>>((accumulator, account) => {
    accumulator[account.country] = (accumulator[account.country] || 0) + 1;
    return accumulator;
  }, {});

  const selectedCountryLabel = selectedCountry ? `Country: ${selectedCountry}` : "All public accounts";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08101E] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,210,255,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(106,126,170,0.18),_transparent_35%)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* Navbar */}
        <nav className="mb-8 flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Flash Pay Logo" width={40} height={40} className="rounded-full" />
            <span className="text-lg font-semibold text-white">Flash Pay</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/login" className="rounded-full bg-[#00D2FF] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#00c6ff]">
              Login
            </Link>
          </div>
        </nav>

        {/* Country Filter Section */}
        <section className="mb-12 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Public Accounts</h2>
              <p className="text-sm text-slate-400">Select a country to view public accounts for that region.</p>
            </div>
            {selectedCountry && (
              <button
                onClick={() => setSelectedCountry(null)}
                className="rounded-full bg-[#00D2FF] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#00c6ff]"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {countries.map((country) => (
              <button
                key={country.id}
                type="button"
                onClick={() => setSelectedCountry(country.name)}
                className={`rounded-[1.5rem] border px-5 py-5 text-left transition ${
                  selectedCountry === country.name
                    ? "border-[#00D2FF] bg-[#00D2FF]/10"
                    : "border-white/10 bg-slate-950/80 hover:border-[#00D2FF] hover:bg-white/5"
                }`}
              >
                <p className="text-base font-semibold text-white">{country.name}</p>
                <p className="mt-2 text-sm text-slate-400">Currency: {country.currency}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">
                  {publicAccountCountByCountry[country.name] || 0} public accounts
                </p>
              </button>
            ))}
          </div>

          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-slate-400">{selectedCountryLabel}</p>

          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : filteredAccounts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAccounts.map((account) => (
                <div key={account.id} className="rounded-[1rem] border border-white/10 bg-slate-950/80 p-4">
                  <p className="text-lg font-semibold text-white">{account.accountText}</p>
                  <p className="text-sm text-slate-400">{account.country} - {account.currency}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No public accounts available for this country.</p>
          )}
        </section>

        {/* Currency Converter Section */}
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
            <h2 className="mb-6 text-2xl font-semibold text-white">Currency Converter</h2>
            <CurrencyConverter currencies={currencies} />
          </section>
      </div>
    </main>
  );
}

function CurrencyConverter({ currencies }: { currencies: CurrencyOption[] }) {
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
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
          placeholder="Amount"
        />
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
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
          className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-[#00D2FF]/60"
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
          className="rounded-3xl bg-[#00D2FF] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#00D2FF]/90 disabled:opacity-50"
        >
          {loading ? "Converting..." : "Convert"}
        </button>
        <button
          onClick={() => {
            setFromCurrency(toCurrency);
            setToCurrency(fromCurrency);
            setResult(null);
          }}
          type="button"
          className="rounded-3xl border border-white/10 bg-slate-950/80 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#00D2FF]/60"
        >
          Swap currencies
        </button>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Live rates across the top 100 currencies
        </p>
      </div>
      {rateError && <p className="text-sm text-rose-300">{rateError}</p>}
      {result !== null && (
        <div className="space-y-2 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-lg text-white">
            {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
          </p>
          {updatedAt && <p className="text-sm text-slate-400">Updated: {updatedAt}</p>}
        </div>
      )}
    </div>
  );
}
