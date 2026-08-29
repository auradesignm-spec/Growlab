"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { enterHref, SIGN_IN_HREF } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";
import TourStartLink from "@/components/TourStartLink";

const BILLS = [
  { src: 1, dx: -120, dy: -48, fall: 72, sway: 14, w: 32, delay: 0, spin: -14, dur: 2.6 },
  { src: 2, dx: 110, dy: -56, fall: 68, sway: -12, w: 28, delay: 160, spin: 18, dur: 3.1 },
  { src: 3, dx: -36, dy: -80, fall: 78, sway: 16, w: 30, delay: 320, spin: 8, dur: 2.8 },
  { src: 1, dx: 86, dy: 36, fall: 60, sway: -10, w: 26, delay: 80, spin: -12, dur: 3.2 },
  { src: 2, dx: -92, dy: 44, fall: 74, sway: 12, w: 28, delay: 240, spin: 14, dur: 2.7 },
  { src: 3, dx: 132, dy: 8, fall: 66, sway: -8, w: 24, delay: 400, spin: -20, dur: 3.0 },
  { src: 1, dx: 48, dy: -70, fall: 70, sway: 10, w: 26, delay: 200, spin: 12, dur: 2.9 },
  { src: 2, dx: -148, dy: 20, fall: 58, sway: -14, w: 30, delay: 360, spin: -10, dur: 3.15 },
] as const;

function isCashWord(word: string, locale: string): boolean {
  const clean = word
    .replace(/[^\p{L}]/gu, "")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .toLowerCase();
  if (locale === "ar") return clean === "ارباح" || clean === "أرباح";
  return clean === "profit";
}

export default function Hero() {
  const t = useTranslations("marketing.hero");
  const locale = useLocale();
  const words = t("title").split(/\s+/).filter(Boolean);
  const cashIndex = words.findIndex((word) => isCashWord(word, locale));

  return (
    <section id="manifesto" className="relative overflow-x-clip scroll-mt-24 pb-10 pt-[5.5rem] sm:pb-10 sm:pt-28">
      <div className="relative z-[1] mx-auto max-w-wrap px-5 sm:px-8">
        <div className="relative max-w-4xl overflow-visible px-1 pt-16 sm:px-4 sm:pt-24">
          {/* Brandstack Financial Intelligence Manifesto Banner */}
          <div className="relative z-[1] mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span>
              {locale === "en"
                ? "Brandstack Engine: Gross is vanity. Net is the truth."
                : "محرك الربح الصافي: إجمالي المبيعات مظهر خادع.. وصافي الربح هو الحقيقة."}
            </span>
          </div>

          <h1 key={locale} className="gl-hero-title relative z-[1] text-start font-semibold text-frost">
            {words.map((word, index) => {
              const cashWord = index === cashIndex;
              return (
                <span key={`${locale}-${index}`} className={cashWord ? "gl-word-cash" : undefined}>
                  {cashWord ? (
                    <span className="gl-hero-cash" aria-hidden="true">
                      {BILLS.map((bill, billIndex) => (
                        <span
                          key={billIndex}
                          className="gl-bill"
                          style={
                            {
                              "--dx": `${bill.dx * 0.78}px`,
                              "--dy": `${bill.dy * 0.72}px`,
                              "--fall": `${bill.fall * 0.7}px`,
                              "--sway": `${bill.sway * 0.85}px`,
                              "--turn": `${bill.spin > 0 ? 200 + bill.spin * 3 : -200 + bill.spin * 3}deg`,
                              "--bill-w": `${Math.round(bill.w * 1.15)}px`,
                              "--bill-delay": `${bill.delay}ms`,
                              "--path-dur": `${bill.dur}s`,
                            } as CSSProperties
                          }
                        >
                          <img src={`/hero-bill-${bill.src}.png`} alt="" decoding="async" />
                        </span>
                      ))}
                    </span>
                  ) : null}
                  <span className="gl-word">
                    <span className="gl-word-inner" style={{ animationDelay: `${90 + index * 78}ms` }}>
                      {word}
                    </span>
                  </span>
                </span>
              );
            })}
          </h1>

          {/* Punchy Fragmentation Callout */}
          <div className="gl-enter-2 relative z-[1] mt-4 rounded-2xl border border-line bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:bg-slate-900/60">
            <p className="text-sm font-bold text-frost">
              {locale === "en"
                ? "Your sales are in Shopify. Your spend is in Meta. Your returns are in a spreadsheet. And none of them agree."
                : "مبيعاتك في شوبيفاي وسلة، إنفاقك الإعلاني في ميتا وجوجل، ومرتجعاتك في جدول إكسيل.. ولا أحد منها يتطابق مع رصيدك البنكي."}
            </p>
            <p className="mt-1 text-xs text-frost-dim leading-relaxed">
              {locale === "en"
                ? "Growlab unifies multi-channel sales, live ad spend attribution, courier COD settlements, and return losses into one single source of True Net Profit."
                : "جروولاب يوحّد بيانات مبيعاتك، الإنفاق الإعلاني الحقيقي، تحصيلات شركات الشحن، وخسائر المرتجعات في شاشة واحدة تركز على الكاش الحقيقي في جيبك."}
            </p>
          </div>

          {/* Key Value Points */}
          <div className="relative z-[1] mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-frost-dim font-medium">
            <div className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/5 px-3 py-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>{locale === "en" ? "Live Cross-Platform Sync" : "مزامنة لحظية للمتاجر والإعلانات"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/5 px-3 py-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>{locale === "en" ? "SKU-Level Profitability" : "حساب هامش الربح الصافي لكل SKU"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/5 px-3 py-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>{locale === "en" ? "Automated Courier & RTO Audit" : "تدقيق بوليصات الشحن والمرتجعات"}</span>
            </div>
          </div>

          <div className="relative z-[1] mt-6 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <TourStartLink
              href={enterHref("merchant")}
              guide="open-account"
              source="hero-merchant"
              className="gl-btn-primary min-h-12 w-full justify-center sm:w-auto"
            >
              {t("ctaMerchant")}
            </TourStartLink>
            <a
              href="/onboarding/survey"
              className="gl-btn-secondary min-h-12 w-full justify-center sm:w-auto border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-300 hover:bg-amber-500/20 font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <span>{locale === "en" ? "Take AI Profit Leak Audit" : "فحص التسريبات المالية مجاناً"}</span>
            </a>
            <a
              href="/demo"
              className="gl-btn-ghost min-h-12 w-full justify-center sm:w-auto border border-[#111318]/20 bg-white/80 backdrop-blur font-semibold shadow-sm hover:bg-white hover:border-[#111318]/40 transition-all text-[#111318] flex items-center gap-2"
              onClick={() => track("Demo Clicked", { source: "hero-demo" })}
            >
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {locale === "en" ? "Try Demo" : "تجربة ديمو"}
            </a>
          </div>
          <p className="relative z-[1] mt-3 text-start text-[13px] text-frost-dim flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{locale === "en" ? "No credit card required • Instant setup" : "بدون بطاقة ائتمان • إعداد فوري خلال دقيقة"}</span>
            <span>•</span>
            <a href={SIGN_IN_HREF} className="font-medium text-frost underline-offset-2 hover:underline">
              {t("signIn")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
