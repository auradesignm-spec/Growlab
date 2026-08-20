"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  Star, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  Store, 
  Filter,
  CheckCircle2,
  Play,
  Zap,
  Globe
} from "lucide-react";
import { useUgc } from "@/lib/UgcContext";
import { convertPrice } from "@/lib/ugc-store";
import { ProductCategory, Product } from "@/lib/ugc-types";
import { StorefrontNav } from "@/components/store/StorefrontNav";
import { CartDrawer } from "@/components/store/CartDrawer";

function StoreContent() {
  const { products, addToCart, currentCurrency, setCurrentCurrency } = useUgc();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [selectedProductForVideo, setSelectedProductForVideo] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-body selection:bg-emerald-500/30 selection:text-white" dir="rtl">
      {/* Navigation */}
      <StorefrontNav
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Hero Banner / Flash Sale Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 py-16 border-b border-slate-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-15" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مهرجان التسوق الذكي • منتجات موثوقة من صناع المحتوى</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-display">
              تسوق أفضل المنتجات مع <span className="text-emerald-500">مراجعات حية</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              كل منتج معروض هنا تم اختباره ومراجعته من قِبل أشهر صناع المحتوى في الخليج مع ضمان استبدال فوري وتوصيل سريع لباب البيت.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/"
              className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition-all text-center text-sm"
            >
              العودة للرئيسية
            </Link>
            <Link 
              href="/creator/dashboard"
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-500 transition-all text-center text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>أنشئ متجرك الخاص</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Product Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">المنتجات الأكثر طلباً</h2>
            <p className="text-xs text-slate-400">تحديث فوري للمخزون والأسعار بأفضل معايير الجودة</p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            عرض {filteredProducts.length} منتج
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">لا توجد منتجات مطابقة للبحث</h3>
            <p className="text-slate-400 text-xs">جرب البحث بكلمات أخرى أو تغيير التصنيف.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const displayPrice = convertPrice(product.priceUSD, currentCurrency);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-slate-900/60 rounded-3xl border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div>
                    {/* Product Image & Creator Badge Container */}
                    <div className="relative h-64 bg-slate-950 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                        <span>4.9 (مراجعة موثقة)</span>
                      </div>

                      {/* Video Review Trigger Button */}
                      <button
                        onClick={() => setSelectedProductForVideo(product)}
                        className="absolute bottom-3 right-3 bg-emerald-600/90 hover:bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>فيديو المراجعة</span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                          {product.category}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          المخزون: {product.stock}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Pricing & Add to Cart */}
                  <div className="p-5 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">السعر النهائي</div>
                      <div className="text-lg font-black text-white font-mono">
                        {displayPrice.formatted}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>أضف للسلة</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Creator Review Video Modal */}
      <AnimatePresence>
        {selectedProductForVideo && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">مراجعة صانع المحتوى الحية</h3>
                <button
                  onClick={() => setSelectedProductForVideo(null)}
                  className="text-slate-400 hover:text-white text-sm font-mono px-3 py-1 rounded-lg bg-slate-800"
                >
                  ✕ إغلاق
                </button>
              </div>

              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                <img 
                  src={selectedProductForVideo.image} 
                  alt="Review" 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-900/50 mb-3 animate-pulse">
                    <Play className="w-8 h-8 fill-white text-white translate-x-0.5" />
                  </div>
                  <div className="text-sm font-bold text-white">تجربة حصرية لـ {selectedProductForVideo.name}</div>
                  <div className="text-xs text-emerald-400 mt-1">&ldquo;الجودة تفوق التوقعات والتوصيل تم خلال 24 ساعة!&rdquo;</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-xs text-slate-400">المنتج المرتبط</div>
                  <div className="text-sm font-bold text-white">{selectedProductForVideo.name}</div>
                </div>
                <button
                  onClick={() => {
                    addToCart(selectedProductForVideo, 1);
                    setSelectedProductForVideo(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30"
                >
                  شراء الآن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StorePage() {
  return <StoreContent />;
}
