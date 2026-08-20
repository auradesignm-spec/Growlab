"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Calculator as CalcIcon, TrendingUp, Clock, DollarSign } from "lucide-react";

export function Calculator() {
  const { t } = useLanguage();
  
  // Default values
  const [spend, setSpend] = useState(2500);
  const [aov, setAov] = useState(55);
  const [cr, setCr] = useState(1.5);

  const [results, setResults] = useState({
    revenueLift: 0,
    profitLift: 0,
    roi: 0,
    hours: 0
  });

  useEffect(() => {
    // Basic logic for demonstration
    // Assume Senthora lifts CR by 120% relative (e.g. 1.5% -> 3.3%)
    const liftFactor = 1.2; 
    const currentOrders = (spend / 1.5) * (cr / 100); // Very rough CAC-based estimation or just simple conversion
    // Let's use a simpler model:
    const visitors = spend / 0.5; // $0.5 CPC
    const currentRevenue = visitors * (cr / 100) * aov;
    
    // Senthora impact: 
    // 1. CR Lift (instant response + negotiation) -> +80% relative increase in CR
    const newCr = cr * 1.8;
    const newRevenue = visitors * (newCr / 100) * aov;
    
    const revenueLift = newRevenue - currentRevenue;
    const profitLift = revenueLift * 0.4; // 40% margin
    const roi = (profitLift / 499) * 100; // Assuming $499/mo sub
    const hours = (visitors * (cr/100) * 0.2); // 12 mins per order saved

    setResults({
      revenueLift: Math.round(revenueLift),
      profitLift: Math.round(profitLift),
      roi: Math.round(roi),
      hours: Math.round(hours)
    });
  }, [spend, aov, cr]);

  return (
    <section id="calculator" className="py-24 bg-slate-900/20 border-y border-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">
              {t.calculator.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              {t.calculator.title}
            </h2>
            <p className="text-slate-400 mb-10">
              {t.calculator.subtitle}
            </p>

            <div className="space-y-8">
              {/* Spend Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-300">{t.calculator.monthlySpendLabel}</label>
                  <span className="text-lg font-black text-white">${spend.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="50000" 
                  step="500"
                  value={spend}
                  onChange={(e) => setSpend(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* AOV Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-300">{t.calculator.aovLabel}</label>
                  <span className="text-lg font-black text-white">${aov}</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  step="5"
                  value={aov}
                  onChange={(e) => setAov(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* CR Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-300">{t.calculator.crLabel}</label>
                  <span className="text-lg font-black text-white">{cr}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="10" 
                  step="0.1"
                  value={cr}
                  onChange={(e) => setCr(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full" />
            <div className="relative p-8 md:p-12 rounded-[48px] bg-slate-900 border border-slate-800 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                {t.calculator.resultsTitle}
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.calculator.projectedRevenue}</div>
                  <div className="text-3xl font-black text-white">${results.revenueLift.toLocaleString()}</div>
                </div>
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.calculator.additionalProfit}</div>
                  <div className="text-3xl font-black text-emerald-500">${results.profitLift.toLocaleString()}</div>
                </div>
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.calculator.roiEstimate}</div>
                  <div className="text-3xl font-black text-blue-400">{results.roi}%</div>
                </div>
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.calculator.hoursSaved}</div>
                  <div className="text-3xl font-black text-white">{results.hours}h</div>
                </div>
              </div>

              <button className="w-full mt-10 py-5 rounded-2xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20">
                {t.calculator.ctaButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
