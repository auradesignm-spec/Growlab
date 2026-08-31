"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  X,
  Sliders,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  Zap,
  Layers,
  ArrowRight,
  HelpCircle,
  Truck,
  Flame,
  CheckCircle2,
  Percent,
} from "lucide-react";
import { formatMoney, formatPct } from "@/lib/format";
import type { MerchantProductRow } from "@/lib/dashboard/merchant";
import type { OrderLedgerRow } from "@/lib/dashboard/types";

interface WhatIfProfitabilityOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  products: MerchantProductRow[];
  ordersLedger: OrderLedgerRow[];
  locale: string;
  onApplyCampaignBudget?: (monthlyBudget: number) => void;
  onNavigateTab?: (tab: "products" | "campaign" | "store" | "simulator" | "wallet") => void;
}

export default function WhatIfProfitabilityOverlay({
  isOpen,
  onClose,
  products,
  ordersLedger,
  locale,
  onApplyCampaignBudget,
  onNavigateTab,
}: WhatIfProfitabilityOverlayProps) {
  const isAr = locale !== "en";

  // Calculate default baseline numbers from real store catalog and orders if available
  const initialCalculations = useMemo(() => {
    const activeProducts = products.filter((p) => p.active);
    const avgAov =
      activeProducts.length > 0
        ? activeProducts.reduce((sum, p) => sum + (p.basePrice || 25), 0) / activeProducts.length
        : 28.5;

    const avgCogsPct =
      activeProducts.length > 0
        ? (activeProducts.reduce(
            (sum, p) => sum + (p.costPrice > 0 ? p.costPrice / (p.basePrice || 1) : 0.4),
            0
          ) /
            activeProducts.length) *
          100
        : 38;

    const baseOrders = Math.max(35, ordersLedger.length || 120);

    return {
      aov: Math.round(avgAov * 10) / 10,
      cogsPct: Math.round(avgCogsPct),
      monthlyOrders: baseOrders,
    };
  }, [products, ordersLedger]);

  // Variables state (Sliders)
  const [monthlyOrders, setMonthlyOrders] = useState<number>(initialCalculations.monthlyOrders);
  const [aov, setAov] = useState<number>(initialCalculations.aov);
  const [adSpend, setAdSpend] = useState<number>(250); // in OMR
  const [returnRate, setReturnRate] = useState<number>(12); // in % (RTO)
  const [cogsPct, setCogsPct] = useState<number>(initialCalculations.cogsPct); // in %
  const [shippingCostPerOrder, setShippingCostPerOrder] = useState<number>(2.0); // OMR per attempt
  const [rtoReturnPenalty, setRtoReturnPenalty] = useState<number>(1.5); // OMR return processing penalty
  const [affiliateCommPct, setAffiliateCommPct] = useState<number>(10); // in %

  // Active scenario identifier
  const [activeScenario, setActiveScenario] = useState<string>("custom");

  // Keyboard escape listener to close overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset to default baseline values
  const handleResetToBaseline = () => {
    setMonthlyOrders(initialCalculations.monthlyOrders);
    setAov(initialCalculations.aov);
    setAdSpend(250);
    setReturnRate(12);
    setCogsPct(initialCalculations.cogsPct);
    setShippingCostPerOrder(2.0);
    setRtoReturnPenalty(1.5);
    setAffiliateCommPct(10);
    setActiveScenario("baseline");
  };

  // Pre-configured Scenarios
  const applyScenario = (name: string) => {
    setActiveScenario(name);
    if (name === "baseline") {
      handleResetToBaseline();
    } else if (name === "aggressive_scale") {
      setMonthlyOrders(Math.round(initialCalculations.monthlyOrders * 2.8));
      setAdSpend(750);
      setReturnRate(16); // Higher scale usually brings slightly higher RTO
      setAffiliateCommPct(12);
    } else if (name === "rto_optimized") {
      setReturnRate(5); // Low returns via verification/advance payment
      setShippingCostPerOrder(1.8);
      setAdSpend(300);
      setMonthlyOrders(Math.round(initialCalculations.monthlyOrders * 1.5));
    } else if (name === "high_margin_lean") {
      setAdSpend(50); // Organic & affiliate heavy
      setAffiliateCommPct(18);
      setReturnRate(8);
      setAov(Math.round(initialCalculations.aov * 1.25));
    } else if (name === "clearance_liquidation") {
      setMonthlyOrders(Math.round(initialCalculations.monthlyOrders * 3.5));
      setAov(Math.round(initialCalculations.aov * 0.75)); // Discounted prices
      setCogsPct(Math.min(65, initialCalculations.cogsPct + 10));
      setAdSpend(150);
      setAffiliateCommPct(15);
      setReturnRate(10);
    }
  };

  // Mathematical Calculations
  const metrics = useMemo(() => {
    const grossRevenue = monthlyOrders * aov;
    const returnRateDecimal = returnRate / 100;
    const deliveredOrders = Math.round(monthlyOrders * (1 - returnRateDecimal));
    const returnedOrders = monthlyOrders - deliveredOrders;

    // Realized Revenue = only from delivered orders
    const realizedRevenue = deliveredOrders * aov;
    const lostRtoRevenue = returnedOrders * aov;

    // Cost of Goods Sold (only for delivered goods; returned goods returned to inventory)
    const cogsAmount = deliveredOrders * (aov * (cogsPct / 100));

    // Shipping fees (all shipments pay forward shipping; returned orders pay penalty)
    const shippingTotal = monthlyOrders * shippingCostPerOrder;
    const rtoFrictionTotal = returnedOrders * rtoReturnPenalty;
    const totalLogisticsCost = shippingTotal + rtoFrictionTotal;

    // Platform and Affiliate Commissions (charged on realized revenue)
    const commissionsTotal = realizedRevenue * (affiliateCommPct / 100);

    // Total Operating Costs
    const totalCosts = cogsAmount + totalLogisticsCost + adSpend + commissionsTotal;

    // Net Profit
    const netProfit = realizedRevenue - totalCosts;
    const netMarginPct = realizedRevenue > 0 ? (netProfit / realizedRevenue) * 100 : 0;

    // Per Unit Net Profit
    const netProfitPerDeliveredOrder = deliveredOrders > 0 ? netProfit / deliveredOrders : 0;

    // Customer Acquisition Cost (CAC / CPA)
    const cpaPerAcquisition = deliveredOrders > 0 ? adSpend / deliveredOrders : 0;

    // ROAS (Return On Ad Spend)
    const roas = adSpend > 0 ? realizedRevenue / adSpend : 0;

    // Break-even thresholds:
    // 1. Max tolerable Return Rate before net profit turns zero
    // netProfit = (Orders * (1-R) * AOV) - [Orders*(1-R)*AOV*cogs% + Orders*Ship + Orders*R*Pen + AdSpend + Orders*(1-R)*AOV*Comm%] = 0
    // Solving for R:
    const unitGrossMargin = aov * (1 - cogsPct / 100 - affiliateCommPct / 100);
    const fixedCosts = adSpend + monthlyOrders * shippingCostPerOrder;
    const denominator = monthlyOrders * (unitGrossMargin + rtoReturnPenalty);
    const breakEvenRtoPct =
      denominator > 0 ? Math.max(0, Math.min(100, (1 - fixedCosts / denominator) * 100)) : 0;

    // 2. Max tolerable Ad Spend before net profit becomes zero
    const maxTolerableAdSpend = Math.max(
      0,
      realizedRevenue - (cogsAmount + totalLogisticsCost + commissionsTotal)
    );

    return {
      grossRevenue,
      deliveredOrders,
      returnedOrders,
      realizedRevenue,
      lostRtoRevenue,
      cogsAmount,
      totalLogisticsCost,
      shippingTotal,
      rtoFrictionTotal,
      commissionsTotal,
      totalCosts,
      netProfit,
      netMarginPct,
      netProfitPerDeliveredOrder,
      cpaPerAcquisition,
      roas,
      breakEvenRtoPct,
      maxTolerableAdSpend,
    };
  }, [
    monthlyOrders,
    aov,
    adSpend,
    returnRate,
    cogsPct,
    shippingCostPerOrder,
    rtoReturnPenalty,
    affiliateCommPct,
  ]);

  // Waterfall Chart Data
  const waterfallChartData = useMemo(() => {
    return [
      {
        name: isAr ? "إجمالي الإيرادات" : "Realized Revenue",
        amount: metrics.realizedRevenue,
        type: "revenue",
        fill: "#10b981",
      },
      {
        name: isAr ? "تكلفة البضاعة" : "COGS",
        amount: -metrics.cogsAmount,
        type: "cost",
        fill: "#f59e0b",
      },
      {
        name: isAr ? "ميزانية الإعلانات" : "Ad Spend",
        amount: -adSpend,
        type: "cost",
        fill: "#6366f1",
      },
      {
        name: isAr ? "الشحن والمرتجعات" : "Shipping & RTO",
        amount: -metrics.totalLogisticsCost,
        type: "cost",
        fill: "#f43f5e",
      },
      {
        name: isAr ? "العمولات والمسوقين" : "Commissions",
        amount: -metrics.commissionsTotal,
        type: "cost",
        fill: "#8b5cf6",
      },
      {
        name: isAr ? "صافي الربح" : "Net Profit",
        amount: metrics.netProfit,
        type: metrics.netProfit >= 0 ? "profit" : "loss",
        fill: metrics.netProfit >= 0 ? "#059669" : "#dc2626",
      },
    ];
  }, [metrics, adSpend, isAr]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatif-overlay-title"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div
        id="whatif-profitability-calculator-modal"
        className="relative flex flex-col w-full max-w-5xl my-auto rounded-[2rem] border border-line bg-white shadow-2xl overflow-hidden dark:bg-slate-900 max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-line bg-slate-50/80 px-6 py-4 dark:bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-black dark:bg-white/10 dark:text-white border border-slate-200 dark:border-white/10">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="whatif-overlay-title" className="text-base sm:text-lg font-bold text-frost">
                  {isAr
                    ? "حاسبة التوقعات وسيناريوهات الربحية (What-If Profitability)"
                    : "What-If Profitability & Scenario Simulator"}
                </h3>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 text-[10px] font-extrabold text-slate-800 dark:text-slate-200">
                  {isAr ? "تفاعلي لحظي" : "Live Real-Time"}
                </span>
              </div>
              <p className="text-[12px] text-frost-dim">
                {isAr
                  ? "غيّر المتغيرات بحرية (ميزانية الإعلانات، نسبة المرتجعات، حجم الطلبات) لمعاينة الأثر المباشر على صافي الربح ونقطة التعادل."
                  : "Toggle variables like ad spend, return rate (RTO), and volume to evaluate direct impact on bottom-line net profit."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToBaseline}
              title={isAr ? "إعادة ضبط" : "Reset to default"}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-frost-dim hover:bg-slate-100 hover:text-frost dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5 text-black dark:text-white" />
              <span className="hidden sm:inline">{isAr ? "إعادة ضبط" : "Reset"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-frost-dim hover:bg-slate-100 hover:text-frost dark:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95"
              aria-label={isAr ? "إغلاق النافذة" : "Close"}
            >
              <X className="h-4 w-4 text-black dark:text-white" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Dual-Column Layout */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 [scrollbar-width:thin]">
          {/* 1. Preset Scenarios Quick Bar */}
          <div className="rounded-2xl border border-line bg-night/5 p-3 dark:bg-night/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-black dark:text-white shrink-0" />
                <span className="text-xs font-bold text-frost">
                  {isAr ? "سيناريوهات نمو وأداء جاهزة:" : "Instant Preset Scenarios:"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  {
                    id: "baseline",
                    label: isAr ? "الوضع الطبيعي المعتدل" : "Balanced Baseline",
                  },
                  {
                    id: "aggressive_scale",
                    label: isAr ? "توسع إعلاني مكثف" : "Aggressive Ad Scale",
                  },
                  {
                    id: "rto_optimized",
                    label: isAr ? "تخفيض المرتجعات (RTO 5%)" : "Low RTO (5%)",
                  },
                  {
                    id: "high_margin_lean",
                    label: isAr ? "تسويق بالعمولة عالي الهامش" : "High-Margin Affiliate",
                  },
                  {
                    id: "clearance_liquidation",
                    label: isAr ? "تصفية وتصريف مخزون" : "Stock Clearance",
                  },
                ].map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => applyScenario(sc.id)}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      activeScenario === sc.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-line bg-white text-frost-dim hover:border-indigo-400 hover:text-frost dark:bg-slate-800"
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Main 2-Column Grid: Sliders on Left/Top vs Projected Analytics on Right/Bottom */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Interactive Sliders (5 Cols on large) */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-2xl border border-line bg-slate-50/50 p-4 dark:bg-slate-950/40 space-y-4">
                <div className="flex items-center justify-between border-b border-line/60 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-black dark:text-white" />
                    <span>{isAr ? "معايير ومتغيرات المحاكاة" : "Simulation Variables"}</span>
                  </h4>
                  <span className="text-[11px] text-frost-dim font-mono">
                    {isAr ? "اسحب للتغيير" : "Drag to test"}
                  </span>
                </div>

                {/* Variable 1: Monthly Ad Spend */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-frost flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-black dark:text-white" />
                      <span>{isAr ? "ميزانية الإعلانات الشهرية:" : "Monthly Ad Spend:"}</span>
                    </label>
                    <span className="font-mono font-bold text-black dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-line">
                      {formatMoney(adSpend, "OMR")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2500}
                    step={25}
                    value={adSpend}
                    onChange={(e) => {
                      setAdSpend(Number(e.target.value));
                      setActiveScenario("custom");
                    }}
                    className="w-full accent-slate-900 dark:accent-white cursor-pointer h-2 bg-slate-200 rounded-lg dark:bg-slate-700"
                  />
                  <div className="flex justify-between text-[10px] text-frost-dim font-mono">
                    <span>0 ر.ع</span>
                    <span>1,000 ر.ع</span>
                    <span>2,500 ر.ع</span>
                  </div>
                </div>

                {/* Variable 2: Return Rate (RTO %) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-frost flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-black dark:text-white" />
                      <span>{isAr ? "نسبة المرتجعات المتوقعة (RTO):" : "Return Rate (RTO %):"}</span>
                    </label>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-lg border text-xs ${
                        returnRate <= 8
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50"
                          : returnRate <= 18
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/50"
                      }`}
                    >
                      {returnRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    step={1}
                    value={returnRate}
                    onChange={(e) => {
                      setReturnRate(Number(e.target.value));
                      setActiveScenario("custom");
                    }}
                    className="w-full accent-slate-900 dark:accent-white cursor-pointer h-2 bg-slate-200 rounded-lg dark:bg-slate-700"
                  />
                  <div className="flex justify-between text-[10px] text-frost-dim font-mono">
                    <span>0% (مثالي)</span>
                    <span>15% (معتاد)</span>
                    <span>40% (حرج)</span>
                  </div>
                </div>

                {/* Variable 3: Monthly Order Volume */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-frost flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-black dark:text-white" />
                      <span>{isAr ? "إجمالي حجم الطلبات الشهري:" : "Monthly Orders Volume:"}</span>
                    </label>
                    <span className="font-mono font-bold text-frost bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-line">
                      {monthlyOrders} {isAr ? "طلب" : "orders"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={1500}
                    step={10}
                    value={monthlyOrders}
                    onChange={(e) => {
                      setMonthlyOrders(Number(e.target.value));
                      setActiveScenario("custom");
                    }}
                    className="w-full accent-slate-900 dark:accent-white cursor-pointer h-2 bg-slate-200 rounded-lg dark:bg-slate-700"
                  />
                  <div className="flex justify-between text-[10px] text-frost-dim font-mono">
                    <span>10</span>
                    <span>500</span>
                    <span>1,500</span>
                  </div>
                </div>

                {/* Variable 4: Average Order Value (AOV) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-frost flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-black dark:text-white" />
                      <span>{isAr ? "متوسط قيمة الطلب (AOV):" : "Avg Order Value (AOV):"}</span>
                    </label>
                    <span className="font-mono font-bold text-frost bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-line">
                      {formatMoney(aov, "OMR")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={1}
                    value={aov}
                    onChange={(e) => {
                      setAov(Number(e.target.value));
                      setActiveScenario("custom");
                    }}
                    className="w-full accent-slate-900 dark:accent-white cursor-pointer h-2 bg-slate-200 rounded-lg dark:bg-slate-700"
                  />
                  <div className="flex justify-between text-[10px] text-frost-dim font-mono">
                    <span>5 ر.ع</span>
                    <span>50 ر.ع</span>
                    <span>120 ر.ع</span>
                  </div>
                </div>

                {/* Advanced Variables Collapsible / Direct Toggles */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/60">
                  {/* COGS % */}
                  <div>
                    <label className="text-[11px] font-medium text-frost-dim block mb-1">
                      {isAr ? "تكلفة البضاعة %:" : "COGS %:"}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={10}
                        max={80}
                        value={cogsPct}
                        onChange={(e) => {
                          setCogsPct(Number(e.target.value) || 0);
                          setActiveScenario("custom");
                        }}
                        className="w-full rounded-xl border border-line bg-white px-2.5 py-1 text-xs font-mono font-bold text-frost shadow-xs dark:bg-slate-800"
                      />
                      <span className="text-xs text-frost-dim font-bold">%</span>
                    </div>
                  </div>

                  {/* Affiliate Commission % */}
                  <div>
                    <label className="text-[11px] font-medium text-frost-dim block mb-1">
                      {isAr ? "عمولة المسوقين %:" : "Affiliate Comm %:"}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={35}
                        value={affiliateCommPct}
                        onChange={(e) => {
                          setAffiliateCommPct(Number(e.target.value) || 0);
                          setActiveScenario("custom");
                        }}
                        className="w-full rounded-xl border border-line bg-white px-2.5 py-1 text-xs font-mono font-bold text-frost shadow-xs dark:bg-slate-800"
                      />
                      <span className="text-xs text-frost-dim font-bold">%</span>
                    </div>
                  </div>

                  {/* Shipping Fee */}
                  <div>
                    <label className="text-[11px] font-medium text-frost-dim block mb-1">
                      {isAr ? "شحن الطلب (ر.ع):" : "Shipping Cost:"}
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={0.5}
                      max={10}
                      value={shippingCostPerOrder}
                      onChange={(e) => {
                        setShippingCostPerOrder(Number(e.target.value) || 0);
                        setActiveScenario("custom");
                      }}
                      className="w-full rounded-xl border border-line bg-white px-2.5 py-1 text-xs font-mono font-bold text-frost shadow-xs dark:bg-slate-800"
                    />
                  </div>

                  {/* Return Penalty Fee */}
                  <div>
                    <label className="text-[11px] font-medium text-frost-dim block mb-1">
                      {isAr ? "غرامة استرجاع (ر.ع):" : "RTO Processing:"}
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      max={10}
                      value={rtoReturnPenalty}
                      onChange={(e) => {
                        setRtoReturnPenalty(Number(e.target.value) || 0);
                        setActiveScenario("custom");
                      }}
                      className="w-full rounded-xl border border-line bg-white px-2.5 py-1 text-xs font-mono font-bold text-frost shadow-xs dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Key Projected Outcomes & Waterfall Breakdown (7 Cols) */}
            <div className="space-y-4 lg:col-span-7">
              {/* Primary Projected Net Profit Banner */}
              <div
                className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
                  metrics.netProfit >= 0
                    ? "border-emerald-300/80 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:border-emerald-800/60 dark:bg-emerald-950/20"
                    : "border-rose-300/80 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent dark:border-rose-800/60 dark:bg-rose-950/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-frost-dim uppercase tracking-wider">
                        {isAr ? "صافي الربح الشهري المتوقع" : "Projected Monthly Net Profit"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold flex items-center gap-1 ${
                          metrics.netProfit >= 0
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                        }`}
                      >
                        {metrics.netProfit >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {metrics.netMarginPct.toFixed(1)}% {isAr ? "هامش صافي" : "Net Margin"}
                        </span>
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span
                        className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${
                          metrics.netProfit >= 0
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-rose-700 dark:text-rose-400"
                        }`}
                      >
                        {formatMoney(metrics.netProfit, "OMR")}
                      </span>
                      <span className="text-xs text-frost-dim">
                        ({formatMoney(metrics.netProfitPerDeliveredOrder, "OMR")}{" "}
                        {isAr ? "/ لكل طلب مُسلّم" : "/ delivered order"})
                      </span>
                    </div>
                  </div>

                  {/* Mini KPI Pill */}
                  <div className="flex sm:flex-col items-end gap-1.5 border-t sm:border-t-0 sm:border-r sm:pr-4 border-line/60 pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className="text-[11px] text-frost-dim block">
                        {isAr ? "عائد الإنفاق الإعلاني (ROAS):" : "Target ROAS:"}
                      </span>
                      <span className="text-sm font-bold font-mono text-frost">
                        {metrics.roas.toFixed(2)}x
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-frost-dim block">
                        {isAr ? "تكلفة الطلب (CPA):" : "Effective CPA:"}
                      </span>
                      <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {formatMoney(metrics.cpaPerAcquisition, "OMR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Breakdown Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
                {/* Realized Revenue */}
                <div className="rounded-2xl border border-line bg-night/5 p-3 dark:bg-night/30">
                  <span className="text-[11px] text-frost-dim block truncate">
                    {isAr ? "الإيرادات المحققة" : "Realized Revenue"}
                  </span>
                  <p className="mt-1 font-mono font-bold text-frost text-sm sm:text-base">
                    {formatMoney(metrics.realizedRevenue, "OMR")}
                  </p>
                  <p className="text-[10px] text-frost-dim mt-0.5">
                    {metrics.deliveredOrders} {isAr ? "طلب مُسلّم" : "delivered"}
                  </p>
                </div>

                {/* Lost in Returns (RTO) */}
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <span className="text-[11px] text-amber-800 dark:text-amber-300 block truncate">
                    {isAr ? "مبيعات مفقودة بالمرتجع" : "Lost to RTO"}
                  </span>
                  <p className="mt-1 font-mono font-bold text-amber-700 dark:text-amber-400 text-sm sm:text-base">
                    {formatMoney(metrics.lostRtoRevenue, "OMR")}
                  </p>
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                    {metrics.returnedOrders} {isAr ? "طلب راجع" : "returns"}
                  </p>
                </div>

                {/* Total Operating Costs */}
                <div className="rounded-2xl border border-line bg-night/5 p-3 dark:bg-night/30">
                  <span className="text-[11px] text-frost-dim block truncate">
                    {isAr ? "إجمالي التكاليف" : "Total Outflows"}
                  </span>
                  <p className="mt-1 font-mono font-bold text-frost text-sm sm:text-base">
                    {formatMoney(metrics.totalCosts, "OMR")}
                  </p>
                  <p className="text-[10px] text-frost-dim mt-0.5">
                    {isAr ? "بضاعة + إعلانات + شحن" : "COGS+Ads+Shipping"}
                  </p>
                </div>
              </div>

              {/* Visual Waterfall Recharts Bar Chart */}
              <div className="rounded-2xl border border-line bg-slate-50/70 p-4 dark:bg-slate-950/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-frost">
                    {isAr
                      ? "المسار المالي: من الإيراد إلى صافي الربح (Waterfall Flow)"
                      : "Financial Waterfall: Revenue to Net Profit"}
                  </span>
                  <span className="text-[11px] text-frost-dim font-mono">
                    {isAr ? "القيمة بالريال العماني" : "Values in OMR"}
                  </span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={waterfallChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(150,150,150,0.15)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9.5, fill: "var(--frost-dim, #888)" }}
                        axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
                        tickLine={false}
                        interval={0}
                        angle={-10}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--frost-dim, #888)" }}
                        axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const item = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-line bg-white/95 p-2.5 shadow-xl backdrop-blur-md dark:bg-slate-900/95 text-[11px]">
                              <p className="font-bold text-frost">{item.name}</p>
                              <p
                                className={`font-mono font-extrabold mt-0.5 ${
                                  item.amount >= 0 ? "text-emerald-600" : "text-rose-600"
                                }`}
                              >
                                {formatMoney(Math.abs(item.amount), "OMR")}{" "}
                                {item.amount < 0 && (isAr ? "(خصم)" : "(outflow)")}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine y={0} stroke="rgba(150,150,150,0.4)" />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {waterfallChartData.map((entry, idx) => (
                          <Cell key={`cell-flow-${idx}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Break-Even Intelligence & Strategic Advice Box */}
              <div className="rounded-2xl border border-line bg-slate-50/70 p-3.5 dark:bg-slate-950/40 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-black dark:text-white shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-frost">
                      {isAr ? "تحليل نقطة التعادل والأمان:" : "Break-Even Safety Margins:"}
                    </p>
                    <ul className="space-y-1 text-frost-dim text-[11.5px] leading-relaxed">
                      <li>
                        •{" "}
                        {isAr
                          ? `أقصى نسبة مرتجعات مسموحة قبل الخسارة: `
                          : `Max Tolerable Return Rate (RTO): `}
                        <strong className="font-mono text-frost">
                          {metrics.breakEvenRtoPct.toFixed(1)}%
                        </strong>
                        {returnRate > metrics.breakEvenRtoPct && (
                          <span className="text-rose-600 font-bold mr-1">
                            {isAr ? " (أنت في نطاق الخسارة!)" : " (Loss Zone!)"}
                          </span>
                        )}
                      </li>
                      <li>
                        •{" "}
                        {isAr
                          ? `الحد الأقصى للإنفاق الإعلاني المسموح به شهرياً: `
                          : `Max Tolerable Monthly Ad Budget: `}
                        <strong className="font-mono text-frost">
                          {formatMoney(metrics.maxTolerableAdSpend, "OMR")}
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-slate-50/90 px-6 py-4 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-frost-dim">
            <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />
            <span>
              {isAr
                ? "الحسابات دقيقة وتأخذ بالاعتبار رسوم استرجاع الطلبات غير المستلمة وعمولات المنصة."
                : "Calculations accurately incorporate COD RTO return logistics and affiliate deductions."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="gl-btn-secondary !min-h-10 !py-2 !px-4 !text-xs"
            >
              {isAr ? "إغلاق النافذة" : "Close Overlay"}
            </button>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => {
                  if (onApplyCampaignBudget) {
                    onApplyCampaignBudget(adSpend);
                  }
                  onClose();
                  onNavigateTab("campaign");
                }}
                className="gl-btn-primary !min-h-10 !py-2 !px-4 !text-xs flex items-center gap-1.5"
              >
                <Zap className="h-3.5 w-3.5 fill-white" />
                <span>
                  {isAr
                    ? `اعتماد ميزانية الإعلانات (${formatMoney(adSpend, "OMR")})`
                    : `Apply Ad Budget (${formatMoney(adSpend, "OMR")})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
