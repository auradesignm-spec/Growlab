"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useUgc } from "@/lib/UgcContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const { setCurrentLanguage } = useUgc();

  const handleSelectLang = (newLang: "ar" | "en") => {
    setLang(newLang);
    if (setCurrentLanguage) {
      setCurrentLanguage(newLang);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center gap-0.5 rounded-xl bg-growlab-bgCard/90 p-1 border border-growlab-border/80 backdrop-blur-md shadow-sm ${className}`}
      role="radiogroup"
      aria-label="Language selector"
    >
      <div className="pl-1 pr-0.5 text-muted hidden xs:flex items-center">
        <Globe className="h-3.5 w-3.5" />
      </div>

      <button
        type="button"
        role="radio"
        aria-checked={lang === "ar"}
        onClick={() => handleSelectLang("ar")}
        className={`relative z-10 flex items-center gap-1 px-2.5 py-1 text-xs font-bold transition-all duration-200 cursor-pointer rounded-lg ${
          lang === "ar" ? "text-growlab-bgDark" : "text-muted hover:text-white"
        }`}
      >
        <span>🇸🇦</span>
        <span>العربية</span>
        {lang === "ar" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-growlab-gold to-growlab-emerald shadow-xs -z-10"
            transition={{ duration: 0.2 }}
          />
        )}
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={lang === "en"}
        onClick={() => handleSelectLang("en")}
        className={`relative z-10 flex items-center gap-1 px-2.5 py-1 text-xs font-bold transition-all duration-200 cursor-pointer rounded-lg ${
          lang === "en" ? "text-growlab-bgDark" : "text-muted hover:text-white"
        }`}
      >
        <span>🇺🇸</span>
        <span>English</span>
        {lang === "en" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-growlab-gold to-growlab-emerald shadow-xs -z-10"
            transition={{ duration: 0.2 }}
          />
        )}
      </button>
    </div>
  );
}

