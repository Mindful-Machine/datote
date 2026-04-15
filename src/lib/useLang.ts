"use client";

import { useEffect, useState } from "react";
import { translations, type Lang, type TKey } from "./i18n";

const STORAGE_KEY = "pindate_lang";

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (saved === "en" || saved === "fr") return saved;
  // Auto-detect from browser locale
  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export const LANG_LABELS: Record<Lang, { flag: string; name: string }> = {
  en: { flag: "🇬🇧", name: "English" },
  fr: { flag: "🇫🇷", name: "Français" },
};

export function useLang() {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  function setLang(l: Lang) {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }

  function t(key: TKey): string {
    return translations[lang][key];
  }

  return { lang, setLang, t };
}
