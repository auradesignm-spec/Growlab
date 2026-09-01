"use client";

import { useState, useRef, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  Layers,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Search,
  Check,
  X,
  Share2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  Send,
  Download,
  Filter,
  Plus,
  Trash2,
  ArrowUpRight,
  Eye,
  FileText,
} from "lucide-react";
import {
  detectAllProfitLeaks,
  getSampleMerchantDataset,
  calculateProductNetProfit,
  calculateCampaignNetProfit,
  type DetectedLeak,
  type MerchantProductCosting,
  type AdCampaignMetric,
  type PlatformOrder,
  type CourierStatementLine,
  type PaymentMethodType,
  type ConfidenceTier,
  type NetProfitOverview,
  type ReconciliationSummary,
  type AuditTrailLog,
} from "@/lib/profitLeaks";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export default function ProfitLeakCenter({ locale = "ar" }: { locale?: string }) {
  const isAr = locale === "ar";
  const currency = isAr ? "ر.ع." : "OMR";

  // Initial sample dataset
  const initial = useMemo(() => getSampleMerchantDataset(), []);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(initial.paymentMethod);
  const [products, setProducts] = useState<MerchantProductCosting[]>(initial.products);
  const [campaigns, setCampaigns] = useState<AdCampaignMetric[]>(initial.campaigns);
  const [orders, setOrders] = useState<PlatformOrder[]>(initial.orders);
  const [courierStatements, setCourierStatements] = useState<CourierStatementLine[]>(initial.courierStatements);

  // Active view tabs
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "leaks" | "products" | "campaigns" | "reconciliation" | "ai_parser" | "weekly_digest" | "referral"
  >("overview");

  // Filter for Leaks tab
  const [leakTierFilter, setLeakTierFilter] = useState<"ALL" | "TIER_1" | "TIER_2" | "TIER_3">("ALL");
  const [selectedLeakDetail, setSelectedLeakDetail] = useState<DetectedLeak | null>(null);

  // Recovered leaks tracking
  const [recoveredLeakIds, setRecoveredLeakIds] = useState<Set<string>>(new Set());

  // AI Parser state
  const [rawAiText, setRawAiText] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiResultNote, setAiResultNote] = useState<string | null>(null);

  // File upload drag & drop ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<"ORDERS" | "COURIER" | "CAMPAIGNS">("COURIER");
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Add Product Modal / State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    sku: "",
    sellingPrice: 20,
    cogs: 5,
    shippingFee: 2,
    returnRate: 10,
    adCostAllocation: 3,
    unitsSold: 50,
  });

  // Calculate live results
  const analysis = useMemo(() => {
    return detectAllProfitLeaks({
      products,
      campaigns,
      orders,
      courierStatements,
      paymentMethod,
      currency,
    });
  }, [products, campaigns, orders, courierStatements, paymentMethod, currency]);

  const { leaks, overview, reconciliation, auditTrail } = analysis;

  // Filtered leaks
  const filteredLeaks = useMemo(() => {
    return leaks.filter((l) => {
      if (recoveredLeakIds.has(l.id)) return false;
      if (leakTierFilter === "TIER_1") return l.tier === "TIER_1_CONFIRMED";
      if (leakTierFilter === "TIER_2") return l.tier === "TIER_2_ESTIMATED";
      if (leakTierFilter === "TIER_3") return l.tier === "TIER_3_REVIEW_NEEDED";
      return true;
    });
  }, [leaks, leakTierFilter, recoveredLeakIds]);

  // Mark a leak as resolved / recovered
  const handleResolveLeak = (leak: DetectedLeak) => {
    setRecoveredLeakIds((prev) => new Set([...prev, leak.id]));
  };

  // Handle CSV / Excel Upload using SheetJS & PapaParse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith(".csv")) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processParsedRecords(results.data, uploadType);
          },
        });
      };
      reader.readAsText(file);
    } else {
      // Excel (.xlsx / .xls)
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        processParsedRecords(json, uploadType);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const processParsedRecords = (rows: any[], type: "ORDERS" | "COURIER" | "CAMPAIGNS") => {
    if (!rows || rows.length === 0) return;

    if (type === "COURIER") {
      const newStatements: CourierStatementLine[] = rows.map((row, idx) => ({
        id: `uploaded-stmt-${Date.now()}-${idx}`,
        waybillNumber: String(row.Waybill || row.AWB || row.Tracking || row["رقم البوليصة"] || `WB-${idx + 1}`),
        orderReference: String(row.Order || row.Ref || row["رقم الطلب"] || ""),
        customerPhone: String(row.Phone || row["رقم الهاتف"] || ""),
        customerName: String(row.Customer || row["اسم العميل"] || ""),
        courierName: String(row.Courier || row["شركة الشحن"] || "Aramex"),
        courierStatus: String(row.Status || row["الحالة"] || "").toLowerCase().includes("deliv") ? "DELIVERED" : "DELIVERED",
        codCollectedAmount: Number(row.COD || row.Collected || row["المبلغ المحصل"] || 20),
        codRemittedAmount: Number(row.Remitted || row.Payout || row["المبلغ المحول"] || 0),
        courierFee: Number(row.Fee || row["رسوم الشحن"] || 2.0),
        deliveryDate: String(row.Date || row["تاريخ التسليم"] || new Date().toISOString().slice(0, 10)),
      }));

      setCourierStatements((prev) => [...prev, ...newStatements]);
      setUploadSuccessMsg(`تم استيراد ${newStatements.length} سجل بنجاح من كشف شركة الشحن!`);
    } else if (type === "ORDERS") {
      const newOrders: PlatformOrder[] = rows.map((row, idx) => ({
        id: `uploaded-ord-${Date.now()}-${idx}`,
        orderNumber: String(row.Order || row["رقم الطلب"] || `ORD-${idx + 1}`),
        trackingNumber: String(row.Tracking || row["رقم البوليصة"] || ""),
        customerName: String(row.Name || row["الاسم"] || "عميل"),
        customerPhone: String(row.Phone || row["الهاتف"] || ""),
        productTitle: String(row.Product || row["المنتج"] || "منتج عام"),
        sellingPrice: Number(row.Price || row["سعر البيع"] || 25),
        cogs: Number(row.COGS || row["التكلفة"] || 6),
        shippingCost: Number(row.Shipping || row["الشحن"] || 2),
        paymentMethod: String(row.Payment || "").toLowerCase().includes("card") ? "PREPAID" : "COD",
        courierName: "Aramex",
        orderDate: new Date().toISOString().slice(0, 10),
        status: "DELIVERED",
      }));
      setOrders((prev) => [...prev, ...newOrders]);
      setUploadSuccessMsg(`تم استيراد ${newOrders.length} طلب جديد بنجاح!`);
    }
    setTimeout(() => setUploadSuccessMsg(null), 4000);
  };

  // Call Internal AI Statement Parser
  const runAiParser = async () => {
    if (!rawAiText.trim()) return;
    setIsAiProcessing(true);
    setAiResultNote(null);

    try {
      const res = await fetch("/api/ai/parse-statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: rawAiText,
          courierHint: "Aramex",
        }),
      });
      const data = await res.json();
      if (data.success && data.extractedLines) {
        setCourierStatements((prev) => [...prev, ...data.extractedLines]);
        setAiResultNote(data.note || "تم استخراج السجلات وإضافتها لقائمة المطابقة (Tier 2).");
        setRawAiText("");
      } else {
        setAiResultNote("حدث خطأ أثناء المعالجة: " + (data.error || "خطأ غير معروف"));
      }
    } catch {
      setAiResultNote("تعذر الاتصال بخدمة المعالجة.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Add Product Form Submit
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title.trim()) return;

    const prod: MerchantProductCosting = {
      id: `prod-${Date.now()}`,
      sku: newProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
      title: newProduct.title,
      sellingPrice: Number(newProduct.sellingPrice),
      cogs: Number(newProduct.cogs),
      shippingFee: Number(newProduct.shippingFee),
      returnRate: Number(newProduct.returnRate) / 100,
      adCostAllocation: Number(newProduct.adCostAllocation),
      unitsSold: Number(newProduct.unitsSold),
      currency,
    };

    setProducts((prev) => [prod, ...prev]);
    setIsAddingProduct(false);
    setNewProduct({
      title: "",
      sku: "",
      sellingPrice: 20,
      cogs: 5,
      shippingFee: 2,
      returnRate: 10,
      adCostAllocation: 3,
      unitsSold: 50,
    });
  };

  // Generate Weekly WhatsApp Digest Text
  const weeklyDigestText = useMemo(() => {
    return `📊 *تقرير أرباحك الأسبوعي من Growlab*
🗓️ التاريخ: ${new Date().toLocaleDateString(isAr ? "ar-OM" : "en-US")}

💰 *صافي الربح الحقيقي:* ${overview.netProfit.toFixed(2)} ${currency} (هامش ${overview.netMarginPercent.toFixed(1)}%)
📦 *إجمالي المبيعات:* ${overview.grossSales.toFixed(2)} ${currency}
📉 *تكلفة البضاعة (COGS):* ${overview.totalCogs.toFixed(2)} ${currency}
🚚 *تكلفة الشحن والتوصيل:* ${overview.totalShippingCosts.toFixed(2)} ${currency}
📢 *إنفاق الإعلانات:* ${overview.totalAdSpend.toFixed(2)} ${currency}

⚠️ *تسريبات الأرباح المكتشفة (${leaks.length} تسريب):*
🔴 مؤكدة (Tier 1): ${overview.confirmedLeaksAmount.toFixed(2)} ${currency}
🟡 تحتاج مراجعة (Tier 2): ${overview.estimatedLeaksAmount.toFixed(2)} ${currency}

✅ *المبالغ المسترجعة حتى الآن:* ${overview.totalRecoveredAmount.toFixed(2)} ${currency}

👉 راجع كافة التفاصيل وسد التسريبات من لوحتك: https://growlab.om/dashboard`;
  }, [overview, leaks, currency, isAr]);

  return (
    <div className="space-y-8">
      {/* 1. TOP HERO BANNER: RECOVERED MONEY COUNTER & PAYMENT METHOD SELECTOR */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                <Sparkles className="size-3.5" />
                {isAr ? "عداد المبالغ المسترجعة والمحمية" : "Recovered & Protected Money Counter"}
              </div>
              <h2 className="mt-1 text-2xl font-black text-frost sm:text-3xl">
                {isAr ? `وفّرنا لك ` : `Saved you `}
                <span className="text-emerald-600 font-mono">
                  {overview.totalRecoveredAmount.toLocaleString()} {currency}
                </span>
                {isAr ? ` حتى الآن` : ` so far`}
              </h2>
              <p className="mt-0.5 text-xs text-frost-dim">
                {isAr
                  ? "إجمالي مبالغ الحملات الخاسرة الموقوفة، المنتجات المعاد تسعيرها، ومستحقات الشحن المستردة."
                  : "Cumulative recovered leaks across paused losing adsets, repriced SKUs, and settled courier payouts."}
              </p>
            </div>
          </div>

          {/* Payment Method Switcher (Auto-activates Courier Reconciliation if COD) */}
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-medium text-frost-dim">
              {isAr ? "طريقة دفع المتجر الحالية:" : "Current Store Payment Mix:"}
            </span>
            <div className="flex rounded-xl border border-line bg-slate-50 p-1">
              {[
                { id: "COD", label: isAr ? "دفع عند الاستلام (COD)" : "COD", icon: Truck },
                { id: "ELECTRONIC", label: isAr ? "دفع إلكتروني / بطاقات" : "Card / Online", icon: DollarSign },
                { id: "MIXED", label: isAr ? "مختلط (COD + بطاقة)" : "Mixed", icon: Layers },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    paymentMethod === m.id
                      ? "bg-frost text-white shadow-xs"
                      : "text-frost-dim hover:text-frost"
                  }`}
                >
                  <m.icon className="size-3.5" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
            {paymentMethod === "COD" || paymentMethod === "MIXED" ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="size-3.5" />
                {isAr ? "نظام تسوية شحن COD مفعّل تلقائياً" : "COD Shipping Reconciliation Active"}
              </span>
            ) : null}
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {/* Net Profit */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="text-xs font-bold text-emerald-900">{isAr ? "صافي الربح الحقيقي" : "True Net Profit"}</p>
            <p className="mt-1 font-mono text-2xl font-black text-emerald-700 sm:text-3xl">
              {overview.netProfit.toFixed(2)} <span className="text-xs">{currency}</span>
            </p>
            <p className="mt-1 text-[11px] font-medium text-emerald-800">
              {isAr ? `هامش صافي: ${overview.netMarginPercent.toFixed(1)}%` : `Net Margin: ${overview.netMarginPercent.toFixed(1)}%`}
            </p>
          </div>

          {/* Gross Sales */}
          <div className="rounded-2xl border border-line bg-[#f8fafc] p-4">
            <p className="text-xs font-medium text-frost-dim">{isAr ? "إجمالي المبيعات" : "Gross Revenue"}</p>
            <p className="mt-1 font-mono text-xl font-extrabold text-frost sm:text-2xl">
              {overview.grossSales.toFixed(2)} <span className="text-xs text-frost-dim">{currency}</span>
            </p>
            <p className="mt-1 text-[11px] text-frost-dim">{isAr ? "قبل خصم التكاليف" : "Before deductions"}</p>
          </div>

          {/* COGS + Shipping */}
          <div className="rounded-2xl border border-line bg-[#f8fafc] p-4">
            <p className="text-xs font-medium text-frost-dim">{isAr ? "تكلفة المنتجات والشحن" : "COGS & Shipping"}</p>
            <p className="mt-1 font-mono text-xl font-extrabold text-slate-800 sm:text-2xl">
              {(overview.totalCogs + overview.totalShippingCosts).toFixed(2)}{" "}
              <span className="text-xs text-frost-dim">{currency}</span>
            </p>
            <p className="mt-1 text-[11px] text-frost-dim">{isAr ? "التكلفة المباشرة للطلبات" : "Direct fulfillment costs"}</p>
          </div>

          {/* Ad Spend */}
          <div className="rounded-2xl border border-line bg-[#f8fafc] p-4">
            <p className="text-xs font-medium text-frost-dim">{isAr ? "إنفاق الإعلانات" : "Total Ad Spend"}</p>
            <p className="mt-1 font-mono text-xl font-extrabold text-slate-800 sm:text-2xl">
              {overview.totalAdSpend.toFixed(2)} <span className="text-xs text-frost-dim">{currency}</span>
            </p>
            <p className="mt-1 text-[11px] text-frost-dim">{isAr ? "ميتا وسناب شات وجوجل" : "Meta, Snapchat & Google"}</p>
          </div>

          {/* Total Detected Leaks */}
          <div className="col-span-2 rounded-2xl border border-rose-200 bg-rose-50/60 p-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-rose-900">{isAr ? "تسريبات ربح مكتشفة" : "Active Profit Leaks"}</p>
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                {overview.leaksCount.total}
              </span>
            </div>
            <p className="mt-1 font-mono text-2xl font-black text-rose-600 sm:text-3xl">
              {overview.totalDetectedLeaksAmount.toFixed(2)} <span className="text-xs">{currency}</span>
            </p>
            <p className="mt-1 text-[11px] font-bold text-rose-800">
              {isAr
                ? `${overview.leaksCount.tier1} مؤكدة (Tier 1) • ${overview.leaksCount.tier2} للمراجعة`
                : `${overview.leaksCount.tier1} Confirmed • ${overview.leaksCount.tier2} Review`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        {[
          { id: "overview", label: isAr ? "نظرة عامة والتحليل" : "Overview & Analytics", icon: Layers },
          {
            id: "leaks",
            label: isAr
              ? `مركز التسريبات (${overview.leaksCount.total})`
              : `Leak Center (${overview.leaksCount.total})`,
            icon: AlertTriangle,
            badge: overview.leaksCount.total > 0 ? "rose" : null,
          },
          { id: "products", label: isAr ? "المنتجات والتكلفة (COGS)" : "Products & COGS", icon: Package },
          { id: "campaigns", label: isAr ? "أداء الحملات الإعلانية" : "Ad Campaigns", icon: DollarSign },
          ...(paymentMethod === "COD" || paymentMethod === "MIXED"
            ? [
                {
                  id: "reconciliation",
                  label: isAr ? "تسوية شحن COD" : "COD Courier Reconciliation",
                  icon: Truck,
                  badge: reconciliation.discrepancies.length > 0 ? "amber" : null,
                },
              ]
            : []),
          { id: "ai_parser", label: isAr ? "معالج الكشوفات الذكي" : "AI Statement Tool", icon: Sparkles },
          { id: "weekly_digest", label: isAr ? "الملخص الأسبوعي" : "Weekly Digest", icon: FileText },
          { id: "referral", label: isAr ? "برنامج إحالة التجار" : "Referral Program", icon: Share2 },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id as any)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeSubTab === item.id
                ? "bg-frost text-white shadow-xs"
                : "border border-line bg-white text-frost-dim hover:bg-slate-50 hover:text-frost"
            }`}
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENTS */}

      {/* TAB: LEAK CENTER (MULTI-TIER CONFIDENCE SYSTEM) */}
      {activeSubTab === "leaks" && (
        <div className="space-y-6">
          {/* Multi-Tier Filter & Explanation */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-frost">{isAr ? "تصفية حسب هرم الثقة:" : "Filter by Confidence Tier:"}</span>
              <div className="flex rounded-lg border border-line bg-slate-50 p-0.5 text-xs">
                <button
                  onClick={() => setLeakTierFilter("ALL")}
                  className={`rounded-md px-3 py-1 font-semibold transition ${
                    leakTierFilter === "ALL" ? "bg-white text-frost shadow-xs font-bold" : "text-frost-dim"
                  }`}
                >
                  {isAr ? `الكل (${leaks.length})` : `All (${leaks.length})`}
                </button>
                <button
                  onClick={() => setLeakTierFilter("TIER_1")}
                  className={`rounded-md px-3 py-1 font-semibold transition ${
                    leakTierFilter === "TIER_1" ? "bg-rose-600 text-white font-bold" : "text-frost-dim"
                  }`}
                >
                  {isAr ? `Tier 1: مؤكدة (${overview.leaksCount.tier1})` : `Tier 1: Confirmed (${overview.leaksCount.tier1})`}
                </button>
                <button
                  onClick={() => setLeakTierFilter("TIER_2")}
                  className={`rounded-md px-3 py-1 font-semibold transition ${
                    leakTierFilter === "TIER_2" ? "bg-amber-600 text-white font-bold" : "text-frost-dim"
                  }`}
                >
                  {isAr ? `Tier 2: تحتاج مراجعة (${overview.leaksCount.tier2})` : `Tier 2: Review (${overview.leaksCount.tier2})`}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-frost-dim">
              <Info className="size-4 text-frost-faint" />
              <span>
                {isAr
                  ? "هرم الثقة يمنع التنبيهات المضللة: المستوى 1 مؤكد برقم البوليصة أو معادلات الحساب الحتمية."
                  : "Deterministic Tier 1 rules eliminate false positives. Tier 2 flags fuzzy estimates for manual review."}
              </span>
            </div>
          </div>

          {/* Leaks Cards Grid */}
          {filteredLeaks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center">
              <CheckCircle2 className="size-12 text-emerald-600" />
              <h3 className="mt-4 text-lg font-bold text-emerald-950">
                {isAr ? "ممتاز! لا توجد تسريبات أرباح مفتوحة حالياً" : "No open profit leaks detected!"}
              </h3>
              <p className="mt-1 text-xs text-emerald-800">
                {isAr
                  ? "جميع الحملات والمنتجات وتدقيقات الشحن مطابقة بنسبة 100%."
                  : "All campaigns, SKUs, and courier payouts are healthy and fully reconciled."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredLeaks.map((leak) => {
                const isTier1 = leak.tier === "TIER_1_CONFIRMED";
                return (
                  <div
                    key={leak.id}
                    className={`flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-xs ${
                      isTier1
                        ? "border-rose-300 bg-rose-50/30 hover:border-rose-400"
                        : "border-amber-300 bg-amber-50/30 hover:border-amber-400"
                    }`}
                  >
                    <div>
                      {/* Badge & Amount Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold ${
                              isTier1 ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                            }`}
                          >
                            <AlertTriangle className="size-3" />
                            {isTier1
                              ? isAr
                                ? "تسريب مكتشف ومؤكد (Tier 1)"
                                : "Confirmed Leak (Tier 1)"
                              : isAr
                                ? "حالة تحتاج مراجعة إضافية (Tier 2)"
                                : "Needs Review (Tier 2)"}
                          </span>
                          <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-mono text-frost-dim border border-line">
                            ثقة {(leak.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="text-end">
                          <span className="font-mono text-xl font-black text-rose-600">
                            -{leak.estimatedLeakAmount.toFixed(2)} {currency}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="mt-3 text-base font-bold text-slate-900">
                        {isAr ? leak.titleAr : leak.titleEn}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {isAr ? leak.descriptionAr : leak.descriptionEn}
                      </p>

                      {/* Evidence & Calculation Box */}
                      <div className="mt-3 rounded-xl border border-line bg-white p-3 text-[11px]">
                        <span className="font-bold text-frost">{isAr ? "معادلة وسند الكشف:" : "Audit Evidence:"}</span>{" "}
                        <span className="font-mono text-frost-dim">{leak.evidence.calculationBreakdown}</span>
                        {leak.evidence.matchingCriteria && (
                          <div className="mt-1 text-frost-dim">
                            <span className="font-semibold">{isAr ? "قاعدة المطابقة:" : "Matching Rule:"}</span>{" "}
                            {leak.evidence.matchingCriteria}
                          </div>
                        )}
                      </div>

                      {/* Recommended Action */}
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
                        <span className="font-bold text-emerald-900">{isAr ? "الإجراء المقترح لسد النزيف:" : "Action:"}</span>{" "}
                        {isAr ? leak.recommendedActionAr : leak.recommendedActionEn}
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                      <button
                        onClick={() => setSelectedLeakDetail(leak)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-frost hover:underline"
                      >
                        <Eye className="size-3.5" />
                        <span>{isAr ? "عرض سجل التدقيق (Audit Trail)" : "View Audit Trail"}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {leak.source === "SHIPPING_RECONCILIATION" && (
                          <button
                            onClick={() => {
                              alert(
                                isAr
                                  ? `تم تصدير إشعار مطالبة رسمية لشركة الشحن برقم البوليصة #${leak.entityName}`
                                  : `Dispute claim exported for #${leak.entityName}`
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-frost hover:bg-slate-50"
                          >
                            <Download className="size-3.5" />
                            <span>{isAr ? "تصدير مطالبة للشحن" : "Export Dispute"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveLeak(leak)}
                          className="gl-btn-primary py-1.5 px-3 text-xs font-semibold"
                        >
                          <Check className="size-3.5" />
                          <span>{isAr ? "تم حل وسد التسريب ✓" : "Mark as Resolved ✓"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: PRODUCTS & COGS COSTING */}
      {activeSubTab === "products" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-frost">{isAr ? "إدارة تكلفة المنتجات وحساب الهامش الحقيقي" : "Product COGS & Real Margins"}</h3>
              <p className="text-xs text-frost-dim">
                {isAr
                  ? "احتساب دقيق لهامش الربح الصافي لكل منتج بعد خصم تكلفة التوريد، التوصيل، المرتجعات، وحصة الإعلانات."
                  : "Unit-level true net profit calculation factoring COGS, shipping, return allowances, and ad allocations."}
              </p>
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="gl-btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-2"
            >
              <Plus className="size-4" />
              <span>{isAr ? "إضافة منتج جديد" : "Add Product"}</span>
            </button>
          </div>

          {/* Add Product Modal */}
          {isAddingProduct && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-md">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h4 className="font-bold text-frost">{isAr ? "إضافة منتج جديد لحساب صافي الربح" : "Add New Product"}</h4>
                <button onClick={() => setIsAddingProduct(false)} className="text-frost-dim hover:text-frost">
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-frost">{isAr ? "اسم المنتج" : "Product Title"}</label>
                  <input
                    type="text"
                    required
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    placeholder={isAr ? "عطر اللبان الملكي" : "Royal Perfume"}
                    className="gl-input mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-frost">{isAr ? "سعر البيع للعميل" : "Selling Price"}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })}
                    className="gl-input mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-frost">{isAr ? "تكلفة المنتج (COGS)" : "Unit COGS"}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newProduct.cogs}
                    onChange={(e) => setNewProduct({ ...newProduct, cogs: Number(e.target.value) })}
                    className="gl-input mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-frost">{isAr ? "رسوم الشحن للقطعة" : "Shipping Fee"}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newProduct.shippingFee}
                    onChange={(e) => setNewProduct({ ...newProduct, shippingFee: Number(e.target.value) })}
                    className="gl-input mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-frost">{isAr ? "نسبة المرتجع المتوقعة %" : "Return Rate %"}</label>
                  <input
                    type="number"
                    value={newProduct.returnRate}
                    onChange={(e) => setNewProduct({ ...newProduct, returnRate: Number(e.target.value) })}
                    className="gl-input mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-frost">{isAr ? "حصة الإعلان لكل بيعة" : "Ad Spend Per Unit"}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProduct.adCostAllocation}
                    onChange={(e) => setNewProduct({ ...newProduct, adCostAllocation: Number(e.target.value) })}
                    className="gl-input mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-frost">{isAr ? "الكمية المباعة الشهرية" : "Units Sold"}</label>
                  <input
                    type="number"
                    value={newProduct.unitsSold}
                    onChange={(e) => setNewProduct({ ...newProduct, unitsSold: Number(e.target.value) })}
                    className="gl-input mt-1 text-xs font-mono"
                  />
                </div>

                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <button type="submit" className="gl-btn-primary w-full py-2.5 text-xs font-bold justify-center">
                    {isAr ? "حفظ واحتساب الربح" : "Save & Calculate"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
            <table className="w-full text-start text-xs">
              <thead className="border-b border-line bg-slate-50 text-frost-dim">
                <tr>
                  <th className="p-3.5 text-start font-bold">{isAr ? "المنتج" : "Product"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "سعر البيع" : "Price"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "تكلفة البضاعة (COGS)" : "COGS"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "الشحن والإعلانات" : "Ship & Ads"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "صافي ربح القطعة" : "Unit Net Profit"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "إجمالي الصافي الشهري" : "Total Monthly Net"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "حالة الهامش" : "Margin Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((prod) => {
                  const pAnalysis = calculateProductNetProfit(prod);
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5">
                        <p className="font-bold text-frost">{prod.title}</p>
                        <p className="font-mono text-[11px] text-frost-dim">{prod.sku}</p>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-frost">
                        {prod.sellingPrice.toFixed(2)} {currency}
                      </td>
                      <td className="p-3.5 text-center font-mono text-frost-dim">
                        {prod.cogs.toFixed(2)} {currency}
                      </td>
                      <td className="p-3.5 text-center font-mono text-frost-dim">
                        {(prod.shippingFee + prod.adCostAllocation).toFixed(2)} {currency}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold">
                        <span className={pAnalysis.unitNetProfit >= 0 ? "text-emerald-700" : "text-rose-600"}>
                          {pAnalysis.unitNetProfit.toFixed(2)} {currency}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold">
                        <span className={pAnalysis.totalNetProfit >= 0 ? "text-emerald-700" : "text-rose-600"}>
                          {pAnalysis.totalNetProfit.toFixed(2)} {currency}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {pAnalysis.isNegativeMargin ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                            <AlertTriangle className="size-3" />
                            {isAr ? "هامش سالب (تسريب!)" : "Negative Margin"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            <Check className="size-3" />
                            {isAr ? `مربح (${pAnalysis.unitMarginPercent.toFixed(0)}%)` : `Profitable (${pAnalysis.unitMarginPercent.toFixed(0)}%)`}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: AD CAMPAIGNS PERFORMANCE */}
      {activeSubTab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-frost">{isAr ? "تدقيق أداء الحملات الإعلانية بصافي الربح الحقيقي" : "Ad Campaigns Real Net Profit"}</h3>
              <p className="text-xs text-frost-dim">
                {isAr
                  ? "لا ننظر فقط إلى ROAS المضلل؛ نحسب صافي الربح الفعلي بعد خصم تكلفة المنتجات والشحن والإعلانات."
                  : "True profitability per ad campaign after deducting actual COGS, fulfillment, and ad budget."}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
            <table className="w-full text-start text-xs">
              <thead className="border-b border-line bg-slate-50 text-frost-dim">
                <tr>
                  <th className="p-3.5 text-start font-bold">{isAr ? "الحملة والمنصة" : "Campaign & Platform"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "المصروف" : "Spend"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "المبيعات المنسوبة" : "Attributed Sales"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "COGS + الشحن" : "COGS & Ship"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "صافي الربح الفعلي" : "Real Net Profit"}</th>
                  <th className="p-3.5 text-center font-bold">{isAr ? "التقييم والتوصية" : "Audit Recommendation"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {campaigns.map((camp) => {
                  const cAnalysis = calculateCampaignNetProfit(camp);
                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5">
                        <p className="font-bold text-frost">{camp.campaignName}</p>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-frost-dim">
                          {camp.platform}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-frost">
                        {camp.spend.toFixed(2)} {currency}
                      </td>
                      <td className="p-3.5 text-center font-mono text-frost-dim">
                        {camp.attributedSales.toFixed(2)} {currency} ({camp.ordersCount} {isAr ? "طلب" : "orders"})
                      </td>
                      <td className="p-3.5 text-center font-mono text-frost-dim">
                        {(camp.cogsTotal + camp.shippingTotal).toFixed(2)} {currency}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold">
                        <span className={cAnalysis.netProfit >= 0 ? "text-emerald-700" : "text-rose-600"}>
                          {cAnalysis.netProfit.toFixed(2)} {currency}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {cAnalysis.isLosingCampaign ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                            <AlertTriangle className="size-3" />
                            {isAr ? "حملة خاسرة (أوقفها فوراً!)" : "Losing Campaign (Pause)"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                            <Check className="size-3" />
                            {isAr ? "حملة رابحة وممتازة" : "Profitable Campaign"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: COD COURIER RECONCILIATION */}
      {activeSubTab === "reconciliation" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                <Truck className="size-3.5" />
                {isAr ? "مطابقة كشوفات شركات الشحن (COD)" : "COD Courier Statement Reconciliation"}
              </div>
              <h3 className="mt-2 text-xl font-bold text-frost">
                {isAr ? "مطابقة بوالص التوصيل واستخراج المبالغ المفقودة" : "Waybill Matching & Payout Discrepancy Finder"}
              </h3>
              <p className="mt-1 text-xs text-frost-dim">
                {isAr
                  ? "يقارن النظام كل طلب دفع عند الاستلام مع كشف حساب شركة الشحن (أرامكس، سمسا، J&T) لكشف أي طلب سُلّم ولم يُحول مبلغه."
                  : "Cross-checks registered orders against courier payout batches with deterministic Waybill/Order matching."}
              </p>
            </div>

            {/* Upload Button */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => {
                  setUploadType("COURIER");
                  fileInputRef.current?.click();
                }}
                className="gl-btn-primary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-2"
              >
                <Upload className="size-4" />
                <span>{isAr ? "رفع كشف حساب الشحن (Excel / CSV)" : "Upload Courier Sheet"}</span>
              </button>
            </div>
          </div>

          {uploadSuccessMsg && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900">
              {uploadSuccessMsg}
            </div>
          )}

          {/* Reconciliation Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-medium text-frost-dim">{isAr ? "طلبات COD المفحوصة" : "COD Orders Audited"}</p>
              <p className="mt-1 font-mono text-2xl font-black text-frost">{reconciliation.totalOrdersChecked}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-medium text-frost-dim">{isAr ? "مطابقات تامة (Tier 1)" : "Exact Matches"}</p>
              <p className="mt-1 font-mono text-2xl font-black text-emerald-600">{reconciliation.matchedExactCount}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-medium text-frost-dim">{isAr ? "مطابقات تقريبية (Tier 2)" : "Fuzzy Matches"}</p>
              <p className="mt-1 font-mono text-2xl font-black text-amber-600">{reconciliation.matchedFuzzyCount}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
              <p className="text-xs font-bold text-rose-900">{isAr ? "عجز وتحصيلات ضائعة" : "Total Shortfall"}</p>
              <p className="mt-1 font-mono text-2xl font-black text-rose-600">
                {reconciliation.totalShortfall.toFixed(2)} {currency}
              </p>
            </div>
          </div>

          {/* Discrepancies Table */}
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
            <div className="border-b border-line bg-slate-50 p-4 font-bold text-frost">
              {isAr ? "سجل مقارنة البوالص والكشوفات" : "Detailed Waybill Comparison Log"}
            </div>
            <table className="w-full text-start text-xs">
              <thead className="border-b border-line bg-slate-50/50 text-frost-dim">
                <tr>
                  <th className="p-3 text-start font-bold">{isAr ? "رقم الطلب والبوليصة" : "Order / Waybill"}</th>
                  <th className="p-3 text-center font-bold">{isAr ? "شركة الشحن" : "Courier"}</th>
                  <th className="p-3 text-center font-bold">{isAr ? "المبلغ المتوقع" : "Expected COD"}</th>
                  <th className="p-3 text-center font-bold">{isAr ? "المحول فعلياً" : "Remitted"}</th>
                  <th className="p-3 text-center font-bold">{isAr ? "الفرق المالي" : "Discrepancy"}</th>
                  <th className="p-3 text-center font-bold">{isAr ? "مستوى الثقة" : "Confidence Tier"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {courierStatements.map((stmt) => {
                  const diff = stmt.codCollectedAmount - stmt.codRemittedAmount;
                  const isDeliveredMissing = stmt.courierStatus === "DELIVERED" && stmt.codRemittedAmount <= 0;
                  const isUnderpaid = stmt.codRemittedAmount > 0 && diff > 0.2;

                  return (
                    <tr key={stmt.id} className="hover:bg-slate-50/70">
                      <td className="p-3">
                        <p className="font-bold text-frost">{stmt.waybillNumber}</p>
                        <p className="font-mono text-[11px] text-frost-dim">Ref: {stmt.orderReference || stmt.customerPhone || "N/A"}</p>
                      </td>
                      <td className="p-3 text-center text-frost-dim">{stmt.courierName}</td>
                      <td className="p-3 text-center font-mono font-bold text-frost">
                        {stmt.codCollectedAmount.toFixed(2)} {currency}
                      </td>
                      <td className="p-3 text-center font-mono text-frost-dim">
                        {stmt.codRemittedAmount.toFixed(2)} {currency}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {diff > 0 ? (
                          <span className="text-rose-600">-{diff.toFixed(2)} {currency}</span>
                        ) : (
                          <span className="text-emerald-700">0.00 {currency} (مطابق)</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isDeliveredMissing || isUnderpaid ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            <AlertTriangle className="size-3" />
                            {isAr ? "Tier 1: نقص مؤكد" : "Tier 1: Discrepancy"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <Check className="size-3" />
                            {isAr ? "مطابق تماماً ✓" : "Fully Settled ✓"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: INTERNAL AI STATEMENT PARSER */}
      {activeSubTab === "ai_parser" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 border border-violet-200">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-frost">
                  {isAr ? "أداة الذكاء الاصطناعي الداخلية لمعالجة الكشوفات المعقدة" : "Internal AI Statement Processing Tool"}
                </h3>
                <p className="text-xs text-frost-dim">
                  {isAr
                    ? "الصق أي نص غير منظم أو كشف حساب معقد، وسيقوم نموذج الذكاء الاصطناعي باستخراج البوالص والمبالغ المنظمة وإرسالها للمطابقة (Tier 2)."
                    : "Parse unstructured courier statements or messy tables into clean records. Tagged as Tier 2 for internal verification."}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block text-xs font-bold text-frost">
                {isAr ? "الصق نص كشف الشحن أو بيانات الجدول هنا:" : "Paste raw statement text here:"}
              </label>
              <textarea
                rows={5}
                value={rawAiText}
                onChange={(e) => setRawAiText(e.target.value)}
                placeholder={`ARX-OM-99210 \t GL-ORD-901 \t 96891234567 \t 28.00 \t 0.00 \t DELIVERED\nAWB-88301 \t GL-ORD-902 \t 96898765432 \t 16.50 \t 12.50 \t DELIVERED`}
                className="gl-input font-mono text-xs"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-frost-dim">
                  {isAr
                    ? "ملاحظة أمنية: البيانات تُعالج كأداة تنظيم داخلية فقط وتخضع لهرم التحقق متعدد الطبقات."
                    : "Security notice: AI-extracted records are tagged as Tier 2 and require human verification."}
                </p>
                <button
                  onClick={runAiParser}
                  disabled={isAiProcessing || !rawAiText.trim()}
                  className="gl-btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2"
                >
                  {isAiProcessing ? (
                    <>
                      <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>{isAr ? "جاري استخراج السجلات..." : "Extracting records..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      <span>{isAr ? "استخراج البيانات بذكاء" : "Extract Records with AI"}</span>
                    </>
                  )}
                </button>
              </div>

              {aiResultNote && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900">
                  {aiResultNote}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: WEEKLY DIGEST GENERATOR */}
      {activeSubTab === "weekly_digest" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-frost" />
                <div>
                  <h3 className="font-bold text-frost">{isAr ? "ملخص التسريبات الأسبوعي التلقائي" : "Weekly Profit Leak Digest"}</h3>
                  <p className="text-xs text-frost-dim">
                    {isAr ? "تقرير ملخص جاهز للمشاركة والإرسال عبر واتساب أو البريد." : "Automated weekly summary ready for WhatsApp or email."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(weeklyDigestText);
                  alert(isAr ? "تم نسخ التقرير الأسبوعي بنجاح!" : "Weekly digest copied!");
                }}
                className="gl-btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-2"
              >
                <Copy className="size-3.5" />
                <span>{isAr ? "نسخ التقرير لواتساب" : "Copy to WhatsApp"}</span>
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-line bg-[#f8fafc] p-4">
              <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-frost">{weeklyDigestText}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REFERRAL PROGRAM */}
      {activeSubTab === "referral" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <Share2 className="size-6 text-emerald-600" />
              <div>
                <h3 className="text-lg font-bold text-frost">{isAr ? "برنامج إحالة التجار والشركات" : "Merchant Referral Program"}</h3>
                <p className="text-xs text-frost-dim">
                  {isAr
                    ? "شارك رابط الإحالة مع أي تاجر تعرفه: يحصل على خصم 50% على رسوم الأداء للشهر الأول، وتحصل أنت أيضاً على نفس الخصم!"
                    : "Invite fellow e-commerce merchants: Both of you get 50% off performance fees for the first month."}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-frost">{isAr ? "رابط الإحالة الخاص بمتجرك:" : "Your Exclusive Invite Link:"}</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://growlab.om/enter/merchant?ref=GL-MTR-8820"
                    className="gl-input font-mono text-xs"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("https://growlab.om/enter/merchant?ref=GL-MTR-8820");
                      alert(isAr ? "تم نسخ رابط الإحالة!" : "Referral link copied!");
                    }}
                    className="gl-btn-primary py-2.5 px-4 text-xs font-bold shrink-0"
                  >
                    <Copy className="size-3.5" />
                    <span>{isAr ? "نسخ" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 pt-4">
                <div className="rounded-xl border border-line bg-[#f8fafc] p-4 text-center">
                  <p className="text-xs font-medium text-frost-dim">{isAr ? "التجار المسجلين عبرك" : "Referred Merchants"}</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-frost">3</p>
                </div>
                <div className="rounded-xl border border-line bg-[#f8fafc] p-4 text-center">
                  <p className="text-xs font-medium text-frost-dim">{isAr ? "نسبة رسوم الأداء الحالية" : "Active Performance Fee"}</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-emerald-600">5% <span className="text-xs font-normal">(-50% خصم)</span></p>
                </div>
                <div className="rounded-xl border border-line bg-[#f8fafc] p-4 text-center">
                  <p className="text-xs font-medium text-frost-dim">{isAr ? "الوفورات الإضافية من الإحالات" : "Referral Savings"}</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-frost">142.00 {currency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL DETAIL MODAL */}
      {selectedLeakDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-frost" />
                <h4 className="font-bold text-frost">{isAr ? "سجل التدقيق والمطابقة الكامل (Audit Trail)" : "Full Audit Trail Log"}</h4>
              </div>
              <button onClick={() => setSelectedLeakDetail(null)} className="text-frost-dim hover:text-frost">
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl border border-line bg-slate-50 p-3">
                <p className="font-bold text-frost">{selectedLeakDetail.titleAr}</p>
                <p className="text-frost-dim mt-0.5">{selectedLeakDetail.descriptionAr}</p>
              </div>

              <div>
                <p className="font-bold text-frost mb-1.5">{isAr ? "البيانات المقارنة والحسابات الحتمية:" : "Audited Data Points:"}</p>
                <div className="rounded-xl border border-line bg-white p-3 font-mono text-[11px]">
                  <pre className="whitespace-pre-wrap text-slate-700">
                    {JSON.stringify(selectedLeakDetail.evidence.dataPoints, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <p className="font-bold text-frost mb-1.5">{isAr ? "سجل الإجراءات والتحديثات:" : "Audit Log Entries:"}</p>
                <div className="space-y-2">
                  {auditTrail
                    .filter((a) => a.leakId === selectedLeakDetail.id)
                    .map((a) => (
                      <div key={a.id} className="rounded-lg border border-line bg-slate-50/70 p-2.5">
                        <div className="flex items-center justify-between font-mono text-[10px] text-frost-dim">
                          <span>{a.timestamp}</span>
                          <span className="font-bold text-frost">{a.performedBy}</span>
                        </div>
                        <p className="mt-1 text-frost">{a.details}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-line pt-3">
              <button onClick={() => setSelectedLeakDetail(null)} className="gl-btn-primary py-2 px-5 text-xs font-semibold">
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
