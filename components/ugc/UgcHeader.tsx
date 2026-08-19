"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Trophy,
  Users,
  Store,
  ShieldCheck,
  ChevronDown,
  Globe,
  ExternalLink,
  PlusCircle,
  BarChart3,
  Percent,
} from "lucide-react";
import { useUgc } from "@/lib/UgcContext";
import { CURRENCIES } from "@/lib/ugc-store";
import { CurrencyCode, UserRole } from "@/lib/ugc-types";

interface UgcHeaderProps {
  currentTab: "overview" | "leaderboard" | "creator-portal" | "merchant-portal" | "admin-ledger";
  onTabChange: (tab: "overview" | "leaderboard" | "creator-portal" | "merchant-portal" | "admin-ledger") => void;
  onOpenOnboarding: () => void;
}

export const UgcHeader: React.FC<UgcHeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenOnboarding,
}) => {
  const {
    creators,
    currentCurrency,
    setCurrentCurrency,
    activeRole,
    setActiveRole,
    activeCreatorId,
    setActiveCreatorId,
  } = useUgc();

  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);

  const activeCreator = creators.find((c) => c.id === activeCreatorId) || creators[0];

  return (
    <header className="sticky top-0 z-40 bg-growlab-bgDark/95 backdrop-blur-lg border-b border-growlab-border">
      {/* Top micro ticker */}
      <div className="bg-growlab-bgSurface/80 border-b border-growlab-border/50 px-4 py-1 text-[11px] text-muted">
        <div className="max-w-wrap mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-growlab-emerald animate-pulse" />
            <span className="text-white font-medium">المنصة مباشرة:</span>
            <span className="hidden sm:inline">تقسيم أرباح لحظي (75-80% للتاجر • 15-20% لصانع المحتوى • 5% للمنصة)</span>
            <span className="sm:hidden">مشاركة أرباح قائمة على الأداء</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-growlab-gold font-medium hidden md:inline">
              ✨ أول حملة مجانية لكل صانع محتوى موثق (0% رسوم منصة)
            </span>
            <div className="flex items-center gap-1 font-mono">
              {(["OMR", "SAR", "AED", "USD"] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrentCurrency(c)}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                    currentCurrency === c
                      ? "bg-growlab-gold text-growlab-bgDark font-bold"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-wrap mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => onTabChange("overview")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-growlab-gold to-growlab-bgSurface border border-growlab-gold/50 flex items-center justify-center shadow-glow-gold/20 shadow-lg group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-growlab-bgDark text-lg">G</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold font-display tracking-tight text-white">
                  Growlab
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-growlab-gold/20 text-growlab-gold border border-growlab-gold/40">
                  UGC
                </span>
              </div>
              <p className="text-[10px] text-muted -mt-1 hidden sm:block">
                منصة تجارة صناع المحتوى الخليجية
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-growlab-bgCard border border-growlab-border p-1 rounded-xl text-xs">
            <button
              onClick={() => onTabChange("overview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === "overview"
                  ? "bg-growlab-bgSurface text-white font-bold shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              <Store className="h-3.5 w-3.5 text-growlab-gold" />
              <span>الرئيسية والكتالوج</span>
            </button>

            <button
              onClick={() => onTabChange("leaderboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === "leaderboard"
                  ? "bg-growlab-bgSurface text-white font-bold shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>لوحة الترتيب التنافسية</span>
            </button>

            <button
              onClick={() => {
                setActiveRole("creator");
                onTabChange("creator-portal");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === "creator-portal"
                  ? "bg-growlab-bgSurface text-white font-bold shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              <Users className="h-3.5 w-3.5 text-growlab-emerald" />
              <span>بوابة صناع المحتوى</span>
            </button>

            <button
              onClick={() => {
                setActiveRole("merchant");
                onTabChange("merchant-portal");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === "merchant-portal"
                  ? "bg-growlab-bgSurface text-white font-bold shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5 text-cyan-400" />
              <span>بوابة التجار</span>
            </button>

            <button
              onClick={() => {
                setActiveRole("admin");
                onTabChange("admin-ledger");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentTab === "admin-ledger"
                  ? "bg-growlab-bgSurface text-white font-bold shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
              <span>دفتر الإدارة والتقسيم</span>
            </button>
          </nav>
        </div>

        {/* Right action group */}
        <div className="flex items-center gap-2.5">
          {/* Quick storefronts preview dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-growlab-bgCard border border-growlab-border hover:border-growlab-gold text-xs text-white transition-colors"
            >
              <img
                src={activeCreator.avatar}
                alt={activeCreator.displayName}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="hidden sm:inline font-mono">@{activeCreator.username}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted" />
            </button>

            {isStoreMenuOpen && (
              <div className="absolute left-0 rtl:left-auto rtl:right-0 mt-2 w-64 rounded-2xl bg-growlab-bgCard border border-growlab-border p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1.5 text-[11px] font-bold text-muted uppercase border-b border-growlab-border mb-1">
                  المتاجر المصغرة المعتمدة (Live Storefronts):
                </div>
                <div className="space-y-1">
                  {creators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-growlab-bgSurface text-xs transition-colors"
                    >
                      <div
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => {
                          setActiveCreatorId(c.id);
                          setIsStoreMenuOpen(false);
                        }}
                      >
                        <img src={c.avatar} alt={c.displayName} className="w-7 h-7 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-white leading-none">{c.displayName}</div>
                          <div className="font-mono text-[10px] text-growlab-gold">@{c.username}</div>
                        </div>
                      </div>
                      <Link
                        href={`/creator/${c.username}`}
                        onClick={() => setIsStoreMenuOpen(false)}
                        className="p-1.5 rounded-lg bg-growlab-bgDark text-muted hover:text-white"
                        title="فتح المتجر"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Join Creator Onboarding CTA */}
          <button
            onClick={onOpenOnboarding}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">انضم كصانع محتوى</span>
            <span className="sm:hidden">انضم كصانع</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-growlab-border bg-growlab-bgDark px-2 py-2 text-xs overflow-x-auto">
        <button
          onClick={() => onTabChange("overview")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            currentTab === "overview" ? "bg-growlab-bgSurface text-white font-bold" : "text-muted"
          }`}
        >
          الكتالوج
        </button>
        <button
          onClick={() => onTabChange("leaderboard")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            currentTab === "leaderboard" ? "bg-growlab-bgSurface text-white font-bold" : "text-muted"
          }`}
        >
          لوحة الترتيب
        </button>
        <button
          onClick={() => {
            setActiveRole("creator");
            onTabChange("creator-portal");
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            currentTab === "creator-portal" ? "bg-growlab-bgSurface text-white font-bold" : "text-muted"
          }`}
        >
          بوابة الصانع
        </button>
        <button
          onClick={() => {
            setActiveRole("merchant");
            onTabChange("merchant-portal");
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            currentTab === "merchant-portal" ? "bg-growlab-bgSurface text-white font-bold" : "text-muted"
          }`}
        >
          بوابة التاجر
        </button>
      </div>
    </header>
  );
};
