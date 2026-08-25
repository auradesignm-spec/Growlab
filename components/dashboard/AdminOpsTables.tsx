"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatDate, formatMoney } from "@/lib/format";
import type { AdminDashboardData, AdminOrderRow, AdminPayoutRow, AdminProductRow, AdminSampleRow, AdminWalletTopupRow } from "@/lib/dashboard/admin";
import {
  adminProcessWalletTopup,
  adminRespondToSample,
  adminSetEscrowStatus,
  adminSetOrderStatus,
  adminSetPayoutStatus,
  adminSetProductActive,
} from "@/app/(dashboard)/dashboard/admin-actions";
import { EmptyState, StatusPill, TableShell } from "@/components/dashboard/ui";
import { nextOrderStatuses } from "@/lib/domain/orders";
import type { PayoutStatusId } from "@/lib/domain/enums";

function useAction() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }
  return { pending, error, run };
}

export function OrdersTab({ data, locale }: { data: AdminDashboardData; locale: string }) {
  const t = useTranslations("dashboardApp.admin.orders");
  if (data.orders.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("empty")} />
      </section>
    );
  }
  return (
    <section className="px-5 py-10 sm:px-8">
      <TableShell
        head={[
          t("columns.buyer"),
          t("columns.product"),
          t("columns.parties"),
          t("columns.total"),
          t("columns.status"),
          t("columns.escrow"),
          t("columns.actions"),
        ]}
      >
        {data.orders.map((order) => (
          <OrderRow key={order.id} order={order} locale={locale} />
        ))}
      </TableShell>
    </section>
  );
}

function OrderRow({ order, locale }: { order: AdminOrderRow; locale: string }) {
  const t = useTranslations("dashboardApp.admin.orders");
  const tStatus = useTranslations("dashboardApp.status");
  const { pending, error, run } = useAction();
  const next = nextOrderStatuses(order.status);

  return (
    <tr className="border-b border-white/10 align-top">
      <td className="px-4 py-3">
        <p className="font-display text-base">{order.buyerName}</p>
        {order.buyerPhone && <p className="font-mono text-[11px] text-frost">{order.buyerPhone}</p>}
        {(order.buyerCity || order.buyerAddress) && (
          <p className="mt-1 text-[12px] text-frost-dim">
            {[order.buyerCity, order.buyerAddress].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="font-mono text-[11px] text-frost-dim">{formatDate(order.createdAt, locale)}</p>
      </td>
      <td className="px-4 py-3 font-serif text-sm italic text-frost-dim">{order.productTitle}</td>
      <td className="px-4 py-3 font-mono text-[11px] text-frost-dim">
        @{order.creatorUsername}
        <br />
        {order.merchantBusinessName}
      </td>
      <td className="px-4 py-3 font-mono text-sm">
        {formatMoney(order.unitPriceCharged * order.quantity, order.currency)}
        <span className="block text-[11px] text-frost-dim">×{order.quantity}</span>
        {order.attributedGmv != null && (
          <span className="block text-[11px] text-pulse">GMV {formatMoney(order.attributedGmv, order.currency)}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusPill ok={order.status === "fulfilled" || order.status === "confirmed"}>{order.status}</StatusPill>
      </td>
      <td className="px-4 py-3">
        <StatusPill ok={order.escrowStatus === "released"}>{tStatus(`escrow.${order.escrowStatus}` as "escrow.held")}</StatusPill>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {next.map((status) => (
            <button
              key={status}
              type="button"
              disabled={pending}
              onClick={() => run(() => adminSetOrderStatus(order.id, status))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t(`actions.${status}`)}
            </button>
          ))}
          {order.escrowStatus === "released" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => adminSetEscrowStatus(order.id, "held"))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("escrowFreeze")}
            </button>
          )}
          {order.status === "fulfilled" && order.escrowStatus === "held" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => adminSetEscrowStatus(order.id, "released"))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("escrowRelease")}
            </button>
          )}
        </div>
        {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}

export function SamplesTab({ data, locale }: { data: AdminDashboardData; locale: string }) {
  const t = useTranslations("dashboardApp.admin.samples");
  if (data.samples.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("empty")} />
      </section>
    );
  }
  return (
    <section className="px-5 py-10 sm:px-8">
      <TableShell
        head={[
          t("columns.product"),
          t("columns.parties"),
          t("columns.status"),
          t("columns.ugc"),
          t("columns.deposit"),
          t("columns.actions"),
        ]}
      >
        {data.samples.map((sample) => (
          <SampleRow key={sample.id} sample={sample} locale={locale} />
        ))}
      </TableShell>
    </section>
  );
}

function SampleRow({ sample, locale }: { sample: AdminSampleRow; locale: string }) {
  const t = useTranslations("dashboardApp.admin.samples");
  const { pending, error, run } = useAction();

  return (
    <tr className="border-b border-white/10 align-top">
      <td className="px-4 py-3">
        <p className="font-display text-base">{sample.productTitle}</p>
        <p className="font-mono text-[11px] text-frost-dim">{formatDate(sample.createdAt, locale)}</p>
      </td>
      <td className="px-4 py-3 font-mono text-[11px] text-frost-dim">
        @{sample.creatorUsername}
        <br />
        {sample.merchantBusinessName}
      </td>
      <td className="px-4 py-3">
        <StatusPill ok={sample.status === "shipped" || sample.status === "approved"}>{sample.status}</StatusPill>
        {sample.shippingRef && <p className="mt-1 font-mono text-[11px] text-pulse">{sample.shippingRef}</p>}
      </td>
      <td className="px-4 py-3 font-west text-[10px] uppercase tracking-[0.16em] text-frost-dim">{sample.ugcStatus}</td>
      <td className="px-4 py-3 font-mono text-sm">
        {sample.depositAmount != null ? formatMoney(sample.depositAmount) : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {sample.status === "pending" && (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => adminRespondToSample(sample.id, "approve"))}
                className="gl-btn-ghost disabled:opacity-40"
              >
                {t("approve")}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => adminRespondToSample(sample.id, "reject"))}
                className="gl-btn-ghost disabled:opacity-40"
              >
                {t("reject")}
              </button>
            </>
          )}
          {sample.status === "approved" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => adminRespondToSample(sample.id, "ship"))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("ship")}
            </button>
          )}
        </div>
        {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}

export function PayoutsTab({ data, locale }: { data: AdminDashboardData; locale: string }) {
  const t = useTranslations("dashboardApp.admin.payouts");
  if (data.payouts.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("empty")} />
      </section>
    );
  }
  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="mb-6 max-w-lg font-serif text-sm italic text-frost-dim">{t("hint")}</p>
      <TableShell
        head={[
          t("columns.creator"),
          t("columns.account"),
          t("columns.type"),
          t("columns.amount"),
          t("columns.status"),
          t("columns.actions"),
        ]}
      >
        {data.payouts.map((payout) => (
          <PayoutRow key={payout.id} payout={payout} locale={locale} />
        ))}
      </TableShell>
    </section>
  );
}

function PayoutRow({ payout, locale }: { payout: AdminPayoutRow; locale: string }) {
  const t = useTranslations("dashboardApp.admin.payouts");
  const { pending, error, run } = useAction();
  const open = payout.status === "requested" || payout.status === "approved";

  return (
    <tr className={`border-b border-white/10 align-top ${payout.status === "requested" ? "bg-pulse/5" : ""}`}>
      <td className="px-4 py-3">
        <p className="font-display text-base">@{payout.creatorUsername}</p>
        <p className="font-mono text-[11px] text-frost-dim">{formatDate(payout.requestedAt, locale)}</p>
      </td>
      <td className="px-4 py-3">
        {payout.bankName || payout.accountName || payout.accountNumber ? (
          <>
            <p className="text-[13px] text-frost">{payout.bankName}</p>
            <p className="text-[13px] text-frost-dim">{payout.accountName}</p>
            <p className="font-mono text-[12px] text-frost">{payout.accountNumber}</p>
          </>
        ) : (
          <p className="text-[12px] text-danger">{t("noAccount")}</p>
        )}
      </td>
      <td className="px-4 py-3 font-west text-[11px] uppercase tracking-[0.16em] text-frost-dim">{payout.type}</td>
      <td className="px-4 py-3 font-mono text-sm">
        {formatMoney(payout.amount)}
        {payout.feeAmount > 0 && (
          <span className="block text-[11px] text-frost-dim">{t("fee", { fee: formatMoney(payout.feeAmount) })}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusPill ok={payout.status === "paid" || payout.status === "approved"}>{payout.status}</StatusPill>
      </td>
      <td className="px-4 py-3">
        {open && (
          <div className="flex flex-wrap gap-2">
            {payout.status === "requested" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => adminSetPayoutStatus(payout.id, "approved" as PayoutStatusId))}
                className="gl-btn-ghost disabled:opacity-40"
              >
                {t("approve")}
              </button>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => adminSetPayoutStatus(payout.id, "paid"))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("markPaid")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => adminSetPayoutStatus(payout.id, "rejected"))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("reject")}
            </button>
          </div>
        )}
        {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}

export function WalletTopupsTab({ data, locale }: { data: AdminDashboardData; locale: string }) {
  const t = useTranslations("dashboardApp.admin.topups");
  if (data.walletTopups.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("empty")} />
      </section>
    );
  }
  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="mb-6 max-w-lg font-serif text-sm italic text-frost-dim">{t("hint")}</p>
      <TableShell
        head={[
          t("columns.merchant"),
          t("columns.amount"),
          t("columns.proof"),
          t("columns.status"),
          t("columns.actions"),
        ]}
      >
        {data.walletTopups.map((row) => (
          <WalletTopupRow key={row.id} row={row} locale={locale} />
        ))}
      </TableShell>
    </section>
  );
}

function WalletTopupRow({ row, locale }: { row: AdminWalletTopupRow; locale: string }) {
  const t = useTranslations("dashboardApp.admin.topups");
  const { pending, error, run } = useAction();
  const [note, setNote] = useState("");

  return (
    <tr className={`border-b border-white/10 align-top ${row.status === "pending" ? "bg-warn/5" : ""}`}>
      <td className="px-4 py-3">
        <p className="font-display text-base">{row.businessName}</p>
        <p className="font-mono text-[11px] text-frost-dim">{formatDate(row.createdAt, locale)}</p>
      </td>
      <td className="px-4 py-3 font-mono text-sm">{formatMoney(row.amount, row.currency)}</td>
      <td className="px-4 py-3 text-[13px] text-frost-dim">{row.proofNote}</td>
      <td className="px-4 py-3">
        <StatusPill ok={row.status === "approved"}>{row.status}</StatusPill>
        {row.adminNote ? <p className="mt-1 text-[11px] text-frost-faint">{row.adminNote}</p> : null}
      </td>
      <td className="px-4 py-3">
        {row.status === "pending" ? (
          <div className="flex flex-col gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="w-full max-w-[180px] border border-white/15 bg-white/[0.03] px-2 py-1 text-[12px] text-frost"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => adminProcessWalletTopup(row.id, "approve", note))}
                className="gl-btn-ghost disabled:opacity-40"
              >
                {t("approve")}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => adminProcessWalletTopup(row.id, "reject", note))}
                className="gl-btn-ghost disabled:opacity-40"
              >
                {t("reject")}
              </button>
            </div>
          </div>
        ) : null}
        {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}

export function ProductActiveToggle({ product, t }: { product: AdminProductRow; t: ReturnType<typeof useTranslations> }) {
  const { pending, error, run } = useAction();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill ok={product.active}>{product.active ? t("products.active") : t("products.inactive")}</StatusPill>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => adminSetProductActive(product.id, !product.active))}
          className="gl-btn-ghost disabled:opacity-40"
        >
          {product.active ? t("products.deactivate") : t("products.activate")}
        </button>
      </div>
      {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
    </div>
  );
}
