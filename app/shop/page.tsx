"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Filter,
  ArrowRight,
  Flame,
  Award,
  Heart,
  Eye,
  Check,
  Store,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useUgc } from "@/lib/UgcContext";
import { convertPrice } from "@/lib/ugc-store";
import { Product, ProductCategory, TargetAudienceGender } from "@/lib/ugc-types";
import { StorefrontNav } from "@/components/store/StorefrontNav";
import { CartDrawer } from "@/components/store/CartDrawer";

export default function ShopPage() {
  const {
    products,
    creators,
    currentCurrency,
    addToCart,
    placeOrder,
  } = useUgc();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [selectedGender, setSelectedGender] = useState<TargetAudienceGender | "all">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  // Instant Split Checkout modal state
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("مسقط");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
        if (selectedGender !== "all" && p.genderTarget !== selectedGender && p.genderTarget !== "all") return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q);
          const matchesDesc = p.description.toLowerCase().includes(q);
          const matchesMerchant = p.merchantName.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesMerchant) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceUSD - b.priceUSD;
        if (sortBy === "price-desc") return b.priceUSD - a.priceUSD;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0; // featured
      });
  }, [products, selectedCategory, selectedGender, searchQuery, sortBy]);

  const handleInstantBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForBuy || !customerName.trim() || !customerPhone.trim()) return;

    setIsOrdering(true);
    setTimeout(() => {
      const result = placeOrder({
        productId: selectedProductForBuy.id,
        creatorId: creators[0]?.id || "c_salem",
        customerName,
        customerPhone,
        customerCity,
        customerCountry: "OM",
        quantity: 1,
        currency: currentCurrency,
      });

      setIsOrdering(false);
      setOrderSuccessData(result);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#AD7A2A", "#10B981", "#34D399", "#F59E0B"],
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-growlab-bg text-onDark selection:bg-growlab-gold/30 selection:text-white" dir="rtl">
      {/* 1. Dedicated E-Commerce Navigation Bar */}
      <StorefrontNav
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* 2. Slide-out Cart Drawer */}
      <CartDrawer />

      {/* 3. Flash Promotion / Curated Hero Banner (Noon / Shein Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-growlab-bgCard via-growlab-bgDark to-growlab-bgCard border border-growlab-border p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-96 h-96 bg-growlab-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-growlab-emerald/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-right max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-growlab-gold/20 text-growlab-gold border border-growlab-gold/30 text-xs font-bold">
                <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>موسم تخفيضات ومختارات صناع المحتوى الحصرية</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight leading-tight">
                تسوق المنتجات الأكثر رواجاً مع{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-growlab-gold via-amber-300 to-growlab-goldLight">
                  ضمان الأصالة الخليجي
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-onDarkSoft leading-relaxed">
                كل منتج معروض هنا خضع لاختبار وتوصية صناع محتوى معتمدين. توصيل سريع لباب بيتك مع خيارات الدفع الآمن.
              </p>
            </div>

            {/* Quick Stats Grid inside Banner */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
              <div className="p-4 rounded-2xl bg-growlab-bgDark/80 border border-growlab-border text-center">
                <div className="text-lg sm:text-xl font-mono font-bold text-growlab-gold">100%</div>
                <div className="text-[11px] text-muted">منتجات أصلية ومضمونة</div>
              </div>
              <div className="p-4 rounded-2xl bg-growlab-bgDark/80 border border-growlab-border text-center">
                <div className="text-lg sm:text-xl font-mono font-bold text-growlab-emerald">24-48 ساعة</div>
                <div className="text-[11px] text-muted">توصيل خليجي سريع</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Controls Strip (Gender & Sorting) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-growlab-bgCard border border-growlab-border text-xs">
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted text-[11px] ml-1">التصنيف:</span>
            <button
              onClick={() => setSelectedGender("all")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedGender === "all"
                  ? "bg-growlab-gold text-growlab-bgDark font-bold"
                  : "bg-growlab-bgDark border border-growlab-border text-muted hover:text-white"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedGender("men")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedGender === "men"
                  ? "bg-growlab-gold text-growlab-bgDark font-bold"
                  : "bg-growlab-bgDark border border-growlab-border text-muted hover:text-white"
              }`}
            >
              👔 رجالي
            </button>
            <button
              onClick={() => setSelectedGender("women")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedGender === "women"
                  ? "bg-growlab-gold text-growlab-bgDark font-bold"
                  : "bg-growlab-bgDark border border-growlab-border text-muted hover:text-white"
              }`}
            >
              👗 نسائي
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-muted text-[11px]">ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none focus:border-growlab-gold cursor-pointer"
            >
              <option value="featured">المختارات المميزة</option>
              <option value="rating">الأعلى تقييماً ★</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>
      </section>

      {/* 5. Product Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              المنتجات المعروضة
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-growlab-bgCard border border-growlab-border text-growlab-gold">
              {filteredProducts.length} منتج
            </span>
          </div>

          {/* Browse Creator Stores Link */}
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>تفضل الشراء من صانع معين؟</span>
            <Link
              href={`/creator/${creators[0]?.username || "salem_ugc"}`}
              className="text-growlab-gold hover:underline font-bold"
            >
              تصفح متاجر الصناع ←
            </Link>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-growlab-bgCard border border-growlab-border space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="text-base font-bold text-white">لا توجد منتجات مطابقة لبحثك</h3>
            <p className="text-xs text-muted">جرب البحث بكلمة أخرى أو تغيير الفئات المحددة.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedGender("all");
              }}
              className="px-4 py-2 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs hover:brightness-110"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const converted = convertPrice(product.priceUSD, currentCurrency);
              // Find matching creator who promotes this product
              const endorsingCreator = creators.find((c) => c.selectedProductIds.includes(product.id)) || creators[0];

              return (
                <div
                  key={product.id}
                  className="group rounded-3xl bg-growlab-bgCard border border-growlab-border hover:border-growlab-gold/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-glow-gold/10"
                >
                  {/* Image Container */}
                  <div className="relative h-60 w-full bg-growlab-bgDark overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-growlab-bgCard via-transparent to-transparent opacity-90" />

                    {/* Category badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-xl bg-growlab-bgDark/90 backdrop-blur-md text-[11px] font-bold text-growlab-gold border border-growlab-gold/30">
                        {product.category === "tech"
                          ? "📱 تقنية"
                          : product.category === "perfume"
                          ? "💎 عطور"
                          : product.category === "fashion"
                          ? "👗 أزياء"
                          : "🌿 جمال"}
                      </span>
                    </div>

                    {/* Stock badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-growlab-emerald font-mono">
                        متاح ({product.stock})
                      </span>
                    </div>

                    {/* Price banner */}
                    <div className="absolute bottom-3 right-3">
                      <div className="px-3 py-1 rounded-xl bg-growlab-bgDark/95 backdrop-blur-md border border-growlab-border">
                        <span className="font-mono font-bold text-white text-base">
                          {converted.formatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <span>★ {product.rating}</span>
                          <span className="text-muted font-normal text-[11px]">
                            ({product.reviewsCount})
                          </span>
                        </div>
                        <span className="text-[10px] text-muted">
                          المورد: {product.merchantName}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold font-display text-white line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Creator Endorsement Badge */}
                      {endorsingCreator && (
                        <Link
                          href={`/creator/${endorsingCreator.username}`}
                          className="inline-flex items-center gap-1.5 p-1.5 px-2.5 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold/60 text-[11px] text-white transition-colors"
                        >
                          <img
                            src={endorsingCreator.avatar}
                            alt={endorsingCreator.displayName}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-muted">موصى به من:</span>
                          <span className="text-growlab-gold font-bold">@{endorsingCreator.username}</span>
                        </Link>
                      )}
                    </div>

                    {/* Dual Action Buttons: Add to Cart & Fast Buy */}
                    <div className="pt-3 border-t border-growlab-border/70 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1, endorsingCreator?.id)}
                        className="py-2.5 px-3 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-emerald text-white hover:text-growlab-emerald font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>أضف للسلة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProductForBuy(product)}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>شراء فوري</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Trust & Gold Guarantee Ribbon */}
        <section className="mt-16 p-8 rounded-3xl bg-growlab-bgCard border border-growlab-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-right">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-growlab-bgSurface text-growlab-gold shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">توصيل خليجي مباشر</h4>
                <p className="text-xs text-muted leading-relaxed">
                  شحن سريع من مستودعات التاجر في عُمان، السعودية، والإمارات مع رقم تتبع لحظي.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-growlab-bgSurface text-growlab-emerald shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">الضمان الذهبي للأصالة</h4>
                <p className="text-xs text-muted leading-relaxed">
                  جميع المنتجات خاضعة لتدقيق الجودة ومطابقة لمراجعات صناع المحتوى المعتمدين.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-growlab-bgSurface text-growlab-gold shrink-0">
                <Percent className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">دعم صناع المحتوى</h4>
                <p className="text-xs text-muted leading-relaxed">
                  عملية الشراء تضمن مكافأة الصانع الذي رشح المنتج بعمولة عادلة ومحمية بنظام الضمان.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Instant Split Checkout Modal */}
      {selectedProductForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-growlab-bgCard border border-growlab-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {orderSuccessData ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-growlab-emerald/20 text-growlab-emerald border border-growlab-emerald/40 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold font-display text-white">
                  تم تأكيد الطلب وتوزيع الأرباح لحظياً!
                </h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  رقم الطلب: <span className="font-mono text-growlab-gold font-bold">{orderSuccessData.order.orderNumber}</span>
                  <br />
                  تم تسجيل إسناد الشراء للمورد <span className="text-white font-bold">{selectedProductForBuy.merchantName}</span>.
                </p>

                {/* Ledger summary */}
                <div className="p-4 rounded-xl bg-growlab-bgDark border border-growlab-border text-right space-y-2 text-xs">
                  <div className="font-bold text-growlab-gold text-xs border-b border-growlab-border pb-1">
                    📊 سجل الشفافية وتوزيع العملية (Real-Time Split Ledger):
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>• نصيب التاجر ({Math.round(orderSuccessData.split.merchantRate * 100)}%):</span>
                    <span className="font-mono text-white font-bold">${orderSuccessData.split.merchantAmountUSD}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>• عمولة الصانع الشريك ({Math.round(orderSuccessData.split.creatorCommissionRate * 100)}%):</span>
                    <span className="font-mono text-growlab-emerald font-bold">+${orderSuccessData.split.creatorCommissionUSD}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>• رسوم المنصة ({Math.round(orderSuccessData.split.platformFeeRate * 100)}%):</span>
                    <span className="font-mono text-growlab-gold font-bold">${orderSuccessData.split.platformFeeUSD}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedProductForBuy(null);
                      setOrderSuccessData(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs hover:brightness-110"
                  >
                    متابعة التسوق في المتجر
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2.5 rounded-xl bg-growlab-bgSurface border border-growlab-border text-xs text-white hover:border-growlab-gold"
                  >
                    العودة للرئيسية
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-growlab-border">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-growlab-gold" />
                    <h3 className="text-base font-bold font-display text-white">
                      إتمام الشراء السريع
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedProductForBuy(null)}
                    className="text-muted hover:text-white text-lg font-mono p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Selected Product Summary */}
                <div className="flex items-center gap-3 my-4 p-3 rounded-2xl bg-growlab-bgDark border border-growlab-border">
                  <img
                    src={selectedProductForBuy.image}
                    alt={selectedProductForBuy.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{selectedProductForBuy.name}</h4>
                    <p className="text-[11px] text-muted">التاجر المورد: {selectedProductForBuy.merchantName}</p>
                    <div className="font-mono font-bold text-growlab-gold text-xs mt-0.5">
                      {convertPrice(selectedProductForBuy.priceUSD, currentCurrency).formatted}
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleInstantBuySubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">الاسم الكريم بالكامل *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سالم بن سعيد"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border focus:border-growlab-gold text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1">رقم هاتف الواتساب للتوصيل *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+968 9XXXXXXX أو +966 5XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border focus:border-growlab-gold text-white text-xs outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1">المدينة / العنوان بالتفصيل *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مسقط - الخوض - قرب الجامع"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border focus:border-growlab-gold text-white text-xs outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isOrdering}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isOrdering ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-growlab-bgDark border-t-transparent animate-spin" />
                          <span>جاري تسجيل الطلب وتوزيع الحسابات...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>تأكيد الشراء الفوري ({convertPrice(selectedProductForBuy.priceUSD, currentCurrency).formatted})</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-muted mt-2">
                      🔒 دفع آمن ومشفر • الدفع عند الاستلام متاح في الخليج
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
