"use client";

import { useState, useMemo, useTransition } from "react";
import { useLocale } from "next-intl";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Download,
  Plus,
  ArrowUpRight,
  Sparkles,
  Layers,
  Coins,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Send,
  Zap,
  Info,
  DollarSign,
  Truck,
  Flame,
  FileText,
  Sliders,
} from "lucide-react";
import {
  type MerchantState,
  type ProfitLeakItem,
  type MerchantProduct,
  type AdCampaign,
  type CourierStatementLine,
  type MerchantOrder,
  type ConfidenceTier,
  type PaymentMethod,
  calculateTrueNetProfit,
  runProfitLeakDetection,
  createDefaultMerchantState,
  generateWeeklyExecutiveSummary,
} from "@/lib/profitLeakEngine";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export default function ProfitLeakAuditHub({
  initialState,
  locale = "ar",
}: {
  initialState?: MerchantState;
  locale?: string;
}) {
  const isAr = locale === "ar";
  const [state, setState] = useState<MerchantState>(() => initialState || createDefaultMerchantState("mixed"));
  const [selectedLeakFilter, setSelectedLeakFilter] = useState<"all" | "confirmed" | "needs_review" | "ads" | "products" | "courier">("all");
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "leaks" | "products" | "campaigns" | "courier" | "summary">("overview");
  
  // Modals & Drawers state
  const [auditModalItem, setAuditModalItem] = useState<ProfitLeakItem | null>(null);
  const [isClaimLetterOpen, setIsClaimLetterOpen] = useState(false);
  const [isExecutiveSummaryOpen, setIsExecutiveSummaryOpen] = useState(false);
  const [isAddDataOpen, setIsAddDataOpen] = useState<"product" | "campaign" | "courier" | "order" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New item forms state
  const [newProduct, setNewProduct] = useState<Partial<MerchantProduct>>({
    title: "",
    sku: "",
    category: "عام",
    sellingPrice: 15,
    cogs: 4,
    shippingCost: 1.8,
    returnRatePct: 5,
    adSpendShare: 3,
  });

  const [newCampaign, setNewCampaign] = useState<Partial<AdCampaign>>({
    name: "",
    channel: "Meta (Instagram/FB)",
    spend: 100,
    attributedGrossSales: 350,
    attributedCogs: 90,
    attributedShipping: 25,
    attributedReturns: 15,
  });

  const [newCourierStmt, setNewCourierStmt] = useState<Partial<CourierStatementLine>>({
    trackingNumber: "",
    orderNumber: "",
    customerPhone: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    collectedCodAmount: 25,
    courierFeeCharged: 1.8,
    netPayoutToMerchant: 23.2,
    courierStatus: "DELIVERED",
    courierName: "Aramex Oman",
  });

  // Calculate live metrics
  const metrics = useMemo(() => calculateTrueNetProfit(state), [state]);
  const weeklySummary = useMemo(() => generateWeeklyExecutiveSummary(state), [state]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Action: Mark leak as Recovered
  function handleMarkAsRecovered(leakId: string) {
    setState((prev) => {
      const targetLeak = prev.leaks.find((l) => l.id === leakId);
      if (!targetLeak) return prev;

      const updatedLeaks = prev.leaks.map((l) =>
        l.id === leakId ? { ...l, status: "recovered" as const } : l
      );
      const newRecovered = prev.recoveredTotal + targetLeak.estimatedLossAmount;

      return {
        ...prev,
        leaks: updatedLeaks,
        recoveredTotal: +newRecovered.toFixed(2),
      };
    });

    showToast(isAr ? "تم تحديث الحالة وإضافة المبلغ لعداد الأرباح المسترجعة بنجاح!" : "Leak marked as recovered!");
  }

  // Action: Change payment method
  function handlePaymentMethodChange(newMethod: PaymentMethod) {
    setState((prev) => {
      const nextState: MerchantState = { ...prev, paymentMethod: newMethod };
      nextState.leaks = runProfitLeakDetection(nextState);
      return nextState;
    });
    showToast(isAr ? "تم تحديث طريقة الدفع وإعادة تشغيل محرك المطابقة المالية." : "Payment method updated & rules re-evaluated.");
  }

  // Action: Add new product
  function handleSaveProduct() {
    if (!newProduct.title) return;
    const prod: MerchantProduct = {
      id: `prod-${Date.now()}`,
      sku: newProduct.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      title: newProduct.title,
      category: newProduct.category || "عام",
      sellingPrice: Number(newProduct.sellingPrice) || 10,
      cogs: Number(newProduct.cogs) || 3,
      shippingCost: Number(newProduct.shippingCost) || 1.8,
      returnRatePct: Number(newProduct.returnRatePct) || 5,
      adSpendShare: Number(newProduct.adSpendShare) || 2,
      currency: state.currency,
      totalOrders: 20,
      isActive: true,
    };

    setState((prev) => {
      const next = { ...prev, products: [prod, ...prev.products] };
      next.leaks = runProfitLeakDetection(next);
      return next;
    });

    setIsAddDataOpen(null);
    showToast(isAr ? "تمت إضافة المنتج واحتساب هامش ربحه الصافي!" : "Product saved!");
  }

  // Action: Add new campaign
  function handleSaveCampaign() {
    if (!newCampaign.name) return;
    const camp: AdCampaign = {
      id: `camp-${Date.now()}`,
      name: newCampaign.name,
      channel: (newCampaign.channel as any) || "Meta (Instagram/FB)",
      spend: Number(newCampaign.spend) || 0,
      attributedGrossSales: Number(newCampaign.attributedGrossSales) || 0,
      attributedOrdersCount: 15,
      attributedCogs: Number(newCampaign.attributedCogs) || 0,
      attributedShipping: Number(newCampaign.attributedShipping) || 0,
      attributedReturns: Number(newCampaign.attributedReturns) || 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setState((prev) => {
      const next = { ...prev, campaigns: [camp, ...prev.campaigns] };
      next.leaks = runProfitLeakDetection(next);
      return next;
    });

    setIsAddDataOpen(null);
    showToast(isAr ? "تمت إضافة الحملة وتحليل صافي ربحها الحقيقي!" : "Campaign saved!");
  }

  // Action: Add new courier statement
  function handleSaveCourierStatement() {
    if (!newCourierStmt.trackingNumber) return;
    const stmt: CourierStatementLine = {
      id: `cst-${Date.now()}`,
      trackingNumber: newCourierStmt.trackingNumber,
      orderNumber: newCourierStmt.orderNumber || "",
      customerPhone: newCourierStmt.customerPhone || "",
      deliveryDate: newCourierStmt.deliveryDate || new Date().toISOString().split("T")[0],
      collectedCodAmount: Number(newCourierStmt.collectedCodAmount) || 0,
      courierFeeCharged: Number(newCourierStmt.courierFeeCharged) || 1.8,
      netPayoutToMerchant: Number(newCourierStmt.netPayoutToMerchant) || 0,
      courierStatus: (newCourierStmt.courierStatus as any) || "DELIVERED",
      courierName: newCourierStmt.courierName || "Aramex Oman",
    };

    setState((prev) => {
      const next = { ...prev, courierStatements: [stmt, ...prev.courierStatements] };
      next.leaks = runProfitLeakDetection(next);
      return next;
    });

    setIsAddDataOpen(null);
    showToast(isAr ? "تمت مطابقة كشف الشحن وتحديث التسريبات المكتشفة!" : "Courier line reconciled!");
  }

  // Action: Upload CSV or Excel file
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: "orders" | "campaigns" | "courier") {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (type === "courier") {
          const parsedLines: CourierStatementLine[] = rows.map((r, idx) => ({
            id: `upload-cst-${Date.now()}-${idx}`,
            trackingNumber: String(r["رقم التتبع"] || r["Tracking"] || r["tracking_number"] || r["AWB"] || `TRK-${idx}`),
            orderNumber: String(r["رقم الطلب"] || r["Order"] || r["order_number"] || ""),
            customerPhone: String(r["الهاتف"] || r["Phone"] || ""),
            deliveryDate: String(r["التاريخ"] || r["Date"] || new Date().toISOString().split("T")[0]),
            collectedCodAmount: Number(r["المبلغ المحصل"] || r["Collected"] || r["cod_amount"] || 0),
            courierFeeCharged: Number(r["رسوم الشحن"] || r["Fee"] || 1.8),
            netPayoutToMerchant: Number(r["صافي المستحق"] || r["Payout"] || 0),
            courierStatus: "DELIVERED",
            courierName: String(r["شركة الشحن"] || r["Courier"] || "Courier"),
          }));

          setState((prev) => {
            const next = { ...prev, courierStatements: [...parsedLines, ...prev.courierStatements] };
            next.leaks = runProfitLeakDetection(next);
            return next;
          });
          showToast(isAr ? `تمت قراءة ${parsedLines.length} سطر من كشف الشحن ومطابقتها فوراً!` : `Parsed and matched ${parsedLines.length} courier lines!`);
        }
      } catch (err) {
        showToast(isAr ? "حدث خطأ أثناء معالجة الملف، يرجى التأكد من التنسيق." : "File parsing error.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  }

  // Filtered leaks list
  const filteredLeaks = useMemo(() => {
    return state.leaks.filter((leak) => {
      if (selectedLeakFilter === "confirmed") return leak.isConfirmed && leak.status === "active";
      if (selectedLeakFilter === "needs_review") return leak.requiresReview && leak.status === "active";
      if (selectedLeakFilter === "ads") return leak.sourceCategory === "ad_campaign";
      if (selectedLeakFilter === "products") return leak.sourceCategory === "product_pricing";
      if (selectedLeakFilter === "courier") return leak.sourceCategory === "courier_settlement";
      return leak.status === "active";
    });
  }, [state.leaks, selectedLeakFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Recovered Money Counter + 60-Day Founder Review Guarantee */}
      <div className="grid lg:grid-cols-12 gap-4 items-stretch">
        {/* Glowing Recovered Money Counter */}
        <div className="lg:col-span-7 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 end-0 size-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                <Coins className="size-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>{isAr ? "عداد الأرباح المسترجعة والموفّرة" : "Recovered & Protected Profit Counter"}</span>
              </span>
              <span className="text-[11px] text-frost-dim">
                {isAr ? "عمولة الأداء 10% فقط على ما يتم استرداده" : "10% performance fee only on recovered"}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="font-mono text-3xl sm:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.recoveredMoneyTotal.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-frost-dim">{state.currency}</span>
            </div>

            <p className="text-xs text-frost-dim max-w-lg leading-relaxed">
              {isAr
                ? "مجموع المبالغ التي ساعدك Growlab في استردادها من فروقات شركات الشحن ووقف هدر الحملات الإعلانية الخاسرة حتى اليوم."
                : "Total money Growlab helped you recover from courier discrepancies and stop leaking into losing ad campaigns."}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-frost-dim">
                {isAr ? "وفّرت على متجرك حتى الآن: " : "Saved your store so far: "}
                <strong className="text-frost font-mono">{metrics.recoveredMoneyTotal.toFixed(2)} {state.currency}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExecutiveSummaryOpen(true)}
              className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              <FileText className="size-3.5" />
              <span>{isAr ? "تصدير التقرير التنفيذي الأسبوعي" : "Export Weekly Report"}</span>
            </button>
          </div>
        </div>

        {/* 60-Day Founder Review & Method Selector */}
        <div className="lg:col-span-5 rounded-3xl border border-line bg-surface/90 backdrop-blur-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
              <ShieldCheck className="size-4 text-amber-600 shrink-0" />
              <span>{isAr ? "طبقة التحقق البشري المزدوج (ضمان 60 يوماً)" : "Human Verification Layer (60-Day Guarantee)"}</span>
            </div>
            <p className="text-xs text-frost-dim leading-relaxed mb-4">
              {isAr
                ? "خلال أول شهرين من تشغيل متجرك، تخضع كافة التسريبات المكتشفة لفحص وتدقيق يدوي من فريق الخبراء لضمان دقة 100% قبل تقديم المطالبات."
                : "During initial operations, all detected leaks undergo double human verification to guarantee 100% precision before claims."}
            </p>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-frost flex items-center justify-between">
                <span>{isAr ? "طريقة الدفع الحالية للمتجر:" : "Store Payment Method:"}</span>
                <span className="text-frost-faint">{isAr ? "يحدد قنوات التدقيق النشطة" : "Activates audit rules"}</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: "mixed", labelAr: "مختلط (COD + إلكتروني)", labelEn: "Mixed (COD + Online)" },
                  { id: "cod", labelAr: "COD فقط", labelEn: "COD Only" },
                  { id: "electronic", labelAr: "إلكتروني / بطاقات", labelEn: "Online Only" },
                  { id: "bank_transfer", labelAr: "تحويل بنكي / WA", labelEn: "Bank Transfer" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handlePaymentMethodChange(m.id as PaymentMethod)}
                    className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                      state.paymentMethod === m.id
                        ? "border-signal bg-signal/10 text-signal font-bold"
                        : "border-line bg-surface-raised/50 text-frost-dim hover:text-frost"
                    }`}
                  >
                    {isAr ? m.labelAr : m.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs text-frost-dim">
            <span>{isAr ? "قاعدة البيانات:" : "Audit Engine:"}</span>
            <span className="font-mono text-emerald-600 font-bold">Rule-Based Multi-Tier v2.4</span>
          </div>
        </div>
      </div>

      {/* Main KPI Bar: True Net Profit Waterfall Formula */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Gross Sales */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-frost-dim block">{isAr ? "إجمالي المبيعات" : "Gross Sales"}</span>
          <div className="font-mono text-lg sm:text-xl font-bold text-frost mt-1">
            {metrics.grossSales.toFixed(2)} <span className="text-xs font-normal">{state.currency}</span>
          </div>
          <span className="text-[10px] text-frost-faint">{metrics.successfulOrdersCount} {isAr ? "طلب مسلّم" : "orders"}</span>
        </div>

        {/* 2. Total COGS */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-frost-dim block">{isAr ? "تكلفة المنتجات (COGS)" : "Total COGS"}</span>
          <div className="font-mono text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            -{metrics.totalCogs.toFixed(2)} <span className="text-xs font-normal">{state.currency}</span>
          </div>
          <span className="text-[10px] text-frost-faint">{isAr ? "تكلفة جملة وتوريد" : "inventory cost"}</span>
        </div>

        {/* 3. Shipping & Delivery */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-frost-dim block">{isAr ? "رسوم الشحن والتوصيل" : "Shipping Costs"}</span>
          <div className="font-mono text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            -{metrics.totalShippingCosts.toFixed(2)} <span className="text-xs font-normal">{state.currency}</span>
          </div>
          <span className="text-[10px] text-frost-faint">{isAr ? "لشركات التوصيل" : "courier fees"}</span>
        </div>

        {/* 4. Returns & RTO Loss */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-frost-dim block">{isAr ? "هدر المرتجعات (RTO)" : "Returns & RTO"}</span>
          <div className="font-mono text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            -{metrics.totalReturnsAndRtoLoss.toFixed(2)} <span className="text-xs font-normal">{state.currency}</span>
          </div>
          <span className="text-[10px] text-frost-faint">{metrics.returnRatePercentage}% {isAr ? "نسبة المرتجع" : "return rate"}</span>
        </div>

        {/* 5. Total Ad Spend */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-frost-dim block">{isAr ? "الصرف الإعلاني" : "Ad Spend"}</span>
          <div className="font-mono text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            -{metrics.totalAdSpend.toFixed(2)} <span className="text-xs font-normal">{state.currency}</span>
          </div>
          <span className="text-[10px] text-frost-faint">ROAS: {metrics.roas.toFixed(2)}x</span>
        </div>

        {/* 6. True Net Profit (The Ultimate Goal) */}
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">{isAr ? "صافي الربح الحقيقي" : "True Net Profit"}</span>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {metrics.trueNetProfit.toFixed(2)} <span className="text-xs font-normal">{state.currency}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            {isAr ? "هامش صافي: " : "Net Margin: "} {metrics.netMarginPercentage}%
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "overview", labelAr: "مركز تسريبات الأرباح", labelEn: "Profit Leak Center", count: metrics.leaksCount, badgeColor: "bg-rose-500 text-white" },
            { id: "products", labelAr: "ربحية المنتجات (COGS)", labelEn: "Products Net Profit", count: state.products.length },
            { id: "campaigns", labelAr: "تدقيق الحملات الإعلانية", labelEn: "Ad Campaigns Profit", count: state.campaigns.length },
            ...(state.paymentMethod === "cod" || state.paymentMethod === "mixed"
              ? [{ id: "courier", labelAr: "مطابقة كشوف الشحن (COD)", labelEn: "Courier Reconciliation", count: state.courierStatements.length }]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-surface-raised/60 text-frost-dim hover:text-frost hover:bg-surface-raised"
              }`}
            >
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab.badgeColor || "bg-slate-200 dark:bg-slate-700 text-frost"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Fast Action Buttons */}
        <div className="flex items-center gap-2">
          {activeSubTab === "products" && (
            <button
              type="button"
              onClick={() => setIsAddDataOpen("product")}
              className="gl-btn-primary !py-1.5 !px-3 !text-xs"
            >
              <Plus className="size-3.5" />
              <span>{isAr ? "إضافة منتج جديد" : "Add Product"}</span>
            </button>
          )}

          {activeSubTab === "campaigns" && (
            <button
              type="button"
              onClick={() => setIsAddDataOpen("campaign")}
              className="gl-btn-primary !py-1.5 !px-3 !text-xs"
            >
              <Plus className="size-3.5" />
              <span>{isAr ? "إضافة حملة إعلانية" : "Add Campaign"}</span>
            </button>
          )}

          {activeSubTab === "courier" && (
            <div className="flex items-center gap-2">
              <label className="gl-btn-secondary !py-1.5 !px-3 !text-xs cursor-pointer">
                <FileSpreadsheet className="size-3.5 text-emerald-500" />
                <span>{isAr ? "رفع إكسل كشف الشحن" : "Upload Courier Excel"}</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileUpload(e, "courier")}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setIsAddDataOpen("courier")}
                className="gl-btn-primary !py-1.5 !px-3 !text-xs"
              >
                <Plus className="size-3.5" />
                <span>{isAr ? "إدخال يدوي لطلب كشف" : "Add Row"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsClaimLetterOpen(true)}
                className="gl-btn-secondary !py-1.5 !px-3 !text-xs text-rose-600 border-rose-500/30"
              >
                <Send className="size-3.5" />
                <span>{isAr ? "تجهيز خطاب مطالبة الشحن" : "Claim Letter"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-VIEW 1: Profit Leak Center (Overview) */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Leaks Header & Multi-Tier Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-frost flex items-center gap-2">
                <AlertTriangle className="size-4 text-rose-500" />
                <span>{isAr ? "التسريبات المكتشفة في متجرك حالياً" : "Active Discovered Profit Leaks"}</span>
              </h3>
              <p className="text-xs text-frost-dim">
                {isAr
                  ? `تم العثور على إجمالي تسريبات بقيمة ${metrics.totalDiscoveredLeaksAmount.toFixed(2)} ${state.currency} عبر الحملات، المنتجات، وفروقات الشحن.`
                  : `Discovered total leaks worth ${metrics.totalDiscoveredLeaksAmount.toFixed(2)} ${state.currency}.`}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: "all", labelAr: "الكل", labelEn: "All" },
                { id: "confirmed", labelAr: "مؤكدة (Tier 1)", labelEn: "Confirmed (Tier 1)", color: "text-rose-600" },
                { id: "needs_review", labelAr: "تحتاج مراجعة (Tier 2/3)", labelEn: "Needs Review (Tier 2/3)", color: "text-amber-600" },
                { id: "ads", labelAr: "إعلانات خاسرة", labelEn: "Losing Ads" },
                { id: "products", labelAr: "هوامش سالبة", labelEn: "Negative Margins" },
                { id: "courier", labelAr: "فروقات شحن COD", labelEn: "Courier COD Gaps" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedLeakFilter(f.id as any)}
                  className={`px-3 py-1 rounded-xl border font-semibold transition-all ${
                    selectedLeakFilter === f.id
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-line bg-surface text-frost-dim hover:text-frost"
                  }`}
                >
                  {isAr ? f.labelAr : f.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Leaks Cards Grid */}
          {filteredLeaks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line bg-surface/40 p-12 text-center">
              <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-frost">
                {isAr ? "لا توجد تسريبات نشطة مطابقة لهذا الفلتر!" : "No active leaks in this filter!"}
              </h4>
              <p className="text-xs text-frost-dim mt-1 max-w-md mx-auto">
                {isAr
                  ? "جميع الحملات والمنتجات المسجلة حالياً تحقق هوامش ربحية إيجابية، ولا توجد فروقات تسوية معلقة."
                  : "All current campaigns, products and couriers are operating with positive net margins."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredLeaks.map((leak) => (
                <div
                  key={leak.id}
                  className={`rounded-3xl border p-5 transition-all relative flex flex-col justify-between ${
                    leak.isConfirmed
                      ? "border-rose-500/30 bg-rose-500/[0.03] hover:border-rose-500/50"
                      : "border-amber-500/30 bg-amber-500/[0.03] hover:border-amber-500/50"
                  }`}
                >
                  <div>
                    {/* Badge and loss amount */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            leak.confidenceTier === "tier_1_high"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {leak.confidenceTier === "tier_1_high"
                            ? isAr ? "مؤكد بنسبة 100% (Tier 1)" : "Confirmed (Tier 1)"
                            : isAr ? "تقديري يحتاج مراجعة (Tier 2)" : "Needs Review (Tier 2)"}
                        </span>

                        <span className="text-[11px] text-frost-faint">
                          {leak.sourceCategory === "ad_campaign" && (isAr ? "حملة إعلانية" : "Ad Campaign")}
                          {leak.sourceCategory === "product_pricing" && (isAr ? "تسعير منتج" : "Product Pricing")}
                          {leak.sourceCategory === "courier_settlement" && (isAr ? "تسوية شحن" : "Courier Settlement")}
                        </span>
                      </div>

                      <div className="text-end shrink-0">
                        <span className="font-mono text-lg font-extrabold text-rose-600 dark:text-rose-400 block">
                          -{leak.estimatedLossAmount.toFixed(2)} {leak.currency}
                        </span>
                        <span className="text-[10px] text-frost-faint">{isAr ? "خسارة فعلية" : "loss amount"}</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-frost mb-1.5">{isAr ? leak.title : leak.titleEn}</h4>
                    <p className="text-xs text-frost-dim leading-relaxed mb-4">{isAr ? leak.description : leak.descriptionEn}</p>
                  </div>

                  {/* Recommendation & Action Controls */}
                  <div className="pt-3 border-t border-line space-y-3">
                    <div className="rounded-xl bg-surface-raised/80 p-2.5 text-[11px] text-frost">
                      <strong className="text-signal">{isAr ? "الإجراء الموصى به: " : "Recommended: "}</strong>
                      <span>{isAr ? leak.recommendedAction : leak.recommendedActionEn}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setAuditModalItem(leak)}
                        className="inline-flex items-center gap-1.5 text-xs text-frost-dim hover:text-frost font-medium underline"
                      >
                        <Eye className="size-3.5" />
                        <span>{isAr ? "عرض سجل التدقيق (Audit Trail)" : "View Audit Trail"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkAsRecovered(leak.id)}
                        className="gl-btn-primary !py-1.5 !px-3 !text-xs !bg-emerald-600 hover:!bg-emerald-700 font-bold"
                      >
                        <Check className="size-3.5" />
                        <span>{isAr ? "تم المعالجة والاسترداد" : "Mark Recovered"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: Products Net Profit & Unit Economics */}
      {activeSubTab === "products" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-frost">{isAr ? "تحليل صافي ربح المنتجات (Unit Economics)" : "Products True Unit Economics"}</h3>
              <p className="text-xs text-frost-dim">{isAr ? "احتساب هامش الربح الحقيقي لكل قطعة بعد خصم تكلفة الشراء، الشحن، الإعلانات، وهدر المرتجعات." : "True net profit per unit after COGS, shipping, ad share and return loss."}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-raised text-frost-dim border-b border-line text-[11px]">
                <tr>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "المنتج / الرمز" : "Product / SKU"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "سعر البيع" : "Selling Price"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "تكلفة القطعة (COGS)" : "Unit COGS"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "رسوم الشحن" : "Shipping"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "حصة الإعلان" : "Ad Spend Share"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "نسبة المرتجع" : "Return Rate"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "صافي الربح للوحدة" : "Unit Net Profit"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {state.products.map((p) => {
                  const returnLoss = (p.returnRatePct / 100) * (p.shippingCost * 1.5);
                  const totalUnitCost = p.cogs + p.shippingCost + p.adSpendShare + returnLoss;
                  const unitNet = p.sellingPrice - totalUnitCost;
                  const marginPct = (unitNet / p.sellingPrice) * 100;
                  const isNegative = unitNet < 0;

                  return (
                    <tr key={p.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-frost">{p.title}</p>
                        <span className="font-mono text-[10px] text-frost-faint">{p.sku} • {p.category}</span>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-frost">
                        {p.sellingPrice.toFixed(2)} {p.currency}
                      </td>
                      <td className="p-3.5 font-mono text-frost-dim">
                        {p.cogs.toFixed(2)} {p.currency}
                      </td>
                      <td className="p-3.5 font-mono text-frost-dim">
                        {p.shippingCost.toFixed(2)} {p.currency}
                      </td>
                      <td className="p-3.5 font-mono text-frost-dim">
                        {p.adSpendShare.toFixed(2)} {p.currency}
                      </td>
                      <td className="p-3.5 font-mono text-frost-dim">
                        {p.returnRatePct}%
                      </td>
                      <td className="p-3.5 font-mono font-bold">
                        <span className={isNegative ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                          {unitNet > 0 ? "+" : ""}{unitNet.toFixed(2)} {p.currency}
                        </span>
                        <span className="block text-[10px] text-frost-faint">({marginPct.toFixed(1)}%)</span>
                      </td>
                      <td className="p-3.5">
                        {isNegative ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                            <Flame className="size-3" />
                            {isAr ? "هامش ربح سالب!" : "Negative Margin"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            <Check className="size-3" />
                            {isAr ? "منتج رابح" : "Profitable"}
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

      {/* SUB-VIEW 3: Ad Campaigns True Net Profit Audit */}
      {activeSubTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-frost">{isAr ? "تدقيق صافي أرباح الحملات الإعلانية (True POAS)" : "Ad Campaigns True POAS Audit"}</h3>
              <p className="text-xs text-frost-dim">{isAr ? "حساب الأرباح الفعلية للحملات بعد خصم تكلفة المنتج والشحن والمرتجعات، وليس مجرد ROAS السطحي." : "Calculate true net return after all expenses, not just superficial ROAS."}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-raised text-frost-dim border-b border-line text-[11px]">
                <tr>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "الحملة / القناة" : "Campaign / Channel"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "الصرف الإعلاني" : "Ad Spend"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "الإيرادات الإجمالية" : "Gross Revenue"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "التكاليف المرتبطة (COGS+شحن+مرتجع)" : "Attributed Costs"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "صافي الربح الفعلي" : "True Net Profit"}</th>
                  <th className="p-3.5 text-start font-semibold">ROAS vs POAS</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "التقييم" : "Verdict"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {state.campaigns.map((c) => {
                  const totalExpenses = c.spend + c.attributedCogs + c.attributedShipping + c.attributedReturns;
                  const netProfit = c.attributedGrossSales - totalExpenses;
                  const roas = c.spend > 0 ? (c.attributedGrossSales / c.spend).toFixed(2) : "0";
                  const poas = c.spend > 0 ? (netProfit / c.spend).toFixed(2) : "0";
                  const isLosing = netProfit < 0;

                  return (
                    <tr key={c.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-frost">{c.name}</p>
                        <span className="text-[10px] text-frost-faint">{c.channel}</span>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-frost">
                        {c.spend.toFixed(2)} {state.currency}
                      </td>
                      <td className="p-3.5 font-mono text-frost">
                        {c.attributedGrossSales.toFixed(2)} {state.currency}
                      </td>
                      <td className="p-3.5 font-mono text-frost-dim">
                        {(c.attributedCogs + c.attributedShipping + c.attributedReturns).toFixed(2)} {state.currency}
                      </td>
                      <td className="p-3.5 font-mono font-bold">
                        <span className={isLosing ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                          {netProfit > 0 ? "+" : ""}{netProfit.toFixed(2)} {state.currency}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <div>ROAS: <span className="font-bold text-frost">{roas}x</span></div>
                        <div>POAS: <span className={`font-bold ${isLosing ? "text-rose-600" : "text-emerald-600"}`}>{poas}x</span></div>
                      </td>
                      <td className="p-3.5">
                        {isLosing ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                            <TrendingDown className="size-3" />
                            {isAr ? "حملة خاسرة (يجب إيقافها)" : "Losing Campaign"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            <TrendingUp className="size-3" />
                            {isAr ? "حملة رابحة" : "Profitable"}
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

      {/* SUB-VIEW 4: Courier COD Reconciliation Module */}
      {activeSubTab === "courier" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-frost">{isAr ? "مطابقة كشوفات شركات الشحن (COD Reconciliation)" : "Courier COD Settlement Reconciliation"}</h3>
              <p className="text-xs text-frost-dim">{isAr ? "مقارنة كشف التحويل البنكي للشحنات مع الطلبات المسلّمة لاكتشاف المبالغ غير المحوّلة أو المحوّلة بنقصان." : "Match courier payout sheets against delivered orders to catch uncredited or underpaid cash."}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
            <table className="w-full text-xs text-start">
              <thead className="bg-surface-raised text-frost-dim border-b border-line text-[11px]">
                <tr>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "رقم التتبع / الطلب" : "Tracking / Order"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "شركة الشحن" : "Courier"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "المبلغ المحصّل بالكشف" : "Statement COD"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "رسوم الشحن" : "Fee Charged"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "صافي المستلم" : "Net Payout"}</th>
                  <th className="p-3.5 text-start font-semibold">{isAr ? "حالة المطابقة" : "Match Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {state.courierStatements.map((stmt) => (
                  <tr key={stmt.id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-frost">{stmt.trackingNumber}</p>
                      <span className="text-[10px] text-frost-faint">{stmt.orderNumber || "طلب غير محدد"} • {stmt.deliveryDate}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-frost">{stmt.courierName}</td>
                    <td className="p-3.5 font-mono font-semibold text-frost">
                      {stmt.collectedCodAmount.toFixed(2)} {state.currency}
                    </td>
                    <td className="p-3.5 font-mono text-frost-dim">
                      {stmt.courierFeeCharged.toFixed(2)} {state.currency}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {stmt.netPayoutToMerchant.toFixed(2)} {state.currency}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <Check className="size-3" />
                        {isAr ? "مطابق" : "Matched"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL MODAL */}
      {auditModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="size-4" />
                  {isAr ? "سجل التدقيق والحساب الرياضي (Audit Trail)" : "Mathematical Audit Trail"}
                </span>
                <h4 className="text-base font-bold text-frost mt-1">{isAr ? auditModalItem.title : auditModalItem.titleEn}</h4>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalItem(null)}
                className="rounded-full p-1 text-frost-dim hover:text-frost hover:bg-surface-raised"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl bg-surface-raised p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-frost-dim">{isAr ? "القاعدة الرياضية المطبقة:" : "Rule:"}</span>
                  <span className="font-mono font-bold text-frost">{auditModalItem.auditTrail.ruleName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-frost-dim">{isAr ? "معيار التحقق الحسابي:" : "Criteria:"}</span>
                  <span className="font-mono text-signal">{auditModalItem.auditTrail.criteriaApplied}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-frost-dim">{isAr ? "درجة دقة المطابقة:" : "Confidence Score:"}</span>
                  <span className="font-mono font-bold text-emerald-600">{auditModalItem.auditTrail.confidenceScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-frost-dim">{isAr ? "الحقول المقارنة:" : "Matched Fields:"}</span>
                  <span className="font-mono text-frost-faint">{auditModalItem.auditTrail.matchedFields.join(", ")}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-line p-3.5 text-frost leading-relaxed">
                <p className="font-bold text-frost mb-1">{isAr ? "ملاحظة المدقق البشري:" : "Auditor Note:"}</p>
                <p className="text-frost-dim">{auditModalItem.auditTrail.reviewerNote}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setAuditModalItem(null)}
                className="gl-btn-secondary !py-2 !px-4 !text-xs"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleMarkAsRecovered(auditModalItem.id);
                  setAuditModalItem(null);
                }}
                className="gl-btn-primary !py-2 !px-4 !text-xs !bg-emerald-600 hover:!bg-emerald-700"
              >
                {isAr ? "اعتماد كـ مسترد ومحمي" : "Confirm Recovered"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COURIER CLAIM LETTER MODAL */}
      {isClaimLetterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <FileText className="size-4" />
                  {isAr ? "خطاب مطالبة تسوية مالية رسمي (لشركة الشحن)" : "Official Courier Settlement Claim Letter"}
                </span>
                <h4 className="text-base font-bold text-frost mt-1">{isAr ? "جاهز للإرسال لإدارة العمليات المالية" : "Ready to Send to Logistics Ops"}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsClaimLetterOpen(false)}
                className="rounded-full p-1 text-frost-dim hover:text-frost hover:bg-surface-raised"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-line bg-surface-raised/80 p-5 font-mono text-xs text-frost space-y-3 leading-relaxed">
              <p><strong>إلى:</strong> قسم التسويات المالية والتحصيل - Aramex Oman</p>
              <p><strong>الموضوع:</strong> مطالبة فروقات مبالغ الدفع عند الاستلام (COD) غير المحولة لشهر أغسطس 2026</p>
              <p>تحية طيبة وبعد،</p>
              <p>
                بعد مطابقة سجلات الطلبات المسلمة بنجاح مع كشوف التحويل البنكي، تبيّن وجود شحنات مسلمة لم يتم إدراج مبالغها في الكشف بقيمة إجمالية قدرها <strong>36.00 ر.ع.</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 bg-surface p-3 rounded-xl border border-line text-[11px]">
                <li>رقم الطلب GL-88902 (تتبع TRK-ARAMEX-9922): 28.00 ر.ع. (لم يُدرج بالكشف)</li>
                <li>رقم الطلب GL-88905 (تتبع TRK-ARAMEX-9925): فرق تحصيل ناقص 8.00 ر.ع.</li>
              </ul>
              <p>يرجى التكرم بمراجعة الأرقام الموضحة وإيداع الفارق المستحق في حسابنا البنكي المعتمد.</p>
              <p>شاكرين ومقدرين حسن تعاونكم،<br /><strong>{state.businessName}</strong></p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `إلى: قسم التسويات المالية والتحصيل - Aramex\nالموضوع: مطالبة فروقات COD لشهر أغسطس 2026 بقيمة 36.00 ر.ع.`
                  );
                  showToast(isAr ? "تم نسخ نص الخطاب للحافظة!" : "Claim copied to clipboard!");
                  setIsClaimLetterOpen(false);
                }}
                className="gl-btn-primary !py-2 !px-4 !text-xs"
              >
                <Send className="size-3.5" />
                <span>{isAr ? "نسخ الخطاب وإرساله" : "Copy Claim"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY EXECUTIVE SUMMARY MODAL */}
      {isExecutiveSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold text-signal flex items-center gap-1.5">
                  <Sparkles className="size-4" />
                  {isAr ? "التقرير المالي التنفيذي الأسبوعي" : "Weekly Executive Financial Report"}
                </span>
                <h4 className="text-base font-bold text-frost mt-1">{weeklySummary.summaryDate}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsExecutiveSummaryOpen(false)}
                className="rounded-full p-1 text-frost-dim hover:text-frost hover:bg-surface-raised"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-surface-raised border border-line">
                  <span className="text-frost-dim block">{isAr ? "إجمالي التسريبات المرصودة:" : "Total Leaks:"}</span>
                  <span className="font-mono text-lg font-bold text-rose-600">
                    {weeklySummary.totalEstimatedLoss.toFixed(2)} {state.currency}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-raised border border-line">
                  <span className="text-frost-dim block">{isAr ? "المبالغ المحمية والمستردة:" : "Recovered Money:"}</span>
                  <span className="font-mono text-lg font-bold text-emerald-600">
                    {weeklySummary.recoveredSoFar.toFixed(2)} {state.currency}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-line p-4 space-y-2">
                <p className="font-bold text-frost">{isAr ? "أهم الخطوات الواجب اتخاذها هذا الأسبوع:" : "Key Actions This Week:"}</p>
                <ul className="space-y-1.5">
                  {weeklySummary.keyActionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-frost-dim">
                      <span className="size-1.5 rounded-full bg-signal mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setIsExecutiveSummaryOpen(false)}
                className="gl-btn-secondary !py-2 !px-4 !text-xs"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DATA MODAL (Product / Campaign / Courier Row) */}
      {isAddDataOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <h4 className="text-base font-bold text-frost">
                {isAddDataOpen === "product" && (isAr ? "إضافة منتج جديد وتكلفة الـ COGS" : "Add New Product & COGS")}
                {isAddDataOpen === "campaign" && (isAr ? "إضافة حملة إعلانية ومصروفها" : "Add Ad Campaign & Spend")}
                {isAddDataOpen === "courier" && (isAr ? "إضافة سطر كشف شحن للمطابقة" : "Add Courier Reconciliation Line")}
              </h4>
              <button
                type="button"
                onClick={() => setIsAddDataOpen(null)}
                className="rounded-full p-1 text-frost-dim hover:text-frost hover:bg-surface-raised"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* PRODUCT FORM */}
            {isAddDataOpen === "product" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-frost block mb-1">{isAr ? "اسم المنتج" : "Product Title"}</label>
                  <input
                    type="text"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    placeholder={isAr ? "مثال: مخلط دهن العود الفاخر" : "e.g. Luxury Oud Oil"}
                    className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "سعر البيع" : "Selling Price"}</label>
                    <input
                      type="number"
                      value={newProduct.sellingPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "تكلفة الشراء (COGS)" : "Unit COGS"}</label>
                    <input
                      type="number"
                      value={newProduct.cogs}
                      onChange={(e) => setNewProduct({ ...newProduct, cogs: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "تكلفة الشحن للقطعة" : "Shipping Cost"}</label>
                    <input
                      type="number"
                      value={newProduct.shippingCost}
                      onChange={(e) => setNewProduct({ ...newProduct, shippingCost: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "حصة الصرف الإعلاني" : "Ad Spend Share"}</label>
                    <input
                      type="number"
                      value={newProduct.adSpendShare}
                      onChange={(e) => setNewProduct({ ...newProduct, adSpendShare: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setIsAddDataOpen(null)}
                    className="gl-btn-secondary !py-2 !px-4 !text-xs"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProduct}
                    className="gl-btn-primary !py-2 !px-4 !text-xs"
                  >
                    {isAr ? "حفظ واحتساب الهامش" : "Save & Calculate"}
                  </button>
                </div>
              </div>
            )}

            {/* CAMPAIGN FORM */}
            {isAddDataOpen === "campaign" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-frost block mb-1">{isAr ? "اسم الحملة" : "Campaign Name"}</label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder={isAr ? "مثال: تيك توك سبارك ادز - عطر الصيف" : "e.g. TikTok Spark Ads Summer"}
                    className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "مبلغ الصرف" : "Spend"}</label>
                    <input
                      type="number"
                      value={newCampaign.spend}
                      onChange={(e) => setNewCampaign({ ...newCampaign, spend: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "الإيرادات الإجمالية" : "Gross Revenue"}</label>
                    <input
                      type="number"
                      value={newCampaign.attributedGrossSales}
                      onChange={(e) => setNewCampaign({ ...newCampaign, attributedGrossSales: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "تكلفة المنتجات المباعة" : "Attributed COGS"}</label>
                    <input
                      type="number"
                      value={newCampaign.attributedCogs}
                      onChange={(e) => setNewCampaign({ ...newCampaign, attributedCogs: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "تكلفة الشحن والمرتجع" : "Shipping & Returns"}</label>
                    <input
                      type="number"
                      value={newCampaign.attributedShipping}
                      onChange={(e) => setNewCampaign({ ...newCampaign, attributedShipping: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setIsAddDataOpen(null)}
                    className="gl-btn-secondary !py-2 !px-4 !text-xs"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCampaign}
                    className="gl-btn-primary !py-2 !px-4 !text-xs"
                  >
                    {isAr ? "حفظ وتحليل الربح الصافي" : "Save & Analyze"}
                  </button>
                </div>
              </div>
            )}

            {/* COURIER FORM */}
            {isAddDataOpen === "courier" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-frost block mb-1">{isAr ? "رقم التتبع (Tracking Number)" : "Tracking Number"}</label>
                  <input
                    type="text"
                    value={newCourierStmt.trackingNumber}
                    onChange={(e) => setNewCourierStmt({ ...newCourierStmt, trackingNumber: e.target.value })}
                    placeholder="e.g. TRK-ARAMEX-9988"
                    className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "المبلغ المحصل (COD)" : "Collected COD"}</label>
                    <input
                      type="number"
                      value={newCourierStmt.collectedCodAmount}
                      onChange={(e) => setNewCourierStmt({ ...newCourierStmt, collectedCodAmount: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-frost block mb-1">{isAr ? "رسوم الشحن المخصومة" : "Courier Fee"}</label>
                    <input
                      type="number"
                      value={newCourierStmt.courierFeeCharged}
                      onChange={(e) => setNewCourierStmt({ ...newCourierStmt, courierFeeCharged: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-xs text-frost outline-none focus:border-signal"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setIsAddDataOpen(null)}
                    className="gl-btn-secondary !py-2 !px-4 !text-xs"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCourierStatement}
                    className="gl-btn-primary !py-2 !px-4 !text-xs"
                  >
                    {isAr ? "حفظ ومطابقة الكشف" : "Save & Reconcile"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
