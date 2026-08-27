"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatDate, formatMoney, formatPct } from "@/lib/format";
import type { CreatorDashboardData } from "@/lib/dashboard/creator";
import { requestInstantPayout, requestScheduledPayout, saveCreatorPayoutAccount } from "@/app/(dashboard)/dashboard/actions";
import { leaveDeal } from "@/app/(dashboard)/dashboard/deals-actions";
import { submitUgcVideo } from "@/app/(dashboard)/dashboard/sample-actions";
import { computeInstantPayoutFee, MIN_PAYOUT_OMR } from "@/lib/ledger/payouts";
import WaterfallBreakdown from "@/components/dashboard/WaterfallBreakdown";
import ShareSheet from "@/components/dashboard/ShareSheet";
import VerifiedBadge from "@/components/dashboard/VerifiedBadge";
import { EmptyState, StatusPill, TierPill } from "@/components/dashboard/ui";

type Tab = "storefront" | "deals" | "samples" | "earnings" | "payouts";

const TABS: Tab[] = ["storefront", "deals", "samples", "earnings", "payouts"];

function isTab(value: string | undefined): value is Tab {
  return Boolean(value && TABS.includes(value as Tab));
}

export default function CreatorDashboard({
  data,
  locale,
  initialTab,
}: {
  data: CreatorDashboardData;
  locale: string;
  initialTab?: string;
}) {
  const t = useTranslations("dashboardApp.creator");
  const tStatus = useTranslations("dashboardApp.status");
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(isTab(initialTab) ? initialTab : "storefront");

  useEffect(() => {
    if (isTab(initialTab)) setTab(initialTab);
  }, [initialTab]);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "storefront", label: t("tabs.storefront") },
    { id: "deals", label: t("tabs.deals") },
    { id: "samples", label: t("tabs.samples") },
    { id: "earnings", label: t("tabs.earnings") },
    { id: "payouts", label: t("tabs.payouts") },
  ];

  function changeTab(next: Tab) {
    setTab(next);
    router.replace(`/dashboard?tab=${next}`, { scroll: false });
  }

  return (
    <div>
      <TabBar tabs={tabs} active={tab} onChange={(id) => changeTab(id as Tab)} />
      {tab === "storefront" && <StorefrontTab data={data} t={t} tStatus={tStatus} />}
      {tab === "deals" && <DealsTab data={data} t={t} tStatus={tStatus} locale={locale} />}
      {tab === "samples" && <SamplesTab data={data} t={t} tStatus={tStatus} locale={locale} />}
      {tab === "earnings" && <EarningsTab data={data} t={t} tStatus={tStatus} locale={locale} />}
      {tab === "payouts" && <PayoutsTab data={data} t={t} tStatus={tStatus} locale={locale} />}
    </div>
  );
}

function StorefrontTab({
  data,
  t,
  tStatus,
}: {
  data: CreatorDashboardData;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
}) {
  const progress = data.tierProgress;
  return (
    <section className="px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-white/10 p-5">
        <div>
          <p className="gl-eyebrow">{t("storefront.linkLabel")}</p>
          <div className="mt-2 flex items-center gap-2">
            <a href={`/creator/${data.creator.username}`} target="_blank" rel="noopener noreferrer" className="font-display text-2xl underline">
              growlab.om/creator/{data.creator.username}
            </a>
            {data.creator.verificationStatus === "verified" && (
              <VerifiedBadge size="md" showLabel label="صانع موثق ✓" />
            )}
          </div>
        </div>
        <TierPill tier={data.creator.tier} size="md" />
      </div>

      <div className="mt-8 border border-white/10 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">
            {t("storefront.tierProgress")}
          </p>
          <p className="font-mono text-sm">{formatMoney(data.totalNetSales)}</p>
        </div>
        <div className="mt-3 h-2 w-full border border-white/15">
          <div
            className="h-full bg-pulse"
            style={{ width: `${Math.round(progress.progressPct * 100)}%` }}
          />
        </div>
        <p className="mt-3 font-serif text-sm italic text-frost-dim">
          {progress.next
            ? t("storefront.nextTier", {
                tier: progress.next.id,
                amount: formatMoney(progress.netSalesToNext),
              })
            : t("storefront.maxTier")}
        </p>
        <p className="mt-1 font-mono text-xs text-frost-dim">
          {t("storefront.returnRate", { pct: formatPct(data.returnRatePct) })}
        </p>
        <p className="mt-1 font-mono text-xs text-frost-dim">
          {t("storefront.visits", { count: data.visitCount })}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/dashboard/storefront/edit" className="gl-btn-primary">
          {t("storefront.editCta")}
        </Link>
        <a
          href={`/creator/${data.creator.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gl-btn-ghost"
        >
          {t("storefront.previewLive")}
        </a>
        <Link href="/dashboard/browse" className="gl-btn-ghost">
          {t("storefront.browseCta")}
        </Link>
      </div>

      <p className="mt-8 font-serif text-sm italic text-frost-dim">{t("storefront.hint")}</p>
      <p className="mt-1 font-serif text-xs italic text-frost/50">{tStatus("tierNote")}</p>
    </section>
  );
}

function DealsTab({
  data,
  t,
  tStatus,
  locale,
}: {
  data: CreatorDashboardData;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  if (data.deals.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("deals.empty")} />
        <Link href="/dashboard/browse" className="gl-btn-primary mt-6 inline-flex">
          {t("storefront.browseCta")}
        </Link>
      </section>
    );
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {data.deals.map((deal) => (
          <DealCard key={deal.dealId} deal={deal} t={t} tStatus={tStatus} locale={locale} />
        ))}
      </div>
    </section>
  );
}

function DealCard({
  deal,
  t,
  tStatus,
  locale,
}: {
  deal: CreatorDashboardData["deals"][number];
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const [pending, startTransition] = useTransition();
  const [left, setLeft] = useState(false);

  if (left) return null;

  return (
    <div className="border border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg leading-tight">{deal.productTitle}</p>
          <p className="font-serif text-xs italic text-frost-dim">{deal.merchantBusinessName}</p>
        </div>
        {deal.featured && (
          <span className="border border-pulse/50 px-2 py-0.5 font-west text-[9px] uppercase tracking-[0.18em] text-pulse">
            {t("deals.featured")}
          </span>
        )}
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
        <Row label={t("deals.lockedPrice")} value={formatMoney(deal.lockedUnitPrice)} />
        <Row label={t("deals.commissionPct")} value={formatPct(deal.lockedCommissionPct)} />
        <Row label={t("deals.cogsPct")} value={formatPct(deal.lockedCogsPct)} />
        <Row label={t("deals.discountCap")} value={formatPct(deal.discountCapPct)} />
        <Row label={t("deals.since")} value={formatDate(deal.createdAt, locale)} />
        <Row label={t("deals.orders")} value={String(deal.orderCount)} />
        <Row label={t("deals.visits")} value={String(deal.visitCount)} />
        <Row label={t("deals.commissionEarned")} value={formatMoney(deal.commissionEarned)} />
      </dl>

      <div className="mt-3 flex items-center gap-2">
        <StatusPill ok={deal.status === "active"}>{tStatus(`deal.${deal.status}` as "deal.active")}</StatusPill>
        {deal.merchantVerificationStatus !== "verified" && (
          <span className="font-serif text-xs italic text-danger">{t("deals.merchantNotVerified")}</span>
        )}
      </div>

      {deal.status === "pending" && (
        <p className="mt-3 text-[13px] leading-relaxed text-frost-dim">{t("deals.waiting")}</p>
      )}

      {deal.status === "active" && (
        <>
          <ShareSheet
            productTitle={deal.productTitle}
            sharePath={`/creator/${deal.username}/${deal.slug}`}
          />
          <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await leaveDeal(deal.dealId);
              setLeft(true);
            })
          }
          className="gl-btn-ghost mt-4 w-full disabled:opacity-40"
        >
          {t("deals.leaveCta")}
        </button>
        </>
      )}
    </div>
  );
}

function SamplesTab({
  data,
  t,
  tStatus,
  locale,
}: {
  data: CreatorDashboardData;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  if (data.sampleRequests.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("samples.empty")} />
        <Link href="/dashboard/browse" className="gl-btn-primary mt-6 inline-flex">
          {t("storefront.browseCta")}
        </Link>
      </section>
    );
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="mb-6 max-w-lg font-serif text-sm italic text-frost-dim">{t("samples.trustNote")}</p>

      <ul className="space-y-2">
        {data.sampleRequests.map((s) => (
          <li key={s.id} className="border border-white/10 px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-display text-base">{s.productTitle}</p>
                <p className="font-serif text-xs italic text-frost-dim">
                  {s.merchantBusinessName} · {formatDate(s.createdAt, locale)}
                </p>
                {s.status === "shipped" && s.shippingRef && (
                  <p className="mt-1 font-mono text-xs text-frost-dim">
                    {t("samples.shippingRef")}: <span className="text-frost">{s.shippingRef}</span>
                  </p>
                )}
              </div>
              <StatusPill ok={s.status === "approved" || s.status === "shipped"}>
                {tStatus(`sample.${s.status}` as "sample.pending")}
              </StatusPill>
            </div>

            {s.depositAmount !== null && s.ugcStatus !== "not_applicable" && (
              <UgcPanel sample={s} t={t} tStatus={tStatus} locale={locale} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function UgcPanel({
  sample,
  t,
  tStatus,
  locale,
}: {
  sample: CreatorDashboardData["sampleRequests"][number];
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const [videoUrl, setVideoUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const daysLeft = useMemo(() => {
    if (!sample.ugcDeadline) return null;
    const ms = new Date(sample.ugcDeadline).getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }, [sample.ugcDeadline]);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await submitUgcVideo(sample.id, videoUrl);
        setVideoUrl("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  const canSubmit = sample.status === "shipped" && sample.ugcStatus === "pending";

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs text-frost-dim">
          {t("samples.depositLabel")}:{" "}
          <span className="text-frost">{formatMoney(sample.depositAmount ?? 0, sample.depositCurrency ?? "OMR")}</span>
        </p>
        <span
          className={`border px-2.5 py-1 font-west text-[10px] uppercase tracking-[0.2em] ${
            sample.ugcStatus === "approved"
              ? "border-white/10 bg-white/10 text-frost"
              : sample.ugcStatus === "forfeited"
                ? "border-danger/60 bg-danger/10 text-danger"
                : "border-white/15 text-frost-dim"
          }`}
        >
          {tStatus(`ugc.${sample.ugcStatus}` as "ugc.pending")}
        </span>
      </div>

      {sample.ugcDeadline && sample.ugcStatus !== "approved" && sample.ugcStatus !== "forfeited" && (
        <p className="mt-1.5 font-mono text-xs text-frost-dim">
          {t("samples.ugcDeadlineLabel")}: {formatDate(sample.ugcDeadline, locale)} ·{" "}
          {daysLeft !== null && daysLeft > 1
            ? t("samples.daysLeft", { days: daysLeft })
            : daysLeft !== null && daysLeft >= 0
              ? t("samples.lessThanDay")
              : t("samples.deadlinePassed")}
        </p>
      )}

      {sample.ugcStatus === "approved" && (
        <p className="mt-2 font-serif text-xs italic text-frost-dim">{t("samples.ugcApprovedNote")}</p>
      )}
      {sample.ugcStatus === "forfeited" && (
        <p className="mt-2 font-serif text-xs italic text-danger">{t("samples.ugcForfeitedNote")}</p>
      )}

      {sample.ugcStatus === "submitted" && (
        <p className="mt-2 font-serif text-xs italic text-frost-dim">{t("samples.ugcSubmittedNote")}</p>
      )}

      {canSubmit && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {sample.ugcSubmittedAt !== null && (
            <p className="w-full font-serif text-xs italic text-frost-dim">{t("samples.ugcRejectedHint")}</p>
          )}
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={t("samples.ugcVideoPlaceholder")}
            className="min-w-[16rem] flex-1 border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-xs"
          />
          <button
            type="button"
            disabled={pending || !videoUrl.trim()}
            onClick={handleSubmit}
            className="gl-btn-ghost disabled:opacity-40"
          >
            {t("samples.ugcSubmitCta")}
          </button>
        </div>
      )}
      {error && <p className="mt-1.5 font-mono text-xs text-danger">{error}</p>}
    </div>
  );
}

function EarningsTab({
  data,
  t,
  tStatus,
  locale,
}: {
  data: CreatorDashboardData;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (data.ordersLedger.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("earnings.empty")} />
      </section>
    );
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <ul className="space-y-3">
        {data.ordersLedger.map((o) => (
          <li key={o.orderId} className="border border-white/10">
            <button
              type="button"
              onClick={() => setExpanded(expanded === o.orderId ? null : o.orderId)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-start"
            >
              <div>
                <p className="font-display text-base">{o.productTitle}</p>
                <p className="font-serif text-xs italic text-frost-dim">{formatDate(o.createdAt, locale)}</p>
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
                <span className="font-mono text-sm font-bold">
                  {o.ledger ? formatMoney(o.ledger.creatorShare, o.currency) : "—"}
                </span>
              </div>
            </button>
            {expanded === o.orderId && (
              <div className="border-t border-white/10 p-4">
                <WaterfallBreakdown row={o} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PayoutsTab({
  data,
  t,
  tStatus,
}: {
  data: CreatorDashboardData;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const [amountInput, setAmountInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [bankName, setBankName] = useState(data.creator.bankName);
  const [accountName, setAccountName] = useState(data.creator.accountName);
  const [accountNumber, setAccountNumber] = useState(data.creator.accountNumber);

  const amount = Number(amountInput) || 0;
  const fee = amount > 0 ? computeInstantPayoutFee(amount) : 0;
  const belowMinimum = amount > 0 && amount < MIN_PAYOUT_OMR;
  const canRequest =
    amount > 0 &&
    amount <= data.balances.availableBalance &&
    !belowMinimum &&
    data.creator.hasPayoutAccount;

  function submit(type: "instant" | "scheduled") {
    setError(null);
    startTransition(async () => {
      try {
        if (type === "instant") {
          await requestInstantPayout(data.creator.id, amount);
        } else {
          await requestScheduledPayout(data.creator.id, amount);
        }
        setAmountInput("");
      } catch (e) {
        if (e instanceof Error && e.message === "BELOW_MIN_PAYOUT") {
          setError(t("payouts.belowMinimum", { min: formatMoney(MIN_PAYOUT_OMR) }));
        } else if (e instanceof Error && e.message === "PAYOUT_ACCOUNT_REQUIRED") {
          setError(t("payouts.accountRequired"));
        } else {
          setError(e instanceof Error ? e.message : "Failed");
        }
      }
    });
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-white/10 p-5">
          <p className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{t("payouts.available")}</p>
          <p className="mt-2 font-mono text-3xl font-bold">{formatMoney(data.balances.availableBalance)}</p>
          <p className="mt-1 font-serif text-xs italic text-frost-dim">{t("payouts.availableHint")}</p>
        </div>
        <div className="border border-white/15 p-5">
          <p className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{t("payouts.held")}</p>
          <p className="mt-2 font-mono text-3xl font-bold text-frost-dim">{formatMoney(data.balances.heldBalance)}</p>
          <p className="mt-1 font-serif text-xs italic text-frost-dim">{t("payouts.heldHint")}</p>
        </div>
      </div>

      <div className="mt-8 border border-white/10 p-5">
        <p className="gl-eyebrow">{t("payouts.accountTitle")}</p>
        <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-frost-dim">{t("payouts.accountLede")}</p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            startTransition(async () => {
              try {
                await saveCreatorPayoutAccount(data.creator.id, { bankName, accountName, accountNumber });
              } catch {
                setError(t("payouts.accountInvalid"));
              }
            });
          }}
        >
          <label className="block">
            <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("payouts.bankName")}</span>
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="mt-1 w-full border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block">
            <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("payouts.accountName")}</span>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="mt-1 w-full border border-white/15 bg-white/[0.03] px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("payouts.accountNumber")}</span>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="mt-1 w-full border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
            />
          </label>
          <button type="submit" disabled={pending} className="gl-btn-ghost sm:col-span-3 disabled:opacity-40">
            {t("payouts.saveAccount")}
          </button>
        </form>
      </div>

      <div className="mt-8 border border-white/10 p-5">
        <p className="gl-eyebrow">{t("payouts.localPathTitle")}</p>
        <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-frost-dim">{t("payouts.localPathLede")}</p>
        <p className="gl-eyebrow mt-6">{t("payouts.requestTitle")}</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
              {t("payouts.amountLabel")}
            </label>
            <input
              type="number"
              min={MIN_PAYOUT_OMR}
              step={0.01}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="mt-1 w-40 border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
              placeholder="0.000"
            />
          </div>
          <button
            type="button"
            disabled={!canRequest || pending}
            onClick={() => submit("instant")}
            className="gl-btn-primary disabled:opacity-40"
          >
            {t("payouts.requestInstant")}
          </button>
          <button
            type="button"
            disabled={!canRequest || pending}
            onClick={() => submit("scheduled")}
            className="gl-btn-ghost disabled:opacity-40"
          >
            {t("payouts.requestScheduled")}
          </button>
        </div>
        {amount > 0 && (
          <p className="mt-3 font-serif text-sm italic text-danger">
            {t("payouts.feePreview", { fee: formatMoney(fee) })}
          </p>
        )}
        {belowMinimum && (
          <p className="mt-2 font-mono text-xs text-danger">
            {t("payouts.belowMinimum", { min: formatMoney(MIN_PAYOUT_OMR) })}
          </p>
        )}
        {!data.creator.hasPayoutAccount && (
          <p className="mt-2 font-mono text-xs text-danger">{t("payouts.accountRequired")}</p>
        )}
        {amount > data.balances.availableBalance && (
          <p className="mt-2 font-mono text-xs text-danger">{t("payouts.exceedsAvailable")}</p>
        )}
        {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
      </div>

      <div className="mt-8">
        <p className="gl-eyebrow">{t("payouts.historyTitle")}</p>
        {data.payoutRequests.length === 0 ? (
          <EmptyState text={t("payouts.historyEmpty")} />
        ) : (
          <ul className="mt-4 space-y-2">
            {data.payoutRequests.map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 py-2">
                <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
                  {t(`payouts.type.${p.type}` as "payouts.type.instant")}
                </span>
                <span className="font-mono text-sm">{formatMoney(p.amount)}</span>
                {p.feeAmount > 0 && (
                  <span className="font-mono text-xs text-danger">−{formatMoney(p.feeAmount)}</span>
                )}
                <StatusPill ok={p.status === "paid" || p.status === "approved"}>
                  {tStatus(`payout.${p.status}` as "payout.requested")}
                </StatusPill>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="gl-tabs">
      {tabs.map((tabItem) => (
        <button
          key={tabItem.id}
          type="button"
          onClick={() => onChange(tabItem.id)}
          className={`gl-tab ${active === tabItem.id ? "is-on" : ""}`}
        >
          {tabItem.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-west text-[10px] uppercase tracking-[0.16em] text-frost-dim">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
