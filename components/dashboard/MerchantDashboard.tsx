"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatDate, formatMoney, formatPct } from "@/lib/format";
import type { MerchantDashboardData } from "@/lib/dashboard/merchant";
import { respondToSampleRequest, respondToUgcSubmission } from "@/app/(dashboard)/dashboard/sample-actions";
import { merchantSetOrderStatus } from "@/app/(dashboard)/dashboard/order-actions";
import { nextOrderStatuses, type OrderActionStatus } from "@/lib/domain/orders";
import WaterfallBreakdown from "@/components/dashboard/WaterfallBreakdown";
import MediaKitManager from "@/components/dashboard/MediaKitManager";
import ProductPricingEditor from "@/components/dashboard/ProductPricingEditor";
import { EmptyState, Metric, StatusPill, TableShell, TierPill } from "@/components/dashboard/ui";

type Tab = "products" | "creators" | "orders" | "samples" | "ads";

export default function MerchantDashboard({
  data,
  locale,
}: {
  data: MerchantDashboardData;
  locale: string;
}) {
  const t = useTranslations("dashboardApp.merchant");
  const tStatus = useTranslations("dashboardApp.status");
  const [tab, setTab] = useState<Tab>("products");

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "products", label: t("tabs.products") },
    { id: "creators", label: t("tabs.creators") },
    { id: "orders", label: t("tabs.orders") },
    { id: "samples", label: t("tabs.samples") },
    { id: "ads", label: t("tabs.ads") },
  ];

  return (
    <div>
      <VerificationBanner merchant={data.merchant} />
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      {tab === "products" && <ProductsTab data={data} />}
      {tab === "creators" && <CreatorsTab data={data} />}
      {tab === "orders" && <OrdersTab data={data} locale={locale} />}
      {tab === "samples" && <SamplesTab data={data} locale={locale} />}
      {tab === "ads" && <AdWalletTab data={data} locale={locale} />}
    </div>
  );

  function VerificationBanner({ merchant }: { merchant: MerchantDashboardData["merchant"] }) {
    const status = merchant.verificationStatus;
    const toneClass =
      status === "verified"
        ? "border-white/10 bg-white/[0.04]"
        : status === "rejected"
          ? "border-danger/60 bg-danger/10"
          : "border-warn/50 bg-warn/10";

    return (
      <div className={`border-b px-5 py-4 sm:px-8 ${toneClass}`}>
        <p className="text-[12px] text-frost-dim">
          {tStatus(`verification.${status}` as "verification.pending")}
        </p>
        <p className="mt-1 max-w-xl text-[14px] text-frost-dim">
          {t(`verificationBanner.${status}` as "verificationBanner.pending")}
        </p>
      </div>
    );
  }

  function ProductsTab({ data: d }: { data: MerchantDashboardData }) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <div className="mb-6 flex justify-end">
          <Link href="/dashboard/products/new" className="gl-btn-primary">
            {t("products.addCta")}
          </Link>
        </div>

        {d.products.length === 0 ? (
          <EmptyState text={t("products.empty")} />
        ) : (
          <TableShell
            head={[
              t("products.columns.title"),
              t("products.columns.category"),
              t("products.columns.tags"),
              t("products.columns.price"),
              t("products.columns.cogs"),
              t("products.columns.deals"),
              t("products.columns.status"),
            ]}
          >
            {d.products.map((p) => (
              <Fragment key={p.id}>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 font-display text-base">{p.title}</td>
                  <td className="px-4 py-3 font-west text-[11px] uppercase tracking-[0.16em] text-frost-dim">
                    {p.category}
                  </td>
                  <td className="px-4 py-3 font-serif text-xs italic text-frost-dim">{p.tags.join(", ")}</td>
                  <td className="px-4 py-3 font-mono text-sm">{formatMoney(p.basePrice, p.currency)}</td>
                  <td className="px-4 py-3 font-mono text-sm">{formatPct(p.cogsPct, 0)}</td>
                  <td className="px-4 py-3 font-mono text-sm">{p.activeDealsCount}</td>
                  <td className="px-4 py-3">
                    <StatusPill ok={p.active}>{p.active ? tStatus("product.active") : tStatus("product.inactive")}</StatusPill>
                  </td>
                </tr>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <td colSpan={7} className="p-0">
                    <MediaKitManager productId={p.id} assets={p.mediaAssets} />
                    <ProductPricingEditor product={p} />
                  </td>
                </tr>
              </Fragment>
            ))}
          </TableShell>
        )}
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

    const filtered = useMemo(
      () => (filter === "all" ? d.ordersLedger : d.ordersLedger.filter((o) => o.status === filter)),
      [d.ordersLedger, filter]
    );

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
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill ok={o.status === "fulfilled" || o.status === "confirmed"}>
                        {tStatus(`order.${o.status}` as "order.pending")}
                      </StatusPill>
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
                  {next.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3">
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
                    </div>
                  )}
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

  function AdWalletTab({ data: d, locale: loc }: { data: MerchantDashboardData; locale: string }) {
    return (
      <section className="px-5 py-10 sm:px-8">
        {d.adWallets.length === 0 ? (
          <EmptyState text={t("ads.empty")} />
        ) : (
          <div className="space-y-8">
            {d.adWallets.map((w) => (
              <div key={w.walletId} className="border border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="font-display text-lg">{w.productTitle}</p>
                    <p className="font-serif text-xs italic text-frost-dim">@{w.creatorUsername}</p>
                  </div>
                  <StatusPill ok={w.status === "live"}>{tStatus(`wallet.${w.status}` as "wallet.live")}</StatusPill>
                </div>

                {w.autoPauseFlag && (
                  <div className="border-b border-danger/30 bg-danger/10 px-4 py-3">
                    <p className="font-west text-[11px] uppercase tracking-[0.2em] text-danger">
                      {t("ads.autoPaused", { reason: w.autoPauseReason ?? "" })}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 divide-x divide-white/10 border-b border-white/10 sm:grid-cols-4">
                  <Metric label={t("ads.balance")} value={formatMoney(w.availableBalance)} />
                  <Metric label={t("ads.dailyCap")} value={formatMoney(w.dailyCap)} />
                  <Metric label={t("ads.dealCap")} value={formatMoney(w.dealCap)} />
                  <Metric
                    label={t("ads.mer")}
                    value={w.latestMer !== null ? `${w.latestMer.toFixed(2)}x` : "—"}
                    warn={w.latestMer !== null && w.latestMer < w.merKillThreshold}
                  />
                </div>

                <div className="px-4 py-4">
                  <p className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
                    {t("ads.spendHistory")}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {w.spendHistory.slice(0, 8).map((s) => (
                      <li key={s.id} className="flex justify-between font-mono text-xs">
                        <span>{formatDate(s.spentAt, loc)}</span>
                        <span className="text-frost-dim">{s.source}</span>
                        <span>{formatMoney(s.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
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
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: never) => void;
}) {
  return (
    <div className="flex flex-wrap border-b border-white/10">
      {tabs.map((tabItem) => (
        <button
          key={tabItem.id}
          type="button"
          onClick={() => onChange(tabItem.id as never)}
          className={`border-e border-white/10 px-5 py-3 text-[12px] transition-colors duration-150 ease-out ${
            active === tabItem.id ? "bg-white/10 text-frost" : "text-frost-dim hover:text-frost"
          }`}
        >
          {tabItem.label}
        </button>
      ))}
    </div>
  );
}
