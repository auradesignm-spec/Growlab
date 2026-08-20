"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Percent,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  CreditCard,
  Building,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useUgc } from "@/lib/UgcContext";
import { convertPrice } from "@/lib/ugc-store";
import { Product, SubscriptionTier } from "@/lib/ugc-types";

export const CreatorPortal: React.FC = () => {
  const {
    creators,
    activeCreatorId,
    setActiveCreatorId,
    products,
    orders,
    toggleCreatorProduct,
    placeOrder,
    currentCurrency,
  } = useUgc();

  const activeCreator = creators.find((c) => c.id === activeCreatorId) || creators[0];

  const [activeSubTab, setActiveSubTab] = useState<"overview" | "curation" | "catalog" | "ledger" | "subscription">("overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSimulatingSale, setIsSimulatingSale] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Orders attributed to this creator
  const creatorOrders = orders.filter((o) => o.creatorId === activeCreator.id);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/creator/${activeCreator.username}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSimulateSale = (productId: string) => {
    setIsSimulatingSale(true);
    setTimeout(() => {
      placeOrder({
        productId,
        creatorId: activeCreator.id,
        customerName: "عميل تجريبي (Simulated Buyer)",
        customerPhone: "+968 9123 4567",
        customerCity: "مسقط",
        customerCountry: activeCreator.country,
        quantity: 1,
        currency: currentCurrency,
      });
      setIsSimulatingSale(false);

      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#10B981", "#AD7A2A", "#F59E0B"],
        });
      });
    }, 400);
  };

  const handleRequestPayout = () => {
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Creator Profile Top Bar & Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-growlab-bgCard border border-growlab-border">
        <div className="flex items-center gap-3">
          <img
            src={activeCreator.avatar}
            alt={activeCreator.displayName}
            className="w-12 h-12 rounded-xl object-cover border-2 border-growlab-border"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-display text-white">
                {activeCreator.displayName}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-growlab-gold/20 text-growlab-gold border border-growlab-gold/30">
                {activeCreator.subscriptionTier.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-muted font-mono">
              رابط المتجر: growlab.com/creator/{activeCreator.username}
            </div>
          </div>
        </div>

        {/* Creator Switcher for Demo */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={activeCreator.id}
            onChange={(e) => setActiveCreatorId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-xs text-white outline-none font-mono"
          >
            {creators.map((c) => (
              <option key={c.id} value={c.id}>
                تبديل الحساب: @{c.username} ({c.displayName})
              </option>
            ))}
          </select>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold text-xs text-white transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-growlab-emerald" />
                <span className="text-growlab-emerald text-xs">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-growlab-gold" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>

          <Link
            href={`/creator/${activeCreator.username}`}
            className="p-2 rounded-xl bg-growlab-gold text-growlab-bgDark hover:brightness-110 transition-all font-bold"
            title="زيارة المتجر المباشر"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex items-center gap-1 border-b border-growlab-border pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === "overview"
              ? "bg-growlab-bgSurface text-white font-bold border border-growlab-border"
              : "text-muted hover:text-white"
          }`}
        >
          📊 لوحة الإيرادات والأداء
        </button>
        <button
          onClick={() => setActiveSubTab("curation")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === "curation"
              ? "bg-growlab-bgSurface text-white font-bold border border-growlab-border"
              : "text-muted hover:text-white"
          }`}
        >
          🎨 إدارة منتجات متجري ({activeCreator.selectedProductIds.length})
        </button>
        <button
          onClick={() => setActiveSubTab("catalog")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === "catalog"
              ? "bg-growlab-bgSurface text-white font-bold border border-growlab-border"
              : "text-muted hover:text-white"
          }`}
        >
          📦 كتالوج التجار المعتمدين ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab("ledger")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === "ledger"
              ? "bg-growlab-bgSurface text-white font-bold border border-growlab-border"
              : "text-muted hover:text-white"
          }`}
        >
          📑 سجل العمولات والتحويلات ({creatorOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab("subscription")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === "subscription"
              ? "bg-growlab-bgSurface text-white font-bold border border-growlab-border"
              : "text-muted hover:text-white"
          }`}
        >
          💎 باقات ورسوم المنصة
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* First Campaign Free Banner */}
          {activeCreator.isFirstCampaignFree && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-growlab-gold/20 via-growlab-bgSurface to-growlab-bgCard border border-growlab-gold/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-black">
                  0%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    ميزة الحملة الأولى المجانية مفعلة بحسابك!
                  </h4>
                  <p className="text-xs text-muted">
                    أول منتج تبيعه يتم بدون أي رسوم منصة (0% Platform Fee) لتجربة الأرباح بدون أي مخاطرة.
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono text-growlab-gold font-bold">
                ✓ تم توثيق الهوية ووسيلة الدفع
              </div>
            </div>
          )}

          {/* Stats KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>إجمالي العمولات المكتسبة</span>
                <DollarSign className="h-4 w-4 text-growlab-emerald" />
              </div>
              <div className="font-mono font-bold text-2xl text-growlab-emerald">
                ${activeCreator.stats.totalCommission.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted mt-2 flex items-center gap-1">
                <span className="text-growlab-emerald font-bold">+18.5%</span> مقارنة بالأسبوع الماضي
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>المبلغ المتاح للسحب الفوري</span>
                <CreditCard className="h-4 w-4 text-growlab-gold" />
              </div>
              <div className="font-mono font-bold text-2xl text-white">
                ${activeCreator.stats.pendingPayout.toLocaleString()}
              </div>
              <button
                onClick={handleRequestPayout}
                className="mt-2 text-xs font-bold text-growlab-gold hover:underline flex items-center gap-1"
              >
                <span>طلب سحب عبر Stripe Connect ←</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>معدل تحويل المتجر</span>
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="font-mono font-bold text-2xl text-cyan-400">
                {activeCreator.stats.conversionRate}%
              </div>
              <div className="text-[11px] text-muted mt-2">
                أعلى من متوسط السوق (3.2%)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>إجمالي الطلبات المكتملة</span>
                <ShoppingBag className="h-4 w-4 text-purple-400" />
              </div>
              <div className="font-mono font-bold text-2xl text-white">
                {activeCreator.stats.orderCount}
              </div>
              <div className="text-[11px] text-muted mt-2">
                مبيعات إجمالية: ${activeCreator.stats.salesValue.toLocaleString()}
              </div>
            </div>
          </div>

          {payoutSuccess && (
            <div className="p-4 rounded-xl bg-growlab-emerald/20 border border-growlab-emerald text-growlab-emerald text-xs font-bold text-center">
              ✓ تم إرسال طلب التحويل لحسابك البنكي المعتمد ({activeCreator.paymentMethod.bankName}) عبر Stripe Connect بنجاح!
            </div>
          )}

          {/* Quick Simulation Bar */}
          <div className="p-5 rounded-2xl bg-growlab-ledger border border-growlab-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Zap className="h-4 w-4 text-growlab-gold" />
                <span>محاكي الشراء اللحظي (Simulate Instant Sale)</span>
              </h4>
              <p className="text-xs text-muted">
                اضغط لتجربة شراء زائر لمنتج من متجرك ومشاهدة توزيع الأرباح الفوري في الدفتر ولوحة الترتيب.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSimulateSale(activeCreator.selectedProductIds[0] || products[0].id)}
                disabled={isSimulatingSale}
                className="px-4 py-2.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isSimulatingSale ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>جاري محاكاة العملية...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>تجربة بيع منتج الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Curation Tab */}
      {activeSubTab === "curation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-white">
                المنتجات المعروضة في متجرك المصغر
              </h3>
              <p className="text-xs text-muted">
                أنت تختار ما يناسب جمهورك فقط لتفادي تشتيت زوارك القادمين من تيك توك وإنستغرام.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab("catalog")}
              className="px-3.5 py-1.5 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold text-xs text-white flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5 text-growlab-gold" />
              <span>إضافة منتجات من الكتالوج المركزي</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter((p) => activeCreator.selectedProductIds.includes(p.id))
              .map((product) => {
                const commUSD = Number((product.priceUSD * product.commissionRate).toFixed(2));
                return (
                  <div
                    key={product.id}
                    className="p-4 rounded-2xl bg-growlab-bgCard border border-growlab-border flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-muted">تاجر: {product.merchantName}</span>
                        <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                        <div className="font-mono text-xs font-bold text-growlab-gold mt-1">
                          ${product.priceUSD}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border flex items-center justify-between text-xs">
                      <span className="text-muted">عمولتك على البيعة:</span>
                      <span className="font-mono font-bold text-growlab-emerald">
                        +{Math.round(product.commissionRate * 100)}% (${commUSD})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-growlab-border">
                      <button
                        onClick={() => toggleCreatorProduct(activeCreator.id, product.id)}
                        className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>إزالة من متجري</span>
                      </button>
                      <button
                        onClick={() => handleSimulateSale(product.id)}
                        className="px-3 py-1.5 rounded-lg bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold text-xs text-white"
                        title="تجربة بيع سريع"
                      >
                        ⚡ محاكاة
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 3. Catalog Tab */}
      {activeSubTab === "catalog" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold font-display text-white">
              كتالوج المنتجات المركزي للتجار المعتمدين
            </h3>
            <p className="text-xs text-muted">
              تصفح مخزون التجار الحقيقيين في الخليج، واختر المنتجات ذات العمولات الأعلى لإضافتها لمتجرك بنقرة واحدة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const isSelected = activeCreator.selectedProductIds.includes(product.id);
              const commUSD = Number((product.priceUSD * product.commissionRate).toFixed(2));
              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-2xl bg-growlab-bgCard border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected ? "border-growlab-emerald/60 shadow-glow-emerald/10" : "border-growlab-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted">التاجر: {product.merchantName}</span>
                        <span className="text-[10px] text-growlab-gold font-mono font-bold">
                          مخزون: {product.stock}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate mt-0.5">{product.name}</h4>
                      <div className="font-mono text-xs font-bold text-white mt-1">
                        ${product.priceUSD}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border flex items-center justify-between text-xs">
                    <span className="text-muted">عمولة الصانع:</span>
                    <span className="font-mono font-bold text-growlab-emerald">
                      {Math.round(product.commissionRate * 100)}% (${commUSD})
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCreatorProduct(activeCreator.id, product.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-growlab-emerald/20 text-growlab-emerald border border-growlab-emerald/40 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30"
                        : "bg-growlab-gold text-growlab-bgDark hover:brightness-110"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>معروض بمتجرك (انقر للإزالة)</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>إضافة لمتجري المصغر</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Ledger Tab */}
      {activeSubTab === "ledger" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-white">
                دفتر العمولات اللحظي (Real-Time Commission Ledger)
              </h3>
              <p className="text-xs text-muted">
                سجل شفاف لكل عملية بيع ناتجة من متجرك وتفاصيل تقسيم العمولات.
              </p>
            </div>
            <div className="text-xs font-mono text-growlab-emerald font-bold">
              إجمالي العمولات: ${activeCreator.stats.totalCommission.toLocaleString()}
            </div>
          </div>

          <div className="rounded-2xl bg-growlab-bgCard border border-growlab-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right text-xs">
                <thead className="bg-growlab-bgDark text-muted uppercase text-[11px] font-mono border-b border-growlab-border">
                  <tr>
                    <th className="py-3 px-4">رقم الطلب</th>
                    <th className="py-3 px-4">المنتج</th>
                    <th className="py-3 px-4">العميل</th>
                    <th className="py-3 px-4">قيمة الشراء</th>
                    <th className="py-3 px-4">عمولتك الصافية</th>
                    <th className="py-3 px-4">نصيب التاجر</th>
                    <th className="py-3 px-4">رسوم المنصة</th>
                    <th className="py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-growlab-border">
                  {creatorOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-growlab-bgSurface/40">
                      <td className="py-3 px-4 font-mono font-bold text-growlab-gold">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {order.productName}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {order.customerName} ({order.customerCity})
                      </td>
                      <td className="py-3 px-4 font-mono text-white">
                        ${order.splits.totalAmountUSD}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-growlab-emerald">
                        +${order.splits.creatorCommissionUSD} ({Math.round(order.splits.creatorCommissionRate * 100)}%)
                      </td>
                      <td className="py-3 px-4 font-mono text-muted">
                        ${order.splits.merchantAmountUSD}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted">
                        ${order.splits.platformFeeUSD} ({Math.round(order.splits.platformFeeRate * 100)}%)
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-growlab-emerald/20 text-growlab-emerald border border-growlab-emerald/30">
                          مكتمل ومسجل
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Subscription Tiers Tab */}
      {activeSubTab === "subscription" && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold font-display text-white">
              مستويات الاشتراك الاختيارية لصناع المحتوى
            </h3>
            <p className="text-xs text-muted">
              ابدأ مجاناً 100% بدون أي التزام مالي. إذا زاد حجم مبيعاتك، يمكنك الترقية لتقليل رسوم المنصة وزيادة أرباحك الصافية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-6 rounded-3xl bg-growlab-bgCard border border-growlab-border flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-lg bg-growlab-bgSurface text-xs font-bold text-muted">
                  بدون اشتراك (افتراضي)
                </span>
                <div className="font-mono text-2xl font-bold text-white">$0 / شهرياً</div>
                <p className="text-xs text-muted leading-relaxed">
                  مثالي لصناع المحتوى الجدد أو غير المنتظمين.
                </p>
                <div className="pt-3 border-t border-growlab-border space-y-2 text-xs text-onDarkSoft">
                  <div>✓ متجر مصغر متكامل مجاني</div>
                  <div>✓ أول حملة بدون أي رسوم منصة (0%)</div>
                  <div>✓ رسوم منصة قياسية (5%) بعد ذلك</div>
                  <div>✓ سحب عمولات أسبوعي</div>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-growlab-bgSurface border border-growlab-border text-xs text-muted">
                الباقة الحالية الافتراضية
              </button>
            </div>

            {/* Basic */}
            <div className="p-6 rounded-3xl bg-growlab-bgCard border border-growlab-border flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
                  الباقة الأساسية
                </span>
                <div className="font-mono text-2xl font-bold text-white">$19 / شهرياً</div>
                <p className="text-xs text-muted leading-relaxed">
                  للصانع الذي يبيع بانتظام بحجم صغير إلى متوسط.
                </p>
                <div className="pt-3 border-t border-growlab-border space-y-2 text-xs text-onDarkSoft">
                  <div>✓ تخفيض رسوم المنصة إلى 3% فقط</div>
                  <div>✓ سحب عمولات فوري خلال 24 ساعة</div>
                  <div>✓ إحصائيات متقدمة لمصادر الزيارات</div>
                  <div>✓ دعم واتساب مخصص لصناع المحتوى</div>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-cyan-400 text-xs text-white font-bold">
                ترقية للباقة الأساسية
              </button>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-growlab-bgCard to-growlab-bgSurface border-2 border-growlab-gold/60 shadow-glow-gold/20 flex flex-col justify-between space-y-4 relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-growlab-gold text-growlab-bgDark text-[10px] font-bold">
                الأكثر شعبية للنخبة
              </div>
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-lg bg-growlab-gold/20 text-growlab-gold text-xs font-bold border border-growlab-gold/30">
                  باقة المحترفين PRO
                </span>
                <div className="font-mono text-2xl font-bold text-white">$49 / شهرياً</div>
                <p className="text-xs text-muted leading-relaxed">
                  للصناع النشيطين بمبيعات متكررة وعالية.
                </p>
                <div className="pt-3 border-t border-growlab-border space-y-2 text-xs text-onDarkSoft">
                  <div>✓ أقل رسوم منصة (2% فقط)</div>
                  <div>✓ شارة التوثيق الذهبية المميزة (PRO)</div>
                  <div>✓ أولوية الظهور في لوحة الترتيب</div>
                  <div>✓ وصول حصري لمنتجات التجار الأكثر ربحية</div>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark text-xs font-bold hover:brightness-110 shadow-md">
                ترقية إلى باقة PRO الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
