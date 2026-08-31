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
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {isEn ? "Integrations & Data Sources Hub" : "مركز الربط التقني ومصادر البيانات"}
              </h2>
              <p className="text-xs text-slate-400">
                {isEn
                  ? "Connect your storefronts, ad platforms, and courier accounts to automate True Net reconciliation"
                  : "اربط متاجرك، حساباتك الإعلانية، وشركات الشحن لأتمتة حساب صافي الربح الحقيقي فورياً"}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-white" />
            {isEn ? "Bank-Grade Encryption" : "تشفير آمن للبيانات"}
          </span>
        </div>
      </div>

      {/* Section 1: E-Commerce Storefronts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-white" />
            {isEn ? "E-Commerce Platforms & Storefronts" : "المتاجر والمنصات الإلكترونية"}
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Shopify */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Shopify D2C</span>
                {shopifyConnected ? (
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white border border-white/20">
                    <CheckCircle2 className="h-3 w-3 text-white" /> {isEn ? "Connected" : "متصل"}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">{isEn ? "Disconnected" : "غير متصل"}</span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {isEn
                  ? "Syncs orders, refunds, payment gateways, and fulfillment status in real-time."
                  : "مزامنة فورية للطلبات، المرتجعات، بوابات الدفع، وحالات الشحن."}
              </p>
              <div className="mt-3 rounded-lg bg-slate-950/60 p-2.5 text-[11px] font-mono text-slate-300">
                Webhook: <span className="text-white">orders/create & refunds</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{isEn ? "Live Webhook Active" : "الويب هوك نشط"}</span>
              <button
                type="button"
                onClick={() => setShopifyConnected(!shopifyConnected)}
                className="text-xs font-bold text-white hover:underline"
              >
                {shopifyConnected ? (isEn ? "Manage Settings" : "إعدادات الربط") : (isEn ? "Connect Now" : "ربط الآن")}
              </button>
            </div>
          </div>

          {/* Salla */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">منصة سلة (Salla)</span>
                {sallaConnected ? (
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white border border-white/20">
                    <CheckCircle2 className="h-3 w-3 text-white" /> {isEn ? "Connected" : "متصل"}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">{isEn ? "Disconnected" : "غير متصل"}</span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {isEn
                  ? "Salla App Store OAuth sync for Saudi D2C orders and COD settlement."
                  : "ربط رسمي عبر تطبيق سلة لمزامنة مبيعات المتاجر السعودية ومتحصلات الدفع عند الاستلام."}
              </p>
              <div className="mt-3 rounded-lg bg-slate-950/60 p-2.5 text-[11px] font-mono text-slate-300">
                OAuth 2.0: <span className="text-white">Verified Partner</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{isEn ? "Auto Synced" : "مزامنة تلقائية"}</span>
              <button
                type="button"
                className="text-xs font-bold text-white hover:underline"
              >
                {isEn ? "Manage" : "إدارة"}
              </button>
            </div>
          </div>

          {/* Zid */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">منصة زد (Zid)</span>
                <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-400">
                  {isEn ? "Ready to Connect" : "جاهز للربط"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {isEn
                  ? "Direct API token integration for Zid merchants with full ledger tracking."
                  : "ربط مباشر عبر رمز الـ API لتجار زد مع احتساب الهوامش والخصومات."}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-slate-200 transition"
              >
                {isEn ? "Connect Zid" : "ربط متجر زد"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Ad Networks (Meta, Google, TikTok, Snap) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-white" />
          {isEn ? "Ad Networks & Spend Attribution (MER & CAC)" : "المنصات الإعلانية ونسب كفاءة التسويق"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adPlatforms.map((ad) => (
            <div
              key={ad.platform}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{ad.platform} Ads</span>
                  {ad.connected ? (
                    <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white border border-white/20">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" /> {isEn ? "Live" : "مفعل"}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">{isEn ? "Disconnected" : "غير مفعل"}</span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-400 truncate">{ad.accountName}</p>

                {ad.connected ? (
                  <div className="mt-3 space-y-1.5 rounded-lg bg-slate-950/60 p-2.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isEn ? "Today Spend" : "إنفاق اليوم"}:</span>
                      <span className="font-mono font-bold text-white">{ad.todaySpend.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{isEn ? "ROAS" : "العائد الإعلاني"}:</span>
                      <span className="font-mono font-bold text-emerald-400">{ad.blendedRoas}x</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg bg-slate-950/60 p-3 text-center text-xs text-slate-400">
                    {isEn ? "Connect to track ad spend" : "اربط الحساب لتتبع الإنفاق والعائد"}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{ad.lastSyncAt}</span>
                {ad.connected ? (
                  <button
                    type="button"
                    onClick={() => handleSyncPlatform(ad.platform)}
                    disabled={syncingId === ad.platform}
                    className="flex items-center gap-1 text-xs font-bold text-white hover:text-slate-300"
                  >
                    <RefreshCw className={`h-3 w-3 text-white ${syncingId === ad.platform ? "animate-spin" : ""}`} />
                    {syncingId === ad.platform ? (isEn ? "Syncing..." : "مزامنة...") : (isEn ? "Sync" : "مزامنة")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-xs font-bold text-white hover:text-slate-300"
                  >
                    {isEn ? "Connect" : "ربط"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Courier Invoices & Return CSV Import */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
            <Truck className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white">
              {isEn ? "Courier Remittance & Returns Reconciliation (CSV Import)" : "مطابقة فواتير شركات الشحن وتدقيق المرتجعات (رفع ملفات CSV)"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEn
                ? "Upload COD payout spreadsheets from Aramex, SMSA, J&T, or SPL to reconcile true logistics fees and return losses"
                : "ارفع كشوفات تحصيل الدفع عند الاستلام من أرامكس، سمسا، جي آند تي، أو البريد لمطابقة الحوالات الفعلية ورسوم المرتجع"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {/* Upload Dropzone */}
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 p-6 text-center hover:border-amber-500/50 transition">
            <UploadCloud className="h-10 w-10 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-white">
              {isEn ? "Drag & drop courier remittance sheet" : "اسحب وأفلت كشف تسوية شركة الشحن أو اضغط للاختيار"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {isEn ? "Supports CSV, XLSX (SMSA, Aramex, J&T format)" : "يدعم ملفات CSV و Excel (بصيغ سمسا، أرامكس، وغيرها)"}
            </p>

            <label className="mt-4 cursor-pointer rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition">
              <span>{isEn ? "Browse Files" : "استعراض الملفات"}</span>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            </label>

            {csvUploaded && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <Check className="h-3.5 w-3.5" />
                <span>{csvFileName || "Courier_Payout_August2026.csv"}</span>
              </div>
            )}
          </div>

          {/* Supported Couriers List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isEn ? "Supported Logistics Formats" : "صيغ الشركات المدعومة تلقائياً"}
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs">
                <span className="font-bold text-white">SMSA Express Settlement</span>
                <span className="text-emerald-400 text-[11px] font-semibold">Auto Parsed ✓</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs">
                <span className="font-bold text-white">Aramex COD Remittance</span>
                <span className="text-emerald-400 text-[11px] font-semibold">Auto Parsed ✓</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs">
                <span className="font-bold text-white">J&T Express Reconciliation</span>
                <span className="text-emerald-400 text-[11px] font-semibold">Auto Parsed ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
