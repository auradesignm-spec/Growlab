"use client";

import { useLocale } from "next-intl";
import {
  FileSpreadsheet,
  Cpu,
  MessageSquareText,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
  BellRing,
  Award,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

export default function HowItWorks() {
  const locale = useLocale();
  const isAr = locale !== "en";

  const steps = [
    {
      n: "01",
      icon: Building2,
      titleAr: "أدخل بيانات سجلك ونشاطك",
      titleEn: "Enter CR & Sector Details",
      textAr: "في ٦٠ ثانية: حدد نوع نشاطك التجاري، إجمالي القوى العاملة، ومواعيد التراخيص الحالية.",
      textEn: "In 60 seconds: select your business sector, staff count, and current permit dates.",
    },
    {
      n: "02",
      icon: Cpu,
      titleAr: "يفحص الوكيل نسب التعمين والتراخيص",
      titleEn: "AI Audits Quotas & Permits",
      textAr: "يحلل الوكيل الذكي فوراً قرارات وزارة العمل، اشتراطات البلدية، والفوترة الضريبية.",
      textEn: "The AI agent instantly verifies Ministry of Labour quotas, municipal bylaws, and VAT requirements.",
    },
    {
      n: "03",
      icon: MessageSquareText,
      titleAr: "تتلقى تنبيهات وتوجيهات على واتساب",
      titleEn: "Receive WhatsApp Smart Alerts",
      textAr: "إشعارات استباقية قبل ٦٠ و ٣٠ و ٧ أيام من أي استحقاق لتجديد أو تعديل مع خطوات التنفيذ.",
      textEn: "Proactive reminders 60, 30, and 7 days ahead of deadlines with clear execution guidance.",
    },
    {
      n: "04",
      icon: ShieldCheck,
      titleAr: "تتجنب الغرامات وتضمن امتثال 100%",
      titleEn: "Zero Fines & 100% Compliance",
      textAr: "تحمي أرباح منشأتك من الغرامات التراكمية، تحافظ على سريان السجل، وتحصل على تقارير موثقة.",
      textEn: "Protect company cashflow from compounding penalties, keep CR active, and export verified reports.",
    },
  ];

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent("open-compliance-quiz"));
  };

  return (
    <section id="how" className="relative scroll-mt-16 py-section">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="gl-eyebrow text-emerald-700 font-semibold">
              {isAr ? "طريقة العمل في ٤ خطوات بسيطة" : "How It Works in 4 Steps"}
            </p>
            <h2 className="gl-heading text-display-lg font-bold text-slate-900">
              {isAr ? "كيف يحميك مساعد ريادة من الغرامات؟" : "How Riyada Assistant Protects Your Business"}
            </h2>
            <p className="gl-lede text-slate-600 text-sm sm:text-base">
              {isAr
                ? "بدون إجراءات معقدة — نظام ذكي يعمل 24/7 لمراقبة اللوائح والتراخيص وتنبيهك فوراً عبر واتساب."
                : "Zero complex setup — an automated system that monitors Oman regulations 24/7 and alerts you on WhatsApp."}
            </p>
          </div>
        </Reveal>

        <StageGlow className="mt-8 sm:mt-12" tone="cyan" place="center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.n} delay={idx * 60}>
                  <div className="relative flex h-full flex-col justify-between p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-400 hover:shadow-md transition-all shadow-sm group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-mono text-2xl font-bold text-slate-300 group-hover:text-emerald-500 transition-colors">
                          {step.n}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {isAr ? step.titleAr : step.titleEn}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {isAr ? step.textAr : step.textEn}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <span>{isAr ? "ميزة مؤتمتة" : "Automated Feature"}</span>
                      {isAr ? <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </StageGlow>

        {/* Action Button */}
        <Reveal delay={180}>
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={openQuiz}
              className="gl-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/15"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isAr ? "ابدأ الفحص الفوري لمؤسستك مجاناً" : "Start Free Audit for Your Entity"}</span>
              {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
