"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import { createProCheckoutSession, createBillingPortalSession } from "@/app/(dashboard)/dashboard/billing-actions";
import type { MerchantDashboardData } from "@/lib/dashboard/merchant";

export default function MerchantBillingPanel({
  merchant,
}: {
  merchant: MerchantDashboardData["merchant"];
}) {
  const t = useTranslations("dashboardApp.merchant.billing");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isPro = merchant.effectivePlan === "pro";

  function upgrade() {
    setError(null);
    startTransition(async () => {
      try {
        const { url } = await createProCheckoutSession();
        window.location.href = url;
      } catch (err) {
        setError(err instanceof Error ? err.message : t("checkoutFailed"));
      }
    });
  }

  function openPortal() {
    setError(null);
    startTransition(async () => {
      try {
        const { url } = await createBillingPortalSession();
        window.location.href = url;
      } catch (err) {
        setError(err instanceof Error ? err.message : t("portalFailed"));
      }
    });
  }

  const freeFeatures = t.raw("freeFeatures") as string[];
  const proFeatures = t.raw("proFeatures") as string[];

  return (
    <div className="px-5 py-6 sm:px-8">
      <p className="gl-eyebrow">{t("kicker")}</p>
      <h2 className="mt-2 text-[20px] font-semibold text-frost">{t("title")}</h2>
      <p className="mt-2 max-w-xl text-[14px] text-frost-dim">{t("lede")}</p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
        <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("currentPlan")}</span>
        <span className="font-display text-lg text-frost">{isPro ? t("planPro") : t("planFree")}</span>
        {merchant.planExpiresAt ? (
          <span className="font-mono text-[11px] text-frost-dim">
            {t("expires", { date: new Date(merchant.planExpiresAt).toLocaleDateString() })}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-[13px] text-frost-faint">{t("performanceNote")}</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <PlanCard
          title={t("planFree")}
          price={t("freePrice")}
          features={freeFeatures}
          active={!isPro}
        />
        <PlanCard
          title={t("planPro")}
          price={t("proPrice", { amount: formatMoney(15, "OMR") })}
          features={proFeatures}
          active={isPro}
          highlight
        />
      </div>

      {!isPro ? (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button type="button" disabled={pending} onClick={upgrade} className="gl-btn gl-btn-primary disabled:opacity-40">
            {pending ? t("checkoutPending") : t("upgradeCta")}
          </button>
          <Link href="/#pricing" className="text-[13px] text-frost-dim underline-offset-2 hover:underline">
            {t("compareLink")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <p className="text-[14px] text-pulse">{t("proActive")}</p>
          {merchant.planSource === "stripe" ? (
            <button type="button" disabled={pending} onClick={openPortal} className="gl-btn-ghost disabled:opacity-40">
              {t("manageBilling")}
            </button>
          ) : null}
        </div>
      )}

      {error ? <p className="mt-4 text-[13px] text-danger">{error}</p> : null}
    </div>
  );
}

function PlanCard({
  title,
  price,
  features,
  active,
  highlight,
}: {
  title: string;
  price: string;
  features: string[];
  active: boolean;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-6 ${highlight ? "border-signal/40 bg-signal/5" : "border-white/10 bg-white/[0.03]"} ${active ? "ring-1 ring-white/20" : ""}`}
    >
      <h3 className="font-display text-xl text-frost">{title}</h3>
      <p className="mt-2 font-mono text-2xl text-frost">{price}</p>
      <ul className="mt-6 space-y-2">
        {features.map((f) => (
          <li key={f} className="border-t border-white/10 py-2 text-[14px] text-frost-dim">
            {f}
          </li>
        ))}
      </ul>
    </article>
  );
}
