"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Share2,
  Truck,
  Users,
  RotateCcw,
  Check,
  Globe,
  Award,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUgc } from "@/lib/UgcContext";
import { convertPrice, CURRENCIES } from "@/lib/ugc-store";
import { Product, CurrencyCode, ProductCategory } from "@/lib/ugc-types";
import { CartDrawer } from "@/components/store/CartDrawer";
import LanguageSwitcher from "@/components/motion/LanguageSwitcher";

interface CreatorStorefrontProps {
  username?: string;
}

export function CreatorStorefront({ username: usernameProp }: CreatorStorefrontProps = {}) {
  const [clientUsername, setClientUsername] = useState<string>("");

  useEffect(() => {
    if (!usernameProp && typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && last !== "creator") {
        setClientUsername(last);
      }
    }
  }, [usernameProp]);

  const username = decodeURIComponent(usernameProp || clientUsername || "");

  const {
    getCreatorByUsername,
    getProductsForCreator,
    currentCurrency,
    setCurrentCurrency,
    placeOrder,
    addToCart,
  } = useUgc();

  const creator = useMemo(() => getCreatorByUsername(username), [getCreatorByUsername, username]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
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
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [creatorProducts, selectedCategory]);

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

      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10B981", "#34D399", "#AD7A2A"],
        });
      });
    }, 1200);
  };

  if (!creator) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-6">المتجر غير موجود</h1>
        <Link href="/" className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" dir="rtl">
      {/* Immersive Storefront UI */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-500" />
            <span className="text-xl font-black text-white">GROWLAB</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {(["USD", "SAR", "AED", "OMR"] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrentCurrency(c)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
                    currentCurrency === c
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {CURRENCIES[c].flag} {c}
                </button>
              ))}
            </div>

            <LanguageSwitcher />

            <button onClick={handleCopyStoreLink} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-500 hover:text-emerald-400">
              {copiedLink ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <img src={creator.avatar} alt={creator.displayName} className="w-32 h-32 rounded-3xl mx-auto mb-6 border-4 border-slate-900 shadow-2xl" />
          <h1 className="text-4xl font-black text-white mb-4">{creator.displayName}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">{creator.bio}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full aspect-[4/5] object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{product.description}</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-2xl font-black text-emerald-500">{convertPrice(product.priceUSD, currentCurrency).formatted}</div>
                  <button onClick={() => addToCart(product, 1, creator.id)} className="p-3 rounded-xl bg-slate-800 text-white">
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
                <button onClick={() => setSelectedProductForBuy(product)} className="w-full mt-4 py-3 rounded-xl bg-emerald-600 text-white font-bold">شراء الآن</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <CartDrawer />
      
      {/* Success Modal Simplified */}
      <AnimatePresence>
        {selectedProductForBuy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 p-8 rounded-3xl max-w-lg w-full">
               {orderSuccessData ? (
                 <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">تم الطلب بنجاح!</h2>
                    <button onClick={() => setSelectedProductForBuy(null)} className="w-full py-3 bg-emerald-600 rounded-xl font-bold">موافق</button>
                 </div>
               ) : (
                 <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                   <h2 className="text-xl font-bold">طلب سريع: {selectedProductForBuy.name}</h2>
                   <input required type="text" placeholder="الاسم" className="w-full p-4 bg-slate-950 rounded-xl" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                   <input required type="tel" placeholder="رقم الهاتف" className="w-full p-4 bg-slate-950 rounded-xl" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                   <button type="submit" disabled={isOrdering} className="w-full py-4 bg-emerald-600 rounded-xl font-bold">تأكيد الطلب</button>
                   <button type="button" onClick={() => setSelectedProductForBuy(null)} className="w-full text-slate-500">إلغاء</button>
                 </form>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
