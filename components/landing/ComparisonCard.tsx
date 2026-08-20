"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Store, Share2, ShieldCheck, Zap, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export function ComparisonCard() {
  const [activeTab, setActiveTab] = useState<"affiliate" | "growlab">("growlab");

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-4">
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
          <button
            onClick={() => setActiveTab("affiliate")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "affiliate"
                ? "bg-slate-800 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Traditional Link
          </button>
          <button
            onClick={() => setActiveTab("growlab")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "growlab"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Growlab Storefront
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === "affiliate" ? (
            <motion.div
              key="affiliate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid md:grid-cols-2 gap-6 bg-slate-950/50 p-6 md:p-10 rounded-[32px] border border-slate-800/50 backdrop-blur-sm"
            >
              <div className="space-y-6">
                <div className="inline-flex p-3 bg-red-500/10 rounded-2xl">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white font-display">
                  The Broken Link Model
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Random affiliate links are leaky buckets. You send traffic to a generic site, losing your brand identity and 30% of your commissions to attribution errors.
                </p>
                <div className="pt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500/50 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-300">Identity loss: Customers don&apos;t remember you.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500/50 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-300">Manual tracking: Commissions often get &quot;lost&quot;.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500/50 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-300">Messy UI: One-time links that expire or break.</span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full group-hover:bg-red-500/10 transition-all duration-700" />
                <div className="relative bg-slate-900/80 border border-slate-800 p-6 rounded-3xl h-full flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "40%" }}
                      className="h-full bg-red-500"
                    />
                  </div>
                  <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">Estimated Conversion</div>
                  <div className="text-4xl font-bold text-white">1.2%</div>
                  <div className="text-red-500 text-sm font-medium">Low Trust & High Drop-off</div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="growlab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid md:grid-cols-2 gap-6 bg-emerald-950/10 p-6 md:p-10 rounded-[32px] border border-emerald-500/20 backdrop-blur-sm"
            >
              <div className="space-y-6">
                <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white font-display">
                  The Micro-Storefront Ecosystem
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Growlab turns you into a business owner. A professional storefront under your name, with real-time ledger tracking that guarantees every cent of your commission.
                </p>
                <div className="pt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-200 font-medium">Brand Authority: growlab.com/yourname</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-200 font-medium">Automated Ledger: Real-time split distribution.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-200 font-medium">Cross-Border: Multi-currency SAR/AED/OMR support.</span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
                <div className="relative bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-3xl h-full flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-full h-2 bg-emerald-900/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "85%" }}
                      className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                  <div className="text-emerald-400 text-xs uppercase tracking-widest font-bold">Estimated Conversion</div>
                  <div className="text-4xl font-bold text-white">8.5%</div>
                  <div className="text-emerald-400 text-sm font-medium">High Trust & Instant Checkout</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
