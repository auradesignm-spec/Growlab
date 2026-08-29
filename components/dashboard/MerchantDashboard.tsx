"use client";

import { Fragment, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatDate, formatMoney, formatPct } from "@/lib/format";
import type { MerchantDashboardData } from "@/lib/dashboard/merchant";
import { respondToSampleRequest, respondToUgcSubmission } from "@/app/(dashboard)/dashboard/sample-actions";
import { merchantSetOrderStatus, merchantSetShippingRef } from "@/app/(dashboard)/dashboard/order-actions";
import { getNewOrderWhatsAppUrl } from "@/lib/shop/notify";
import { commissionPayState } from "@/lib/shop/commissionPayState";
import { nextOrderStatuses, type OrderActionStatus } from "@/lib/domain/orders";
import WaterfallBreakdown from "@/components/dashboard/WaterfallBreakdown";
import ProductStudio from "@/components/dashboard/ProductStudio";
import PerformanceCampaignPanel from "@/components/dashboard/PerformanceCampaignPanel";
import WalletTopupPanel from "@/components/dashboard/WalletTopupPanel";
import MerchantBillingPanel from "@/components/dashboard/MerchantBillingPanel";
import AcceptQueue from "@/components/dashboard/AcceptQueue";
import LiveSalesSimulator from "@/components/dashboard/LiveSalesSimulator";
import StockAlertToast from "@/components/dashboard/StockAlertToast";
import StockSalesAnalyticsChart from "@/components/dashboard/StockSalesAnalyticsChart";
import AdChannelDemandRadar from "@/components/dashboard/AdChannelDemandRadar";
import FinancialAnalyticsDashboard from "@/components/dashboard/FinancialAnalyticsDashboard";
import IntegrationsHub from "@/components/dashboard/IntegrationsHub";
import VerifiedBadge from "@/components/dashboard/VerifiedBadge";
import { EmptyState, StatusPill, TableShell, TierPill } from "@/components/dashboard/ui";
import { merchantOnboardingHref } from "@/lib/domain/merchantOnboarding";

type Tab = "queue" | "products" | "store" | "campaign" | "wallet" | "billing" | "creators" | "orders" | "samples" | "simulator" | "analytics" | "ad_radar" | "financial_analytics" | "integrations";

/** MVP-visible tabs (deep links to queue/creators/samples still render if forced in code). */
const MERCHANT_TABS: Tab[] = ["financial_analytics", "integrations", "ad_radar", "analytics", "simulator", "products", "store", "campaign", "wallet", "billing", "orders"];

function isMerchantTab(value: string | undefined): value is Tab {
  return Boolean(value && MERCHANT_TABS.includes(value as Tab));
}

export default function MerchantDashboard({
  data,
  locale,
  initialTab,
}: {
  data: MerchantDashboardData;
  locale: string;
  initialTab?: string;
}) {
  const t = useTranslations("dashboardApp.merchant");
  const tStatus = useTranslations("dashboardApp.status");
  const router = useRouter();
  const fallback: Tab =
    data.onboarding.current === "store" || data.onboarding.current === "publish"
      ? "store"
      : data.onboarding.current === "campaign"
        ? "campaign"
        : "products";
  const [tab, setTab] = useState<Tab>(isMerchantTab(initialTab) ? initialTab : fallback);

  useEffect(() => {
    if (isMerchantTab(initialTab)) setTab(initialTab);
  }, [initialTab]);

  const primaryTabs: Array<{ id: Tab; label: string }> = [
    { id: "financial_analytics", label: locale === "en" ? "True Net Profit & Reconciliation" : "تدقيق الأرباح والمطابقة المالية" },
    { id: "integrations", label: locale === "en" ? "Integrations Hub" : "مركز الربط والبيانات" },
    { id: "ad_radar", label: locale === "en" ? "Ad Channels AI Radar" : "رادار القنوات الإعلانية" },
    { id: "analytics", label: locale === "en" ? "Sales & Stock Radar" : "رادار المبيعات والمخزون" },
    { id: "simulator", label: locale === "en" ? "Live Sales Simulator" : "محاكي المبيعات الحية" },
    { id: "store", label: t("tabs.store") },
    { id: "products", label: t("tabs.products") },
    { id: "campaign", label: t("tabs.campaign") },
    { id: "orders", label: t("tabs.orders") },
    { id: "wallet", label: t("tabs.wallet") },
  ];
  const moreTabs: Array<{ id: Tab; label: string }> = [
    { id: "billing", label: t("tabs.billing") },
  ];

  function changeTab(next: Tab) {
    setTab(next);
    router.replace(`/dashboard?tab=${next}`, { scroll: false });
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--paper)]">
      <div className="gl-mesh pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <span className="gl-mesh-orb gl-mesh-cyan" />
        <span className="gl-mesh-orb gl-mesh-lime" />
        <span className="gl-mesh-orb gl-mesh-sun" />
      </div>

      <StockAlertToast products={data.products} locale={locale} onNavigateTab={changeTab} />

      <div className="relative z-[1] mx-auto max-w-wrap px-4 pb-16 pt-6 sm:px-8 sm:pt-8">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold border border-line text-frost">
                {data.merchant.businessName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-display-md font-semibold text-frost">{data.merchant.businessName}</h1>
                {data.merchant.verificationStatus === "verified" && (
                  <VerifiedBadge size="sm" showLabel label="موثق ✓" />
                )}
              </div>
            </div>
          </div>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-frost-dim">{t("home.lede")}</p>
        </header>

        {data.merchant.verificationStatus !== "verified" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm font-bold">
                  {data.merchant.verificationStatus === "pending"
                    ? "مستندات التوثيق قيد المراجعة والتدقيق"
                    : "حسابك في وضع الاستكشاف التجريبي (Explore Mode)"}
                </p>
                <p className="mt-0.5 text-xs opacity-90">
                  {data.merchant.verificationStatus === "pending"
                    ? "يمكنك الاستمرار في تجهيز المنتجات وضبط متجرك، وسنعتمد حسابك فور انتهاء التدقيق."
                    : "يمكنك الآن إضافة منتجاتك وتصميم متجرك وتجربة المنصة. لنشر المتجر رسمياً واستقبال أرباح المسوقين، يلزم توثيق السجل التجاري والبطاقة."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeTab("products")}
                className="gl-btn-secondary !min-h-10 !py-2 !px-3.5 !text-xs"
              >
                أضف أول منتج الآن
              </button>
              <Link
                href="/dashboard?kyc=1"
                className="gl-btn-primary !min-h-10 !py-2 !px-4 !text-xs"
              >
                {data.merchant.verificationStatus === "pending" ? "عرض حالة التوثيق" : "توثيق الحساب الآن"}
              </Link>
            </div>
          </div>
        )}

        <OnboardingProgressBar progress={data.onboarding} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <StatusCard merchant={data.merchant} />
          <WalletCard wallet={data.wallet} onOpenWallet={() => changeTab("wallet")} />
        </div>

        <ShortcutsRow
          store={data.store}
          onTab={changeTab}
          orderCount={data.ordersLedger.length}
        />

        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[var(--shadow-card)]">
          <TabBar tabs={primaryTabs} moreTabs={moreTabs} active={tab} onChange={changeTab} />
          <div className="border-t border-line">
            {tab === "financial_analytics" && (
              <div className="p-4 sm:p-6 bg-slate-950">
                <FinancialAnalyticsDashboard locale={locale} />
              </div>
            )}
            {tab === "integrations" && (
              <div className="p-4 sm:p-6 bg-slate-950">
                <IntegrationsHub locale={locale} />
              </div>
            )}
            {tab === "ad_radar" && (
              <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
                <AdChannelDemandRadar
                  products={data.products}
                  locale={locale}
                  onNavigateTab={changeTab}
                />
              </div>
            )}
            {tab === "analytics" && (
              <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
                <StockSalesAnalyticsChart
                  products={data.products}
                  ordersLedger={data.ordersLedger}
                  locale={locale}
                  onNavigateTab={changeTab}
                />
              </div>
            )}
            {tab === "simulator" && <LiveSalesSimulator locale={locale} onOpenStore={() => changeTab("store")} />}
            {tab === "queue" && <AcceptQueue applications={data.pendingApplications} />}
            {tab === "products" && <ProductsTab data={data} />}
            {tab === "store" && <StoreTab store={data.store} />}
            {tab === "campaign" && (
              <PerformanceCampaignPanel
                products={data.products.map((p) => ({ id: p.id, title: p.title, active: p.active }))}
                campaigns={data.campaigns}
                reels={data.buyerReels}
                maxBudgetCap={data.merchant.limits.maxBudgetCap}
                isPro={data.merchant.effectivePlan === "pro"}
              />
            )}
            {tab === "wallet" && <WalletTopupPanel requests={data.topupRequests} />}
            {tab === "billing" && <MerchantBillingPanel merchant={data.merchant} />}
            {tab === "creators" && <CreatorsTab data={data} />}
            {tab === "orders" && <OrdersTab data={data} locale={locale} />}
            {tab === "samples" && <SamplesTab data={data} locale={locale} />}
          </div>
        </div>
      </div>
    </div>
  );

  function OnboardingProgressBar({ progress }: { progress: MerchantDashboardData["onboarding"] }) {
    if (progress.current === "done") return null;
    const pct = Math.round((progress.completedCount / progress.total) * 100);
    const nextHref = merchantOnboardingHref(progress.current);
    return (
      <section className="rounded-[1.75rem] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-medium text-frost-faint">
              {t("onboarding.kicker")} · {progress.completedCount}/{progress.total}
            </p>
            <p className="mt-1 text-[15px] font-medium text-frost">{t("onboarding.hint")}</p>
          </div>
          <Link href={nextHref} className="gl-btn-primary min-h-11">
            {t("home.continueSetup")}
          </Link>
        </div>
        <div
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--paper-sunk)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("onboarding.kicker")}
        >
          <div
            className="h-full rounded-full bg-frost transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ol className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {progress.steps.map((step) => {
            const href = merchantOnboardingHref(step.id);
            const active = progress.current === step.id;
            return (
              <li key={step.id} className="shrink-0">
                <Link
                  href={href}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors duration-150 ${
                    step.done
                      ? "border-frost bg-frost text-white"
                      : active
                        ? "border-frost/30 bg-[var(--paper)] text-frost"
                        : "border-line bg-white text-frost-dim"
                  }`}
                >
                  <span aria-hidden className="text-[11px]">
                    {step.done ? "✓" : active ? "→" : "·"}
                  </span>
                  {t(`onboarding.steps.${step.id}` as "onboarding.steps.kyc")}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  function StatusCard({ merchant }: { merchant: MerchantDashboardData["merchant"] }) {
    const status = merchant.verificationStatus;
    return (
      <article className="rounded-[1.5rem] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
        <p className="text-[12px] font-medium text-frost-faint">{t("home.statusLabel")}</p>
        <p className="mt-2 text-[16px] font-semibold text-frost">
          {tStatus(`verification.${status}` as "verification.pending")}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-frost-dim">
          {t(`verificationBanner.${status}` as "verificationBanner.pending")}
        </p>
        <p className="mt-3 inline-flex rounded-full bg-[var(--paper-sunk)] px-3 py-1 text-[12px] font-medium text-frost-dim">
          {merchant.effectivePlan === "pro" ? t("home.planPro") : t("home.planFree")}
        </p>
      </article>
    );
  }

  function WalletCard({
    wallet,
    onOpenWallet,
  }: {
    wallet: MerchantDashboardData["wallet"];
    onOpenWallet: () => void;
  }) {
    const tight = wallet.available < 5;
    return (
      <article className="rounded-[1.5rem] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-medium text-frost-faint">{t("wallet.title")}</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-frost">
              {formatMoney(wallet.available, wallet.currency)}
            </p>
            <p className="mt-1 text-[13px] text-frost-dim">
              {tight ? t("wallet.lowHint") : t("wallet.available")}
            </p>
          </div>
          <button type="button" onClick={onOpenWallet} className="gl-btn-ghost min-h-11 shrink-0">
            {t("home.shortcuts.wallet")}
          </button>
        </div>
      </article>
    );
  }

  function ShortcutsRow({
    store,
    onTab,
    orderCount,
  }: {
    store: MerchantDashboardData["store"];
    onTab: (tab: Tab) => void;
    orderCount: number;
  }) {
    const items: Array<{
      id: string;
      label: string;
      hint: string;
      href?: string;
      onClick?: () => void;
      badge?: string | number;
    }> = [
      {
        id: "analytics",
        label: locale === "en" ? "Stock Radar" : "رادار المخزون",
        hint: locale === "en" ? "Daily sales vs dead stock analysis" : "تحليل المبيعات والمخزون الراكد",
        onClick: () => onTab("analytics"),
        badge: "Recharts",
      },
      {
        id: "simulator",
        label: locale === "en" ? "Live Simulator" : "محاكي المبيعات",
        hint: locale === "en" ? "Test real-time orders & margins" : "تجربة تدفق المبيعات والأرباح حياً",
        onClick: () => onTab("simulator"),
        badge: "LIVE",
      },
      {
        id: "store",
        label: t("home.shortcuts.store"),
        hint: store?.published ? t("home.shortcuts.storeLive") : t("home.shortcuts.storeEdit"),
        href: store?.published ? "/dashboard/store/edit" : "/dashboard/store/edit?fresh=1",
      },
      {
        id: "product",
        label: t("home.shortcuts.product"),
        hint: t("home.shortcuts.productHint"),
        href: "/dashboard/products/new",
      },
      {
        id: "campaign",
        label: t("home.shortcuts.campaign"),
        hint: t("home.shortcuts.campaignHint"),
        onClick: () => onTab("campaign"),
      },
      {
        id: "orders",
        label: t("home.shortcuts.orders"),
        hint: t("home.shortcuts.ordersHint", { count: orderCount }),
        onClick: () => onTab("orders"),
        badge: orderCount > 0 ? orderCount : undefined,
      },
      {
        id: "channels",
        label: t("home.shortcuts.channels"),
        hint: t("home.shortcuts.channelsHint"),
        href: "/dashboard/channels",
      },
      {
        id: "adCoach",
        label: t("home.shortcuts.adCoach"),
        hint: t("home.shortcuts.adCoachHint"),
        href: "/dashboard/ads",
      },
    ];

    return (
      <section className="mt-4">
        <p className="mb-3 text-[12px] font-medium text-frost-faint">{t("home.shortcutsTitle")}</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {items.map((item) => {
            const className =
              "group flex min-h-[5.5rem] flex-col justify-between rounded-[1.35rem] border border-line bg-white p-4 text-start shadow-[var(--shadow-card)] transition-colors duration-150 hover:border-frost/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frost";
            const body = (
              <>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-semibold text-frost">{item.label}</span>
                  {item.badge != null ? (
                    <span className="rounded-full bg-frost px-2 py-0.5 font-mono text-[11px] text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 text-[12px] leading-snug text-frost-dim">{item.hint}</span>
              </>
            );
            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className={className}>
                  {body}
                </Link>
              );
            }
            return (
              <button key={item.id} type="button" onClick={item.onClick} className={className}>
                {body}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  function ProductsTab({ data: d }: { data: MerchantDashboardData }) {
    return <ProductStudio products={d.products} />;
  }

  function StoreTab({ store }: { store: MerchantDashboardData["store"] }) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <p className="gl-eyebrow">{t("store.kicker")}</p>
        <h2 className="mt-2 font-display text-display-md">{t("store.title")}</h2>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-frost-dim">{t("store.lede")}</p>
        {store ? (
          <p className="mt-4 text-[14px] text-frost-dim">
            {store.published ? t("store.publishedAt", { slug: store.slug }) : t("store.draftAt", { slug: store.slug })}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={store?.published ? "/dashboard/store/edit" : "/dashboard/store/edit?fresh=1"} className="gl-btn-primary">
            {store ? t("store.editCta") : t("store.startCta")}
          </Link>
          {store?.published ? (
            <Link href={`/m/${store.slug}`} className="gl-btn-ghost">
              {t("store.viewCta")}
            </Link>
          ) : null}
          <Link href="/dashboard/products/new" className="gl-btn-ghost">
            {t("products.addCta")}
          </Link>
        </div>
        <p className="mt-8 max-w-lg font-serif text-sm italic text-frost-dim">{t("store.hint")}</p>
      </section>
    );
  }

  function CreatorsTab({ data: d }: { data: MerchantDashboardData }) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <p className="gl-eyebrow">{t("creators.assignedTitle")}</p>
        {d.assignedCreators.length === 0 ? (
          <EmptyState text={t("creators.assignedEmpty")} />
        ) : (
          <TableShell
            head={[
              t("creators.columns.creator"),
              t("creators.columns.tier"),
              t("creators.columns.deals"),
              t("creators.columns.orders"),
              t("creators.columns.netSales"),
            ]}
          >
            {d.assignedCreators.map((c) => (
              <tr key={c.creatorId} className="border-b border-white/10">
                <td className="px-4 py-3 font-display text-base">@{c.username}</td>
                <td className="px-4 py-3">
                  <TierPill tier={c.tier} />
                </td>
                <td className="px-4 py-3 font-mono text-sm">{c.dealsCount}</td>
                <td className="px-4 py-3 font-mono text-sm">{c.ordersCount}</td>
                <td className="px-4 py-3 font-mono text-sm">{formatMoney(c.netSales)}</td>
              </tr>
            ))}
          </TableShell>
        )}

        <p className="gl-eyebrow mt-14">{t("creators.suggestionsTitle")}</p>
        {d.unassignedProductSuggestions.length === 0 ? (
          <EmptyState text={t("creators.suggestionsEmpty")} />
        ) : (
          <div className="mt-4 space-y-6">
            {d.unassignedProductSuggestions.map((s) => (
              <div key={s.productId} className="border border-white/10 p-4">
                <p className="font-display text-lg">{s.title}</p>
                {s.suggestions.length === 0 ? (
                  <p className="mt-2 font-serif text-sm italic text-frost-dim">{t("creators.noMatch")}</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {s.suggestions.map((sug) => (
                      <li key={sug.creatorId} className="flex flex-wrap items-baseline justify-between gap-2 border-t border-white/10 pt-2">
                        <span className="font-mono text-sm">
                          @{sug.username} · <TierPill tier={sug.tier} />
                        </span>
                        <span className="font-serif text-xs italic text-frost-dim">{sug.reasons.join(" · ")}</span>
                        <span className="font-mono text-xs text-pulse">{t("creators.score", { score: sug.score })}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  function OrdersTab({ data: d, locale: loc }: { data: MerchantDashboardData; locale: string }) {
    const [filter, setFilter] = useState<string>("all");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const [actionError, setActionError] = useState<string | null>(null);

    const filtered = useMemo(() => {
      if (filter === "all") return d.ordersLedger;
      if (filter === "not_delivered" || filter === "awaiting_buyer" || filter === "delivered") {
        return d.ordersLedger.filter((o) => o.deliveryBucket === filter);
      }
      return d.ordersLedger.filter((o) => o.status === filter);
    }, [d.ordersLedger, filter]);

    function setStatus(orderId: string, status: OrderActionStatus) {
      setActionError(null);
      startTransition(async () => {
        try {
          await merchantSetOrderStatus(orderId, status);
        } catch (e) {
          setActionError(e instanceof Error ? e.message : t("orders.actionFailed"));
        }
      });
    }

    return (
      <section className="px-5 py-10 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">
            {t("orders.filterLabel")}
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-white/15 bg-white/[0.03] px-3 py-1.5 font-mono text-xs"
          >
            <option value="all">{t("orders.filterAll")}</option>
            <option value="not_delivered">{t("orders.filterNotDelivered")}</option>
            <option value="awaiting_buyer">{t("orders.filterAwaiting")}</option>
            <option value="delivered">{t("orders.filterDelivered")}</option>
            {["pending", "confirmed", "fulfilled", "returned", "cancelled"].map((s) => (
              <option key={s} value={s}>
                {tStatus(`order.${s}` as "order.pending")}
              </option>
            ))}
          </select>
        </div>

        {actionError && <p className="mb-4 font-mono text-xs text-danger">{actionError}</p>}

        {filtered.length === 0 ? (
          <EmptyState text={t("orders.empty")} />
        ) : (
          <ul className="space-y-3">
            {filtered.map((o) => {
              const next = nextOrderStatuses(o.status);
              const pay = commissionPayState([o.status]);
              return (
                <li key={o.orderId} className="border border-white/10">
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === o.orderId ? null : o.orderId)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-start"
                  >
                    <div>
                      <p className="font-display text-base">{o.productTitle}</p>
                      <p className="text-[13px] text-frost-dim">
                        @{o.creatorUsername} · {o.buyerName} · {formatDate(o.createdAt, loc)}
                      </p>
                      {o.buyerPhone && (
                        <p className="mt-1 font-mono text-[13px] text-frost">{o.buyerPhone}</p>
                      )}
                      {(o.buyerCity || o.buyerAddress) && (
                        <p className="mt-1 text-[13px] text-frost-dim">
                          {t("orders.shipTo")}: {[o.buyerCity, o.buyerAddress].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {o.trackingToken ? (
                        <p className="mt-1 font-mono text-[12px] text-frost-dim">
                          {t("orders.serial")}: <span className="text-frost">{o.trackingToken}</span>
                        </p>
                      ) : null}
                      {o.deliveryBucket === "awaiting_buyer" ? (
                        <p className="mt-1 max-w-md text-[13px] text-frost-dim">{t("orders.awaitingBuyer")}</p>
                      ) : null}
                      {o.shippingRef ? (
                        <p className="mt-1 font-mono text-[12px] text-frost-dim">
                          {t("orders.shippingRef")}: <span className="text-frost">{o.shippingRef}</span>
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill ok={o.status === "fulfilled" || o.status === "confirmed"}>
                        {tStatus(`order.${o.status}` as "order.pending")}
                      </StatusPill>
                      <p className="max-w-[14rem] text-end text-[12px] leading-snug text-frost-dim">
                        {pay === "confirmed"
                          ? t("orders.commissionConfirmed")
                          : pay === "void"
                            ? t("orders.commissionVoid")
                            : t("orders.commissionPending")}
                      </p>
                      {o.escrowStatus && (
                        <StatusPill ok={o.escrowStatus === "released"}>
                          {tStatus(`escrow.${o.escrowStatus}` as "escrow.held")}
                        </StatusPill>
                      )}
                      <span className="font-mono text-sm">
                        {formatMoney(o.quantity * o.unitPriceCharged, o.currency)}
                      </span>
                    </div>
                  </button>
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-3">
                    {next.map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={pending}
                        onClick={() => setStatus(o.orderId, status)}
                        className="gl-btn-ghost disabled:opacity-40"
                      >
                        {t(`orders.actions.${status}` as "orders.actions.confirmed")}
                      </button>
                    ))}
                    {o.buyerNotifyHref ? (
                      <a
                        href={o.buyerNotifyHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gl-btn-primary"
                      >
                        {t("orders.askBuyer")}
                      </a>
                    ) : null}
                    <a
                      href={getNewOrderWhatsAppUrl({
                        productTitle: o.productTitle,
                        buyerName: o.buyerName,
                        buyerCity: o.buyerCity ?? "",
                        quantity: o.quantity,
                        creatorUsername: o.creatorUsername,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gl-btn-ghost"
                    >
                      {t("orders.notifyWhatsapp")}
                    </a>
                    <form
                      className="flex flex-wrap items-center gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const form = event.currentTarget;
                        const ref = String(new FormData(form).get("shippingRef") ?? "");
                        startTransition(async () => {
                          try {
                            await merchantSetShippingRef(o.orderId, ref);
                          } catch (e) {
                            setActionError(e instanceof Error ? e.message : t("orders.actionFailed"));
                          }
                        });
                      }}
                    >
                      <input
                        name="shippingRef"
                        defaultValue={o.shippingRef ?? ""}
                        placeholder={t("orders.shippingPlaceholder")}
                        className="w-40 border border-white/15 bg-white/[0.03] px-3 py-1.5 font-mono text-xs"
                      />
                      <button type="submit" disabled={pending} className="gl-btn-ghost disabled:opacity-40">
                        {t("orders.saveShipping")}
                      </button>
                    </form>
                  </div>
                  {expanded === o.orderId && (
                    <div className="border-t border-white/10 p-4">
                      <WaterfallBreakdown row={o} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  function SamplesTab({ data: d, locale: loc }: { data: MerchantDashboardData; locale: string }) {
    const [pendingId, setPendingId] = useState<string | null>(null);

    return (
      <section className="px-5 py-10 sm:px-8">
        <p className="mb-6 max-w-lg font-serif text-sm italic text-frost-dim">{t("samples.trustNote")}</p>

        {d.sampleRequests.length === 0 ? (
          <EmptyState text={t("samples.empty")} />
        ) : (
          <ul className="space-y-3">
            {d.sampleRequests.map((s) => (
              <li key={s.id} className="border border-white/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base">{s.productTitle}</p>
                    <p className="font-serif text-xs italic text-frost-dim">
                      @{s.creatorUsername} · {formatDate(s.createdAt, loc)}
                    </p>
                    {s.note && <p className="mt-1 font-serif text-sm italic text-frost-dim">“{s.note}”</p>}
                  </div>
                  <StatusPill ok={s.status === "approved" || s.status === "shipped"}>
                    {tStatus(`sample.${s.status}` as "sample.pending")}
                  </StatusPill>
                </div>

                {s.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <SampleActionButton id={s.id} action="approve" label={t("samples.approve")} pendingId={pendingId} setPendingId={setPendingId} />
                    <SampleActionButton id={s.id} action="reject" label={t("samples.reject")} pendingId={pendingId} setPendingId={setPendingId} />
                  </div>
                )}
                {s.status === "approved" && (
                  <div className="mt-3">
                    <SampleActionButton id={s.id} action="ship" label={t("samples.markShipped")} pendingId={pendingId} setPendingId={setPendingId} />
                  </div>
                )}
                {s.status === "shipped" && s.shippingRef && (
                  <p className="mt-3 font-mono text-xs text-frost-dim">
                    {t("samples.shippingRef")}: <span className="text-frost">{s.shippingRef}</span>
                  </p>
                )}

                {s.depositAmount !== null && s.ugcStatus !== "not_applicable" && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs text-frost-dim">
                        {t("samples.depositLabel")}:{" "}
                        <span className="text-frost">{formatMoney(s.depositAmount, s.depositCurrency ?? "OMR")}</span>
                      </p>
                      <UgcStatusPill status={s.ugcStatus} tStatus={tStatus} />
                    </div>
                    {s.ugcDeadline && (
                      <p className="mt-1 font-mono text-xs text-frost-dim">
                        {t("samples.ugcDeadlineLabel")}: {formatDate(s.ugcDeadline, loc)}
                      </p>
                    )}

                    {s.ugcStatus === "submitted" && s.ugcVideoUrl && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <a
                          href={s.ugcVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs underline"
                        >
                          {t("samples.ugcWatch")}
                        </a>
                        <UgcActionButton sampleRequestId={s.id} action="approve" label={t("samples.ugcApprove")} />
                        <UgcActionButton sampleRequestId={s.id} action="reject" label={t("samples.ugcReject")} />
                      </div>
                    )}
                    {s.ugcStatus === "pending" && s.status === "shipped" && (
                      <p className="mt-2 font-serif text-xs italic text-frost-dim">{t("samples.ugcNoSubmission")}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }
}

function SampleActionButton({
  id,
  action,
  label,
  pendingId,
  setPendingId,
}: {
  id: string;
  action: "approve" | "reject" | "ship";
  label: string;
  pendingId: string | null;
  setPendingId: (id: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || pendingId === id}
      onClick={() => {
        setPendingId(id);
        startTransition(async () => {
          await respondToSampleRequest(id, action);
          setPendingId(null);
        });
      }}
      className={action === "reject" ? "gl-btn-ghost disabled:opacity-40" : "gl-btn-primary disabled:opacity-40"}
    >
      {label}
    </button>
  );
}

function UgcActionButton({
  sampleRequestId,
  action,
  label,
}: {
  sampleRequestId: string;
  action: "approve" | "reject";
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await respondToUgcSubmission(sampleRequestId, action);
        })
      }
      className={`font-west text-[10px] uppercase tracking-[0.2em] disabled:opacity-40 ${
        action === "approve" ? "text-frost underline" : "text-danger underline"
      }`}
    >
      {label}
    </button>
  );
}

function UgcStatusPill({
  status,
  tStatus,
}: {
  status: string;
  tStatus: ReturnType<typeof useTranslations>;
}) {
  const toneClass =
    status === "approved"
      ? "border-white/10 bg-white/10 text-frost"
      : status === "forfeited"
        ? "border-danger/60 bg-danger/10 text-danger"
        : "border-white/15 text-frost-dim";

  return (
    <span className={`border px-2.5 py-1 font-west text-[10px] uppercase tracking-[0.2em] ${toneClass}`}>
      {tStatus(`ugc.${status}` as "ugc.pending")}
    </span>
  );
}

function TabBar({
  tabs,
  moreTabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: Tab; label: string }>;
  moreTabs: Array<{ id: Tab; label: string }>;
  active: Tab;
  onChange: (id: Tab) => void;
}) {
  const t = useTranslations("dashboardApp.merchant");
  const moreActive = moreTabs.some((x) => x.id === active);

  return (
    <div className="space-y-2 px-3 py-3 sm:px-4">
      <div
        className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={t("home.primaryTabs")}
      >
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            role="tab"
            aria-selected={active === tabItem.id}
            onClick={() => onChange(tabItem.id)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors duration-150 ${
              active === tabItem.id
                ? "bg-frost text-white"
                : "bg-[var(--paper)] text-frost-dim hover:text-frost"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label={t("home.moreTabs")}>
        <span className="me-1 self-center text-[11px] font-medium text-frost-faint">{t("home.more")}</span>
        {moreTabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            role="tab"
            aria-selected={active === tabItem.id}
            onClick={() => onChange(tabItem.id)}
            className={`min-h-10 rounded-full px-3 text-[12px] font-medium transition-colors duration-150 ${
              active === tabItem.id
                ? "bg-frost text-white"
                : moreActive
                  ? "bg-[var(--paper-sunk)] text-frost-dim"
                  : "text-frost-faint hover:bg-[var(--paper)] hover:text-frost-dim"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>
    </div>
  );
}
