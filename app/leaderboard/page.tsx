"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Store, ShieldCheck, Sparkles } from "lucide-react";
import { LeaderboardView } from "@/components/ugc/LeaderboardView";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/motion/LanguageSwitcher";

export default function LeaderboardPage() {
  const { isAr, language } = useLanguage();

  return (
    <div className="min-h-screen bg-growlab-bgDark text-white font-body selection:bg-growlab-emerald/30 selection:text-white" dir={isAr ? "rtl" : "ltr"}>
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-growlab-bgDark/95 backdrop-blur-lg border-b border-growlab-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-growlab-emerald to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-growlab-emerald/20 group-hover:scale-105 transition-transform">
                <span className="font-display font-black text-growlab-bgDark text-sm">GL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight group-hover:text-growlab-emerald transition-colors font-display">
                  Growlab
                </span>
                <span className="text-[10px] text-muted -mt-1 font-mono">UGC Leaders</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-emerald text-white text-xs font-bold transition-all shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-growlab-emerald" />
              <span>{isAr ? "المتجر العام" : "Public Store"}</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-growlab-emerald text-growlab-bgDark hover:bg-growlab-emerald/90 text-xs font-bold transition-all"
            >
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
              <span>{isAr ? "الرئيسية" : "Home"}</span>
            </Link>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Leaderboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <LeaderboardView />
      </main>

      {/* Footer Note */}
      <footer className="border-t border-growlab-border py-8 text-center text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Growlab Ecosystem • {isAr ? "جميع حقوق النشر محفوظة لمنصة التجارة الاجتماعية الموثقة" : "All rights reserved"}</p>
        </div>
      </footer>
    </div>
  );
}
