"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import MagneticButton from "@/components/motion/MagneticButton";
import { Bot, Zap, ArrowLeft, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface CtaSectionProps {
  onOpenDashboard?: () => void;
}

export default function CtaSection({ onOpenDashboard }: CtaSectionProps) {
  const { t, isRtl } = useLanguage();

  return (
    <section className="relative py-24 bg-dark overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl border border-emerald/30 bg-gradient-to-b from-dark-card to-dark-2 p-8 sm:p-12 lg:p-16 text-center overflow-hidden shadow-2xl">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald/25 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-cyan/20 rounded-full blur-3xl" />

          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald/15 px-4 py-1.5 border border-emerald/40 mb-6 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-emerald" />
            <span className="text-xs font-mono font-bold text-emerald">
              {t.cta.badge}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display mb-4 max-w-2xl mx-auto leading-tight"
          >
            {t.cta.title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-onDarkSoft max-w-xl mx-auto leading-relaxed mb-8 font-body"
          >
            {t.cta.subtitle}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton
              variant="primary"
              size="lg"
              onClick={onOpenDashboard}
              className="gap-2 font-extrabold"
            >
              <Zap className="h-5 w-5" />
              <span>{t.cta.primaryBtn}</span>
              {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </MagneticButton>
          </motion.div>

          {/* Guarantee Note */}
          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-muted font-mono">
            {t.cta.guarantee}
          </div>
        </div>
      </div>
    </section>
  );
}
