"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Store,
  Smartphone,
  Trophy,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Layers,
} from "lucide-react";
import { CurrencyCode } from "@/lib/ugc-types";
import { CURRENCIES } from "@/lib/ugc-store";
import { useUgc } from "@/lib/UgcContext";

interface LandingHeaderProps {
  onOpenOnboarding: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onOpenOnboarding }) => {
  const { currentCurrency, setCurrentCurrency } = useUgc();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-growlab-bgDark/95 backdrop-blur-md border-b border-growlab-border/80 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-growlab-gold via-amber-400 to-growlab-emerald p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-growlab-bgDark rounded-[14px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-growlab-gold group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-tight text-white">
                  GROWLAB
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-growlab-gold/15 text-growlab-gold border border-growlab-gold/30">
                  UGC
                </span>
              </div>
              <p className="text-[10px] text-muted -mt-0.5 hidden sm:block">
                منظومة تجارة صناع المحتوى الخليجية
              </p>
            </div>
          </Link>

          {/* Desktop Clean Navigation Links (Zero Admin Clutter) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-muted">
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              آلية العمل
            </a>
            <a
              href="#trust-vs-chaos"
              className="hover:text-white transition-colors"
            >
              معمارية الثقة والقيمة
            </a>
            <a
              href="#creators"
              className="hover:text-white transition-colors"
            >
              صناع المحتوى
            </a>
            <Link
              href="/leaderboard"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>لوحة المتصدرين</span>
            </Link>
          </nav>
        </div>

        {/* Right Actions: Storefront Link, Portals Dropdown, Creator CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Currency Pill */}
          <div className="hidden sm:flex items-center gap-0.5 bg-growlab-bgSurface border border-growlab-border rounded-xl p-1 text-[11px]">
            {(["OMR", "SAR", "AED", "USD"] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrentCurrency(c)}
                className={`px-2 py-1 rounded-lg font-mono font-medium transition-all ${
                  currentCurrency === c
                    ? "bg-growlab-gold text-growlab-bgDark font-bold shadow-sm"
                    : "text-muted hover:text-white"
                }`}
              >
                {CURRENCIES[c].flag} {c}
              </button>
            ))}
          </div>

          {/* Dedicated Storefront CTA Button */}
          <Link
            href="/shop"
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-emerald/80 text-white hover:text-growlab-emerald font-bold text-xs transition-all shadow-sm group"
          >
            <ShoppingBag className="h-4 w-4 text-growlab-emerald group-hover:scale-110 transition-transform" />
            <span>المتجر العام</span>
            <span className="hidden md:inline-block text-[10px] font-normal text-muted group-hover:text-growlab-emerald">
              (تسوق المنتجات)
            </span>
          </Link>

          {/* Partner Portals Menu (Dropdown for Merchants & Creators) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-amber-400 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <Store className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">بوابات الشركاء</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted" />
            </button>

            {portalsDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setPortalsDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-growlab-bgCard border border-growlab-border p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right">
                  <div className="text-[10px] font-mono text-muted px-2.5 py-1 uppercase border-b border-growlab-border/70 mb-1">
                    بوابات الدخول والإدارة
                  </div>
                  <Link
                    href="/merchant"
                    onClick={() => setPortalsDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-growlab-bgSurface transition-colors text-xs font-bold text-white group"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 group-hover:bg-amber-400/20">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <div>بوابة التاجر والمورد 🏢</div>
                      <div className="text-[10px] text-muted font-normal">إدارة الكتالوج والطلبات</div>
                    </div>
                  </Link>
                  <Link
                    href="/creator/dashboard"
                    onClick={() => setPortalsDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-growlab-bgSurface transition-colors text-xs font-bold text-white group"
                  >
                    <div className="p-1.5 rounded-lg bg-growlab-emerald/10 text-growlab-emerald group-hover:bg-growlab-emerald/20">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <div>بوابة صانع المحتوى 📱</div>
                      <div className="text-[10px] text-muted font-normal">الأرباح وسكريبتات الذكاء الاصطناعي</div>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Primary CTA: Start as Creator */}
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">ابدأ كصانع محتوى</span>
            <span className="xs:hidden">ابدأ</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-growlab-bgSurface border border-growlab-border text-muted hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-growlab-border/70 space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-center">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-growlab-bgSurface border border-growlab-border text-white"
            >
              آلية العمل
            </a>
            <a
              href="#trust-vs-chaos"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-growlab-bgSurface border border-growlab-border text-white"
            >
              معمارية الثقة
            </a>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-growlab-emerald/15 border border-growlab-emerald/30 text-growlab-emerald font-bold"
            >
              🛍️ المتجر العام
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-growlab-bgSurface border border-growlab-border text-amber-400 font-bold"
            >
              🏆 المتصدرون
            </Link>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-growlab-bgSurface border border-growlab-border">
            <span className="text-xs text-muted">العملة:</span>
            <div className="flex items-center gap-1">
              {(["OMR", "SAR", "AED", "USD"] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrentCurrency(c)}
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    currentCurrency === c
                      ? "bg-growlab-gold text-growlab-bgDark font-bold"
                      : "text-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
