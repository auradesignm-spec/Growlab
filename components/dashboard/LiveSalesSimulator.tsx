"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { formatMoney } from "@/lib/format";

export interface SimulatedProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  costPrice: number;
  commissionPct: number;
  shippingFee: number;
  imageUrl: string;
  active: boolean;
  salesCount: number;
  revenue: number;
  netProfit: number;
}

export interface SimulatedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  country: string;
  countryFlag: string;
  productTitle: string;
  productId: string;
  productImage: string;
  price: number;
  costPrice: number;
  commission: number;
  shippingFee: number;
  netProfit: number;
  paymentMethod: "COD" | "Card";
  status: "new" | "confirmed" | "out_for_delivery" | "delivered" | "returned";
  timestamp: Date;
  channel: "Meta Ads (Instagram)" | "Creator Referral" | "Direct Store" | "TikTok Ads";
}

const INITIAL_SIMULATED_PRODUCTS: SimulatedProduct[] = [
  {
    id: "sp-1",
    title: "عطر ميس الريم الفاخر 100 مل",
    category: "عطور شرقية",
    price: 32.0,
    costPrice: 8.0,
    commissionPct: 15,
    shippingFee: 1.5,
    imageUrl: "https://picsum.photos/seed/attar-oud-lux/400/400",
    active: true,
    salesCount: 14,
    revenue: 448.0,
    netProfit: 247.8,
  },
  {
    id: "sp-2",
    title: "بوكس تمور المجدول الملكي VIP",
    category: "أغذية ومأكولات فاخرة",
    price: 18.0,
    costPrice: 4.5,
    commissionPct: 12,
    shippingFee: 1.5,
    imageUrl: "https://picsum.photos/seed/dates-box-vip/400/400",
    active: true,
    salesCount: 22,
    revenue: 396.0,
    netProfit: 216.7,
  },
  {
    id: "sp-3",
    title: "ساعة كرونوغراف ستيل مقاومة للماء",
    category: "إكسسوارات وساعات",
    price: 45.0,
    costPrice: 11.0,
    commissionPct: 18,
    shippingFee: 1.5,
    imageUrl: "https://picsum.photos/seed/luxury-steel-watch/400/400",
    active: true,
    salesCount: 9,
    revenue: 405.0,
    netProfit: 219.6,
  },
];

const GCC_CUSTOMERS = [
  { name: "محمد العامري", city: "مسقط — الخوض", country: "عُمان", flag: "🇴🇲" },
  { name: "فاطمة الكعبي", city: "دبي — جميرا", country: "الإمارات", flag: "🇦🇪" },
  { name: "سلطان العتيبي", city: "الرياض — حطين", country: "السعودية", flag: "🇸🇦" },
  { name: "مريم الشمري", city: "الكويت — حولي", country: "الكويت", flag: "🇰🇼" },
  { name: "حمد الهاجري", city: "الدوحة — اللؤلؤة", country: "قطر", flag: "🇶🇦" },
  { name: "خالد البلوشي", city: "صلالة — الدهاريز", country: "عُمان", flag: "🇴🇲" },
  { name: "نورة الدوسري", city: "الدمام — الشاطئ", country: "السعودية", flag: "🇸🇦" },
  { name: "عبدالله المهيري", city: "أبوظبي — البطين", country: "الإمارات", flag: "🇦🇪" },
  { name: "عائشة المرزوقي", city: "صحار — الطريف", country: "عُمان", flag: "🇴🇲" },
  { name: "فيصل السبيعي", city: "جدة — الروضة", country: "السعودية", flag: "🇸🇦" },
];

const CHANNELS: Array<SimulatedOrder["channel"]> = [
  "Meta Ads (Instagram)",
  "Creator Referral",
  "Meta Ads (Instagram)",
  "TikTok Ads",
  "Direct Store",
];

const QUICK_PRESETS = [
  {
    title: "طقم بخور ومبخرة كريستال ملكية",
    category: "ديكور وعطور",
    price: "28.00",
    costPrice: "7.00",
    commissionPct: "15",
    shippingFee: "1.50",
    imageUrl: "https://picsum.photos/seed/bakhoor-crystal-set/400/400",
  },
  {
    title: "حقيبة لابتوب جلد طبيعي مقاومة للماء",
    category: "حقائب وجلديات",
    price: "36.00",
    costPrice: "9.50",
    commissionPct: "15",
    shippingFee: "1.50",
    imageUrl: "https://picsum.photos/seed/leather-bag-lux/400/400",
  },
  {
    title: "مجموعة العناية بالبشرة العضوية الكاملة",
    category: "عناية وجمال",
    price: "24.00",
    costPrice: "5.50",
    commissionPct: "20",
    shippingFee: "1.50",
    imageUrl: "https://picsum.photos/seed/organic-skincare-box/400/400",
  },
  {
    title: "مطحنة قهوة يدوية من الفولاذ المقاوم للصدأ",
    category: "مستلزمات القهوة",
    price: "21.00",
    costPrice: "6.00",
    commissionPct: "12",
    shippingFee: "1.50",
    imageUrl: "https://picsum.photos/seed/manual-coffee-grinder/400/400",
  },
];

export default function LiveSalesSimulator({
  locale = "ar",
  onOpenStore,
}: {
  locale?: string;
  onOpenStore?: () => void;
}) {
  const isAr = locale !== "en";

  const [products, setProducts] = useState<SimulatedProduct[]>(INITIAL_SIMULATED_PRODUCTS);
  const [orders, setOrders] = useState<SimulatedOrder[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(3500); // ms per order
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // Form State for new product simulation
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("منتجات فاخرة");
  const [newPrice, setNewPrice] = useState("29.00");
  const [newCostPrice, setNewCostPrice] = useState("7.50");
  const [newCommissionPct, setNewCommissionPct] = useState("15");
  const [newShippingFee, setNewShippingFee] = useState("1.50");
  const [newImageUrl, setNewImageUrl] = useState("https://picsum.photos/seed/lux-product-custom/400/400");
  const [showProductSuccessToast, setShowProductSuccessToast] = useState(false);

  // Play audio chime function (synthesized browser audio to avoid missing files)
  const playChime = React.useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Generate a random simulated order
  const triggerNewSimulatedOrder = React.useCallback((specificProduct?: SimulatedProduct) => {
    setProducts((currentProducts) => {
      const activeProducts = currentProducts.filter((p) => p.active);
      if (activeProducts.length === 0) return currentProducts;

      const prod = specificProduct || activeProducts[Math.floor(Math.random() * activeProducts.length)];
      const cust = GCC_CUSTOMERS[Math.floor(Math.random() * GCC_CUSTOMERS.length)];
      const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];

      const price = prod.price;
      const costPrice = prod.costPrice;
      const commission = (price * prod.commissionPct) / 100;
      const shippingFee = prod.shippingFee;
      const netProfit = price - costPrice - commission - shippingFee;

      const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder: SimulatedOrder = {
        id: `sim-ord-${Date.now()}-${Math.random()}`,
        orderNumber: orderNum,
        customerName: cust.name,
        city: cust.city,
        country: cust.country,
        countryFlag: cust.flag,
        productTitle: prod.title,
        productId: prod.id,
        productImage: prod.imageUrl,
        price,
        costPrice,
        commission,
        shippingFee,
        netProfit,
        paymentMethod: "COD",
        status: "new",
        timestamp: new Date(),
        channel,
      };

      setOrders((prev) => [newOrder, ...prev.slice(0, 49)]); // Keep latest 50

      const notifMsg = isAr
        ? `طلب جديد بقيمة ${formatMoney(price)} من ${cust.name} (${cust.city})!`
        : `New order for ${formatMoney(price)} from ${cust.name} (${cust.city})!`;
      setLastNotification(notifMsg);
      playChime();

      setTimeout(() => {
        setLastNotification((curr) => (curr === notifMsg ? null : curr));
      }, 3000);

      return currentProducts.map((p) => {
        if (p.id === prod.id) {
          return {
            ...p,
            salesCount: p.salesCount + 1,
            revenue: p.revenue + price,
            netProfit: p.netProfit + netProfit,
          };
        }
        return p;
      });
    });
  }, [isAr, playChime]);

  // Live Timer Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      triggerNewSimulatedOrder();
    }, simSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, triggerNewSimulatedOrder]);

  // Order lifecycle simulation (advances status from new -> confirmed -> delivered)
  useEffect(() => {
    const advanceInterval = setInterval(() => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.status === "new" && Math.random() > 0.4) {
            return { ...ord, status: "confirmed" };
          }
          if (ord.status === "confirmed" && Math.random() > 0.5) {
            return { ...ord, status: "out_for_delivery" };
          }
          if (ord.status === "out_for_delivery" && Math.random() > 0.5) {
            // 93% success delivery, 7% return
            return { ...ord, status: Math.random() > 0.07 ? "delivered" : "returned" };
          }
          return ord;
        })
      );
    }, 4500);
    return () => clearInterval(advanceInterval);
  }, []);

  // Handle manual product addition
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const price = parseFloat(newPrice) || 20;
    const cost = parseFloat(newCostPrice) || 5;
    const comm = parseFloat(newCommissionPct) || 15;
    const ship = parseFloat(newShippingFee) || 1.5;

    const addedProd: SimulatedProduct = {
      id: `sp-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim(),
      price,
      costPrice: cost,
      commissionPct: comm,
      shippingFee: ship,
      imageUrl: newImageUrl || "https://picsum.photos/seed/lux-product-custom/400/400",
      active: true,
      salesCount: 1,
      revenue: price,
      netProfit: price - cost - (price * comm) / 100 - ship,
    };

    setProducts((prev) => [addedProd, ...prev]);
    setShowProductSuccessToast(true);
    setTimeout(() => setShowProductSuccessToast(false), 4000);

    // Immediately trigger a test order for this new product!
    triggerNewSimulatedOrder(addedProd);

    // Reset inputs
    setNewTitle("");
  };

  const applyPreset = (preset: (typeof QUICK_PRESETS)[0]) => {
    setNewTitle(preset.title);
    setNewCategory(preset.category);
    setNewPrice(preset.price);
    setNewCostPrice(preset.costPrice);
    setNewCommissionPct(preset.commissionPct);
    setNewShippingFee(preset.shippingFee);
    setNewImageUrl(preset.imageUrl);
  };

  // Computed Financial Aggregates
  const totalRevenue = useMemo(() => products.reduce((acc, p) => acc + p.revenue, 0), [products]);
  const totalNetProfit = useMemo(() => products.reduce((acc, p) => acc + p.netProfit, 0), [products]);
  const totalSalesCount = useMemo(() => products.reduce((acc, p) => acc + p.salesCount, 0), [products]);
  const deliveredOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "delivered").length,
    [orders]
  );
  const totalCommissionLocked = useMemo(
    () => orders.reduce((acc, o) => acc + o.commission, 0),
    [orders]
  );

  // Live Unit Margin for the form
  const inputPriceNum = parseFloat(newPrice) || 0;
  const inputCostNum = parseFloat(newCostPrice) || 0;
  const inputCommNum = (inputPriceNum * (parseFloat(newCommissionPct) || 0)) / 100;
  const inputShipNum = parseFloat(newShippingFee) || 0;
  const inputNetPerUnit = inputPriceNum - inputCostNum - inputCommNum - inputShipNum;
  const inputMarginPct = inputPriceNum > 0 ? Math.round((inputNetPerUnit / inputPriceNum) * 100) : 0;

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  return (
    <section className="space-y-8 p-4 sm:p-8">
      {/* Top Banner with live stream status */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-slate-900 to-[#0d1117] p-6 text-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                {isAr ? "محاكي رادار الامتثال والرصد المباشر" : "Live Compliance & Risk Simulator"}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                {isPlaying ? (isAr ? "البث نشط" : "Stream Active") : (isAr ? "متوقف" : "Paused")}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isAr
                ? "لوحة محاكاة الامتثال التفاعلية — تدفق المعاملات وفحص نسب التعمين والغرامات"
                : "Interactive Compliance Engine — Real-Time Transaction & Quota Stream"}
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? "جرّب بنفسك محاكاة تسجيل المعاملات والتوظيف، وشاهد الرصد اللحظي لنسب التعمين وحماية المنشأة من الغرامات التراكمية في سلطنة عُمان."
                : "Simulate corporate transactions and workforce hires, monitoring real-time Omanisation quotas and penalty protection across the Sultanate."}
            </p>
          </div>

          {/* Controls toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
                isPlaying
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              <span>{isPlaying ? (isAr ? "إيقاف مؤقت" : "Pause") : (isAr ? "تشغيل التدفق" : "Play Stream")}</span>
            </button>

            <button
              onClick={() => triggerNewSimulatedOrder()}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white border border-white/15 hover:bg-white/20 active:scale-95 transition-all"
            >
              <span>{isAr ? "طلب تجريبي الآن" : "Trigger Test Order"}</span>
            </button>

            {/* Speed Selector */}
            <select
              value={simSpeed}
              onChange={(e) => setSimSpeed(Number(e.target.value))}
              aria-label={isAr ? "سرعة التدفق" : "Stream Speed"}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white border border-white/15 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value={5000} className="bg-slate-900 text-white">{isAr ? "سرعة عادية (5 ثوانٍ)" : "Normal (5s)"}</option>
              <option value={3000} className="bg-slate-900 text-white">{isAr ? "سرعة متوسطة (3 ثوانٍ)" : "Medium (3s)"}</option>
              <option value={1500} className="bg-slate-900 text-white">{isAr ? "سرعة فائقة (1.5 ثانية)" : "Turbo (1.5s)"}</option>
            </select>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex size-9 items-center justify-center rounded-xl border text-[11px] font-bold transition-all ${
                soundEnabled
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                  : "border-white/10 bg-white/5 text-slate-400"
              }`}
              title={soundEnabled ? "Mute sounds" : "Enable order chime"}
            >
              {soundEnabled ? "صوت" : "صامت"}
            </button>
          </div>
        </div>

        {/* Live Notification Bar */}
        {lastNotification && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-500/20 border border-emerald-400/40 px-4 py-2.5 text-xs font-semibold text-emerald-200 animate-bounce">
            <span className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{lastNotification}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-300 opacity-80">
              {isAr ? "تم قيد الطلب الآن" : "Processed"}
            </span>
          </div>
        )}
      </div>

      {/* KPI Real-Time Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Metric 1: True Net Profit */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-frost-dim">
              {isAr ? "صافي الأرباح البنكية الحقيقية" : "True Net Profit"}
            </span>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              +54.8% Margin
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 font-mono">
            {formatMoney(totalNetProfit)}
          </p>
          <p className="mt-1 text-[11px] text-frost-dim">
            {isAr ? "بعد خصم تكلفة البضاعة والتوصيل والعمولة" : "Net in bank after COGS & Ads"}
          </p>
        </div>

        {/* Metric 2: Gross GMV */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-frost-dim">
              {isAr ? "إجمالي المبيعات (GMV)" : "Gross Revenue"}
            </span>
            <span className="text-[10px] font-mono text-frost-faint">
              {totalSalesCount} {isAr ? "طلب" : "orders"}
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-frost font-mono">
            {formatMoney(totalRevenue)}
          </p>
          <p className="mt-1 text-[11px] text-frost-dim">
            {isAr ? "متوسط السلة: 28.5 ر.ع" : "AOV: 28.5 OMR"}
          </p>
        </div>

        {/* Metric 3: Delivered Orders */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-frost-dim">
              {isAr ? "الطلبات المحصّلة (COD)" : "Delivered / Collected"}
            </span>
            <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
              93.2% Delivery
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-sky-600 font-mono">
            {deliveredOrdersCount} / {orders.length || 36}
          </p>
          <p className="mt-1 text-[11px] text-frost-dim">
            {isAr ? "نسبة مرتجع منخفضة جداً (RTO < 7%)" : "Low RTO rate"}
          </p>
        </div>

        {/* Metric 4: Affiliate Commissions */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-frost-dim">
              {isAr ? "عمولات المسوّقين المحجوزة" : "Creator Commissions"}
            </span>
            <span className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
              Escrow
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 font-mono">
            {formatMoney(totalCommissionLocked || 46.2)}
          </p>
          <p className="mt-1 text-[11px] text-frost-dim">
            {isAr ? "تُدفع تلقائياً بعد التحصيل فقط" : "Settled upon COD delivery"}
          </p>
        </div>
      </div>

      {/* Main Grid: Left is Add Product Form & Presets; Right is Live Orders Stream */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form Column: Add New Product & Instant Margin Calculator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  {isAr ? "محاكي الإدخال" : "Instant Inserter"}
                </span>
                <h3 className="mt-1 text-base font-bold text-frost">
                  {isAr ? "إدخال منتج جديد وتخصيص هوامشه" : "Add New Product & Test Margins"}
                </h3>
              </div>
            </div>

            {/* Quick Templates Presets */}
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-frost-faint">
                {isAr ? "قوالب جاهزة للتجربة السريعة بنقرة واحدة:" : "Quick 1-Click Test Templates:"}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {QUICK_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-xl border border-line bg-slate-50 p-2.5 text-start transition-all hover:border-emerald-500/40 hover:bg-emerald-50/40 hover:shadow-sm"
                  >
                    <p className="line-clamp-1 text-xs font-bold text-frost">{preset.title}</p>
                    <p className="mt-0.5 text-[10px] text-emerald-700 font-mono font-semibold">
                      {preset.price} ر.ع · {preset.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddProduct} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-frost">
                  {isAr ? "اسم المنتج *" : "Product Title *"}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isAr ? "مثال: عطر سدرة مسقط الملكي 100 مل" : "e.g. Royal Muscat Oud 100ml"}
                  className="mt-1 w-full rounded-xl border border-line bg-[#fbfcfd] px-3.5 py-2.5 text-xs text-frost focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-frost">
                    {isAr ? "سعر البيع (ر.ع) *" : "Selling Price (OMR) *"}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-[#fbfcfd] px-3.5 py-2 text-xs font-mono text-frost focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-frost">
                    {isAr ? "تكلفة البضاعة COGS (ر.ع) *" : "Product Cost COGS (OMR) *"}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-[#fbfcfd] px-3.5 py-2 text-xs font-mono text-frost focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-frost">
                    {isAr ? "عمولة المسوّق (%)" : "Affiliate Comm (%)"}
                  </label>
                  <input
                    type="number"
                    value={newCommissionPct}
                    onChange={(e) => setNewCommissionPct(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-[#fbfcfd] px-3.5 py-2 text-xs font-mono text-frost focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-frost">
                    {isAr ? "رسوم الشحن (ر.ع)" : "Shipping Fee (OMR)"}
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={newShippingFee}
                    onChange={(e) => setNewShippingFee(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-[#fbfcfd] px-3.5 py-2 text-xs font-mono text-frost focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Live Margin Preview Box */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">
                    {isAr ? "صافي الربح المتوقع للقطعة الواحدة:" : "Estimated True Net Profit/Unit:"}
                  </span>
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 font-mono font-bold text-white text-[11px]">
                    +{formatMoney(inputNetPerUnit)} ({inputMarginPct}%)
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] text-emerald-900/80 border-t border-emerald-200/60 pt-2 font-mono">
                  <div>بيع: {formatMoney(inputPriceNum)}</div>
                  <div>تكلفة: {formatMoney(inputCostNum)}</div>
                  <div>عمولة: {formatMoney(inputCommNum)}</div>
                  <div>شحن: {formatMoney(inputShipNum)}</div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>{isAr ? "إضافة المنتج وبدء تدفق المبيعات له فوراً" : "Add Product & Trigger Live Sales"}</span>
              </button>

              {showProductSuccessToast && (
                <div className="rounded-xl bg-emerald-100 border border-emerald-300 p-2.5 text-center text-xs font-bold text-emerald-800 animate-pulse">
                  {isAr ? "تم إدراج المنتج بنجاح وتوليد طلب تجريبي فوري!" : "Product added & test order triggered!"}
                </div>
              )}
            </form>
          </div>

          {/* Active Product Catalog in Simulator */}
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-frost">
              {isAr ? "المنتجات النشطة في المحاكي" : "Active Products in Engine"} ({products.length})
            </h3>
            <div className="mt-3 space-y-3">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between rounded-2xl border border-line bg-slate-50/80 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 overflow-hidden rounded-xl bg-slate-200">
                      <Image
                        src={prod.imageUrl}
                        alt={prod.title}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="line-clamp-1 text-xs font-bold text-frost">{prod.title}</p>
                      <p className="text-[11px] text-frost-dim font-mono">
                        {formatMoney(prod.price)} · {prod.salesCount} {isAr ? "مبيعة" : "sales"}
                      </p>
                    </div>
                  </div>

                  <div className="text-end">
                    <p className="text-xs font-bold text-emerald-600 font-mono">
                      +{formatMoney(prod.netProfit)}
                    </p>
                    <button
                      onClick={() => triggerNewSimulatedOrder(prod)}
                      className="mt-1 text-[10px] font-semibold text-emerald-700 hover:underline"
                    >
                      {isAr ? "+ طلب للمنتج" : "+ Order"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Orders Stream Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                  {isAr ? "شريط الطلبات المباشر" : "Live Orders Stream"}
                </span>
                <h3 className="mt-1 text-base font-bold text-frost">
                  {isAr ? "تتبع تدفق المبيعات والتحصيل لحظة بلحظة" : "Real-Time Sales & Fulfillment Feed"}
                </h3>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", labelAr: "الكل", labelEn: "All" },
                  { id: "new", labelAr: "جديد", labelEn: "New" },
                  { id: "confirmed", labelAr: "مؤكد", labelEn: "Confirmed" },
                  { id: "out_for_delivery", labelAr: "مع المندوب", labelEn: "Out" },
                  { id: "delivered", labelAr: "تم التحصيل", labelEn: "Collected" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      orderFilter === f.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {isAr ? f.labelAr : f.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed */}
            <div className="mt-4 space-y-3 max-h-[580px] overflow-y-auto pe-1 scrollbar-thin">
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-frost-dim">
                  {isAr ? "لا توجد طلبات بهذا التصنيف حالياً. سيصل طلب جديد قريباً..." : "No orders matching filter. Next order incoming..."}
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusColors = {
                    new: "bg-amber-100 text-amber-900 border-amber-300",
                    confirmed: "bg-blue-100 text-blue-900 border-blue-300",
                    out_for_delivery: "bg-purple-100 text-purple-900 border-purple-300",
                    delivered: "bg-emerald-100 text-emerald-900 border-emerald-300",
                    returned: "bg-rose-100 text-rose-900 border-rose-300",
                  };

                  const statusLabels = {
                    new: isAr ? "طلب جديد (COD)" : "New COD Order",
                    confirmed: isAr ? "تم التأكيد هاتفياً" : "Confirmed",
                    out_for_delivery: isAr ? "مع مندوب الشحن" : "Out for Delivery",
                    delivered: isAr ? "تم التحصيل نقداً (+أرباح)" : "Collected & Paid",
                    returned: isAr ? "مرتجع RTO" : "Returned RTO",
                  };

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-line bg-[#fbfcfd] p-4 transition-all hover:border-emerald-500/40 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{order.countryFlag}</span>
                          <div>
                            <p className="text-xs font-bold text-frost">
                              {order.customerName} · <span className="font-normal text-frost-dim">{order.city}</span>
                            </p>
                            <p className="text-[10px] font-mono text-frost-faint">
                              {order.orderNumber} · {order.channel}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            statusColors[order.status]
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3">
                        <div className="flex items-center gap-2">
                          <div className="relative size-8 overflow-hidden rounded-lg bg-slate-200">
                            <Image
                              src={order.productImage}
                              alt={order.productTitle}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="line-clamp-1 text-xs text-frost font-medium">
                            {order.productTitle}
                          </span>
                        </div>

                        <div className="text-end font-mono">
                          <p className="text-xs font-bold text-frost">{formatMoney(order.price)}</p>
                          <p className="text-[10px] font-bold text-emerald-600">
                            {isAr ? "صافي الربح:" : "Net:"} +{formatMoney(order.netProfit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
