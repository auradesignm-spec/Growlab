"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Check, X, Sparkles, Bot, Building2, Users } from "lucide-react";

export default function ComparisonTable() {
  const { t } = useLanguage();

  return (
    <section id="comparison" className="relative py-24 bg-dark-1/90 border-t border-white/10 overflow-hidden">
      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-cyan/10 px-3.5 py-1.5 border border-cyan/30 mb-4"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan" />
            <span className="text-xs font-mono font-bold text-cyan">
              {t.comparison.badge}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display mb-4"
          >
            {t.comparison.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-onDarkSoft leading-relaxed font-body"
          >
            {t.comparison.subtitle}
          </motion.p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-dark-card shadow-2xl backdrop-blur-2xl">
          <table className="w-full text-left rtl:text-right border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 bg-dark-2/90">
                <th className="p-5 text-xs sm:text-sm font-bold text-onDarkSoft font-display w-1/4">
                  {t.comparison.headers.feature}
                </th>
                <th className="p-5 text-xs sm:text-sm font-extrabold text-emerald font-display w-1/3 bg-emerald/10 border-x border-emerald/30">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-emerald" />
                    <span>{t.comparison.headers.senthora}</span>
                  </div>
                </th>
                <th className="p-5 text-xs sm:text-sm font-bold text-onDarkSoft font-display w-1/4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted" />
                    <span>{t.comparison.headers.traditional}</span>
                  </div>
                </th>
                <th className="p-5 text-xs sm:text-sm font-bold text-onDarkSoft font-display w-1/4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted" />
                    <span>{t.comparison.headers.inHouse}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-body">
              {t.comparison.rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-5 text-xs sm:text-sm font-bold text-white">
                    {row.name}
                  </td>
                  <td className="p-5 text-xs sm:text-sm font-extrabold text-white bg-emerald/5 border-x border-emerald/30">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-emerald/20 flex items-center justify-center shrink-0">
                        <Check className="h-3.5 w-3.5 text-emerald" />
                      </div>
                      <span>{row.senthora}</span>
                    </div>
                  </td>
                  <td className="p-5 text-xs sm:text-sm text-onDarkSoft">
                    {row.traditional}
                  </td>
                  <td className="p-5 text-xs sm:text-sm text-onDarkSoft">
                    {row.inHouse}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
