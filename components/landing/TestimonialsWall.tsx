"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import TiltCard3D from "@/components/motion/TiltCard3D";
import { Star, Quote, Sparkles, TrendingUp } from "lucide-react";

export default function TestimonialsWall() {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="relative py-24 bg-dark overflow-hidden">
      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-3.5 py-1.5 border border-emerald/30 mb-4"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald" />
            <span className="text-xs font-mono font-bold text-emerald">
              {t.testimonials.badge}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display mb-4"
          >
            {t.testimonials.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-onDarkSoft leading-relaxed font-body"
          >
            {t.testimonials.subtitle}
          </motion.p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.testimonials.items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <TiltCard3D glowColor="emerald" className="p-7 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  {/* Rating Stars & Metric Tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-gold" />
                      ))}
                    </div>
                    <span className="rounded-full bg-emerald/10 border border-emerald/30 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald">
                      {item.metric}
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="text-xs sm:text-sm text-onDark leading-relaxed font-body italic">
                    &quot;{item.quote}&quot;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="h-11 w-11 rounded-full object-cover border-2 border-emerald/40"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">
                      {item.author}
                    </h4>
                    <span className="text-[11px] text-muted block font-body">
                      {item.role} • {item.company}
                    </span>
                  </div>
                </div>
              </TiltCard3D>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
