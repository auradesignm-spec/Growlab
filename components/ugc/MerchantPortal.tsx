"use client";

import React, { useState } from "react";
import {
  Store,
  Plus,
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Percent,
  Layers,
  CheckCircle2,
  Package,
  Building,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useUgc } from "@/lib/UgcContext";
import { ProductCategory, TargetAudienceGender } from "@/lib/ugc-types";

export const MerchantPortal: React.FC = () => {
  const {
    merchants,
    activeMerchantId,
    setActiveMerchantId,
    products,
    orders,
    creators,
    addProduct,
  } = useUgc();

  const activeMerchant = merchants.find((m) => m.id === activeMerchantId) || merchants[0];

  const [activeSubTab, setActiveSubTab] = useState<"overview" | "catalog" | "creators-breakdown" | "add-product">("overview");

  // New product form
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("tech");
  const [genderTarget, setGenderTarget] = useState<TargetAudienceGender>("all");
  const [priceUSD, setPriceUSD] = useState<number>(65);
  const [costUSD, setCostUSD] = useState<number>(20);
  const [commissionRate, setCommissionRate] = useState<number>(0.18);
  const [stock, setStock] = useState<number>(50);
  const [image, setImage] = useState("");
  const [sellingPoint1, setSellingPoint1] = useState("");
  const [sellingPoint2, setSellingPoint2] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Products by this merchant
  const merchantProducts = products.filter((p) => p.merchantId === activeMerchant.id);
  const merchantOrders = orders.filter((o) => o.merchantId === activeMerchant.id);

  // Creator performance breakdown for this merchant
  const creatorBreakdown = creators.map((creator) => {
    const attributedOrders = merchantOrders.filter((o) => o.creatorId === creator.id);
    const totalSales = attributedOrders.reduce((sum, o) => sum + o.splits.totalAmountUSD, 0);
    const netMerchant = attributedOrders.reduce((sum, o) => sum + o.splits.merchantAmountUSD, 0);
    const creatorComm = attributedOrders.reduce((sum, o) => sum + o.splits.creatorCommissionUSD, 0);

    return {
      creator,
      orderCount: attributedOrders.length,
      totalSales,
      netMerchant,
      creatorComm,
      isPromoting: creator.selectedProductIds.some((pId) =>
        merchantProducts.some((mp) => mp.id === pId)
      ),
    };
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProduct({
      merchantId: activeMerchant.id,
      merchantName: activeMerchant.businessName,
      name,
      nameEn: nameEn || name,
      description: description || "منتج تجاري عالي الجودة معتمد من التاجر.",
      category,
      genderTarget,
      priceUSD: Number(priceUSD),
      costUSD: Number(costUSD),
      commissionRate: Number(commissionRate),
      stock: Number(stock),
      image:
        image ||
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
      sellingPoints: [sellingPoint1 || "جودة ممتازة", sellingPoint2 || "توصيل سريع لباب البيت"],
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setActiveSubTab("catalog");
      setName("");
      setDescription("");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Merchant Header & Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-growlab-bgCard border border-growlab-border">
        <div className="flex items-center gap-3">
          <img
            src={activeMerchant.logo}
            alt={activeMerchant.businessName}
            className="w-12 h-12 rounded-xl object-cover border-2 border-growlab-border"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-display text-white">
                {activeMerchant.businessName}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-growlab-emerald/20 text-growlab-emerald border border-growlab-emerald/30">
                تاجر معتمد وموثق
              </span>
            </div>
            <div className="text-xs text-muted">
              {activeMerchant.country === "OM" ? "🇴🇲 سلطنة عُمان" : activeMerchant.country === "SA" ? "🇸🇦 السعودية" : "🇦🇪 الإمارات"} • {activeMerchant.contactEmail}
            </div>
          </div>
        </div>

        {/* Merchant switcher for Demo */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={activeMerchant.id}
            onChange={(e) => setActiveMerchantId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-xs text-white outline-none font-mono"
          >
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                تبديل المتجر: {m.businessName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setActiveSubTab("add-product")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs hover:brightness-110 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>رفع منتج جديد</span>
          </button>
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
          📊 ملخص مبيعات التجار
        </button>
        <button
          onClick={() => setActiveSubTab("creators-breakdown")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === "creators-breakdown"
              ? "bg-growlab-bgSurface text-white font-bold border border-growlab-border"
              : "text-muted hover:text-white"
          }`}
        >
          👥 مبيعات كل صانع محتوى بالتفصيل
        </button>
        <button
          onClick={() => setActiveSubTab("catalog")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === "catalog"
              ? "bg-growlab-bgSurface text-white font-bold border border-growlab-border"
              : "text-muted hover:text-white"
          }`}
        >
          📦 منتجاتي في الكتالوج المركزي ({merchantProducts.length})
        </button>
        <button
          onClick={() => setActiveSubTab("add-product")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === "add-product"
              ? "bg-growlab-bgSurface text-white font-bold border border-growlab-border"
              : "text-muted hover:text-white"
          }`}
        >
          ➕ إضافة منتج وتحديد العمولة
        </button>
      </div>

      {/* 1. Overview */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>صافي أرباح التاجر (Net Revenue)</span>
                <DollarSign className="h-4 w-4 text-growlab-emerald" />
              </div>
              <div className="font-mono font-bold text-2xl text-growlab-emerald">
                ${activeMerchant.netRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted mt-2">
                بعد خصم عمولات الصناع ورسوم المنصة
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>إجمالي الطلبات المكتملة</span>
                <ShoppingBag className="h-4 w-4 text-growlab-gold" />
              </div>
              <div className="font-mono font-bold text-2xl text-white">
                {activeMerchant.totalOrders.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted mt-2">
                معدل تقييم العملاء: {activeMerchant.rating} ★
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>صناع محتوى يروجون لمنتجاتك</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="font-mono font-bold text-2xl text-cyan-400">
                {creatorBreakdown.filter((cb) => cb.isPromoting).length} صناع
              </div>
              <div className="text-[11px] text-muted mt-2">
                ينشرون فيديوهات UGC مستمرة
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>متوسط حصة التاجر</span>
                <Percent className="h-4 w-4 text-purple-400" />
              </div>
              <div className="font-mono font-bold text-2xl text-white">
                ~77%
              </div>
              <div className="text-[11px] text-muted mt-2">
                نموذج مشاركة أرباح خالي من المخاطرة
              </div>
            </div>
          </div>

          {/* Model Explanation */}
          <div className="p-5 rounded-2xl bg-growlab-ledger border border-growlab-border space-y-2">
            <h4 className="text-sm font-bold text-growlab-gold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>ميزة التاجر في منصة Growlab UGC:</span>
            </h4>
            <p className="text-xs text-onDarkSoft leading-relaxed">
              أنت لا تدفع أي ميزانيات تسويق مسبقة أو رواتب إعلانات. صناع المحتوى المعتمدون يختارون منتجاتك، يصنعون فيديوهات UGC حقيقية لجمهورهم، وأنت تدفع العمولة فقط بعد تأكيد استلام العميل للطلب ودفع المبلغ.
            </p>
          </div>
        </div>
      )}

      {/* 2. Creators Breakdown Tab */}
      {activeSubTab === "creators-breakdown" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold font-display text-white">
              تقرير أداء مبيعات صناع المحتوى لعلامتك التجارية
            </h3>
            <p className="text-xs text-muted">
              تتبع حجم المبيعات وصافي الأرباح الناتجة من كل صانع محتوى على حدة بدقة وشفافية.
            </p>
          </div>

          <div className="rounded-2xl bg-growlab-bgCard border border-growlab-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right text-xs">
                <thead className="bg-growlab-bgDark text-muted uppercase text-[11px] font-mono border-b border-growlab-border">
                  <tr>
                    <th className="py-3 px-4">صانع المحتوى</th>
                    <th className="py-3 px-4">حالة العرض</th>
                    <th className="py-3 px-4">عدد المبيعات</th>
                    <th className="py-3 px-4">إجمالي قيمة المبيعات</th>
                    <th className="py-3 px-4">عمولة الصانع المدفوعة</th>
                    <th className="py-3 px-4">صافي أرباحك كتاجر</th>
                    <th className="py-3 px-4 text-center">المتجر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-growlab-border">
                  {creatorBreakdown.map(({ creator, orderCount, totalSales, netMerchant, creatorComm, isPromoting }) => (
                    <tr key={creator.id} className="hover:bg-growlab-bgSurface/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={creator.avatar}
                            alt={creator.displayName}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-bold text-white">{creator.displayName}</div>
                            <div className="font-mono text-[10px] text-muted">@{creator.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPromoting ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-growlab-emerald/20 text-growlab-emerald border border-growlab-emerald/30">
                            ✓ معروض بمتجره
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] text-muted bg-growlab-bgDark">
                            غير مختار
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-white">
                        {orderCount} طلبات
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ${totalSales}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-growlab-gold">
                        ${creatorComm}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-growlab-emerald">
                        ${netMerchant}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={`/creator/${creator.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-growlab-bgDark text-muted hover:text-white border border-growlab-border text-[11px]"
                        >
                          زيارة المتجر
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Catalog Tab */}
      {activeSubTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-white">
                منتجاتك الحالية في الكتالوج المركزي
              </h3>
              <p className="text-xs text-muted">
                هذه المنتجات متاحة لجميع صناع المحتوى لإضافتها لمتاجرهم والترويج لها.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab("add-product")}
              className="px-3.5 py-1.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إضافة منتج</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {merchantProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-2xl bg-growlab-bgCard border border-growlab-border space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-growlab-gold font-mono font-bold">
                      مخزون: {product.stock} حبة
                    </span>
                    <h4 className="text-xs font-bold text-white truncate mt-0.5">{product.name}</h4>
                    <div className="font-mono text-xs font-bold text-white mt-1">
                      سعر البيع: ${product.priceUSD}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border flex items-center justify-between text-xs">
                  <span className="text-muted">عمولة الصانع المحددة:</span>
                  <span className="font-mono font-bold text-growlab-emerald">
                    {Math.round(product.commissionRate * 100)}% (${Number((product.priceUSD * product.commissionRate).toFixed(2))})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Add Product Tab */}
      {activeSubTab === "add-product" && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-growlab-bgCard border border-growlab-border space-y-6">
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              رفع منتج جديد للكتالوج المركزي
            </h3>
            <p className="text-xs text-muted mt-1">
              حدد سعر التجزئة ونسبة عمولة صانع المحتوى الجذابة لتحفيزهم على الترويج لمنتجك.
            </p>
          </div>

          {isSaved && (
            <div className="p-3 rounded-xl bg-growlab-emerald/20 border border-growlab-emerald text-growlab-emerald text-xs font-bold text-center">
              ✓ تم نشر المنتج في الكتالوج المركزي بنجاح!
            </div>
          )}

          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1">اسم المنتج باللغة العربية *</label>
              <input
                type="text"
                required
                placeholder="مثال: ساعة كرونوغراف فاخرة ضد الماء"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border focus:border-growlab-gold text-white text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">فئة المنتج *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none"
                >
                  <option value="tech">📱 إلكترونيات وتقنية</option>
                  <option value="perfume">✨ عطور وبخور</option>
                  <option value="fashion">👗 أزياء وعبايات</option>
                  <option value="beauty">🌿 عناية وجمال</option>
                  <option value="lifestyle">☕ لايف ستايل ومنزل</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">الجمهور المستهدف (الجنس) *</label>
                <select
                  value={genderTarget}
                  onChange={(e) => setGenderTarget(e.target.value as TargetAudienceGender)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none"
                >
                  <option value="all">الكل (Unisex)</option>
                  <option value="men">👔 رجالي فقط</option>
                  <option value="women">👗 نسائي فقط</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">سعر البيع ($) *</label>
                <input
                  type="number"
                  required
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">عمولة الصانع (%) *</label>
                <select
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-growlab-bgDark border border-growlab-border text-growlab-emerald text-xs font-mono font-bold outline-none"
                >
                  <option value={0.15}>15% عمولة</option>
                  <option value={0.18}>18% عمولة (موصى بها)</option>
                  <option value={0.20}>20% عمولة ممتازة</option>
                  <option value={0.25}>25% عمولة حصرية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">المخزون المتوفر *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">وصف المنتج وميزاته</label>
              <textarea
                rows={2}
                placeholder="تفاصيل المنتج وضمان التوصيل..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border focus:border-growlab-gold text-white text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 transition-all shadow-md cursor-pointer"
            >
              ✓ نشر المنتج بالكتالوج المركزي لصناع المحتوى
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
