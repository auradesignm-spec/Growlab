"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
  Store,
  Layers,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import { CurrencyCode, ProductCategory } from "@/lib/ugc-types";
import { CURRENCIES } from "@/lib/ugc-store";
import { useUgc } from "@/lib/UgcContext";

interface StorefrontNavProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory | "all";
  setSelectedCategory: (cat: ProductCategory | "all") => void;
}

export const StorefrontNav: React.FC<StorefrontNavProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const {
    currentCurrency,
    setCurrentCurrency,
    cartItemCount,
    setIsCartOpen,
  } = useUgc();

  const categories: { id: ProductCategory | "all"; label: string; icon: string }[] = [
    { id: "all", label: "جميع المنتجات", icon: "✨" },
    { id: "perfume", label: "عطور وبخور ملكي", icon: "💎" },
    { id: "tech", label: "تقنية وأجهزة ذكية", icon: "📱" },
    { id: "fashion", label: "أزياء وعبايات خليجية", icon: "👗" },
    { id: "beauty", label: "عناية وجمال طبيعي", icon: "🌿" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-growlab-bgDark/95 backdrop-blur-md border-b border-growlab-border" dir="rtl">
      {/* 1. Top Announcement Micro-Bar */}
      <div className="bg-gradient-to-r from-growlab-bgDark via-growlab-bgCard to-growlab-bgDark border-b border-growlab-border/60 px-4 py-1.5 text-[11px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted truncate">
            <span className="flex items-center gap-1 text-growlab-gold font-bold">
              <Truck className="h-3.5 w-3.5" />
              توصيل سريع لكافة دول الخليج:
            </span>
            <span className="hidden sm:inline">سلطنة عُمان 🇴🇲 • السعودية 🇸🇦 • الإمارات 🇦🇪 • الكويت 🇰🇼</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-growlab-bgSurface border border-growlab-border/70 rounded-lg p-0.5">
              {(["OMR", "SAR", "AED", "USD"] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrentCurrency(c)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
                    currentCurrency === c
                      ? "bg-growlab-gold text-growlab-bgDark font-bold"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {CURRENCIES[c].flag} {c}
                </button>
              ))}
            </div>

            <span className="text-growlab-border">|</span>

            {/* Link back to Main Marketing Landing */}
            <Link
              href="/"
              className="text-muted hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>الرئيسية التعريفية</span>
              <ArrowRight className="h-3 w-3 rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main E-Commerce Header Bar (Noon / Shein Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand with Store Badge */}
        <div className="flex items-center gap-4">
          <Link href="/shop" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-growlab-gold to-growlab-emerald p-0.5 shadow-md">
              <div className="w-full h-full bg-growlab-bgDark rounded-[14px] flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-growlab-gold group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl text-white tracking-tight">
                  GROWLAB
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-growlab-emerald/20 text-growlab-emerald border border-growlab-emerald/40 font-bold">
                  STORE • المتجر
                </span>
              </div>
              <p className="text-[10px] text-muted -mt-0.5 hidden md:block">
                مختارات موثقة من تجار الخليج وصناع المحتوى
              </p>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن عطور، تقنية، ساعات، أو اسم صانع المحتوى..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-growlab-bgSurface border border-growlab-border text-white text-xs outline-none focus:border-growlab-gold transition-colors placeholder:text-muted/70"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Partner Portals, Cart Button */}
        <div className="flex items-center gap-3">
          {/* Creator Stores Link */}
          <Link
            href="/creator/dashboard"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-amber-400 text-xs text-muted hover:text-white transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>بوابة صانع المحتوى</span>
          </Link>

          {/* Cart Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden xs:inline">سلة التسوق</span>
            {cartItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-growlab-bgDark text-white text-[10px] font-mono flex items-center justify-center font-bold shadow">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search input */}
      <div className="sm:hidden px-4 pb-2.5">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن المنتجات أو الصناع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-9 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border text-white text-xs outline-none focus:border-growlab-gold"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
        </div>
      </div>

      {/* 3. Category Filter Navigation Ribbon */}
      <div className="border-t border-growlab-border/70 bg-growlab-bgDark/80 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-growlab-gold text-growlab-bgDark font-bold shadow-sm"
                  : "bg-growlab-bgSurface/70 border border-growlab-border text-muted hover:text-white hover:border-growlab-border/90"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
