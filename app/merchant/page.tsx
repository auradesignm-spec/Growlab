"use client";

import React from "react";
import Link from "next/link";
import { Store, ArrowRight, ShoppingBag, Sparkles, Trophy } from "lucide-react";
import { MerchantPortal } from "@/components/ugc/MerchantPortal";

export default function MerchantDashboardPage() {
  return (
    <div className="min-h-screen bg-growlab-bg text-onDark selection:bg-amber-400/30 selection:text-white" dir="rtl">
      {/* Merchant Top Header */}
      <header className="sticky top-0 z-40 bg-growlab-bgDark/95 backdrop-blur-md border-b border-growlab-border px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-white transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>الرئيسية</span>
            </Link>
            <span className="text-growlab-border">/</span>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-400/15 text-amber-400">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-white">بوابة التاجر والمورد (Merchant Portal)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/shop"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-emerald text-xs text-white"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-growlab-emerald" />
              <span>معاينة المتجر العام</span>
            </Link>

            <Link
              href="/creator/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold text-xs text-muted hover:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-growlab-gold" />
              <span>بوابة الصانع</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Merchant Portal Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <MerchantPortal />
      </main>
    </div>
  );
}
