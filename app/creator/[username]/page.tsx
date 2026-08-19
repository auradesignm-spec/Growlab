"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Share2,
  ExternalLink,
  Filter,
  ArrowRight,
  Truck,
  Heart,
  RotateCcw,
  Check,
  Layers,
  Globe,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Award,
  ChevronRight,
  Percent,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useUgc } from "@/lib/UgcContext";
import { convertPrice, CURRENCIES } from "@/lib/ugc-store";
import { Product, CurrencyCode, TargetAudienceGender, ProductCategory } from "@/lib/ugc-types";

export default function CreatorStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = Array.isArray(params?.username) ? params.username[0] : params?.username;
  const username = decodeURIComponent(rawUsername || "");

  const {
    getCreatorByUsername,
    getProductsForCreator,
    currentCurrency,
    setCurrentCurrency,
    currentLanguage,
    setCurrentLanguage,
    placeOrder,
    creators,
    products: allProducts,
    addToCart,
  } = useUgc();
  import { CartDrawer } from "@/components/store/CartDrawer";

  const creator = getCreatorByUsername(username);

  // Filters
  const [selectedGender, setSelectedGender] = useState<TargetAudienceGender | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Checkout modal
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("مسقط");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  // Curated products
  const creatorProducts = useMemo(() => {
    if (!creator) return [];
    return getProductsForCreator(creator.id);
  }, [creator, getProductsForCreator]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return creatorProducts.filter((p) => {
      if (selectedGender !== "all" && p.genderTarget !== selectedGender && p.genderTarget !== "all") {
        return false;
      }
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [creatorProducts, selectedGender, selectedCategory, searchQuery]);

  const handleCopyStoreLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForBuy || !creator || !customerName.trim() || !customerPhone.trim()) return;

    setIsOrdering(true);
    setTimeout(() => {
      const result = placeOrder({
        productId: selectedProductForBuy.id,
        creatorId: creator.id,
        customerName,
        customerPhone,
        customerCity,
        customerCountry: creator.country,
        quantity: 1,
        currency: currentCurrency,
      });

      setIsOrdering(false);
      setOrderSuccessData(result);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#AD7A2A", "#10B981", "#34D399", "#F59E0B"],
      });
    }, 600);
  };

  if (!creator) {
    return (
      <div className="min-h-screen bg-growlab-bg text-onDark flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-growlab-border flex items-center justify-center mb-4 text-2xl">
          🔍
        </div>
        <h1 className="text-2xl font-bold font-display text-white mb-2">
          المتجر المصغر غير موجود • Storefront Not Found
        </h1>
        <p className="text-sm text-muted max-w-md mb-6">
          لم يتم العثور على صانع محتوى باسم المستخدم &quot;@{username}&quot;. يمكنك تصفح المتاجر المعتمدة النشطة أدناه.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {creators.map((c) => (
            <Link
              key={c.id}
              href={`/creator/${c.username}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold transition-all text-sm"
            >
              <img src={c.avatar} alt={c.displayName} className="w-6 h-6 rounded-full object-cover" />
              <span>@{c.username}</span>
            </Link>
          ))}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold hover:brightness-110 transition-all text-sm"
        >
          العودة للرئيسية • Back to Growlab
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-growlab-bg text-onDark selection:bg-growlab-gold/30 selection:text-white" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
      {/* Top Universal Micro Navigation */}
      <header className="sticky top-0 z-40 bg-growlab-bgDark/90 backdrop-blur-md border-b border-growlab-border px-4 py-2.5">
        <div className="max-w-wrap mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-white transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
              <span className="hidden sm:inline">منصة Growlab</span>
            </Link>
            <span className="text-growlab-border">/</span>
            <div className="flex items-center gap-1.5 text-xs text-growlab-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-bold">متجر صانع محتوى موثق</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-growlab-bgSurface border border-growlab-border rounded-lg p-1">
              {(["OMR", "SAR", "AED", "USD"] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrentCurrency(c)}
                  className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all ${
                    currentCurrency === c
                      ? "bg-growlab-gold text-growlab-bgDark font-bold shadow-sm"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {CURRENCIES[c].flag} {c}
                </button>
              ))}
            </div>

            {/* Share button */}
            <button
              onClick={handleCopyStoreLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold transition-all text-xs text-white"
              title="نسخ رابط المتجر"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-growlab-emerald" />
                  <span className="text-growlab-emerald text-xs">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-growlab-gold" />
                  <span className="hidden sm:inline">مشاركة المتجر</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Creator Banner & Profile Hero */}
      <section className="relative bg-growlab-bgDark border-b border-growlab-border overflow-hidden">
        {/* Banner Image with Mesh Overlay */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden">
          <img
            src={creator.banner}
            alt={creator.displayName}
            className="w-full h-full object-cover object-center filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-growlab-bgDark via-growlab-bgDark/60 to-transparent" />
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        </div>

        {/* Profile Card Container */}
        <div className="max-w-wrap mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-growlab-bgDark shadow-2xl bg-growlab-bgCard"
                />
                <div
                  className="absolute -bottom-1.5 -right-1.5 p-1 rounded-lg bg-growlab-gold text-growlab-bgDark shadow-md"
                  title="حساب موثق بهوية وطنية"
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                    {creator.displayName}
                  </h1>
                  {creator.subscriptionTier === "pro" && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-growlab-gold/20 text-growlab-gold border border-growlab-gold/40">
                      ★ PRO CREATOR
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="font-mono text-growlab-gold">@{creator.username}</span>
                  <span>•</span>
                  <span>{creator.country === "OM" ? "🇴🇲 سلطنة عُمان" : creator.country === "SA" ? "🇸🇦 السعودية" : "🇦🇪 الإمارات"}</span>
                  {creator.socialLinks.followersCount && (
                    <>
                      <span>•</span>
                      <span className="text-white font-medium">{creator.socialLinks.followersCount} متابع</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-3 bg-growlab-bgSurface/90 border border-growlab-border p-2.5 rounded-xl text-xs w-full sm:w-auto justify-around sm:justify-end">
              <div className="text-center px-3 border-l rtl:border-l-0 rtl:border-r border-growlab-border first:border-0">
                <div className="text-[10px] text-muted uppercase">معدل التحويل</div>
                <div className="font-mono font-bold text-growlab-emerald text-sm">
                  {creator.stats.conversionRate}%
                </div>
              </div>
              <div className="text-center px-3 border-l rtl:border-l-0 rtl:border-r border-growlab-border">
                <div className="text-[10px] text-muted uppercase">طلبات مكتملة</div>
                <div className="font-mono font-bold text-white text-sm">
                  {creator.stats.orderCount}+
                </div>
              </div>
              <div className="text-center px-3">
                <div className="text-[10px] text-muted uppercase">نسبة الرضا</div>
                <div className="font-mono font-bold text-growlab-gold text-sm">99.4%</div>
              </div>
            </div>
          </div>

          {/* Bio text */}
          <p className="mt-4 text-sm text-onDarkSoft max-w-3xl leading-relaxed">
            {creator.bio}
          </p>

          {/* Badges strip */}
          {creator.badges.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {creator.badges.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-growlab-bgCard border border-growlab-border text-xs text-muted hover:border-growlab-gold/50 transition-colors"
                >
                  <span>{b.icon}</span>
                  <span className="text-white font-medium">{b.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Storefront Content Area */}
      <main className="max-w-wrap mx-auto px-4 sm:px-6 py-8">
        {/* Curated Products Header & Filtering Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-growlab-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                المختارات المعتمدة في متجري
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-growlab-bgCard border border-growlab-border text-growlab-gold">
                {filteredProducts.length} منتج
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              منتجات تجار حقيقيين تم اختبارها وتنسيقها بعناية مع ضمان أصالة 100% وتوصيل سريع.
            </p>
          </div>

          {/* Segmentation Filters (Gender, Category, Search) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Gender filter */}
            <div className="flex items-center bg-growlab-bgDark border border-growlab-border rounded-xl p-1 text-xs">
              <button
                onClick={() => setSelectedGender("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedGender === "all"
                    ? "bg-growlab-bgSurface text-white font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedGender("men")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedGender === "men"
                    ? "bg-growlab-bgSurface text-white font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                👔 رجالي
              </button>
              <button
                onClick={() => setSelectedGender("women")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedGender === "women"
                    ? "bg-growlab-bgSurface text-white font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                👗 نسائي
              </button>
            </div>

            {/* Category filter */}
            <div className="flex items-center bg-growlab-bgDark border border-growlab-border rounded-xl p-1 text-xs overflow-x-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-growlab-gold text-growlab-bgDark font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                جميع الفئات
              </button>
              <button
                onClick={() => setSelectedCategory("tech")}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === "tech"
                    ? "bg-growlab-gold text-growlab-bgDark font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                تقنية
              </button>
              <button
                onClick={() => setSelectedCategory("perfume")}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === "perfume"
                    ? "bg-growlab-gold text-growlab-bgDark font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                عطور
              </button>
              <button
                onClick={() => setSelectedCategory("fashion")}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === "fashion"
                    ? "bg-growlab-gold text-growlab-bgDark font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                أزياء
              </button>
              <button
                onClick={() => setSelectedCategory("beauty")}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === "beauty"
                    ? "bg-growlab-gold text-growlab-bgDark font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                جمال
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-growlab-border rounded-2xl bg-growlab-bgDark/50 my-8">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-base font-bold text-white mb-1">لا توجد منتجات مطابقة لخيارات الفلترة</h3>
            <p className="text-xs text-muted mb-4">جرب تغيير فلتر الجنس أو الفئة لتصفح باقي مختارات الصانع.</p>
            <button
              onClick={() => {
                setSelectedGender("all");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border text-xs text-white hover:border-growlab-gold"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredProducts.map((product) => {
              const converted = convertPrice(product.priceUSD, currentCurrency);
              return (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-growlab-bgCard border border-growlab-border hover:border-growlab-gold/60 transition-all duration-300 overflow-hidden flex flex-col shadow-lg hover:shadow-glow-gold/10"
                >
                  {/* Image container */}
                  <div className="relative h-56 w-full bg-growlab-bgDark overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-growlab-bgCard via-transparent to-transparent opacity-80" />

                    {/* Top badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-growlab-bgDark/80 backdrop-blur-md text-[11px] font-bold text-growlab-gold border border-growlab-gold/30">
                        {product.category === "tech"
                          ? "📱 تقنية"
                          : product.category === "perfume"
                          ? "✨ عطور"
                          : product.category === "fashion"
                          ? "👗 أزياء"
                          : "🌿 جمال"}
                      </span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-muted">
                        تاجر معتمد: {product.merchantName}
                      </span>
                    </div>

                    {/* Price banner */}
                    <div className="absolute bottom-3 right-3">
                      <div className="px-3 py-1.5 rounded-xl bg-growlab-bgDark/90 backdrop-blur-md border border-growlab-border">
                        <span className="text-xs text-muted ml-1">السعر:</span>
                        <span className="font-mono font-bold text-white text-base">
                          {converted.formatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted">
                        <div className="flex items-center gap-1 text-amber-400">
                          <span>★ {product.rating}</span>
                          <span className="text-muted">({product.reviewsCount} تقييم)</span>
                        </div>
                        <span className="text-[11px] text-growlab-emerald flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          متوفر بالمخزون
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-display text-white line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Selling points */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {product.sellingPoints.slice(0, 2).map((sp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-growlab-bgSurface border border-growlab-border text-[11px] text-onDarkSoft"
                          >
                            ✓ {sp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-growlab-border/70 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProductForBuy(product)}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>شراء الآن • إتمام الطلب</span>
                      </button>

                      <a
                        href={`https://wa.me/96891234567?text=${encodeURIComponent(
                          `مرحباً! أود الاستفسار عن منتج "${product.name}" المعروض في متجر صانع المحتوى @${creator.username}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-emerald text-growlab-emerald transition-colors"
                        title="محادثة واتساب سريعة"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Growth & Trust Section */}
        <section className="mt-14 p-6 rounded-2xl bg-growlab-bgCard border border-growlab-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-right rtl:sm:text-right">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-growlab-bgSurface text-growlab-gold shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">توصيل خليجي لباب البيت</h4>
                <p className="text-xs text-muted leading-relaxed">
                  تنفيذ وشحن فوري من مستودعات التاجر المعتمد في عُمان والسعودية والإمارات.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-growlab-bgSurface text-growlab-emerald shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">ضمان ذهبي 100% أصلي</h4>
                <p className="text-xs text-muted leading-relaxed">
                  جميع المنتجات خضعت لفحص الجودة ومطابقة لمواصفات وتجارب صانع المحتوى.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-growlab-bgSurface text-growlab-gold shrink-0">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">عمولة مباشرة ودعم الصانع</h4>
                <p className="text-xs text-muted leading-relaxed">
                  شرائك من هذا الرابط يكافئ صانع المحتوى المفضل لديك بعمولة عادلة بدون تكلفة إضافية عليك.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Transparent Split Checkout Modal */}
      {selectedProductForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-growlab-bgCard border border-growlab-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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
                  تم تسجيل إسناد الشراء لصانع المحتوى <span className="text-white font-bold">@{creator.username}</span> وتم خصم وإرسال تفاصيل التوصيل للتاجر <span className="text-white font-bold">{selectedProductForBuy.merchantName}</span>.
                </p>

                {/* Ledger summary */}
                <div className="p-4 rounded-xl bg-growlab-ledger border border-growlab-border text-right space-y-2 text-xs">
                  <div className="font-bold text-growlab-gold text-xs border-b border-growlab-border pb-1">
                    📊 سجل الشفافية وتوزيع العملية (Real-Time Split Ledger):
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>• نصيب التاجر ({Math.round(orderSuccessData.split.merchantRate * 100)}%):</span>
                    <span className="font-mono text-white font-bold">${orderSuccessData.split.merchantAmountUSD}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>• عمولة الصانع @{creator.username} ({Math.round(orderSuccessData.split.creatorCommissionRate * 100)}%):</span>
                    <span className="font-mono text-growlab-emerald font-bold">+${orderSuccessData.split.creatorCommissionUSD}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>• رسوم منصة Growlab ({Math.round(orderSuccessData.split.platformFeeRate * 100)}%):</span>
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
                    عرض منصة Growlab
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-growlab-border">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-growlab-gold" />
                    <h3 className="text-base font-bold font-display text-white">
                      إتمام الطلب المباشر من متجر @{creator.username}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedProductForBuy(null)}
                    className="text-muted hover:text-white text-lg font-mono p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Selected product summary */}
                <div className="flex items-center gap-3 my-4 p-3 rounded-xl bg-growlab-bgSurface border border-growlab-border">
                  <img
                    src={selectedProductForBuy.image}
                    alt={selectedProductForBuy.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{selectedProductForBuy.name}</h4>
                    <p className="text-[11px] text-muted">التاجر المورد: {selectedProductForBuy.merchantName}</p>
                    <div className="font-mono font-bold text-growlab-gold text-xs mt-0.5">
                      {convertPrice(selectedProductForBuy.priceUSD, currentCurrency).formatted}
                    </div>
                  </div>
                </div>

                {/* Transparent 3-Way Split Explainer */}
                <div className="p-3.5 rounded-xl bg-growlab-ledger border border-growlab-border mb-4 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-white text-[11px]">
                    <span className="flex items-center gap-1.5 text-growlab-gold">
                      <Percent className="h-3.5 w-3.5" />
                      توزيع العملية بشفافية تامة (Performance Split):
                    </span>
                    <span className="font-mono text-muted">Stripe Connect Ready</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                    <div className="p-2 rounded-lg bg-growlab-bgCard border border-growlab-border">
                      <div className="text-muted">التاجر (المخزون)</div>
                      <div className="font-mono font-bold text-white text-xs mt-0.5">
                        ~{Math.round((1 - selectedProductForBuy.commissionRate - 0.05) * 100)}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-growlab-bgCard border border-growlab-emerald/40">
                      <div className="text-growlab-emerald">عمولة الصانع</div>
                      <div className="font-mono font-bold text-growlab-emerald text-xs mt-0.5">
                        {Math.round(selectedProductForBuy.commissionRate * 100)}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-growlab-bgCard border border-growlab-border">
                      <div className="text-growlab-gold">رسوم المنصة</div>
                      <div className="font-mono font-bold text-growlab-gold text-xs mt-0.5">
                        {creator.isFirstCampaignFree ? "0% (مجاني)" : "5%"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkout form */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">الاسم الكريم بالكامل *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سالم بن خالد المعمري"
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
                    <label className="block text-xs text-muted mb-1">المدينة / الولاية والعنوان *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مسقط - السيب - شارع السلام"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border focus:border-growlab-gold text-white text-xs outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isOrdering}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isOrdering ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-growlab-bgDark border-t-transparent animate-spin" />
                          <span>جاري تسجيل الطلب وتوزيع الحسابات...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>تأكيد الشراء الفوري وتوثيق العمولة</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-muted mt-2">
                      🔒 دفع آمن ومشفر عبر Stripe Connect • الدفع عند الاستلام متاح أيضاً
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
