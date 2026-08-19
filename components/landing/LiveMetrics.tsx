"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { DollarSign, MessageSquare, TrendingUp, Store } from "lucide-react";

export default function LiveMetrics() {
  const { t } = useLanguage();

  const metricsData = [
    {
      icon: DollarSign,
      value: t.metrics.revenueGenerated,
      label: t.metrics.revenueLabel,
      color: "emerald",
      gradient: "from-emerald to-teal",
    },
    {
      icon: MessageSquare,
      value: t.metrics.messagesProcessed,
      label: t.metrics.messagesLabel,
      color: "cyan",
      gradient: "from-cyan to-blue-500",
    },
    {
      icon: TrendingUp,
      value: t.metrics.avgConversionLift,
      label: t.metrics.conversionLabel,
      color: "gold",
      gradient: "from-gold to-amber-500",
    },
    {
      icon: Store,
      value: t.metrics.activeStores,
      label: t.metrics.activeStoresLabel,
      color: "emerald",
      gradient: "from-emerald-soft to-teal",
    },
  ];

  return (
    <section className="relative py-12 border-y border-white/10 bg-dark-1/80 backdrop-blur-xl">
      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {metricsData.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center sm:items-start text-center sm:text-left rtl:sm:text-right group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white group-hover:border-emerald/40 transition-colors">
                    <Icon className="h-4 w-4 text-emerald" />
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight text-white group-hover:text-emerald transition-colors">
                    {item.value}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-onDarkSoft font-medium leading-snug">
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
