"use client";

import { useLocale } from "next-intl";
import { Check, X, ShieldCheck, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

export default function Compare() {
  const locale = useLocale();
  const isAr = locale !== "en";

  const rows = [
    {
      titleAr: "رصد نسب التعمين وقرارات وزارة العمل",
      titleEn: "Omanisation Tracking & Labor Laws",
      riyadaAr: "حساب فوري مستمر لنسبتك مقابل المستهدف لنشاطك، وتنبيه فوري عند أي نقص لتفادي حظر المأذونيات.",
      riyadaEn: "Continuous real-time calculation vs sector target with instant hiring alerts.",
      traditionalAr: "حسابات يدوية متباعدة وغالباً ما يكتشف النقص بعد صدور المخالفة أو رفض المعاملة في الوزارة.",
      traditionalEn: "Manual sporadic checks; often discovered only when transactions get blocked.",
    },
    {
      titleAr: "تنبيهات التراخيص والسجل التجاري",
      titleEn: "Permit & CR Expiry Alerts",
      riyadaAr: "تنبيهات تلقائية عبر واتساب قبل 60 و 30 و 7 أيام مع روابط تجديد سريعة.",
      riyadaEn: "Automated WhatsApp notifications 60, 30, and 7 days prior to expiry.",
      traditionalAr: "الاعتماد على الذاكرة أو أوراق مكتب سند، مما يسبب غرامات تأخير تراكمية.",
      traditionalEn: "Relying on memory or paper binders, leading to compounding late fines.",
    },
    {
      titleAr: "استشارات الأنظمة واللوائح 24/7",
      titleEn: "24/7 Regulatory Advisory",
      riyadaAr: "وكيل ذكاء اصطناعي متخصص في اللوائح العمانية يجيب فوراً على أي استفسار على واتساب.",
      riyadaEn: "AI agent trained on Omani regulations answering inquiries 24/7 on WhatsApp.",
      traditionalAr: "الانتظار في الطوابير أو البحث الطويل غير الموثوق في صفحات الإنترنت وقنوات التواصل.",
      traditionalEn: "Waiting in queues or searching unverified forum threads.",
    },
    {
      titleAr: "الفوترة الإلكترونية وضريبة القيمة المضافة",
      titleEn: "E-Invoicing & VAT Compliance",
      riyadaAr: "تدقيق متطلبات الفوترة والإقرارات لضمان مطابقة معايير جهاز الضرائب وتفادي غرامات الفحص.",
      riyadaEn: "Built-in checks for Tax Authority compliance preventing audit penalties.",
      traditionalAr: "إصدار فواتير عادية دون مطابقة البنود الإلزامية والتعرض لغرامات تصل لـ 5,000 ر.ع.",
      traditionalEn: "Non-standard invoices risking penalties up to 5,000 OMR.",
    },
    {
      titleAr: "لوحة تحكم وتقارير شهرية موحدة",
      titleEn: "Central Dashboard & Monthly Reports",
      riyadaAr: "شاشة واحدة تتابع كل الفروع والأنشطة مع إمكانية تصدير تقارير رسمية بضغطة زر.",
      riyadaEn: "One unified screen tracking all branches with 1-click PDF export.",
      traditionalAr: "ملفات إكسل متفرقة وفقدان الرؤية الشاملة لامتثال المؤسسة.",
      traditionalEn: "Scattered spreadsheets and zero visibility on compliance health.",
    },
  ];

  return (
    <section id="compare" className="relative scroll-mt-16 py-section">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="gl-eyebrow text-emerald-700 font-semibold">
              {isAr ? "المقارنة والتفوق" : "Why Choose Riyada Assistant"}
            </p>
            <h2 className="gl-heading text-display-lg font-bold text-slate-900">
              {isAr ? "مساعد ريادة مقابل الطرق التقليدية والتخمين" : "Riyada Assistant vs Traditional Guesswork"}
            </h2>
            <p className="gl-lede text-slate-600 text-sm sm:text-base">
              {isAr
                ? "شاهد كيف يحول الذكاء الاصطناعي متابعة الامتثال من عبء إداري مستمر إلى حماية مؤتمتة بنسبة 100%."
                : "See how automated AI tracking replaces tedious paperwork with reliable 100% protection."}
            </p>
          </div>
        </Reveal>

        <StageGlow className="mt-8 sm:mt-12" tone="cyan" place="center">
          <div className="overflow-x-auto">
              <div className="min-w-[560px] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 p-3 sm:p-4 text-xs sm:text-sm font-bold text-slate-900">
                <div className="col-span-4">{isAr ? "المعيار والخدمة" : "Feature / Standard"}</div>
                <div className="col-span-4 text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>{isAr ? "مع منصة مساعد ريادة" : "With Riyada Assistant"}</span>
                </div>
                <div className="col-span-4 text-rose-700">{isAr ? "المتابعة اليدوية التقليدية" : "Traditional Manual Way"}</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <div key={row.titleAr} className="grid grid-cols-12 p-2.5 sm:p-4 text-xs items-start gap-2 sm:gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-4 font-bold text-slate-900 pt-2">
                      {isAr ? row.titleAr : row.titleEn}
                    </div>

                    <div className="col-span-4 space-y-1.5 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{isAr ? "مؤتمت ودقيق" : "Automated & Precise"}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {isAr ? row.riyadaAr : row.riyadaEn}
                      </p>
                    </div>

                    <div className="col-span-4 space-y-1.5 bg-rose-50/60 p-3 rounded-xl border border-rose-200/80">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800 text-xs">
                        <X className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                        <span>{isAr ? "معرض للمخاطر" : "High Risk"}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {isAr ? row.traditionalAr : row.traditionalEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StageGlow>
      </div>
    </section>
  );
}
