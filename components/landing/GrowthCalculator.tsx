"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import MagneticButton from "@/components/motion/MagneticButton";
import {
  TrendingUp,
  DollarSign,
  Zap,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface GrowthCalculatorProps {
  onOpenDashboard?: () => void;
}

export default function GrowthCalculator({ onOpenDashboard }: GrowthCalculatorProps) {
  const { t, isRtl, lang } = useLanguage();

  const [monthlySpend, setMonthlySpend] = useState<number>(3000);
  const [aov, setAov] = useState<number>(65);
  const [currentCr, setCurrentCr] = useState<number>(2.5);

  // Calculations
  // Instant response + negotiation lifts conversion rate by ~1.8x
  const currentMonthlyOrders = Math.round((monthlySpend / 15) * (currentCr / 100) * 10);
  const newCr = currentCr * 1.85;
  const newMonthlyOrders = Math.round(currentMonthlyOrders * 1.85);
  const additionalOrders = newMonthlyOrders - currentMonthlyOrders;
  const projectedRevenueLift = Math.round(additionalOrders * aov);
  const estimatedNetProfit = Math.round(projectedRevenueLift * 0.42);
  const hoursSaved = Math.min(120, Math.round(newMonthlyOrders * 0.35));
  const estimatedRoi = ((projectedRevenueLift / (monthlySpend * 0.3 + 200)) * 1.5).toFixed(1);

  const triggerConfetti = () => {
    import("canvas-confetti").then((confetti) => {
      confetti.default({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#10B981", "#06B6D4", "#F59E0B"],
      });
    });
  };

  return (
    <section id="calculator" className="relative py-24 bg-dark overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-emerald/10 rounded-full blur-[140px]" />

      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3.5 py-1.5 border border-gold/30 mb-4"
          >
            <TrendingUp className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-mono font-bold text-gold">
              {t.calculator.badge}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display mb-4"
          >
            {t.calculator.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-onDarkSoft leading-relaxed font-body"
          >
            {t.calculator.subtitle}
          </motion.p>
        </div>

        {/* Main Calculator Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl border border-white/10 bg-dark-card/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
          {/* Left Column: Sliders */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Slider 1: Monthly Ad Spend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-white font-body">
                    {t.calculator.monthlySpendLabel}
                  </label>
                  <span className="font-mono text-base font-extrabold text-emerald bg-emerald/10 px-3 py-1 rounded-xl border border-emerald/30">
                    ${monthlySpend.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="250"
                  value={monthlySpend}
                  onChange={(e) => {
                    setMonthlySpend(Number(e.target.value));
                    if (Number(e.target.value) % 5000 === 0) triggerConfetti();
                  }}
                  className="w-full h-2 rounded-lg bg-dark-3 accent-emerald cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted">
                  <span>$500</span>
                  <span>$10,000</span>
                  <span>$25,000+</span>
                </div>
              </div>

              {/* Slider 2: Average Order Value */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-white font-body">
                    {t.calculator.aovLabel}
                  </label>
                  <span className="font-mono text-base font-extrabold text-cyan bg-cyan/10 px-3 py-1 rounded-xl border border-cyan/30">
                    ${aov}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="250"
                  step="5"
                  value={aov}
                  onChange={(e) => setAov(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-dark-3 accent-cyan cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted">
                  <span>$15</span>
                  <span>$100</span>
                  <span>$250+</span>
                </div>
              </div>

              {/* Slider 3: Current Conversion Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-white font-body">
                    {t.calculator.crLabel}
                  </label>
                  <span className="font-mono text-base font-extrabold text-gold bg-gold/10 px-3 py-1 rounded-xl border border-gold/30">
                    {currentCr}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.1"
                  value={currentCr}
                  onChange={(e) => setCurrentCr(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-dark-3 accent-gold cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted">
                  <span>0.5%</span>
                  <span>4.0%</span>
                  <span>8.0%</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-dark-2 p-4 border border-white/10 text-xs text-onDarkSoft leading-relaxed font-body">
              💡 {lang === "ar"
                ? "تعتمد الحسابات على تحسين سرعة الرد اللحظي على الواتساب (تحت ثانية واحدة)، ومضاعفة استجابة العميل بنسبة +85% عبر التفاوض الذكي على السلة."
                : "Calculations reflect instant sub-second response times and an average +85% conversion lift from autonomous margin-safe deal closing."}
            </div>
          </div>

          {/* Right Column: Projected Real-time Results Card */}
          <div className="lg:col-span-6 rounded-2xl bg-gradient-to-br from-dark-2 to-dark-3 p-6 sm:p-8 border border-white/15 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Ambient Corner Flare */}
            <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-emerald/20 rounded-full blur-2xl" />

            <div className="space-y-6 relative z-10">
              <span className="text-xs font-mono font-bold text-emerald uppercase tracking-wider block">
                {t.calculator.resultsTitle}
              </span>

              {/* Huge Projected Revenue Lift */}
              <div>
                <span className="text-xs text-onDarkSoft block font-body mb-1">
                  {t.calculator.projectedRevenue}
                </span>
                <motion.div
                  key={projectedRevenueLift}
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-white tracking-tight"
                >
                  +${projectedRevenueLift.toLocaleString()}
                  <span className="text-xs font-mono text-emerald font-semibold ms-2">/ month</span>
                </motion.div>
              </div>

              {/* 3 Metric Mini Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="rounded-xl bg-dark p-3.5 border border-white/10">
                  <span className="text-[11px] text-muted font-body block mb-1">
                    {t.calculator.additionalProfit}
                  </span>
                  <span className="text-lg font-bold font-mono text-emerald">
                    +${estimatedNetProfit.toLocaleString()}
                  </span>
                </div>

                <div className="rounded-xl bg-dark p-3.5 border border-white/10">
                  <span className="text-[11px] text-muted font-body block mb-1">
                    {t.calculator.roiEstimate}
                  </span>
                  <span className="text-lg font-bold font-mono text-cyan">
                    {estimatedRoi}x ROI
                  </span>
                </div>

                <div className="rounded-xl bg-dark p-3.5 border border-white/10">
                  <span className="text-[11px] text-muted font-body block mb-1">
                    {t.calculator.hoursSaved}
                  </span>
                  <span className="text-lg font-bold font-mono text-gold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{hoursSaved} hrs</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6 relative z-10">
              <MagneticButton
                variant="primary"
                size="lg"
                onClick={onOpenDashboard}
                className="w-full justify-center text-sm font-extrabold"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t.calculator.ctaButton}</span>
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
