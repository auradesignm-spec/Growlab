"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Trophy,
  Users,
  Store,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Truck,
  Flame,
  Award,
  Zap,
  Globe,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useUgc } from "@/lib/UgcContext";
import { convertPrice } from "@/lib/ugc-store";
import { Product, ProductCategory, TargetAudienceGender } from "@/lib/ugc-types";
import { TrustVsChaosSection } from "@/components/ugc/TrustVsChaosSection";

interface PlatformOverviewProps {
  onOpenOnboarding: () => void;
  onNavigateToLeaderboard: () => void;
  onNavigateToCreatorPortal: () => void;
  onNavigateToMerchantPortal: () => void;
}

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({
  onOpenOnboarding,
  onNavigateToLeaderboard,
  onNavigateToCreatorPortal,
  onNavigateToMerchantPortal,
}) => {
  const { creators, products, currentCurrency, placeOrder } = useUgc();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [selectedGender, setSelectedGender] = useState<TargetAudienceGender | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick buy modal
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("مسقط");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (selectedGender !== "all" && p.genderTarget !== selectedGender && p.genderTarget !== "all") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedCategory, selectedGender, searchQuery]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForBuy || !customerName.trim() || !customerPhone.trim()) return;

    setIsOrdering(true);
    setTimeout(() => {
      const defaultCreator = creators[0];
      const result = placeOrder({
        productId: selectedProductForBuy.id,
        creatorId: defaultCreator.id,
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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#AD7A2A", "#10B981", "#34D399"],
      });
    }, 600);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* 1. Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-b from-growlab-bgCard via-growlab-bgDark to-growlab-bgCard border border-growlab-border p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-growlab-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-growlab-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-growlab-gold/15 text-growlab-gold border border-growlab-gold/30 text-xs font-bold shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>منصة تجارة صناع المحتوى الأولى في عُمان والخليج (UGC Commerce)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight leading-tight sm:leading-tight">
            سوق ثلاثي الأطراف يربط <span className="text-transparent bg-clip-text bg-gradient-to-r from-growlab-gold via-amber-300 to-growlab-goldLight">التجار</span> بـ <span className="text-transparent bg-clip-text bg-gradient-to-r from-growlab-emerald to-teal-300">صناع المحتوى</span>
          </h1>

          <p className="text-sm sm:text-base text-onDarkSoft leading-relaxed max-w-2xl mx-auto">
            نموذج مشاركة أرباح قائم على الأداء الفعلي: <strong>75-80% للتاجر</strong>، <strong>15-20% عمولة للصانع</strong>، و <strong>5% للمنصة</strong>. بدون أي ميزانيات إعلانات مهدرة أو تكاليف مسبقة.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenOnboarding}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>ابدأ كصانع محتوى (أول حملة 0% رسوم)</span>
            </button>

            <button
              onClick={onNavigateToMerchantPortal}
              className="px-5 py-3.5 rounded-2xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold text-white text-sm font-bold transition-colors flex items-center gap-2"
            >
              <Store className="h-4 w-4 text-cyan-400" />
              <span>بوابة التجار الموردين</span>
            </button>

            <button
              onClick={onNavigateToLeaderboard}
              className="px-5 py-3.5 rounded-2xl bg-growlab-bgSurface border border-growlab-border hover:border-amber-400 text-white text-sm font-bold transition-colors flex items-center gap-2"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>لوحة الترتيب التنافسية</span>
            </button>
          </div>

          {/* Performance split pill strip */}
          <div className="grid grid-cols-3 gap-2 pt-6 max-w-xl mx-auto text-xs">
            <div className="p-3 rounded-xl bg-growlab-bgDark/80 border border-growlab-border text-center">
              <div className="text-muted text-[11px]">حصة التاجر</div>
              <div className="font-mono font-bold text-white text-sm mt-0.5">75% - 80%</div>
            </div>
            <div className="p-3 rounded-xl bg-growlab-bgDark/80 border border-growlab-emerald/40 text-center">
              <div className="text-growlab-emerald text-[11px]">عمولة الصانع</div>
              <div className="font-mono font-bold text-growlab-emerald text-sm mt-0.5">15% - 20%</div>
            </div>
            <div className="p-3 rounded-xl bg-growlab-bgDark/80 border border-growlab-border text-center">
              <div className="text-growlab-gold text-[11px]">رسوم Growlab</div>
              <div className="font-mono font-bold text-growlab-gold text-sm mt-0.5">5% (أول حملة 0%)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Curated Creator Storefronts Grid Showcase */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-growlab-gold" />
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                المتاجر المصغرة لصناع المحتوى المعتمدين
              </h2>
            </div>
            <p className="text-xs text-muted mt-1">
              متاجر مخصصة لكل صانع محتوى تضم منتجات مختارة بعناية وموثوقة لجمهورهم.
            </p>
          </div>

          <button
            onClick={onNavigateToLeaderboard}
            className="text-xs font-bold text-growlab-gold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>عرض لوحة الترتيب الكاملة</span>
            <ChevronRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creators.map((creator) => (
            <Link
              key={creator.id}
              href={`/creator/${creator.username}`}
              className="group rounded-2xl bg-growlab-bgCard border border-growlab-border hover:border-growlab-gold/60 p-4 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-glow-gold/10"
            >
              <div>
                <div className="relative h-24 rounded-xl overflow-hidden mb-3">
                  <img
                    src={creator.banner}
                    alt={creator.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-growlab-bgCard via-transparent to-transparent" />
                  <div className="absolute bottom-2 right-2">
                    <img
                      src={creator.avatar}
                      alt={creator.displayName}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-growlab-bgCard shadow-md"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:text-growlab-gold transition-colors truncate">
                      {creator.displayName}
                    </h3>
                    <span className="text-[10px] font-mono text-muted">
                      {creator.country === "OM" ? "🇴🇲" : creator.country === "SA" ? "🇸🇦" : "🇦🇪"}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-growlab-gold">@{creator.username}</div>
                  <p className="text-[11px] text-muted line-clamp-2 leading-relaxed mt-1">
                    {creator.bio}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-growlab-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted text-[10px]">التحويل:</span>
                  <span className="font-mono font-bold text-growlab-emerald">
                    {creator.stats.conversionRate}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-growlab-gold font-bold text-[11px]">
                  <span>تصفح المتجر</span>
                  <ArrowRight className="h-3 w-3 rotate-180 rtl:rotate-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Central Marketplace Catalog */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-growlab-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              الكتالوج المركزي لمنتجات التجار المعتمدين
            </h2>
            <p className="text-xs text-muted mt-1">
              منتجات أصلية جاهزة للشحن والتوصيل مع عمولات أداء مجزية لكل بيعة.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-growlab-bgDark border border-growlab-border rounded-xl p-1 text-xs">
              <button
                onClick={() => setSelectedGender("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedGender === "all" ? "bg-growlab-bgSurface text-white font-bold" : "text-muted hover:text-white"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedGender("men")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedGender === "men" ? "bg-growlab-bgSurface text-white font-bold" : "text-muted hover:text-white"
                }`}
              >
                👔 رجالي
              </button>
              <button
                onClick={() => setSelectedGender("women")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedGender === "women" ? "bg-growlab-bgSurface text-white font-bold" : "text-muted hover:text-white"
                }`}
              >
                👗 نسائي
              </button>
            </div>

            <div className="flex items-center bg-growlab-bgDark border border-growlab-border rounded-xl p-1 text-xs overflow-x-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === "all" ? "bg-growlab-gold text-growlab-bgDark font-bold" : "text-muted hover:text-white"
                }`}
              >
                جميع الفئات
              </button>
              <button
                onClick={() => setSelectedCategory("tech")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === "tech" ? "bg-growlab-gold text-growlab-bgDark font-bold" : "text-muted hover:text-white"
                }`}
              >
                تقنية
              </button>
              <button
                onClick={() => setSelectedCategory("perfume")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === "perfume" ? "bg-growlab-gold text-growlab-bgDark font-bold" : "text-muted hover:text-white"
                }`}
              >
                عطور
              </button>
              <button
                onClick={() => setSelectedCategory("fashion")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === "fashion" ? "bg-growlab-gold text-growlab-bgDark font-bold" : "text-muted hover:text-white"
                }`}
              >
                أزياء
              </button>
              <button
                onClick={() => setSelectedCategory("beauty")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === "beauty" ? "bg-growlab-gold text-growlab-bgDark font-bold" : "text-muted hover:text-white"
                }`}
              >
                جمال
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const converted = convertPrice(product.priceUSD, currentCurrency);
            const creatorComm = Number((product.priceUSD * product.commissionRate).toFixed(2));
            return (
              <div
                key={product.id}
                className="group rounded-2xl bg-growlab-bgCard border border-growlab-border hover:border-growlab-gold/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg"
              >
                <div className="relative h-52 w-full bg-growlab-bgDark overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-growlab-bgCard via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg bg-growlab-bgDark/80 backdrop-blur-md text-[11px] font-bold text-growlab-gold border border-growlab-gold/30">
                      عمولة الصانع: {Math.round(product.commissionRate * 100)}% (${creatorComm})
                    </span>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-muted">
                      التاجر: {product.merchantName}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <div className="px-3 py-1 rounded-xl bg-growlab-bgDark/90 backdrop-blur-md border border-growlab-border font-mono font-bold text-white text-sm">
                      {converted.formatted}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>★ {product.rating} ({product.reviewsCount} تقييم)</span>
                      <span className="text-growlab-emerald font-mono">مخزون: {product.stock}</span>
                    </div>

                    <h3 className="text-sm font-bold font-display text-white line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-growlab-border flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProductForBuy(product)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>شراء فوري مع تقسيم شفاف</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. The Trust & Value Architecture (Comparison Matrix: Chaos vs Structured Ecosystem) */}
      <TrustVsChaosSection
        onOpenOnboarding={onOpenOnboarding}
        onNavigateToMerchantPortal={onNavigateToMerchantPortal}
      />

      {/* 5. Why Growlab Tri-Party Architecture Works */}
      <section className="p-8 rounded-3xl bg-growlab-bgCard border border-growlab-border space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-xl font-bold font-display text-white">
            لماذا تنجح التجارة القائمة على صناع المحتوى (UGC Commerce)؟
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            المنصة تعالج أكبر تحديين في التجارة الإلكترونية الخليجية: ارتفاع تكلفة إعلانات ميتا وتيك توك، وصعوبة تحقيق صناع المحتوى لعوائد حقيقية من الترويج.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-growlab-bgDark border border-growlab-border space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              🏪
            </div>
            <h4 className="text-sm font-bold text-white">للتاجر (المورد)</h4>
            <p className="text-xs text-muted leading-relaxed">
              صفر ميزانية تسويق مسبقة. شبكة من عشرات صناع المحتوى يصورون منتجاتك ويروجون لها لجمهورهم، وتدفع العمولة فقط بعد تأكيد استلام العميل للطلب.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-growlab-bgDark border border-growlab-border space-y-2">
            <div className="w-10 h-10 rounded-xl bg-growlab-emerald/20 text-growlab-emerald flex items-center justify-center font-bold">
              🌟
            </div>
            <h4 className="text-sm font-bold text-white">لصانع المحتوى (Creator)</h4>
            <p className="text-xs text-muted leading-relaxed">
              متجر مصغر متكامل باسمك ورابطك الخاص بدون الحاجة لشراء أو تخزين منتجات أو التعامل مع الشحن والتوصيل. عمولات عالية وتوزيع فوري.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-growlab-bgDark border border-growlab-border space-y-2">
            <div className="w-10 h-10 rounded-xl bg-growlab-gold/20 text-growlab-gold flex items-center justify-center font-bold">
              ⚡
            </div>
            <h4 className="text-sm font-bold text-white">للمشتري (الجمهور)</h4>
            <p className="text-xs text-muted leading-relaxed">
              منتجات مجربة وموصى بها من صانع المحتوى المفضل لديهم، مع ضمان الجودة، والتوصيل السريع لباب البيت، والدفع الآمن.
            </p>
          </div>
        </div>
      </section>

      {/* Instant Split Checkout Modal */}
      {selectedProductForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-growlab-bgCard border border-growlab-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {orderSuccessData ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-growlab-emerald/20 text-growlab-emerald border border-growlab-emerald/40 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold font-display text-white">
                  تم تسجيل الطلب وتوزيع الأرباح لحظياً!
                </h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  رقم العملية: <span className="font-mono text-growlab-gold font-bold">{orderSuccessData.order.orderNumber}</span>
                </p>

                <div className="p-4 rounded-xl bg-growlab-ledger border border-growlab-border text-right space-y-2 text-xs">
                  <div className="font-bold text-growlab-gold text-xs border-b border-growlab-border pb-1">
                    📊 توزيع العملية المالي اللحظي (Live Split Ledger):
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>• التاجر المورد ({Math.round(orderSuccessData.split.merchantRate * 100)}%):</span>
                    <span className="font-mono text-white font-bold">${orderSuccessData.split.merchantAmountUSD}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>• عمولة صانع المحتوى ({Math.round(orderSuccessData.split.creatorCommissionRate * 100)}%):</span>
                    <span className="font-mono text-growlab-emerald font-bold">+${orderSuccessData.split.creatorCommissionUSD}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>• رسوم منصة Growlab ({Math.round(orderSuccessData.split.platformFeeRate * 100)}%):</span>
                    <span className="font-mono text-growlab-gold font-bold">${orderSuccessData.split.platformFeeUSD}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedProductForBuy(null);
                    setOrderSuccessData(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs hover:brightness-110"
                >
                  إغلاق ومتابعة التصفح
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-growlab-border">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-growlab-gold" />
                    <h3 className="text-base font-bold font-display text-white">
                      إتمام شراء مع تقسيم لحظي شفاف
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedProductForBuy(null)}
                    className="text-muted hover:text-white text-lg font-mono p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-3 my-4 p-3 rounded-xl bg-growlab-bgSurface border border-growlab-border">
                  <img
                    src={selectedProductForBuy.image}
                    alt={selectedProductForBuy.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{selectedProductForBuy.name}</h4>
                    <p className="text-[11px] text-muted">التاجر: {selectedProductForBuy.merchantName}</p>
                    <div className="font-mono font-bold text-growlab-gold text-xs mt-0.5">
                      {convertPrice(selectedProductForBuy.priceUSD, currentCurrency).formatted}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">الاسم الكريم *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: فهد البلوشي"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1">رقم الهاتف للتوصيل *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+968 9XXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1">المدينة / العنوان *</label>
                    <input
                      type="text"
                      required
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isOrdering}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
                  >
                    {isOrdering ? (
                      <span>جاري معالجة الطلب...</span>
                    ) : (
                      <span>تأكيد الشراء الفوري</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
