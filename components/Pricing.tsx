"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Check, Sparkles, ArrowLeft, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";
import Link from "next/link";

export default function Pricing() {
  const locale = useLocale();
  const isAr = locale !== "en";
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: "starter",
      titleAr: "باقة الأساسية (Starter)",
      titleEn: "Starter Plan",
      subtitleAr: "للمؤسسات الصغرى والناشئة التي تبحث عن أمان التراخيص",
      subtitleEn: "For micro-enterprises and new ventures",
      priceMonthly: 9,
      priceAnnual: 7,
      periodAr: "ر.ع / شهرياً",
      periodEn: "OMR / month",
      highlight: false,
      featuresAr: [
        "تتبع سجل تجاري واحد (1 CR)",
        "تنبيهات تلقائية لانتهاء التراخيص عبر واتساب",
        "حاسبة نسب التعمين لنشاطك",
        "تقرير الامتثال الأساسي الشهري",
        "دعم فني عبر البريد والواتساب",
      ],
      featuresEn: [
        "Track 1 Commercial Registry (CR)",
        "WhatsApp alerts for permit renewals",
        "Sector Omanisation calculator",
        "Monthly basic compliance report",
        "Email & WhatsApp support",
      ],
      ctaAr: "ابدأ التجربة المجانية",
      ctaEn: "Start Free Trial",
      href: "/sign-up?plan=starter",
    },
    {
      id: "growth",
      titleAr: "باقة النمو (Growth)",
      titleEn: "Growth Plan",
      subtitleAr: "الخيار الأكثر شعبية للمؤسسات المتوسطة لتفادي كافة الغرامات",
      subtitleEn: "Most popular for scaling SMEs",
      priceMonthly: 19,
      priceAnnual: 15,
      periodAr: "ر.ع / شهرياً",
      periodEn: "OMR / month",
      highlight: true,
      badgeAr: "الأكثر طلباً",
      badgeEn: "Most Popular",
      featuresAr: [
        "تتبع حتى 3 سجلات وفروع تجارية",
        "وكيل ذكاء اصطناعي على واتساب 24/7 للإجابة الفورية",
        "مراقبة متقدمة لنسب التعمين والتأمينات (منصة توطين)",
        "تدقيق متطلبات الفوترة الإلكترونية وضريبة القيمة المضافة",
        "تنبيهات استباقية مبكرة (قبل 60 و 30 و 7 أيام)",
        "تصدير تقارير امتثال PDF رسمية جاهزة للبنوك",
      ],
      featuresEn: [
        "Track up to 3 CRs & branches",
        "24/7 WhatsApp AI Agent advisor",
        "Advanced Tawteen & Social Security tracking",
        "VAT & e-invoicing compliance audit",
        "Multi-stage early reminders (60, 30, 7 days)",
        "Export official PDF compliance reports",
      ],
      ctaAr: "اشترك في باقة النمو",
      ctaEn: "Get Growth Plan",
      href: "/sign-up?plan=growth",
    },
    {
      id: "pro",
      titleAr: "باقة المحترفين (Pro)",
      titleEn: "Pro Enterprise",
      subtitleAr: "للشركات المتعددة، المجموعات التجارية، ومكاتب سند والاستشارات",
      subtitleEn: "For groups, multi-entity businesses & Sanad offices",
      priceMonthly: 39,
      priceAnnual: 31,
      periodAr: "ر.ع / شهرياً",
      periodEn: "OMR / month",
      highlight: false,
      featuresAr: [
        "تتبع غير محدود للسجلات والتراخيص البلدية",
        "استشارات الامتثال القانوني واللوائح بالذكاء الاصطناعي",
        "وصول متعدد لمديري الفروع والمحاسبين",
        "تخصيص كامل للتنبيهات وقنوات الإشعار",
        "ربط مخصص عبر Webhooks و API للأنظمة الداخلية",
        "مدير حساب مخصص وأولوية دعم على مدار الساعة",
      ],
      featuresEn: [
        "Unlimited CRs & municipal permits",
        "AI Regulatory & Labor law consultations",
        "Multi-user access for branch managers & accountants",
        "Custom alert workflows & notification channels",
        "Custom API & Webhooks integration (n8n ready)",
        "Dedicated account manager & 24/7 priority support",
      ],
      ctaAr: "اشترك في باقة المحترفين",
      ctaEn: "Get Pro Plan",
      href: "/sign-up?plan=pro",
    },
  ];

  return (
    <section id="pricing" className="relative scroll-mt-16 py-section">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="gl-eyebrow text-emerald-700 font-semibold">
              {isAr ? "باقات اشتراك واضحة ومدروسة" : "Simple, Transparent Pricing"}
            </p>
            <h2 className="gl-heading text-display-lg font-bold text-slate-900">
              {isAr ? "استثمر في حماية منشأتك ووفر آلاف الريالات" : "Protect Your Business & Save Thousands"}
            </h2>
            <p className="gl-lede text-slate-600 text-sm sm:text-base">
              {isAr
                ? "تكلفة اشتراك شهري بسيط تعادل جزءاً بسيطاً جداً من قيمة مخالفة أو غرامة واحدة قد تتعرض لها."
                : "A modest subscription that costs a tiny fraction of a single government fine."}
            </p>

            {/* Monthly / Annual Toggle Switch */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span
                onClick={() => setIsAnnual(false)}
                className={`text-xs font-semibold cursor-pointer transition-colors ${
                  !isAnnual ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isAr ? "دفع شهري" : "Monthly"}
              </span>

              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative h-7 w-12 rounded-full bg-slate-200 p-1 transition-colors border border-slate-300 focus:outline-none"
                aria-label="Toggle Annual Billing"
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-emerald-600 shadow-md transition-transform ${
                    isAnnual ? (isAr ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                  }`}
                />
              </button>

              <div className="flex items-center gap-1.5">
                <span
                  onClick={() => setIsAnnual(true)}
                  className={`text-xs font-semibold cursor-pointer transition-colors ${
                    isAnnual ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isAr ? "دفع سنوي" : "Annual"}
                </span>
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {isAr ? "خصم 20%" : "Save 20%"}
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <StageGlow className="mt-8 sm:mt-12" tone="sun" place="center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {plans.map((plan, idx) => {
              const currentPrice = isAnnual ? plan.priceAnnual : plan.priceMonthly;
              return (
                <Reveal key={plan.id} delay={idx * 60}>
                  <div
                    className={`relative flex h-full flex-col justify-between p-5 sm:p-6 md:p-7 rounded-2xl border transition-all ${
                      plan.highlight
                        ? "border-2 border-emerald-500 bg-white shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/10"
                        : "border-slate-200/90 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md">
                        {isAr ? plan.badgeAr : plan.badgeEn}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{isAr ? plan.titleAr : plan.titleEn}</h3>
                        <p className="mt-1 text-xs text-slate-500 min-h-[32px]">{isAr ? plan.subtitleAr : plan.subtitleEn}</p>
                      </div>

                      <div className="pt-2 flex items-baseline gap-1.5">
                        <span className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900">{currentPrice}</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {isAr ? plan.periodAr : plan.periodEn}
                        </span>
                      </div>

                      <ul className="space-y-2.5 pt-4 border-t border-slate-100">
                        {(isAr ? plan.featuresAr : plan.featuresEn).map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <Link
                        href={plan.href}
                        className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                          plan.highlight
                            ? "gl-btn-primary shadow-lg shadow-emerald-500/20"
                            : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {plan.highlight && <Sparkles className="h-4 w-4" />}
                        <span>{isAr ? plan.ctaAr : plan.ctaEn}</span>
                      </Link>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </StageGlow>

        <Reveal delay={180}>
          <div className="mt-10 text-center text-xs text-slate-500 space-y-1">
            <p>{isAr ? "جميع الأسعار بالريال العُماني (OMR) شاملة الدعم الفني والتحديثات الدورية للوائح." : "All prices in OMR."}</p>
            <p>{isAr ? "هل تحتاج باقة خاصة للشركات القابضة أو مكاتب الاستشارات؟ تواصل معنا مباشرة عبر واتساب." : "Custom group plans available."}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
