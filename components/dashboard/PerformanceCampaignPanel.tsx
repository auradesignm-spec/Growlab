"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import {
  savePerformanceCampaign,
  setPerformanceCampaignStatus,
  type PerformanceCampaignDraft,
} from "@/app/(dashboard)/dashboard/performance-actions";
import {
  merchantAttestReelViews,
  merchantReviewBuyerReel,
} from "@/app/(dashboard)/dashboard/content-actions";

export interface CampaignRow {
  id: string;
  productId: string;
  productTitle: string;
  productActive: boolean;
  status: string;
  budgetCap: number;
  budgetSpent: number;
  currency: string;
  visitRateSharer: number;
  visitRateOrigin: number;
  purchasePctSharer: number;
  purchasePctOrigin: number;
  viewCpmOrigin: number;
  ugcBrief: string;
}

export interface BuyerReelRow {
  id: string;
  productId: string;
  productTitle: string;
  originUsername: string;
  socialPostUrl: string | null;
  caption: string | null;
  status: string;
  lastPaidViewCount: number;
  lastViewReportAt: Date | null;
  createdAt: Date;
}

export default function PerformanceCampaignPanel({
  products,
  campaigns,
  reels,
  maxBudgetCap,
  isPro,
}: {
  products: Array<{ id: string; title: string; active: boolean }>;
  campaigns: CampaignRow[];
  reels: BuyerReelRow[];
  maxBudgetCap: number;
  isPro: boolean;
}) {
  const t = useTranslations("dashboardApp.merchant.campaign");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<PerformanceCampaignDraft>(() => {
    const first = products.find((p) => p.active);
    const existing = campaigns.find((c) => c.productId === first?.id);
    return {
      productId: first?.id ?? "",
      budgetCap: existing?.budgetCap ?? 100,
      purchasePctSharer: existing?.purchasePctSharer ?? 0.1,
      purchasePctOrigin: existing?.purchasePctOrigin ?? 0.15,
      viewCpmOrigin: existing?.viewCpmOrigin ?? 2.5,
      ugcBrief: existing?.ugcBrief ?? "",
    };
  });
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  const current = campaigns.find((c) => c.productId === draft.productId);

  function selectProduct(productId: string) {
    const existing = campaigns.find((c) => c.productId === productId);
    setDraft({
      productId,
      budgetCap: existing?.budgetCap ?? 100,
      purchasePctSharer: existing?.purchasePctSharer ?? 0.1,
      purchasePctOrigin: existing?.purchasePctOrigin ?? 0.15,
      viewCpmOrigin: existing?.viewCpmOrigin ?? 2.5,
      ugcBrief: existing?.ugcBrief ?? "",
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await savePerformanceCampaign(draft);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  function setStatus(status: "active" | "paused" | "ended") {
    setError(null);
    startTransition(async () => {
      try {
        await setPerformanceCampaignStatus(draft.productId, status);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  function reviewReel(id: string, action: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      try {
        await merchantReviewBuyerReel(id, action);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  function attestViews(id: string) {
    setError(null);
    const count = viewCounts[id] ?? 0;
    startTransition(async () => {
      try {
        await merchantAttestReelViews(id, count);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  if (products.length === 0) {
    return <p className="px-5 py-8 text-[14px] text-frost-dim sm:px-8">{t("needProduct")}</p>;
  }

  const productReels = reels.filter((r) => r.productId === draft.productId);

  return (
    <div className="px-5 py-6 sm:px-8">
      <p className="gl-eyebrow">{t("kicker")}</p>
      <h2 className="mt-2 text-[20px] font-semibold text-frost">{t("title")}</h2>
      <p className="mt-2 max-w-xl text-[14px] text-frost-dim">{t("lede")}</p>
      <p className="mt-3 max-w-xl text-[13px] text-warn">{t("strictRules")}</p>
      {!isPro ? (
        <p className="mt-2 max-w-xl text-[13px] text-warn">{t("freeLimits", { cap: maxBudgetCap })}</p>
      ) : null}

      <div className="mt-8 grid max-w-2xl gap-4">
        <label className="block">
          <span className="text-[13px] text-frost-dim">{t("product")}</span>
          <select
            value={draft.productId}
            onChange={(e) => selectProduct(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[14px] text-frost"
          >
            {products.filter((p) => p.active).map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        {current ? (
          <>
            <p className="font-mono text-[13px] text-frost-dim">
              {t("spent")}: {formatMoney(current.budgetSpent, current.currency)} /{" "}
              {formatMoney(current.budgetCap, current.currency)} · {t(`status.${current.status}` as "status.draft")}
            </p>
            {current.budgetCap > 0 && current.budgetSpent / current.budgetCap >= 0.8 ? (
              <p className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-[13px] text-warn">
                {t("budgetWarn", {
                  pct: Math.round((current.budgetSpent / current.budgetCap) * 100),
                  left: formatMoney(Math.max(0, current.budgetCap - current.budgetSpent), current.currency),
                })}
              </p>
            ) : null}
          </>
        ) : null}

        <label className="block">
          <span className="text-[13px] text-frost-dim">{t("budgetCap")}</span>
          <input
            type="number"
            min={10}
            max={maxBudgetCap}
            step={1}
            value={draft.budgetCap}
            onChange={(e) => setDraft({ ...draft, budgetCap: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-[14px] text-frost"
          />
          <span className="mt-1 block font-mono text-[11px] text-frost-faint">
            {t("budgetCapMax", { cap: maxBudgetCap })}
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[13px] text-frost-dim">{t("viewCpm")}</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={draft.viewCpmOrigin}
              onChange={(e) => setDraft({ ...draft, viewCpmOrigin: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-[14px]"
            />
          </label>
          <label className="block">
            <span className="text-[13px] text-frost-dim">{t("purchaseSharer")}</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={draft.purchasePctSharer}
              onChange={(e) => setDraft({ ...draft, purchasePctSharer: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-[14px]"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-[13px] text-frost-dim">{t("ugcBrief")}</span>
          <textarea
            value={draft.ugcBrief}
            onChange={(e) => setDraft({ ...draft, ugcBrief: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[14px] text-frost"
          />
        </label>

        {error ? <p className="text-[13px] text-danger">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={pending} onClick={save} className="gl-btn gl-btn-secondary">
            {pending ? t("saving") : t("save")}
          </button>
          <button type="button" disabled={pending} onClick={() => setStatus("active")} className="gl-btn gl-btn-primary">
            {t("activate")}
          </button>
          {current?.status === "active" ? (
            <button type="button" disabled={pending} onClick={() => setStatus("paused")} className="gl-btn gl-btn-secondary">
              {t("pause")}
            </button>
          ) : null}
        </div>
      </div>

      <section className="mt-12 max-w-2xl">
        <h3 className="text-[16px] font-semibold text-frost">{t("reelsTitle")}</h3>
        <p className="mt-1 text-[13px] text-frost-dim">{t("reelsLede")}</p>
        {productReels.length === 0 ? (
          <p className="mt-4 text-[13px] text-frost-faint">{t("reelsEmpty")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {productReels.map((reel) => (
              <li key={reel.id} className="space-y-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[14px] text-frost">@{reel.originUsername}</p>
                    <p className="font-mono text-[11px] text-frost-dim">{t(`reelStatus.${reel.status}` as "reelStatus.pending")}</p>
                    {reel.socialPostUrl ? (
                      <a
                        href={reel.socialPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-[13px] text-pulse underline"
                      >
                        {t("openReel")}
                      </a>
                    ) : null}
                    <p className="mt-1 font-mono text-[11px] text-frost-faint">
                      {t("paidViews", { count: reel.lastPaidViewCount })}
                    </p>
                  </div>
                  {reel.status === "pending" ? (
                    <div className="flex gap-2">
                      <button type="button" disabled={pending} onClick={() => reviewReel(reel.id, "approve")} className="gl-btn gl-btn-primary">
                        {t("approveReel")}
                      </button>
                      <button type="button" disabled={pending} onClick={() => reviewReel(reel.id, "reject")} className="gl-btn gl-btn-secondary">
                        {t("rejectReel")}
                      </button>
                    </div>
                  ) : null}
                </div>
                {reel.status === "approved" ? (
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="block">
                      <span className="text-[12px] text-frost-dim">{t("attestViews")}</span>
                      <input
                        type="number"
                        min={reel.lastPaidViewCount}
                        step={1}
                        value={viewCounts[reel.id] ?? reel.lastPaidViewCount}
                        onChange={(e) =>
                          setViewCounts((prev) => ({ ...prev, [reel.id]: Number(e.target.value) }))
                        }
                        className="mt-1 w-36 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-[13px]"
                      />
                    </label>
                    <button type="button" disabled={pending} onClick={() => attestViews(reel.id)} className="gl-btn gl-btn-primary">
                      {t("payViews")}
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
