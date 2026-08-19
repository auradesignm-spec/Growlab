"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Languages } from "lucide-react";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`relative inline-flex items-center rounded-xl bg-dark-2/90 p-1 border border-white/10 backdrop-blur-md shadow-inner ${className}`}
      role="radiogroup"
      aria-label="Language selector"
    >
      <button
        type="button"
        role="radio"
        aria-checked={lang === "ar"}
        onClick={() => setLang("ar")}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors duration-200 cursor-pointer ${
          lang === "ar" ? "text-dark" : "text-onDarkSoft hover:text-onDark"
        }`}
      >
        <span>العربية</span>
        {lang === "ar" && (
          <motion.div
            layoutId="activeLangPill"
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald to-teal shadow-xs -z-10"
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
          />
        )}
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={lang === "en"}
        onClick={() => setLang("en")}
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors duration-200 cursor-pointer ${
          lang === "en" ? "text-dark" : "text-onDarkSoft hover:text-onDark"
        }`}
      >
        <span>English</span>
        {lang === "en" && (
          <motion.div
            layoutId="activeLangPill"
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald to-teal shadow-xs -z-10"
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
}
