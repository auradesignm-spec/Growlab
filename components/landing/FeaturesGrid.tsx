"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import TiltCard3D from "@/components/motion/TiltCard3D";
import {
  Bot,
  ShieldCheck,
  Zap,
  Brain,
  Mic,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

interface FeaturesGridProps {
  onSelectFeature?: (id: string) => void;
}

export default function FeaturesGrid({ onSelectFeature }: FeaturesGridProps) {
  const { t, isRtl } = useLanguage();

  const iconMap: Record<string, any> = {
    "sales-closer": Bot,
    negotiation: ShieldCheck,
    "meta-scaling": Zap,
    "high-thinking": Brain,
    "voice-audio": Mic,
    "creative-studio": Sparkles,
  };

  const glowColorMap: Record<string, "emerald" | "cyan" | "gold" | "purple"> = {
    "sales-closer": "emerald",
    negotiation: "gold",
    "meta-scaling": "cyan",
    "high-thinking": "purple",
    "voice-audio": "cyan",
    "creative-studio": "emerald",
  };

  return (
    <section id="features" className="relative py-24 bg-dark overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald/5 rounded-full blur-[140px]" />

      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-3.5 py-1.5 border border-emerald/30 mb-4"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald" />
            <span className="text-xs font-mono font-bold text-emerald">
              {t.features.badge}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display mb-4"
          >
            {t.features.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-onDarkSoft leading-relaxed font-body"
          >
            {t.features.subtitle}
          </motion.p>
        </div>

        {/* 6 Features 3D Tilt Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map((feature, index) => {
            const Icon = iconMap[feature.id] || Bot;
            const glow = glowColorMap[feature.id] || "emerald";

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <TiltCard3D
                  glowColor={glow}
                  className="flex flex-col justify-between p-7 group cursor-pointer"
                  onClick={() => onSelectFeature && onSelectFeature(feature.id)}
                >
                  <div>
                    {/* Top Row: Icon & Tag */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white group-hover:border-emerald/40 group-hover:bg-emerald/10 group-hover:text-emerald transition-all duration-300 shadow-inner">
                        <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-mono font-semibold text-onDarkSoft border border-white/10 group-hover:border-emerald/30 group-hover:text-emerald transition-colors">
                        {feature.tag}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-emerald-soft transition-colors font-display">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-onDarkSoft leading-relaxed font-body">
                      {feature.description}
                    </p>
                  </div>

                  {/* Bottom Metric Bar */}
                  <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold font-mono text-white group-hover:text-emerald transition-colors">
                        {feature.metric}
                      </span>
                      <span className="block text-[11px] text-muted font-medium">
                        {feature.metricLabel}
                      </span>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted group-hover:bg-emerald group-hover:text-dark transition-all duration-200">
                      <ArrowUpRight className={`h-4 w-4 ${isRtl ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </TiltCard3D>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
