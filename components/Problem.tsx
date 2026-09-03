"use client";

import { useLocale } from "next-intl";
import {
  AlertOctagon,
  ShieldCheck,
  TrendingDown,
  Building,
  Receipt,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

export default function Problem() {
  const locale = useLocale();
  const isAr = locale !== "en";

  const problems = [
    {
      num: "01",
      titleAr: "غرامات تدني نسب التعمين وحظر المأذونيات",
      titleEn: "Omanisation Quota Fines & Blockages",
      descAr: "تغيّر النسب أو نقص موظف عُماني واحد قد يوقف استخراج تصاريح العمل للوافدين ويكلفك غرامات شهرية متراكمة تصل لآلاف الريالات.",
      descEn: "Falling short on Omani staff quotas triggers freeze on work permits and heavy recurring fines.",
    },
    {
      num: "02",
      titleAr: "انتهاء السجل التجاري ورخص البلدية بصمت",
      titleEn: "Silently Expired CR & Municipal Permits",
      descAr: "نسيان مواعيد تجديد السجل أو رخصة البلدية يسبب غرامات تأخير تراكمية وتجميد الحسابات البنكية للمؤسسة.",
      descEn: "Forgotten renewal dates lead to compounding late fees and bank account restrictions.",
    },
    {
      num: "03",
      titleAr: "غرامات الفوترة الإلكترونية وضريبة القيمة المضافة",
      titleEn: "E-Invoicing & VAT Penalties",
      descAr: "عدم إصدار فواتير ضريبية نظامية متوافقة مع متطلبات جهاز الضرائب يعرّض المنشأة لغرامات تدقيق تبدأ من 500 إلى 5,000 ر.ع.",
      descEn: "Non-compliant tax invoicing can trigger steep tax audit penalties.",
    },
    {
      num: "04",
      titleAr: "تشتت المتابعة بين الجهات ومكاتب سند",
      titleEn: "Fragmented Tracking Across Authorities",
      descAr: "صعوبة متابعة كل منصة (استثمر بسهولة، توطين، بلديتي، الحماية الاجتماعية) في وقت واحد والاعتماد على التذكير اليدوي.",
      descEn: "Constantly juggling between portals (Invest Easy, Tawteen, Baladiyati, Social Protection).",
    },
  ];

  return (
    <section id="problem" className="relative scroll-mt-16 py-section border-y border-slate-200/80 bg-slate-50/50">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="gl-eyebrow text-rose-600 font-semibold">
              {isAr ? "المشكلة الحقيقية التي تواجه رواد الأعمال" : "The Real Regulatory Pain in Oman"}
            </p>
            <h2 className="gl-heading text-display-lg font-bold text-slate-900">
              {isAr ? "لماذا تخسر المؤسسات الصغيرة آلاف الريالات في الغرامات؟" : "Why Omani SMEs Lose Thousands in Preventable Fines"}
            </h2>
            <p className="gl-lede text-slate-600 text-sm sm:text-base">
              {isAr
                ? "أكثر من ٧٠٪ من الغرامات التنظيمية في سلطنة عُمان تحدث بسبب تأخر بسيط في التجديد أو عدم معرفة التحديثات الدورية لنسب التعمين."
                : "Over 70% of SME fines happen simply due to missed deadlines or outdated Omanisation quota calculations."}
            </p>
          </div>
        </Reveal>

        <StageGlow className="mt-8 sm:mt-12" tone="sun" place="center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {problems.map((prob, idx) => (
              <Reveal key={prob.num} delay={idx * 60}>
                <div className="relative p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-rose-300 hover:shadow-md transition-all space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                      <AlertOctagon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-sm font-bold text-rose-500/80">{prob.num}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {isAr ? prob.titleAr : prob.titleEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isAr ? prob.descAr : prob.descEn}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </StageGlow>

        {/* The Solution Banner */}
        <Reveal delay={160}>
          <div className="mt-8 sm:mt-10 p-4 sm:p-6 md:p-8 rounded-2xl border border-emerald-700/40 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 shadow-xl text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-2.5 text-start">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isAr ? "الحل مع مساعد ريادة" : "The Solution with Riyada Assistant"}</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  {isAr
                    ? "وكيل ذكي يراقب، يحسب، وينبهك قبل كل استحقاق على واتساب"
                    : "An AI agent that monitors, calculates, and alerts you on WhatsApp"}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
                  {isAr
                    ? "وفر وقتك وركز على تنمية مبيعاتك، ودع الوكيل الذكي يتولى حراسة امتثالك التنظيمي بنسبة 100%."
                    : "Save time and focus on your core business while your AI compliance guard prevents 100% of penalties."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-compliance-quiz"))}
                className="gl-btn-primary px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shrink-0 whitespace-nowrap shadow-lg shadow-emerald-500/30"
              >
                <Sparkles className="h-4 w-4 inline me-1.5" />
                <span>{isAr ? "افحص مؤسستك الآن" : "Check Your Entity"}</span>
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
