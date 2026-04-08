"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { translations } from "@/lib/translations";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 text-sm text-slate-100">
      {(["ar", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          className={`rounded-full px-3 py-2 transition ${locale === value ? "bg-[#00D2FF] text-slate-950" : "hover:bg-white/10"}`}
        >
          {translations.ar.switcher[value]}
        </button>
      ))}
    </div>
  );
}
