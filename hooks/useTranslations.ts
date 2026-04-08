"use client";

import { translations } from "@/lib/translations";
import { useLanguage } from "@/components/LanguageProvider";

export default function useTranslations() {
  const { locale } = useLanguage();
  return translations[locale];
}
