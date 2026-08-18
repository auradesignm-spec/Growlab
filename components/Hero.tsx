"use client";

import { useState } from "react";
import GrowthLine from "@/components/GrowthLine";
import { MessageCircle, ArrowLeft, Bot, ShieldCheck, Zap, TrendingUp, CheckCircle2, PhoneCall } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "تواصل مباشر مع المؤسسين",
    desc: "ما تتعامل مع مدير حسابات ينقل رسايل، تتكلم مع صناع القرار نفسهم.",
  },
  {
    icon: Bot,
    title: "وكيل ذكاء اصطناعي 24/7",
    desc: "يرد في ثوانٍ، يشرح تفاصيل منتجك، ويقفل الطلبات حتى بأوقات النوم.",
  },
  {
    icon: TrendingUp,
    title: "شراكة مبنية على النتيجة",
    desc: "دخلك أولاً، عمولتنا مرتبطة بنجاح حملاتك ومبيعاتك الفعلية.",
  },
];

interface HeroProps {
  onOpenDashboard?: () => void;
}

export default function Hero({ onOpenDashboard }: HeroProps) {
  const [activeTab, setActiveTab] = useState<"ad" | "bot" | "roi">("bot");

  return (
    <section id="hero" className="relative overflow-hidden bg-ink py-20 text-onDark md:py-28 lg:py-32">
      <GrowthLine />
      
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-28 right-1/4 h-96 w-96 rounded-full bg-teal/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-gold/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          
          {/* Main Hero Copy (Left in RTL / Right visually) */}
          <div className="lg:col-span-7">
            <div className="eyebrow inline-flex items-center gap-2">
              <span>Growlab — شريك النمو والأتمتة</span>
            </div>

            <h1 className="font-display text-3xl font-extrabold leading-[1.25] text-onDark sm:text-5xl md:text-6xl">
              وكالات التسويق تبيعك وعود.
              <br />
              إحنا <span className="text-gold-soft underline decoration-gold/60 underline-offset-8" style={{ color: "#E7CFA0" }}>نشاركك نتيجتك</span>.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-onDarkSoft sm:text-lg md:text-xl">
              ندير حملات إعلانات ميتا بإنتاج محتوى فيديو احترافي، ونربط متجرك بوكيل ذكاء اصطناعي مدرّب يحوّل كل عميل مهتم إلى مبيعة حقيقية على مدار الساعة.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              {onOpenDashboard && (
                <button
                  onClick={onOpenDashboard}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-gold px-7 py-4 text-base font-bold text-[#241A08] shadow-lg shadow-gold/20 transition-all hover:bg-gold-soft hover:shadow-xl active:scale-95"
                >
                  <Zap className="h-5 w-5 text-[#241A08]" />
                  <span>دخول لوحة تحكم الشركات ورفع المنتجات</span>
                  <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </button>
              )}

              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-onDarkSoft/40 bg-white/5 px-6 py-4 text-base font-bold text-onDark backdrop-blur-xs transition-all hover:border-gold hover:bg-white/10 active:scale-95"
              >
                <span>احجز استشارة</span>
              </a>

              <a
                href="https://wa.me/?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20Growlab%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D9%85%D8%B9%D8%B1%D9%81%D8%A9%20%D8%AA%D9%81%D8%A7%D8%B5%D9%8A%D9%84%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%D9%83%D9%85"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-onDarkSoft/30 bg-white/5 px-4 py-4 text-base font-semibold text-onDark backdrop-blur-xs transition-all hover:border-gold/60 hover:bg-white/10 active:scale-95"
                title="تواصل مباشر عبر واتساب"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
              </a>
            </div>

            {/* Trust Micro-Bullets */}
            <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-4 font-mono text-xs text-onDarkSoft sm:text-[13px]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                بدون عقود احتكارية طويلة
              </span>
              <span className="text-onDarkSoft/40">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                إلغاء بأي شهر
              </span>
              <span className="text-onDarkSoft/40">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                تجهيز خلال ٤٨ ساعة
              </span>
            </div>
          </div>

          {/* Interactive Live Preview Box (Right in RTL / Left visually) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-onDark/15 bg-onDark/[0.04] p-5 shadow-2xl backdrop-blur-md sm:p-6">
              
              {/* Tab Selector */}
              <div className="mb-4 flex items-center justify-between border-b border-onDark/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  <span className="font-mono text-xs text-onDarkSoft mr-2">نظام Growlab الحي</span>
                </div>
                <span className="rounded-full bg-teal/20 px-2 py-0.5 font-mono text-[11px] text-teal">
                  ● نشط الآن
                </span>
              </div>

              {/* Mini Tabs */}
              <div className="mb-4 grid grid-cols-3 gap-1.5 rounded-lg bg-onDark/[0.06] p-1 text-xs">
                <button
                  onClick={() => setActiveTab("bot")}
                  className={`rounded-md py-1.5 font-semibold transition-all ${
                    activeTab === "bot" ? "bg-gold text-[#241A08] shadow-xs" : "text-onDarkSoft hover:text-onDark"
                  }`}
                >
                  وكيل المبيعات AI
                </button>
                <button
                  onClick={() => setActiveTab("ad")}
                  className={`rounded-md py-1.5 font-semibold transition-all ${
                    activeTab === "ad" ? "bg-gold text-[#241A08] shadow-xs" : "text-onDarkSoft hover:text-onDark"
                  }`}
                >
                  إعلانات ميتا
                </button>
                <button
                  onClick={() => setActiveTab("roi")}
                  className={`rounded-md py-1.5 font-semibold transition-all ${
                    activeTab === "roi" ? "bg-gold text-[#241A08] shadow-xs" : "text-onDarkSoft hover:text-onDark"
                  }`}
                >
                  لوحة الأرباح
                </button>
              </div>

              {/* Tab Content 1: AI Chat Simulator */}
              {activeTab === "bot" && (
                <div className="space-y-3 font-sans text-xs sm:text-sm animate-in fade-in duration-300">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-onDark/[0.12] p-3 text-onDark">
                      <span className="mb-1 block font-mono text-[10px] text-onDarkSoft">عميل محتمل (الساعة 2:14 فجراً)</span>
                      مرحبا، عجبني المنتج بالفيديو. كم سعره وكيف التوصيل لمسقط؟
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-teal/30 border border-teal/40 p-3 text-onDark">
                      <span className="mb-1 flex items-center justify-between font-mono text-[10px] text-gold-soft">
                        <span>وكيل Growlab الذكي (رد خلال 4 ثوانٍ)</span>
                        <Zap className="h-3 w-3 text-gold" />
                      </span>
                      أهلاً بك! السعر 24 ر.ع شامل التوصيل السريع خلال 24 ساعة والدفع عند الاستلام. تحب أثبّت لك الطلب الآن؟
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-xs bg-onDark/[0.12] p-3 text-onDark">
                      أيوا تمام، هذا رقمي وعنواني...
                    </div>
                  </div>

                  <div className="rounded-lg border border-gold/30 bg-gold/10 p-2.5 text-center text-xs font-semibold text-gold-soft">
                    ✨ النتيجة: تم قفل المبيعة تلقائياً وإرسال إشعار فوري للتاجر
                  </div>
                </div>
              )}

              {/* Tab Content 2: Meta Ads Engine */}
              {activeTab === "ad" && (
                <div className="space-y-3 text-xs sm:text-sm animate-in fade-in duration-300">
                  <div className="rounded-xl border border-onDark/15 bg-onDark/[0.08] p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-onDark">حملة Meta Video Ads (UGC)</span>
                      <span className="rounded-full bg-teal/20 px-2 py-0.5 font-mono text-[11px] text-teal">ROAS: 4.8x</span>
                    </div>
                    <p className="mt-1.5 text-xs text-onDarkSoft">تصميم فيديو تسويقي مخصص بنمط ريلز جذاب يجذب الجمهور المهتم بالشراء الفعلي.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
                    <div className="rounded-lg bg-onDark/[0.06] p-2.5">
                      <span className="block text-onDarkSoft">معدل التحويل (CTR)</span>
                      <span className="text-sm font-bold text-gold">4.2%</span>
                    </div>
                    <div className="rounded-lg bg-onDark/[0.06] p-2.5">
                      <span className="block text-onDarkSoft">تكلفة المشتري المؤكد</span>
                      <span className="text-sm font-bold text-teal">1.8$</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: ROI Dashboard */}
              {activeTab === "roi" && (
                <div className="space-y-3 text-xs sm:text-sm animate-in fade-in duration-300">
                  <div className="rounded-xl border border-onDark/15 bg-onDark/[0.08] p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-onDark">صافي المبيعات المحققة</span>
                      <span className="font-mono font-bold text-gold text-base">+3,480$</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-onDark/10 overflow-hidden">
                      <div className="h-full w-4/5 rounded-full bg-gold transition-all" />
                    </div>
                    <div className="mt-2 flex justify-between font-mono text-[11px] text-onDarkSoft">
                      <span>ميزانية الإعلانات: 650$</span>
                      <span>عائد الاستثمار: 535%</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Feature Badges Footer */}
        <div className="mt-16 grid grid-cols-1 gap-4 border-t border-onDark/15 pt-8 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="group rounded-xl border border-onDark/10 bg-onDark/[0.03] p-4.5 transition-all hover:border-gold/40 hover:bg-onDark/[0.06]"
              >
                <div className="mb-2.5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:bg-gold group-hover:text-ink transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="font-display text-sm font-bold text-onDark">{b.title}</h2>
                </div>
                <p className="text-xs leading-relaxed text-onDarkSoft">{b.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

