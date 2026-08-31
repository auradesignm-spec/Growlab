"use client";

import React, { useState } from "react";
import {
  Link2,
  CheckCircle2,
  UploadCloud,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Truck,
  Check,
} from "lucide-react";
import { getAdPlatformStatuses, syncPlatformAdSpend } from "@/services/adsIntegration";

interface Props {
  locale?: string;
}

export default function IntegrationsHub({ locale = "ar" }: Props) {
  const isEn = locale === "en";
  const [adPlatforms, setAdPlatforms] = useState(getAdPlatformStatuses());
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [shopifyConnected, setShopifyConnected] = useState(true);
  const [sallaConnected, setSallaConnected] = useState(true);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");

  const handleSyncPlatform = async (platform: "META" | "GOOGLE" | "TIKTOK" | "SNAPCHAT") => {
    setSyncingId(platform);
    await syncPlatformAdSpend(platform);
    setTimeout(() => {
      setSyncingId(null);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      setCsvUploaded(true);
    }
  };

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {isEn ? "Integrations & Data Sources Hub" : "مركز الربط التقني ومصادر البيانات"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn
                  ? "Connect your storefronts, ad platforms, and courier accounts to automate True Net reconciliation"
                  : "اربط متاجرك، حساباتك الإعلانية، وشركات الشحن لأتمتة حساب صافي الربح الحقيقي فورياً"}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            {isEn ? "SOC2 & GDPR Compliant Sync" : "تشفير ومطابقة آمنة بنسبة 100%"}
          </span>
        </div>
      </div>

      {/* Section 1: E-commerce Storefronts */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-600" />
          {isEn ? "1. Connected E-Commerce Stores" : "1. منصات المتاجر الإلكترونية المتصلة"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Shopify */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm">
                    S
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Shopify Store</h4>
                    <p className="text-[10px] text-slate-500 font-mono">store-oman.myshopify.com</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  متصل
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                مزامنة تلقائية للطلبات، المنتجات، المرتجعات، وتكاليف البضاعة المباعة (COGS) في الوقت الحقيقي.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-[11px] text-slate-500">آخر مزامنة: منذ دقيقتين</span>
              <button
                type="button"
                className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px]"
              >
                إعادة ضبط
              </button>
            </div>
          </div>

          {/* Salla */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-black text-sm">
                    س
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">منصة سلة (Salla)</h4>
                    <p className="text-[10px] text-slate-500 font-mono">salla.sa/growlab-store</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  متصل
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                سحب فوري لطلبات الدفع عند الاستلام (COD)، بولائص الشحن، وحالات التسليم اللوجستية.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-[11px] text-slate-500">آخر مزامنة: منذ 10 دقائق</span>
              <button
                type="button"
                className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px]"
              >
                إعادة ضبط
              </button>
            </div>
          </div>

          {/* Zid / WooCommerce */}
          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-line bg-slate-50/50 p-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-bold text-sm">
                  +
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">منصة زد / WooCommerce</h4>
                  <p className="text-[10px] text-slate-500">ربط متجر إضافي عبر الـ API</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                اربط قنوات بيع أخرى لتوحيد حسابات الأرباح الصافية في لوحة تدقيق مركزية واحدة.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 rounded-xl border border-slate-900 bg-slate-900 py-2 text-center text-xs font-bold text-white hover:bg-slate-800 shadow-2xs transition-colors"
            >
              + ربط متجر جديد
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Advertising Platforms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-600" />
            {isEn ? "2. Ad Networks & Pixel Integrations" : "2. الحسابات الإعلانية وتتبع الإنفاق التلقائي"}
          </h3>
          <span className="text-xs text-slate-500">
            سحب الإنفاق اليومي وحساب كلفة اكتساب العميل المدمجة (Blended CAC)
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adPlatforms.map((p) => {
            const isSyncing = syncingId === p.platform;
            return (
              <div
                key={p.platform}
                className="flex flex-col justify-between rounded-2xl border border-line bg-white p-4.5 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.connected
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.connected ? "نشط ومربوط" : "غير مربوط"}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[11px] text-slate-500">الإنفاق المسحوب اليوم</p>
                    <p className="text-lg font-black font-mono text-slate-900 mt-0.5">
                      {p.todaySpend.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ر.س</span>
                    </p>
                  </div>

                  <p className="mt-2 text-[10px] text-slate-500">
                    آخر مزامنة: {p.lastSyncedAt}
                  </p>
                </div>

                <div className="mt-4 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => handleSyncPlatform(p.platform)}
                    disabled={isSyncing}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-slate-50 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-emerald-600" : "text-slate-500"}`} />
                    <span>{isSyncing ? "جاري السحب..." : "مزامنة الإنفاق"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Courier Invoices & Manual CSV Reconciler */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Truck className="h-4 w-4 text-emerald-600" />
          {isEn ? "3. Courier Invoices & CSV Upload Reconciler" : "3. مطابقة فواتير شركات الشحن وملفات الإكسل (CSV/Excel)"}
        </h3>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                رفع كشف حساب الشحن للدفع عند الاستلام (COD Remittance CSV)
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                ارفع كشف الحساب الأسبوعي الصادر من (سمسا، أرامكس، J&T، البريد السعودي) لمقارنة المبالغ المستلمة فعلياً مع طلبات المتجر واكتشاف أي فروقات مالية أو طرود معلقة فوراً.
              </p>

              {csvUploaded && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>تم رفع الملف بنجاح: {csvFileName} (تم تدقيق 312 بوليصة)</span>
                </div>
              )}
            </div>

            <div className="shrink-0 text-center">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 px-6 py-5 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-900">اختر ملف CSV / Excel</span>
                <span className="text-[10px] text-slate-500 mt-0.5">أو اسحب وأفلت الملف هنا</span>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
