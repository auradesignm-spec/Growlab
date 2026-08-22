"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { AdminDashboardData } from "@/lib/dashboard/admin";
import { EmptyState, Metric, TableShell } from "@/components/dashboard/ui";
import { AddMerchantTab, CreatorAccountRow, KycQueueTab, MerchantAccountRow } from "@/components/dashboard/AdminOps";
import { OrdersTab, PayoutsTab, ProductActiveToggle, SamplesTab } from "@/components/dashboard/AdminOpsTables";

type Tab = "overview" | "kyc" | "orders" | "samples" | "payouts" | "merchants" | "creators" | "invite" | "products";

export default function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const t = useTranslations("dashboardApp.admin");
  const tStatus = useTranslations("dashboardApp.status");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: t("tabs.overview") },
    { id: "kyc", label: t("tabs.kyc") },
    { id: "orders", label: t("tabs.orders") },
    { id: "samples", label: t("tabs.samples") },
    { id: "payouts", label: t("tabs.payouts") },
    { id: "merchants", label: t("tabs.merchants") },
    { id: "creators", label: t("tabs.creators") },
    { id: "invite", label: t("tabs.invite") },
    { id: "products", label: t("tabs.products") },
  ];

  return (
    <div>
      <div className="flex flex-wrap border-b border-white/10">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={`border-e border-white/10 px-5 py-3 text-[12px] transition-colors duration-150 ease-out ${
              tab === tabItem.id ? "bg-white/10 text-frost" : "text-frost-dim hover:text-frost"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab data={data} t={t} onOpenTab={setTab} />}
      {tab === "kyc" && <KycQueueTab data={data} />}
      {tab === "orders" && <OrdersTab data={data} locale={locale} />}
      {tab === "samples" && <SamplesTab data={data} locale={locale} />}
      {tab === "payouts" && <PayoutsTab data={data} locale={locale} />}
      {tab === "merchants" && <MerchantsTab data={data} t={t} tStatus={tStatus} />}
      {tab === "creators" && <CreatorsTab data={data} t={t} tStatus={tStatus} />}
      {tab === "invite" && <AddMerchantTab />}
      {tab === "products" && <ProductsTab data={data} t={t} />}
    </div>
  );
}

function OverviewTab({
  data,
  t,
  onOpenTab,
}: {
  data: AdminDashboardData;
  t: ReturnType<typeof useTranslations>;
  onOpenTab: (tab: Tab) => void;
}) {
  const totals = data.totals;
  return (
    <section className="px-5 py-10 sm:px-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
        <Metric label={t("overview.merchants")} value={String(totals.merchants)} />
        <Metric label={t("overview.verifiedMerchants")} value={String(totals.verifiedMerchants)} />
        <Metric label={t("overview.pendingCreators")} value={String(totals.pendingCreators)} />
        <Metric label={t("overview.orders")} value={String(totals.orders)} />
      </div>

      <p className="gl-eyebrow mt-12">{t("overview.ledgerTitle")}</p>
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
        <Metric label={t("overview.gmv")} value={formatMoney(totals.attributedGmv)} />
        <Metric label={t("overview.creatorShare")} value={formatMoney(totals.creatorShare)} />
        <Metric label={t("overview.merchantShare")} value={formatMoney(totals.merchantShare)} />
        <Metric label={t("overview.platformShare")} value={formatMoney(totals.platformShare)} />
      </div>

      <p className="gl-eyebrow mt-12">{t("overview.escrowTitle")}</p>
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
        <Metric label={t("overview.escrowHeld")} value={String(totals.escrowHeld)} />
        <Metric label={t("overview.escrowReleased")} value={String(totals.escrowReleased)} />
        <Metric label={t("overview.escrowRefunded")} value={String(totals.escrowRefunded)} />
        <Metric label={t("overview.flaggedStores")} value={String(totals.flaggedStores)} />
      </div>

      <p className="gl-eyebrow mt-12">{t("overview.attentionTitle")}</p>
      <ul className="mt-4 space-y-2">
        <AttentionRow
          label={t("overview.pendingMerchants")}
          value={totals.pendingMerchants}
          hot={totals.pendingMerchants > 0}
          onClick={() => onOpenTab("kyc")}
        />
        <AttentionRow
          label={t("overview.pendingCreators")}
          value={totals.pendingCreators}
          hot={totals.pendingCreators > 0}
          onClick={() => onOpenTab("kyc")}
        />
        <AttentionRow
          label={t("overview.pendingSampleRequests")}
          value={totals.pendingSampleRequests}
          hot={totals.pendingSampleRequests > 0}
          onClick={() => onOpenTab("samples")}
        />
        <AttentionRow
          label={t("overview.pendingPayouts")}
          value={totals.pendingPayouts}
          hot={totals.pendingPayouts > 0}
          onClick={() => onOpenTab("payouts")}
        />
        <AttentionRow
          label={t("overview.bannedAccounts")}
          value={totals.bannedAccounts}
          hot={totals.bannedAccounts > 0}
          tone="danger"
        />
        <AttentionRow
          label={t("overview.flaggedStores")}
          value={totals.flaggedStores}
          hot={totals.flaggedStores > 0}
          tone="danger"
        />
        <AttentionRow
          label={t("overview.autoPausedWallets")}
          value={totals.autoPausedWallets}
          hot={totals.autoPausedWallets > 0}
          tone="danger"
        />
      </ul>

      {data.storeQuality.some((row) => row.flag) && (
        <>
          <p className="gl-eyebrow mt-12">{t("overview.storeQualityTitle")}</p>
          <ul className="mt-4 space-y-1.5">
            {data.storeQuality
              .filter((row) => row.flag)
              .map((row) => (
                <li key={row.username} className="flex items-baseline justify-between border-b border-white/10 pb-1.5 font-mono text-sm">
                  <span>@{row.username}</span>
                  <span className="text-danger">
                    {t("overview.storeQualityWatch", {
                      orders: row.orders,
                      returned: row.returned,
                      cancelled: row.cancelled,
                    })}
                  </span>
                </li>
              ))}
          </ul>
        </>
      )}

      {data.ordersByStatus.length > 0 && (
        <>
          <p className="gl-eyebrow mt-12">{t("overview.ordersByStatus")}</p>
          <ul className="mt-4 space-y-1.5">
            {data.ordersByStatus.map((row) => (
              <li key={row.status} className="flex items-baseline justify-between border-b border-white/10 pb-1.5 font-mono text-sm">
                <span className="capitalize">{row.status}</span>
                <span>{row.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function AttentionRow({
  label,
  value,
  hot,
  tone = "pulse",
  onClick,
}: {
  label: string;
  value: number;
  hot: boolean;
  tone?: "pulse" | "danger";
  onClick?: () => void;
}) {
  const countClass = !hot ? "" : tone === "danger" ? "text-danger" : "text-pulse";
  const inner = (
    <>
      <span>{label}</span>
      <span className={countClass}>{value}</span>
    </>
  );
  if (onClick) {
    return (
      <li>
        <button
          type="button"
          onClick={onClick}
          className="flex w-full items-baseline justify-between border-b border-white/10 pb-2 font-mono text-sm text-start hover:text-frost"
        >
          {inner}
        </button>
      </li>
    );
  }
  return <li className="flex items-baseline justify-between border-b border-white/10 pb-2 font-mono text-sm">{inner}</li>;
}

function MerchantsTab({
  data,
  t,
  tStatus,
}: {
  data: AdminDashboardData;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
}) {
  return (
    <section className="px-5 py-10 sm:px-8">
      {data.merchants.length === 0 ? (
        <EmptyState text={t("merchants.empty")} />
      ) : (
        <TableShell
          head={[
            t("merchants.columns.name"),
            t("merchants.columns.products"),
            t("merchants.columns.status"),
            t("merchants.columns.actions"),
          ]}
        >
          {data.merchants.map((m) => (
            <MerchantAccountRow key={m.id} merchant={m} t={t} tStatus={tStatus} />
          ))}
        </TableShell>
      )}
    </section>
  );
}

function CreatorsTab({
  data,
  t,
  tStatus,
}: {
  data: AdminDashboardData;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
}) {
  return (
    <section className="px-5 py-10 sm:px-8">
      {data.creators.length === 0 ? (
        <EmptyState text={t("creators.empty")} />
      ) : (
        <TableShell
          head={[
            t("creators.columns.username"),
            t("creators.columns.tier"),
            t("creators.columns.deals"),
            t("creators.columns.status"),
            t("creators.columns.actions"),
          ]}
        >
          {data.creators.map((c) => (
            <CreatorAccountRow key={c.id} creator={c} t={t} tStatus={tStatus} />
          ))}
        </TableShell>
      )}
    </section>
  );
}

function ProductsTab({ data, t }: { data: AdminDashboardData; t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="max-w-lg font-serif text-sm italic text-frost-dim">{t("products.hint")}</p>
      {data.products.length === 0 ? (
        <EmptyState text={t("products.empty")} />
      ) : (
        <TableShell
          head={[
            t("products.columns.title"),
            t("products.columns.merchant"),
            t("products.columns.retailPrice"),
            t("products.columns.costPrice"),
            t("products.columns.commission"),
            t("products.columns.platformFee"),
            t("products.columns.merchantNet"),
            t("products.columns.status"),
          ]}
        >
          {data.products.map((p) => (
            <tr key={p.id} className="border-b border-white/10">
              <td className="px-4 py-3 font-display text-base">{p.title}</td>
              <td className="px-4 py-3 font-serif text-xs italic text-frost-dim">{p.merchantBusinessName}</td>
              <td className="px-4 py-3 font-mono text-sm">{formatMoney(p.basePrice, p.currency)}</td>
              <td className="px-4 py-3 font-mono text-sm">{formatMoney(p.costPrice, p.currency)}</td>
              <td className="px-4 py-3 font-mono text-sm">
                {p.commissionType === "fixed"
                  ? formatMoney(p.commissionValue, p.currency)
                  : `${Math.round(p.commissionValue * 100)}%`}{" "}
                → {formatMoney(p.marketerCommission, p.currency)}
              </td>
              <td className="px-4 py-3 font-mono text-sm">{formatMoney(p.platformFee, p.currency)}</td>
              <td className="px-4 py-3 font-mono text-sm font-bold">{formatMoney(p.merchantNet, p.currency)}</td>
              <td className="px-4 py-3">
                <ProductActiveToggle product={p} t={t} />
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </section>
  );
}
