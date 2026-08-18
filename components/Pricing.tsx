"use client";

import { useState } from "react";
import { Check, Sparkles, ArrowLeft, Calculator, HelpCircle, ShieldCheck, Zap } from "lucide-react";

const starterFeatures = [
  "إنتاج فيديو إعلاني احترافي مخصص شهرياً (UGC / Reels)",
  "إدارة واختبار حملات إعلانات ميتا (Instagram & Facebook)",
  "وكيل ذكاء اصطناعي أساسي للرد الفوري على الاستفسارات",
  "إعداد بكسل التتبع وربط الأحداث مع المتجر",
  "تقرير أداء دوري كل أسبوعين",
  "بدون عقود طويلة — حرية الإلغاء شهرياً",
];

const partnerFeatures = [
  "إنتاج 2–3 فيديوهات إعلانية احترافية عالية التحويل شهرياً",
  "وكيل ذكاء اصطناعي متقدم مدرّب خصيصاً على كتالوج منتجاتك وسياساتك",
  "إغلاق وتثبيت المبيعات وتأكيد عناوين التوصيل تلقائياً على واتساب",
  "لوحة تحكم حية مخصصة للأرباح والتحويل ومصروف الإعلانات",
  "تواصل مباشر عبر مجموعة واتساب خاصة مع المؤسسين",
  "تحسين مستمر لصفحات الهبوط ونسب التحويل (CRO)",
  "التزام شراكة لـ ٣ أشهر قابل للتجديد مع مشاركة نجاح بنسبة",
];

interface PricingProps {
  onOpenDashboard?: () => void;
}

export default function Pricing({ onOpenDashboard }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly">("monthly");
  const [adBudget, setAdBudget] = useState(600);

  // Quick ROI Calculation
  const estimatedROAS = 3.8;
  const estimatedRevenue = Math.round(adBudget * estimatedROAS);
  const estimatedOrders = Math.round(estimatedRevenue / 35); // Avg order value $35

  const handleSelectPlan = (planName: string) => {
    if (onOpenDashboard) {
      onOpenDashboard();
      return;
    }
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      const planInput = document.querySelector(`input[value="${planName}"]`) as HTMLInputElement;
      if (planInput) {
        planInput.click();
      }
    }
  };

  return (
    <section id="pricing" className="py-20 md:py-28 bg-[#E6E9E0]">
      <div className="mx-auto max-w-wrap px-5 md:px-6">
        
        {/* Section Header & Toggle */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="eyebrow justify-center">باقات الاستثمار</div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-ink leading-tight">
            باقات واضحة بلا رسوم خفية
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted">
            اختر الباقة المناسبة لمرحلة مشروعك، وكبّر معنا كلما زادت مبيعاتك.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-white p-1.5 shadow-xs">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-ink text-onDark shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              دفع شهري (بدون التزام)
            </button>
            <button
              onClick={() => setBillingCycle("quarterly")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                billingCycle === "quarterly"
                  ? "bg-gold text-[#241A08] shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              <span>شراكة ربع سنوية</span>
              <span className="rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-bold text-teal">
                توفير 15%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-4xl mx-auto items-stretch">
          
          {/* Starter Plan */}
          <div className="rounded-2xl border border-line bg-white p-8 sm:p-10 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink">باقة الانطلاق</h3>
                  <p className="mt-1 text-sm text-muted">للمشاريع التي تبحث عن أول تجربة نمو حقيقية</p>
                </div>
                <span className="rounded-full bg-paper-alt px-3 py-1 font-mono text-xs font-semibold text-muted">
                  مرن
                </span>
              </div>

              <div className="mt-6 border-y border-line/60 py-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold text-ink">
                    {billingCycle === "monthly" ? "$220" : "$185"}
                  </span>
                  <span className="text-sm font-medium text-muted">/ شهرياً</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  ميزانية الإعلانات يحددها ويدفعها التاجر مباشرة للمنصة
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <span className="block font-mono text-xs font-bold text-ink">ما يشمله الاشتراك:</span>
                {starterFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink leading-relaxed">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal mt-0.5">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => handleSelectPlan("باقة الانطلاق")}
                className="w-full rounded-xl border-2 border-ink py-3.5 text-center text-sm font-bold text-ink transition-all hover:bg-ink hover:text-onDark active:scale-98"
              >
                اختر باقة الانطلاق
              </button>
            </div>
          </div>

          {/* Partner Plan (Highlighted) */}
          <div className="relative rounded-2xl border-2 border-gold bg-white p-8 sm:p-10 shadow-xl flex flex-col justify-between transition-all hover:shadow-2xl">
            <div className="absolute -top-3.5 right-8 rounded-full bg-gold px-4 py-1 text-xs font-bold text-[#241A08] shadow-md flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>الخيار الأكثر طلباً للشراكة</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink">باقة الشراكة والنمو</h3>
                  <p className="mt-1 text-sm text-muted">للمتاجر الجاهزة لمضاعفة مبيعاتها بأتمتة كاملة</p>
                </div>
              </div>

              <div className="mt-6 border-y border-gold/30 bg-gold/5 -mx-8 sm:-mx-10 px-8 sm:px-10 py-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold text-ink">
                    {billingCycle === "monthly" ? "$390" : "$330"}
                  </span>
                  <span className="text-sm font-semibold text-gold-DEFAULT">+ نسبة مبيعات</span>
                </div>
                <p className="mt-2 text-xs text-ink/80 font-medium">
                  اشتراك ثابت مخفض + عمولة بسيطة على المبيعات المحققة فعلياً
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <span className="block font-mono text-xs font-bold text-ink">كل ميزات الانطلاق بالإضافة إلى:</span>
                {partnerFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink leading-relaxed font-medium">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold/25 text-gold mt-0.5">
                      <Check className="h-3 w-3 text-[#AD7A2A]" />
                    </span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => handleSelectPlan("باقة الشراكة")}
                className="w-full rounded-xl bg-gold py-3.5 text-center text-sm font-bold text-[#241A08] shadow-md transition-all hover:bg-gold-soft hover:shadow-lg active:scale-98"
              >
                انضم لشراكة النمو الآن
              </button>
            </div>
          </div>

        </div>

        {/* Interactive Growth & ROI Estimator */}
        <div className="mt-16 rounded-2xl border border-line bg-white p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-ink">حاسبة العائد المتوقع التقديرية</h3>
              <p className="text-xs text-muted">حرّك الميزانية الإعلانية لتقدير مبيعاتك المتوقعة مع نظام Growlab</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-center">
            <div className="md:col-span-6 space-y-4">
              <div className="flex justify-between items-center font-mono">
                <label htmlFor="budget-slider" className="text-sm font-semibold text-ink">
                  ميزانية الإعلانات الشهرية:
                </label>
                <span className="rounded-lg bg-paper-alt px-3 py-1 text-base font-bold text-teal">
                  ${adBudget}
                </span>
              </div>
              <input
                id="budget-slider"
                type="range"
                min="200"
                max="3000"
                step="50"
                value={adBudget}
                onChange={(e) => setAdBudget(Number(e.target.value))}
                className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-gold"
              />
              <div className="flex justify-between font-mono text-[11px] text-muted">
                <span>200$ (تجربة مبدئية)</span>
                <span>1500$ (متوسط)</span>
                <span>3000$+ (توسع قوي)</span>
              </div>
            </div>

            <div className="md:col-span-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-paper p-4 text-center">
                <span className="block font-mono text-xs text-muted mb-1">المبيعات المتوقعة</span>
                <span className="font-mono text-2xl font-black text-ink">
                  ~${estimatedRevenue.toLocaleString()}
                </span>
                <span className="block text-[10px] text-teal font-medium mt-1">عائد {estimatedROAS}x ROAS</span>
              </div>

              <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
                <span className="block font-mono text-xs text-ink/80 mb-1">الطلبات المقدرة</span>
                <span className="font-mono text-2xl font-black text-gold">
                  ~{estimatedOrders} طلب
                </span>
                <span className="block text-[10px] text-ink font-medium mt-1">بمعدل إغلاق ذكي 24/7</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

