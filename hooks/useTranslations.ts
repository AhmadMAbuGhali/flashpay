"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function useTranslations() {
  const { messages } = useLanguage();
  return messages;
}
