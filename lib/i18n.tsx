"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations, Translations } from "./translations";

interface LanguageContextType {
  lang: Language;
  dir: "rtl" | "ltr";
  isRtl: boolean;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
}

const defaultContextValue: LanguageContextType = {
  lang: "ar",
  dir: "rtl",
  isRtl: true,
  setLang: () => {},
  toggleLang: () => {},
  t: translations.ar,
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("senthora_preferred_lang") as Language;
      if (saved && (saved === "ar" || saved === "en")) {
        setLangState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.setAttribute("lang", lang);
      try {
        localStorage.setItem("senthora_preferred_lang", lang);
      } catch {
        // ignore
      }
    }
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const toggleLang = () => {
    setLangState((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const dir = lang === "ar" ? "rtl" : "ltr";
  const isRtl = lang === "ar";
  const t = translations[lang] || translations.ar;

  return (
    <LanguageContext.Provider value={{ lang, dir, isRtl, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  return context || defaultContextValue;
}
