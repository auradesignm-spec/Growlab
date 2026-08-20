"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { 
  MessageSquare, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Target 
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "sales-closer": <MessageSquare className="w-6 h-6" />,
  "negotiation": <Zap className="w-6 h-6" />,
  "meta-scaling": <TrendingUp className="w-6 h-6" />,
  "high-thinking": <Target className="w-6 h-6" />,
  "voice-audio": <BarChart3 className="w-6 h-6" />,
  "creative-studio": <ShieldCheck className="w-6 h-6" />,
};

export function Features() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4"
          >
            {t.features.badge}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            {t.features.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            {t.features.subtitle}
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {t.features.items.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="group p-8 rounded-[32px] bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                {ICON_MAP[feature.id] || <Zap className="w-6 h-6" />}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {feature.description}
              </p>
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-white">
                    {feature.metric}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {feature.metricLabel}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
