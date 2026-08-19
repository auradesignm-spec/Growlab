"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PackagePlus,
  Smartphone,
  ShoppingBag,
  BadgePercent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: "step-1",
      number: "01",
      role: "التاجر والمورد 🏢",
      title: "إدراج المنتجات الأصلية بدون تكلفة",
      description:
        "يرفع التاجر منتجاته في الكتالوج الموحد ويحدد نسبة العمولة المقترحة لصناع المحتوى (مثلاً 18%). لا توجد أي رسوم اشتراك شهرية ولا دفع مسبق للإعلانات.",
      icon: PackagePlus,
      color: "from-amber-500 to-amber-300",
      badge: "0 رسوم مسبقة",
      details: ["مخزون محمي", "إسناد آلي", "دفع بعد اكتمال البيع"],
    },
    {
      id: "step-2",
      number: "02",
      role: "صانع المحتوى 📱",
      title: "اختيار المنتجات والتصوير بالهاتف",
      description:
        "يختار الصانع المنتجات المناسبة لجمهوره بضغطة زر واحدة لتظهر في متجره المصغر الخاص. يقوم بتصوير مراجعة صادقة ونشر الرابط في البايو.",
      icon: Smartphone,
      color: "from-growlab-emerald to-teal-300",
      badge: "متجر فوري برابطك",
      details: ["بدون شراء منتجات", "بدون شحن وتخزين", "سكريبتات ذكاء اصطناعي"],
    },
    {
      id: "step-3",
      number: "03",
      role: "العميل والمشتري 🛍️",
      title: "تجربة شراء سريعة وموثوقة",
      description:
        "يدخل المتابعون متجر الصانع ويشترون المنتج الأصلي بثقة مع خيارات الدفع عند الاستلام أو البطاقات البنكية، ويصلهم الطلب لباب البيت خلال 24-48 ساعة.",
      icon: ShoppingBag,
      color: "from-cyan-400 to-blue-400",
      badge: "توصيل سريع وضمان ذهبي",
      details: ["100% أصلي", "توصيل لكافة دول الخليج", "دفع آمن"],
    },
    {
      id: "step-4",
      number: "04",
      role: "المنظومة المالية ⚡",
      title: "توزيع الأرباح والعمولات لحظياً (Escrow Split)",
      description:
        "بمجرد تأكيد الطلب، يوزع النظام المالي الأرباح آلياً: 80% للتاجر، 20% للصانع فوراً في محفظته دون أي تأخير أو تلاعب.",
      icon: BadgePercent,
      color: "from-growlab-gold to-amber-300",
      badge: "توزيع فوري بالهللة",
      details: ["محفظة آمنة", "سجل عمليات لحظي", "حماية حقوق الجميع"],
    },
  ];

  return (
    <section id="how-it-works" className="relative space-y-8 my-12" dir="rtl">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-growlab-emerald/15 text-growlab-emerald border border-growlab-emerald/30 text-xs font-bold shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>آلية عمل المنظومة • How It Works</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight">
          كيف تعمل تجارة صناع المحتوى في{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-growlab-gold via-amber-300 to-growlab-emerald">
            4 خطوات بسيطة؟
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-onDarkSoft leading-relaxed max-w-xl mx-auto">
          معادلة ربحية متكاملة تربط المورد بالصانع والمشتري بدون مخاطرة وبشفافية تقنية كاملة.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = activeStep === idx;

          return (
            <motion.div
              key={step.id}
              onClick={() => setActiveStep(idx)}
              whileHover={{ y: -4 }}
              className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer ${
                isSelected
                  ? "bg-growlab-bgCard border-2 border-growlab-gold shadow-glow-gold/10 shadow-xl"
                  : "bg-growlab-bgCard/70 border border-growlab-border hover:border-growlab-border/90"
              }`}
            >
              <div className="space-y-4">
                {/* Step number and badge */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-white/30">
                    {step.number}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-growlab-bgDark border border-growlab-border text-growlab-gold">
                    {step.badge}
                  </span>
                </div>

                {/* Icon and role */}
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-growlab-bgDark border border-growlab-border flex items-center justify-center">
                    <Icon className="h-6 w-6 text-growlab-gold" />
                  </div>
                  <div className="text-[11px] font-bold text-growlab-emerald">
                    {step.role}
                  </div>
                  <h3 className="text-base font-bold font-display text-white leading-snug">
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="pt-3 border-t border-growlab-border/70 space-y-1.5">
                {step.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-1.5 text-[11px] text-onDarkSoft">
                    <CheckCircle2 className="h-3 w-3 text-growlab-emerald shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
