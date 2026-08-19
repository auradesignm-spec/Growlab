"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Store,
  Smartphone,
  Trophy,
  ShieldCheck,
  Zap,
  TrendingUp,
  Percent,
  CheckCircle2,
  ArrowRight,
  Truck,
  ExternalLink,
  Flame,
  Award,
  Globe,
  DollarSign,
  Play,
  Users,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useUgc } from "@/lib/UgcContext";
import { convertPrice } from "@/lib/ugc-store";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TrustVsChaosSection } from "@/components/ugc/TrustVsChaosSection";
import { CreatorOnboardingModal } from "@/components/ugc/CreatorOnboardingModal";

export default function LandingPage() {
  const { creators, products, orders, currentCurrency } = useUgc();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Total gross volume computed from sample store state
  const totalVolumeUSD = orders.reduce((sum, o) => sum + (o.paidAmountLocal || 100), 0);

  return (
    <div className="min-h-screen bg-growlab-bg text-onDark selection:bg-growlab-gold/30 selection:text-white" dir="rtl">
      {/* 1. Clutter-Free Marketing Navigation Header */}
      <LandingHeader onOpenOnboarding={() => setIsOnboardingOpen(true)} />

      {/* 2. World-Class Marketing Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-growlab-gold/15 via-amber-500/10 to-growlab-emerald/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-8">
          {/* Top verified badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-growlab-bgCard border border-growlab-border/80 shadow-md text-xs font-semibold text-white">
            <div className="w-2 h-2 rounded-full bg-growlab-emerald animate-ping" />
            <span className="text-growlab-gold font-bold">منظومة التجارة الخليجية القائمة على الأداء</span>
            <span className="text-growlab-border">|</span>
            <span className="text-muted text-[11px] hidden sm:inline">عُمان 🇴🇲 • السعودية 🇸🇦 • الإمارات 🇦🇪</span>
          </div>

          {/* High-Impact Display Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-white tracking-tight leading-[1.15]">
              حول شغفك وتجارتك إلى{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-growlab-gold via-amber-300 to-growlab-goldLight">
                مبيعات وأرباح فورية
              </span>{" "}
              بأمان 100%
            </h1>
            <p className="text-sm sm:text-base text-onDarkSoft leading-relaxed max-w-2xl mx-auto">
              Growlab تربط كبرى الموردين والتجار المرخصين بنخبة من صناع المحتوى المؤثرين. لا توجد تكاليف إعلانية مسبقة؛ التاجر يدفع فقط بعد اكتمال البيع، والصانع يجني عمولات محمية وموزعة لحظياً.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            {/* Primary Action: Go to Storefront */}
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-growlab-gold via-amber-400 to-growlab-goldLight text-growlab-bgDark font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-glow-gold/10 flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>تصفح وتسوق المتجر العام 🛍️</span>
            </Link>

            {/* Creator Onboarding Action */}
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-growlab-bgCard border border-growlab-border hover:border-growlab-emerald text-white hover:text-growlab-emerald font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Sparkles className="h-4 w-4 text-growlab-emerald group-hover:rotate-12 transition-transform" />
              <span>ابدأ كصانع محتوى (مجاناً) ✨</span>
            </button>

            {/* Merchant Gateway Action */}
            <Link
              href="/merchant"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-growlab-bgSurface border border-growlab-border hover:border-amber-400 text-muted hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Store className="h-4 w-4 text-amber-400" />
              <span>للتجار والموردين 🏢</span>
            </Link>
          </div>

          {/* Live Transparency Metric Strip */}
          <div className="pt-6">
            <div className="max-w-3xl mx-auto p-4 sm:p-5 rounded-3xl bg-growlab-bgCard/90 border border-growlab-border backdrop-blur-md shadow-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-xl sm:text-2xl font-black font-mono text-white">
                    80%
                  </div>
                  <div className="text-[11px] text-muted">صافي ربح التاجر المضمون</div>
                </div>
                <div className="space-y-1 border-r border-growlab-border/70">
                  <div className="text-xl sm:text-2xl font-black font-mono text-growlab-emerald">
                    18-20%
                  </div>
                  <div className="text-[11px] text-muted">عمولة الصانع الموزعة آلياً</div>
                </div>
                <div className="space-y-1 border-r border-growlab-border/70">
                  <div className="text-xl sm:text-2xl font-black font-mono text-growlab-gold">
                    0.00 ر.ع
                  </div>
                  <div className="text-[11px] text-muted">ميزانية إعلانية مسبقة مهدرة</div>
                </div>
                <div className="space-y-1 border-r border-growlab-border/70">
                  <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                    24 ساعة
                  </div>
                  <div className="text-[11px] text-muted">تسوية بنكية فورية</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Workflow: How Growlab Works (01 -> 04) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <HowItWorksSection />
      </section>

      {/* 4. The Trust & Value Architecture (Interactive Perspective Matrix) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <TrustVsChaosSection
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onNavigateToMerchantPortal={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/merchant";
            }
          }}
        />
      </section>

      {/* 5. Featured Verified Creators Showcases */}
      <section id="creators" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-growlab-gold/15 text-growlab-gold border border-growlab-gold/30 text-xs font-bold">
              <Award className="h-3.5 w-3.5" />
              <span>نخبة صناع المحتوى المعتمدين</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              تصفح المتاجر المصغرة لكبار المؤثرين
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-xl">
              صناع محتوى يمتلكون متاجر رقمية معتمدة على منصتنا؛ يمكنك الدخول لمتجر أي صانع والشراء منه مباشرة.
            </p>
          </div>

          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-amber-400 text-xs text-amber-400 font-bold self-start sm:self-auto"
          >
            <Trophy className="h-4 w-4" />
            <span>عرض لوحة المتصدرين وتصنيف الأداء ←</span>
          </Link>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creators.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl bg-growlab-bgCard border border-growlab-border hover:border-growlab-gold/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl group"
            >
              {/* Banner & Avatar */}
              <div className="relative h-32 w-full bg-growlab-bgDark overflow-hidden">
                <img
                  src={c.banner}
                  alt={c.displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-growlab-bgCard via-transparent to-transparent" />
              </div>

              <div className="p-6 relative -mt-12 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div className="relative">
                      <img
                        src={c.avatar}
                        alt={c.displayName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-growlab-bgCard shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded bg-growlab-gold text-growlab-bgDark">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-growlab-bgSurface border border-growlab-border text-growlab-gold">
                      ★ PRO CREATOR
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-white">
                      {c.displayName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                      <span className="font-mono text-growlab-gold">@{c.username}</span>
                      <span>•</span>
                      <span>{c.country === "OM" ? "🇴🇲 سلطنة عُمان" : c.country === "SA" ? "🇸🇦 السعودية" : "🇦🇪 الإمارات"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {c.bio}
                  </p>

                  {/* Creator Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-growlab-border/70 text-center text-xs">
                    <div className="p-2 rounded-xl bg-growlab-bgDark border border-growlab-border">
                      <div className="text-[10px] text-muted">معدل التحويل</div>
                      <div className="font-mono font-bold text-growlab-emerald text-sm mt-0.5">
                        {c.stats.conversionRate}%
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-growlab-bgDark border border-growlab-border">
                      <div className="text-[10px] text-muted">طلبات منفذة</div>
                      <div className="font-mono font-bold text-white text-sm mt-0.5">
                        {c.stats.orderCount}+ طلب
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visit Public Storefront Button */}
                <Link
                  href={`/creator/${c.username}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold text-white font-bold text-xs hover:bg-growlab-bgSurface/80 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <ShoppingBag className="h-3.5 w-3.5 text-growlab-gold group-hover/btn:scale-110 transition-transform" />
                  <span>زيارة متجر @{c.username}</span>
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Partner Portals Access Gateways */}
      <section id="merchants" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Merchant Card */}
          <div className="rounded-3xl bg-gradient-to-br from-growlab-bgCard to-growlab-bgDark border border-growlab-border p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-amber-400 uppercase">للتجار والموردين والماركات</span>
                <h3 className="text-xl font-bold font-display text-white">
                  ضاعف مبيعاتك عبر جيش من صناع المحتوى
                </h3>
              </div>
              <p className="text-xs text-onDarkSoft leading-relaxed">
                ارفع كتالوج منتجاتك، وتتبع عمليات البيع والإسناد بالهللة، ولا تدفع أي رسوم أو عمولات إلا بعد استلام العميل للطلب وتأكيد الدفع.
              </p>
              <div className="space-y-2 text-xs text-muted pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-growlab-emerald" />
                  <span>لوحة تحكم احترافية لإدارة المخزون والطلبات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-growlab-emerald" />
                  <span>تقارير لحظية بنسب مبيعات كل صانع محتوى</span>
                </div>
              </div>
            </div>

            <Link
              href="/merchant"
              className="w-full py-3.5 px-6 rounded-2xl bg-growlab-bgSurface border border-amber-400/40 hover:border-amber-400 text-white font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <span>دخول بوابة التاجر والمورد 🏢</span>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Link>
          </div>

          {/* Creator Card */}
          <div className="rounded-3xl bg-gradient-to-br from-growlab-bgCard to-growlab-bgDark border border-growlab-border p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-growlab-emerald/15 text-growlab-emerald flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-growlab-emerald uppercase">لصناع المحتوى والمؤثرين</span>
                <h3 className="text-xl font-bold font-display text-white">
                  أطلق متجرك الإلكتروني بهاتفك في دقيقة
                </h3>
              </div>
              <p className="text-xs text-onDarkSoft leading-relaxed">
                اختر المنتجات الأصلية من كبار الموردين، واحصل على صفحتك المصغرة فوراً، واستخدم أدوات الذكاء الاصطناعي لكتابة سكريبتات إعلانية فيروسية.
              </p>
              <div className="space-y-2 text-xs text-muted pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-growlab-emerald" />
                  <span>محفظة أرباح لحظية وسحب بنكي سريع</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-growlab-emerald" />
                  <span>بدون شراء أو تخزين أو شحن منتجات</span>
                </div>
              </div>
            </div>

            <Link
              href="/creator/dashboard"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>دخول بوابة صانع المحتوى 📱</span>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Clean World-Class Footer */}
      <footer className="border-t border-growlab-border/80 bg-growlab-bgDark py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-growlab-gold to-growlab-emerald p-0.5">
              <div className="w-full h-full bg-growlab-bgDark rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-growlab-gold" />
              </div>
            </div>
            <div>
              <span className="font-display font-black text-sm text-white">GROWLAB UGC</span>
              <p className="text-[10px] text-muted">المنظومة الخليجية الأولى لتجارة صناع المحتوى</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/shop" className="hover:text-white transition-colors">
              المتجر العام 🛍️
            </Link>
            <Link href="/merchant" className="hover:text-white transition-colors">
              بوابة التجار 🏢
            </Link>
            <Link href="/creator/dashboard" className="hover:text-white transition-colors">
              بوابة الصناع 📱
            </Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors">
              لوحة المتصدرين 🏆
            </Link>
          </div>

          <div className="text-[11px] text-muted text-center md:text-left">
            جميع الحقوق محفوظة © {new Date().getFullYear()} Growlab Ecosystem
          </div>
        </div>
      </footer>

      {/* 8. Creator Onboarding Modal */}
      {isOnboardingOpen && (
        <CreatorOnboardingModal onClose={() => setIsOnboardingOpen(false)} />
      )}
    </div>
  );
}
