"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { TrustVsChaosSection } from "@/components/ugc/TrustVsChaosSection";
import GrowthCalculator from "@/components/landing/GrowthCalculator";
import { CreatorOnboardingModal } from "@/components/ugc/CreatorOnboardingModal";
import LanguageSwitcher from "@/components/motion/LanguageSwitcher";
import { Zap, ArrowRight, ShieldCheck, ShoppingBag, Store, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";

export function LandingMain() {
  const { lang, dir } = useLanguage();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 selection:text-white overflow-x-hidden" dir={dir}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/30">
                <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">Growlab</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/shop" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>{isAr ? "المتجر العام" : "Public Shop"}</span>
              </Link>
              <Link href="/merchant/dashboard" className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                <span>{isAr ? "بوابة التاجر" : "Merchant Portal"}</span>
              </Link>
              <Link href="/creator/dashboard" className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>{isAr ? "بوابة صانع المحتوى" : "Creator Portal"}</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link 
              href="/shop" 
              className="hidden sm:inline-flex px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
            >
              {isAr ? "استكشف المتاجر المصغرة" : "Explore Micro-Stores"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] pt-36 pb-24 overflow-hidden flex flex-col justify-center bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in duration-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isAr ? "منظومة التجارة وصناع المحتوى الأولى في العالم العربي (Pan-Arab UGC Ecosystem)" : "#1 Pan-Arab UGC & E-Commerce Ecosystem"}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.12] mb-8">
              {isAr ? (
                <>
                  اربط تجارتك بأبرز صناع المحتوى <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                    بأمان تام وعمولات مقفلة بالهللة
                  </span>
                </>
              ) : (
                <>
                  Connect Your Business with Top Creators <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                    With Full Security & Automated Escrow
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              {isAr
                ? "تخلص من عشوائية الروابط التقليدية وخسائر الإعلانات المسبقة. امنح منتجاتك متجراً مصغراً احترافياً لكل صانع محتوى في السعودية، الإمارات، عمان، مصر وباقي الوطن العربي مع تسوية مالية آلية وتتبع دقيق."
                : "Eliminate ad waste and manual tracking chaos. Provide a dedicated micro-store for every creator across KSA, UAE, Oman, Egypt, and the Arab region with automated financial escrow."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/merchant/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black text-base hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-3"
              >
                <span>{isAr ? "انضم كتاجر موثق - ابدأ بدون مخاطرة" : "Join as Verified Merchant - Start Risk-Free"}</span>
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>

              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                <span>{isAr ? "انضم كصانع محتوى - ابدأ الربح الآن" : "Join as Creator - Start Earning Now"}</span>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </button>
            </div>

            <div className="mt-16 pt-12 border-t border-slate-900/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">100%</div>
                <div className="text-xs font-bold text-slate-500 uppercase">{isAr ? "دفع مقابل النتيجة" : "Pay-For-Performance"}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">{isAr ? "6 دول" : "6 Countries"}</div>
                <div className="text-xs font-bold text-slate-500 uppercase">{isAr ? "دعم العملات الإقليمية" : "Multi-Currency Support"}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">$0</div>
                <div className="text-xs font-bold text-slate-500 uppercase">{isAr ? "بدون تكاليف إعلانية مقدمة" : "No Upfront Ad Costs"}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">{isAr ? "آلي بالكامل" : "100% Automated"}</div>
                <div className="text-xs font-bold text-slate-500 uppercase">{isAr ? "نظام دفتر العمليات (Escrow)" : "Escrow Financial Ledger"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TrustVsChaosSection: The Core Value Architecture */}
      <div id="trust-vs-chaos">
        <TrustVsChaosSection 
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onNavigateToMerchantPortal={() => { if (typeof window !== "undefined") window.location.href = "/merchant/dashboard"; }}
        />
      </div>

      {/* Growth Calculator Section */}
      <div id="calculator">
        <GrowthCalculator onOpenDashboard={() => { if (typeof window !== "undefined") window.location.href = "/creator/dashboard"; }} />
      </div>

      {/* Pan-Arab Ecosystem Teaser */}
      <section className="py-24 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            {isAr ? "سوق التجارة الموزعة" : "Distributed UGC Marketplace"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            {isAr ? "شبكة متكاملة تغطي أسواق الخليج ومصر والأردن" : "Pan-Arab Network Covering GCC, Egypt, & Jordan"}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-12">
            {isAr
              ? "كل صانع محتوى يحصل على رابط متجر مصغر فريد (growlab.com/creator/username) يعرض منتجات موثقة من كبرى العلامات التجارية مع تسعير تلقائي بالعملة المحلية وعمليات شحن موثوقة."
              : "Every creator gets a custom micro-store link (growlab.com/creator/username) showcasing verified brand items with localized currency pricing and seamless fulfillment."}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span>{isAr ? "تصفح سوق المنتجات والمتاجر المصغرة" : "Browse Marketplace & Micro-Stores"}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 pt-20 pb-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
                </div>
                <span className="text-xl font-black text-white tracking-tighter uppercase">Growlab</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                {isAr
                  ? "منظومة التجارة وصناع المحتوى الأولى في العالم العربي. حماية مالية، متاجر مصغرة، ودفع مقابل الأداء الفعلي."
                  : "The #1 Pan-Arab UGC commerce ecosystem. Financial protection, micro-stores, and performance-based payouts."}
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">{isAr ? "روابط سريعة" : "Quick Links"}</h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="/shop" className="hover:text-white transition-colors">{isAr ? "المتجر العام" : "Public Shop"}</Link></li>
                <li><Link href="/merchant/dashboard" className="hover:text-white transition-colors">{isAr ? "بوابة التاجر والمورد" : "Merchant Portal"}</Link></li>
                <li><Link href="/creator/dashboard" className="hover:text-white transition-colors">{isAr ? "بوابة صانع المحتوى" : "Creator Portal"}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">{isAr ? "الأسواق المدعومة" : "Supported Markets"}</h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>🇺🇸 United States (USD)</li>
                <li>🇸🇦 Saudi Arabia (SAR)</li>
                <li>🇦🇪 United Arab Emirates (AED)</li>
                <li>🇴🇲 Sultanate of Oman (OMR)</li>
                <li>🇪🇬 Egypt (EGP)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">{isAr ? "الأمان والاعتماد" : "Security & Escrow"}</h3>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? "نظام الحماية والتدقيق المالي (Escrow)" : "Financial Escrow Protection"}</span>
                </div>
                <p className="text-slate-500 text-xs">
                  {isAr ? "توزيع الأرباح آلياً فور تأكيد استلام العميل للطلب بالهللة الواحدة." : "Automated profit distribution upon customer delivery confirmation."}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <div>{isAr ? "جميع الحقوق محفوظة © 2026 Growlab Pan-Arab UGC Commerce Ecosystem." : "All rights reserved © 2026 Growlab Pan-Arab UGC Commerce Ecosystem."}</div>
            <div className="flex items-center gap-2 text-emerald-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isAr ? "النظام المالي يعمل بكفاءة 100%" : "Financial Engine Operating 100%"}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      <CreatorOnboardingModal 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)} 
      />
    </div>
  );
}

