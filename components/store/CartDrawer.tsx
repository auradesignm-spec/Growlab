"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  Percent,
  Truck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useUgc } from "@/lib/UgcContext";
import { convertPrice } from "@/lib/ugc-store";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotalUSD,
    cartItemCount,
    currentCurrency,
    placeOrder,
    creators,
  } = useUgc();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("مسقط");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const convertedTotal = convertPrice(cartTotalUSD, currentCurrency);

  // Free shipping threshold (e.g., $50 USD ~ 20 OMR)
  const freeShippingThresholdUSD = 50;
  const progressPercent = Math.min(100, Math.round((cartTotalUSD / freeShippingThresholdUSD) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdUSD - cartTotalUSD);
  const convertedRemaining = convertPrice(remainingForFreeShipping, currentCurrency);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName.trim() || !customerPhone.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Place orders for each item in cart
      const placedOrders = cart.map((item) => {
        return placeOrder({
          productId: item.product.id,
          creatorId: item.creatorId || creators[0]?.id,
          customerName,
          customerPhone,
          customerCity,
          customerCountry: "OM",
          quantity: item.quantity,
          currency: currentCurrency,
        });
      });

      setIsSubmitting(false);
      setOrderSuccess(placedOrders);
      clearCart();

      // Trigger celebration confetti
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#AD7A2A", "#10B981", "#34D399", "#F59E0B"],
        });
      });
    }, 750);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsCartOpen(false);
              setOrderSuccess(null);
            }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="w-screen max-w-md bg-growlab-bgCard border-r border-growlab-border shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-growlab-border/80 flex items-center justify-between bg-growlab-bgDark">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-growlab-gold/15 text-growlab-gold">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-display text-white">
                      سلة التسوق الذكية
                    </h2>
                    <p className="text-[11px] text-muted">
                      {cartItemCount} {cartItemCount === 1 ? "منتج" : "منتجات"} • مع إسناد فوري لعمولة الصانع
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setOrderSuccess(null);
                  }}
                  className="p-2 rounded-xl bg-growlab-bgSurface border border-growlab-border text-muted hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="px-4 py-3 bg-growlab-bgSurface/90 border-b border-growlab-border/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-growlab-emerald" />
                    {remainingForFreeShipping <= 0 ? (
                      <strong className="text-growlab-emerald">مبروك! حصلت على شحن مجاني 🚀</strong>
                    ) : (
                      <>
                        أضف بقيمة <strong className="text-white font-mono">{convertedRemaining.formatted}</strong> للشحن المجاني
                      </>
                    )}
                  </span>
                  <span className="font-mono text-[11px] text-growlab-gold font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-growlab-bgDark overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-growlab-gold to-growlab-emerald transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {orderSuccess ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-growlab-emerald/20 border border-growlab-emerald/40 text-growlab-emerald flex items-center justify-center mx-auto text-2xl">
                      ✓
                    </div>
                    <h3 className="text-lg font-bold font-display text-white">
                      تم تأكيد طلبك بنجاح!
                    </h3>
                    <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">
                      تم تسجيل الطلب وتوزيع عمولات صناع المحتوى وإرسال تفاصيل الشحن والتوصيل لمستودعات التجار.
                    </p>

                    <div className="p-3.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-xs text-right space-y-2">
                      <div className="font-bold text-growlab-gold text-[11px] border-b border-growlab-border/60 pb-1 flex items-center justify-between">
                        <span>سجل الشفافية للعملية:</span>
                        <span className="text-growlab-emerald">مدفوع وموزع آلياً</span>
                      </div>
                      <div className="flex justify-between text-muted text-[11px]">
                        <span>• عدد الطلبات المحققة:</span>
                        <span className="font-mono text-white font-bold">{orderSuccess.length} منتج</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        setOrderSuccess(null);
                      }}
                      className="w-full py-3 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs hover:brightness-110"
                    >
                      متابعة التسوق في المتجر
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-growlab-bgSurface border border-growlab-border flex items-center justify-center mx-auto text-3xl">
                      🛍️
                    </div>
                    <h3 className="text-base font-bold text-white">سلة التسوق فارغة حالياً</h3>
                    <p className="text-xs text-muted max-w-xs mx-auto">
                      تصفح منتجات التجار المعتمدة في المتجر وأضف ما يعجبك للاستفادة من عروض التوصيل والخصومات.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-growlab-bgSurface border border-growlab-border hover:border-growlab-gold text-xs text-white"
                    >
                      <span>تصفح المنتجات الآن</span>
                      <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const itemPrice = convertPrice(item.product.priceUSD * item.quantity, currentCurrency);
                      const creator = creators.find((c) => c.id === item.creatorId);

                      return (
                        <div
                          key={item.product.id}
                          className="p-3 rounded-2xl bg-growlab-bgDark border border-growlab-border hover:border-growlab-border/80 transition-colors flex items-start gap-3"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-xl object-cover bg-growlab-bgSurface shrink-0"
                          />

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-bold text-white truncate">
                                {item.product.name}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-muted hover:text-rose-400 p-1 transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-muted">
                              <span>المورد: {item.product.merchantName}</span>
                              {creator && (
                                <span className="text-growlab-emerald font-mono">
                                  • @{creator.username}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-1 bg-growlab-bgSurface border border-growlab-border rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                  className="p-1 rounded hover:bg-growlab-bgDark text-muted hover:text-white"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="font-mono text-xs font-bold text-white px-2">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                  className="p-1 rounded hover:bg-growlab-bgDark text-muted hover:text-white"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="font-mono font-bold text-growlab-gold text-xs">
                                {itemPrice.formatted}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Footer & Fast Checkout */}
              {cart.length > 0 && !orderSuccess && (
                <div className="p-4 sm:p-5 border-t border-growlab-border bg-growlab-bgDark space-y-4">
                  {/* Subtotal & Split Info */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-muted">
                      <span>المجموع الفرعي ({cartItemCount} منتجات):</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {convertedTotal.formatted}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-muted">
                      <span>الشحن والتوصيل (GCC):</span>
                      <span className="font-mono text-growlab-emerald font-bold">
                        {remainingForFreeShipping <= 0 ? "مجاني (0.00)" : "1.50 ر.ع"}
                      </span>
                    </div>
                  </div>

                  {/* Fast Checkout Form */}
                  <form onSubmit={handleCheckout} className="space-y-2.5 pt-2 border-t border-growlab-border/60">
                    <input
                      type="text"
                      required
                      placeholder="الاسم الكريم بالكامل *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border text-white text-xs outline-none focus:border-growlab-gold"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        required
                        placeholder="رقم الواتساب للتوصيل *"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border text-white text-xs outline-none focus:border-growlab-gold font-mono"
                      />
                      <input
                        type="text"
                        required
                        placeholder="المدينة / العنوان *"
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-growlab-bgSurface border border-growlab-border text-white text-xs outline-none focus:border-growlab-gold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-growlab-bgDark border-t-transparent animate-spin" />
                          <span>جاري تأكيد الطلب وتوزيع الأرباح...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>تأكيد الطلب الفوري ({convertedTotal.formatted})</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-muted">
                      🔒 دفع آمن ومشفر • إسناد أرباح آلي لصناع المحتوى والتجار
                    </p>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
