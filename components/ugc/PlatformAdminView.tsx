"use client";

import React, { useState } from "react";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Percent,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Database,
  Lock,
} from "lucide-react";
import { useUgc } from "@/lib/UgcContext";

export const PlatformAdminView: React.FC = () => {
  const { orders, creators, merchants, products, resetToDefaults } = useUgc();
  const [resetDone, setResetDone] = useState(false);

  const totalGMV = orders.reduce((sum, o) => sum + o.splits.totalAmountUSD, 0);
  const totalCreatorComms = orders.reduce((sum, o) => sum + o.splits.creatorCommissionUSD, 0);
  const totalMerchantRevenue = orders.reduce((sum, o) => sum + o.splits.merchantAmountUSD, 0);
  const totalPlatformFees = orders.reduce((sum, o) => sum + o.splits.platformFeeUSD, 0);

  const handleReset = () => {
    resetToDefaults();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold font-display text-white">
              دفتر عمليات المنصة المركزي (Growlab Master Ledger)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono">
              REAL-TIME SPLIT
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            سجل مالي شفاف مشفر يوثق التوزيع الآلي للأرباح بين التاجر، وصانع المحتوى، والمنصة.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-growlab-bgDark border border-growlab-border hover:border-growlab-gold text-xs text-muted hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{resetDone ? "تمت إعادة الضبط" : "إعادة ضبط البيانات النموذجية"}</span>
        </button>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
          <div className="flex items-center justify-between text-muted text-xs mb-1">
            <span>إجمالي حجم المبيعات (GMV)</span>
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <div className="font-mono font-bold text-2xl text-white">
            ${totalGMV.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted mt-2">
            عبر {orders.length} طلبات مكتملة
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
          <div className="flex items-center justify-between text-muted text-xs mb-1">
            <span>صافي مستحقات التجار الموردين</span>
            <ArrowUpRight className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="font-mono font-bold text-2xl text-cyan-400">
            ${totalMerchantRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted mt-2">
            متوسط ~77% من كل معاملة
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
          <div className="flex items-center justify-between text-muted text-xs mb-1">
            <span>إجمالي عمولات صناع المحتوى</span>
            <TrendingUp className="h-4 w-4 text-growlab-emerald" />
          </div>
          <div className="font-mono font-bold text-2xl text-growlab-emerald">
            ${totalCreatorComms.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted mt-2">
            توزيع مباشر لحسابات الـ Stripe
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-growlab-bgCard border border-growlab-border">
          <div className="flex items-center justify-between text-muted text-xs mb-1">
            <span>رسوم منصة Growlab (Take Rate)</span>
            <Percent className="h-4 w-4 text-growlab-gold" />
          </div>
          <div className="font-mono font-bold text-2xl text-growlab-gold">
            ${totalPlatformFees.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted mt-2">
            0% إلى 5% حسب باقة الصانع
          </div>
        </div>
      </div>

      {/* Orders Ledger Table */}
      <div className="rounded-2xl bg-growlab-bgCard border border-growlab-border overflow-hidden shadow-xl">
        <div className="p-4 border-b border-growlab-border bg-growlab-bgSurface/50 flex items-center justify-between">
          <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-growlab-gold" />
            <span>سجل المعاملات الحية والتقسيم المالي</span>
          </h3>
          <span className="text-xs text-muted font-mono">
            {orders.length} معاملة مسجلة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right text-xs">
            <thead className="bg-growlab-bgDark text-muted uppercase text-[11px] font-mono border-b border-growlab-border">
              <tr>
                <th className="py-3 px-4">رقم المعاملة</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">المنتج</th>
                <th className="py-3 px-4">الصانع المعتمد</th>
                <th className="py-3 px-4">التاجر المورد</th>
                <th className="py-3 px-4">المبلغ الكلي</th>
                <th className="py-3 px-4">حصة التاجر</th>
                <th className="py-3 px-4">عمولة الصانع</th>
                <th className="py-3 px-4">رسوم Growlab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-growlab-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-growlab-bgSurface/40 font-mono">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 text-muted text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="py-3.5 px-4 text-white font-sans font-medium">
                    {order.productName}
                  </td>
                  <td className="py-3.5 px-4 text-growlab-gold font-sans font-medium">
                    @{order.creatorUsername}
                  </td>
                  <td className="py-3.5 px-4 text-muted font-sans">
                    {order.merchantName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ${order.splits.totalAmountUSD}
                  </td>
                  <td className="py-3.5 px-4 text-cyan-400">
                    ${order.splits.merchantAmountUSD} ({Math.round(order.splits.merchantRate * 100)}%)
                  </td>
                  <td className="py-3.5 px-4 font-bold text-growlab-emerald">
                    +${order.splits.creatorCommissionUSD} ({Math.round(order.splits.creatorCommissionRate * 100)}%)
                  </td>
                  <td className="py-3.5 px-4 text-growlab-gold">
                    ${order.splits.platformFeeUSD} ({Math.round(order.splits.platformFeeRate * 100)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
