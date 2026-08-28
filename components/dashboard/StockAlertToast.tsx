"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { MerchantProductRow } from "@/lib/dashboard/merchant";

const STORAGE_VISIT_KEY = "gl_merchant_last_stock_visit_ts";
const STORAGE_ACK_KEY = "gl_merchant_ack_stock_alerts";

export interface StockIssue {
  id: string;
  productId: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  type: "out_of_stock" | "dead_stock";
  reasonAr: string;
  reasonEn: string;
}

export default function StockAlertToast({
  products,
  locale,
  onNavigateTab,
}: {
  products: MerchantProductRow[];
  locale: string;
  onNavigateTab?: (tab: "products" | "campaign" | "store" | "simulator" | "analytics" | "ad_radar") => void;
}) {
  const t = useTranslations("appShell.alerts.stockToast");
  const isAr = locale !== "en";

  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [simulatedIssues, setSimulatedIssues] = useState<StockIssue[] | null>(null);

  // Compute actual stock issues from current products
  const computedIssues = useMemo<StockIssue[]>(() => {
    const list: StockIssue[] = [];

    for (const p of products) {
      // 1. Out of stock detection (inactive product or custom stock === 0)
      const isCustomOutOfStock = (p.attributes?.custom ?? []).some(
        (c) => c.name.toLowerCase().includes("stock") && c.values.includes("0")
      );

      if (!p.active || isCustomOutOfStock) {
        list.push({
          id: `out_${p.id}`,
          productId: p.id,
          title: p.title,
          category: p.category,
          price: p.basePrice,
          currency: p.currency,
          type: "out_of_stock",
          reasonAr: "المنتج متوقف عن البيع أو نفدت كميته في المخزن.",
          reasonEn: "Product is inactive or stock quantity reached zero.",
        });
      } else {
        // 2. Dead stock detection (active product with 0 visits and 0 active deals or stagnant movement)
        const isDeadStock = p.visitCount === 0 && p.activeDealsCount === 0;
        if (isDeadStock) {
          list.push({
            id: `dead_${p.id}`,
            productId: p.id,
            title: p.title,
            category: p.category,
            price: p.basePrice,
            currency: p.currency,
            type: "dead_stock",
            reasonAr: "مخزون راكد لم يسجل أي زيارات أو حملات مسوّقين نشطة.",
            reasonEn: "Stagnant inventory with zero visits or creator deals.",
          });
        }
      }
    }

    return list;
  }, [products]);

  const activeIssues = simulatedIssues || computedIssues;

  // Check last visit timestamp and acknowledged alerts
  useEffect(() => {
    if (activeIssues.length === 0) return;

    try {
      const now = Date.now();
      const lastVisitStr = window.localStorage.getItem(STORAGE_VISIT_KEY);
      const ackListStr = window.localStorage.getItem(STORAGE_ACK_KEY);
      const ackIds = ackListStr ? (JSON.parse(ackListStr) as string[]) : [];

      // Check if there are any issues that haven't been acknowledged yet
      const unacknowledged = activeIssues.filter((issue) => !ackIds.includes(issue.id));

      if (unacknowledged.length > 0) {
        // Show non-intrusive toast upon entering dashboard
        setIsOpen(true);
      }

      // Update visit timestamp for tracking future entries
      window.localStorage.setItem(STORAGE_VISIT_KEY, String(now));
    } catch {
      // Fallback in case localStorage is restricted
      setIsOpen(true);
    }
  }, [activeIssues]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      const ackListStr = window.localStorage.getItem(STORAGE_ACK_KEY);
      const ackIds = ackListStr ? (JSON.parse(ackListStr) as string[]) : [];
      const updated = Array.from(new Set([...ackIds, ...activeIssues.map((i) => i.id)]));
      window.localStorage.setItem(STORAGE_ACK_KEY, JSON.stringify(updated));
    } catch {
      // Ignored
    }
  };

  const handleSimulateToast = (type: "out_of_stock" | "dead_stock" | "both") => {
    const demoItems: StockIssue[] = [];
    if (type === "out_of_stock" || type === "both") {
      demoItems.push({
        id: `demo_out_${Date.now()}`,
        productId: "demo-p-1",
        title: isAr ? "عطر عود ملكي فاخر (إصدار محدود)" : "Royal Oud Imperial Parfum",
        category: "fragrance",
        price: 28.5,
        currency: "OMR",
        type: "out_of_stock",
        reasonAr: "الكمية المتبقية في المخزن: 0 قطعة (نفاد فوري).",
        reasonEn: "Remaining inventory: 0 units (Instant Out of Stock).",
      });
    }
    if (type === "dead_stock" || type === "both") {
      demoItems.push({
        id: `demo_dead_${Date.now()}`,
        productId: "demo-p-2",
        title: isAr ? "طقم ساعات كرونوغراف ستيل" : "Steel Chronograph Watch Set",
        category: "accessories",
        price: 45.0,
        currency: "OMR",
        type: "dead_stock",
        reasonAr: "مخزون راكد: 45 يوماً بدون طلبات أو حملات تسويقية.",
        reasonEn: "Dead stock: 45 days with zero orders or creator campaigns.",
      });
    }
    setSimulatedIssues(demoItems);
    setIsOpen(true);
    setMinimized(false);
  };

  if (!isOpen && activeIssues.length === 0) return null;

  // Minimized floating pill state
  if (!isOpen) {
    return (
      <div className="fixed bottom-5 end-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-[13px] font-medium text-amber-900 shadow-md transition-all hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/80 dark:text-amber-200"
          title={t("title")}
        >
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <span className="font-semibold">{t("kicker")}</span>
          <span className="rounded-full bg-amber-200 px-1.5 py-0.2 font-mono text-[11px] text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            {activeIssues.length}
          </span>
        </button>
      </div>
    );
  }

  const outOfStockCount = activeIssues.filter((i) => i.type === "out_of_stock").length;
  const deadStockCount = activeIssues.filter((i) => i.type === "dead_stock").length;
  const primaryItem = activeIssues[0];
  const remainingCount = activeIssues.length - 1;

  return (
    <aside
      aria-live="polite"
      className="fixed top-4 start-4 end-4 sm:start-auto sm:end-6 z-50 sm:max-w-md w-auto"
    >
      <div className="overflow-hidden rounded-2xl border border-amber-200/90 bg-white/95 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all dark:border-amber-500/30 dark:bg-slate-900/95">
        {/* Toast Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {t("kicker")}
                </span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span className="text-[11px] text-frost-dim">
                  {isAr ? "مكتشف منذ زيارتك السابقة" : "Detected since last visit"}
                </span>
              </div>
              <h3 className="text-[14px] font-semibold text-frost">
                {t("title")}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMinimized((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-frost-dim hover:bg-black/5 hover:text-frost dark:hover:bg-white/10"
              title={minimized ? "Expand" : "Minimize"}
            >
              {minimized ? "▾" : "▴"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-frost-dim hover:bg-black/5 hover:text-frost dark:hover:bg-white/10"
              title={t("dismiss")}
            >
              ✕
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="mt-3 space-y-3 pt-2 border-t border-line/60">
            {/* Quick summary badges */}
            <div className="flex flex-wrap gap-2 text-[12px]">
              {outOfStockCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  {outOfStockCount} {t("outOfStock")}
                </span>
              )}
              {deadStockCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {deadStockCount} {t("deadStock")}
                </span>
              )}
            </div>

            {/* Primary Affected Product Card */}
            {primaryItem && (
              <div className="rounded-xl border border-line bg-night/5 p-3 dark:bg-night/40">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        primaryItem.type === "out_of_stock"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                      }`}
                    >
                      {primaryItem.type === "out_of_stock" ? t("outOfStock") : t("deadStock")}
                    </span>
                    <h4 className="mt-1 text-[13px] font-semibold text-frost">
                      {primaryItem.title}
                    </h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-frost-dim">
                      {isAr ? primaryItem.reasonAr : primaryItem.reasonEn}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[12px] font-medium text-frost">
                    {formatMoney(primaryItem.price, primaryItem.currency)}
                  </span>
                </div>
              </div>
            )}

            {/* Expanded items if more than 1 */}
            {remainingCount > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAllItems((v) => !v)}
                  className="text-[12px] font-medium text-frost-dim underline hover:text-frost"
                >
                  {showAllItems
                    ? (isAr ? "إخفاء باقي المنتجات" : "Hide other items")
                    : `+ ${remainingCount} ${isAr ? "منتجات أخرى بحاجة لمراجعة" : "other items need review"}`}
                </button>

                {showAllItems && (
                  <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
                    {activeIssues.slice(1).map((issue) => (
                      <li
                        key={issue.id}
                        className="rounded-lg border border-line bg-white p-2 text-[12px] dark:bg-slate-800"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-frost truncate">{issue.title}</span>
                          <span
                            className={`shrink-0 rounded px-1 text-[10px] ${
                              issue.type === "out_of_stock"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {issue.type === "out_of_stock" ? t("outOfStock") : t("deadStock")}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab("ad_radar");
                      handleDismiss();
                    }}
                    className="gl-btn-secondary !min-h-9 !py-1.5 !px-3.5 !text-xs font-semibold"
                  >
                    {isAr ? "رادار المنصة الأنسب" : "Ad Radar"}
                  </button>
                )}
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab("analytics");
                      handleDismiss();
                    }}
                    className="gl-btn-secondary !min-h-9 !py-1.5 !px-3.5 !text-xs font-semibold"
                  >
                    {isAr ? "رادار المخزون" : "Stock Radar"}
                  </button>
                )}
                {outOfStockCount > 0 && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab("products");
                      handleDismiss();
                    }}
                    className="gl-btn-primary !min-h-9 !py-1.5 !px-3.5 !text-xs"
                  >
                    {t("manageProducts")}
                  </button>
                )}
                {deadStockCount > 0 && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab("campaign");
                      handleDismiss();
                    }}
                    className="gl-btn-secondary !min-h-9 !py-1.5 !px-3.5 !text-xs"
                  >
                    {t("launchCampaign")}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="text-[12px] text-frost-dim underline hover:text-frost"
              >
                {t("snooze")}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
