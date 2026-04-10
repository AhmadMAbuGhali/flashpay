"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { defaultLocale, type Locale } from "@/lib/translations";
import { deepMergeTranslations, type LocaleContentMap } from "@/lib/uiContent";
import { translations } from "@/lib/translations";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: typeof translations[Locale];
  refreshContent: () => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  messages: translations[defaultLocale],
  refreshContent: async () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [contentOverrides, setContentOverrides] = useState<LocaleContentMap>({ ar: {}, en: {} });

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("flashpay_locale") as Locale | null;
    const browserLocale = navigator.language.startsWith("en") ? "en" : "ar";
    setLocale(storedLocale ?? browserLocale);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("flashpay_locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const refreshContent = async () => {
    try {
      const response = await fetch("/api/content", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as LocaleContentMap;
      setContentOverrides({ ar: data.ar || {}, en: data.en || {} });
    } catch {
      setContentOverrides({ ar: {}, en: {} });
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  const messages = useMemo(
    () => deepMergeTranslations(translations[locale], contentOverrides[locale]),
    [contentOverrides, locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, messages, refreshContent }),
    [locale, messages]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
