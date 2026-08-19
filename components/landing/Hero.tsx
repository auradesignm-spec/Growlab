"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import MagneticButton from "@/components/motion/MagneticButton";
import TextReveal from "@/components/motion/TextReveal";
import TiltCard3D from "@/components/motion/TiltCard3D";
import {
  Sparkles,
  Bot,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Clock,
  Play,
} from "lucide-react";

interface HeroProps {
  onOpenDashboard?: () => void;
  onScrollToShowcase?: () => void;
  onScrollToCalculator?: () => void;
}

export default function Hero({
  onOpenDashboard,
  onScrollToShowcase,
  onScrollToCalculator,
}: HeroProps) {
  const { t, isRtl, lang } = useLanguage();

  return (
    <section className="relative min-h-[92vh] pt-32 pb-20 overflow-hidden flex flex-col justify-center bg-grid-pattern">
      {/* Parallax Background Glowing Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-radial-gradient opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[400px] h-[400px] bg-radial-cyan opacity-40 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute bottom-10 -left-32 w-[350px] h-[350px] bg-emerald/10 rounded-full blur-3xl" />

      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left rtl:text-right">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-3.5 py-1.5 border border-emerald/30 mb-6 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald">
                {t.hero.badgeHighlight}
              </span>
              <span className="text-muted text-xs">•</span>
              <span className="text-xs font-semibold text-onDarkSoft">
                {t.hero.badge}
              </span>
            </motion.div>

            {/* Headline with Text Reveal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-[1.18] tracking-tight font-display mb-6">
              <span className="block">{t.hero.titleLine1}</span>
              <span className="block mt-1">
                {t.hero.titleLine2}{" "}
                <span className="text-gradient-emerald font-black">
                  {t.hero.titleHighlight}
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-onDarkSoft max-w-2xl leading-relaxed mb-8 font-body"
            >
              {t.hero.subtitle}
            </motion.p>

            {/* Dual CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
            >
              <MagneticButton
                variant="primary"
                size="lg"
                onClick={onOpenDashboard}
                className="w-full sm:w-auto"
              >
                <Zap className="h-5 w-5" />
                <span>{t.hero.primaryCta}</span>
                {isRtl ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </MagneticButton>

              <MagneticButton
                variant="secondary"
                size="lg"
                onClick={onScrollToCalculator}
                className="w-full sm:w-auto"
              >
                <TrendingUp className="h-5 w-5 text-emerald" />
                <span>{t.hero.secondaryCta}</span>
              </MagneticButton>
            </motion.div>

            {/* Live Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 w-full max-w-xl"
            >
              <div>
                <div className="text-lg sm:text-2xl font-extrabold font-mono text-emerald flex items-center gap-1">
                  <span>{t.hero.liveStats.uptime}</span>
                </div>
                <div className="text-[11px] sm:text-xs text-onDarkSoft font-medium">
                  {t.hero.liveStats.uptimeLabel}
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-2xl font-extrabold font-mono text-cyan flex items-center gap-1">
                  <span>{t.hero.liveStats.avgRoas}</span>
                </div>
                <div className="text-[11px] sm:text-xs text-onDarkSoft font-medium">
                  {t.hero.liveStats.avgRoasLabel}
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-2xl font-extrabold font-mono text-gold flex items-center gap-1">
                  <span>{t.hero.liveStats.responseSpeed}</span>
                </div>
                <div className="text-[11px] sm:text-xs text-onDarkSoft font-medium">
                  {t.hero.liveStats.responseSpeedLabel}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive 3D Mockup & Floating Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient Behind Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald/20 to-cyan/20 rounded-3xl blur-2xl -z-10" />

            {/* Main 3D Tilt Card Mockup */}
            <TiltCard3D glowColor="emerald" className="w-full max-w-lg shadow-2xl">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-teal shadow-xs">
                    <Bot className="h-5 w-5 text-dark" />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald border-2 border-dark" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{lang === "ar" ? "سالم — وكيل المبيعات الذكي" : "Salem — AI Closer"}</span>
                      <span className="rounded bg-emerald/20 px-1 py-0.2 text-[9px] font-mono text-emerald font-bold">
                        AUTONOMOUS
                      </span>
                    </div>
                    <span className="text-[11px] text-muted font-mono">
                      WhatsApp Business API • Active
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald bg-emerald/10 px-2 py-0.5 rounded-full border border-emerald/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-ping" />
                  <span>24/7 LIVE</span>
                </span>
              </div>

              {/* Chat Simulation Body */}
              <div className="py-4 space-y-3 font-body">
                {/* Incoming Buyer message */}
                <div className="flex flex-col items-start max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-sm bg-dark-3/90 border border-white/10 px-3.5 py-2.5 text-xs text-onDark leading-relaxed">
                    {lang === "ar"
                      ? "هلا أخوي، شفت الإعلان.. الساعة الفاخرة عليها خصم لو أخذت 2؟ وتوصلون للغبرة؟"
                      : "Hey! Saw your ad. Is there any discount if I get 2 watches? Do you ship to Muscat?"}
                  </div>
                  <span className="text-[10px] text-muted mt-1 px-1 font-mono">10:42 PM</span>
                </div>

                {/* AI Instant Reply with Dialect & Margin-Protected Negotiation */}
                <div className="flex flex-col items-end max-w-[90%] ms-auto">
                  <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald/20 to-teal/20 border border-emerald/40 px-3.5 py-2.5 text-xs text-white leading-relaxed shadow-xs">
                    {lang === "ar"
                      ? "يا هلا وغلا فيك! 🌟 أكيد يوصلك لباب بيتك مجاناً. وعشانك حاب حبتين، بنعطيك عرض خاص: السعر الأصلي 50 ر.ع ونخليهم لك بـ 42 ر.ع فقط مع ضمان سنة كاملة. تحب نسجل الطلب الحين؟"
                      : "Welcome! 🌟 Absolutely, express delivery to your door is free. Since you want 2 pieces, I can offer an exclusive bundle: from $120 down to $98 total with a 1-year warranty. Shall I confirm your order?"}
                  </div>
                  <span className="text-[10px] text-emerald mt-1 px-1 font-mono flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>AI response • 0.8s</span>
                  </span>
                </div>

                {/* Structured JSON Order Detected Pill */}
                <div className="rounded-xl bg-emerald/10 border border-emerald/30 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald/20 flex items-center justify-center text-emerald">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {lang === "ar" ? "تم قفل الصفقة وتثبيت الطلب" : "Deal Closed Automatically"}
                      </div>
                      <div className="text-[10px] text-onDarkSoft font-mono">
                        {lang === "ar" ? "طلب #GL-8492 • الإجمالي 42 ر.ع" : "Order #GL-8492 • Total $98.00"}
                      </div>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald text-dark px-2 py-1 text-[10px] font-extrabold font-mono">
                    CONFIRMED
                  </span>
                </div>
              </div>

              {/* Card Footer Ticker */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-muted font-mono">
                <span className="flex items-center gap-1 text-onDarkSoft">
                  <Clock className="h-3.5 w-3.5 text-emerald" />
                  <span>{lang === "ar" ? "توفير 4.5 ساعة يومياً" : "4.5 hrs saved today"}</span>
                </span>
                <span className="text-emerald font-bold">ROAS 4.8x</span>
              </div>
            </TiltCard3D>

            {/* Top-Right Floating Badge */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -top-6 -right-4 sm:-right-8 rounded-2xl bg-dark-2/95 border border-cyan/40 p-3 shadow-glow-cyan backdrop-blur-xl hidden sm:flex items-center gap-3 animate-float"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/20 text-cyan">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {t.hero.floatingCard2.title}
                </div>
                <div className="text-[10px] text-cyan font-mono">
                  {t.hero.floatingCard2.desc}
                </div>
              </div>
            </motion.div>

            {/* Bottom-Left Floating Badge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="absolute -bottom-6 -left-4 sm:-left-8 rounded-2xl bg-dark-2/95 border border-gold/40 p-3 shadow-glow-gold backdrop-blur-xl hidden sm:flex items-center gap-3 animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/20 text-gold">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {t.hero.floatingCard1.title}
                </div>
                <div className="text-[10px] text-gold font-mono">
                  {t.hero.floatingCard1.desc}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
