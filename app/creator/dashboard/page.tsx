"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, ArrowRight, ShoppingBag, Store, Sparkles, ExternalLink } from "lucide-react";
import { CreatorPortal } from "@/components/ugc/CreatorPortal";
import { useUgc } from "@/lib/UgcContext";

export default function CreatorDashboardPage() {
  const { creators, activeCreatorId } = useUgc();
  const activeCreator = creators.find((c) => c.id === activeCreatorId) || creators[0];

  return (
    <div className="min-h-screen bg-growlab-bg text-onDark selection:bg-growlab-emerald/30 selection:text-white" dir="rtl">
      {/* Creator Top Header */}
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
              <div className="p-1.5 rounded-lg bg-growlab-emerald/15 text-growlab-emerald">
                <Smartphone className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-white">بوابة صانع المحتوى (Creator Portal)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {activeCreator && (
              <Link
                href={`/creator/${activeCreator.username}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-growlab-gold/20 text-growlab-gold border border-growlab-gold/40 text-xs font-bold hover:brightness-110 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>زيارة متجري العام (@{activeCreator.username})</span>
              </Link>
            )}

            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-growlab-bgSurface border border-growlab-border text-xs text-muted hover:text-white"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-growlab-emerald" />
              <span>المتجر العام</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Creator Portal Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CreatorPortal />
      </main>
    </div>
  );
}
