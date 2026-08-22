"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { MerchantPendingApplication } from "@/lib/dashboard/merchant";
import { respondToDeal } from "@/app/(dashboard)/dashboard/deals-actions";
import { EmptyState, TierPill } from "@/components/dashboard/ui";

export default function AcceptQueue({ applications }: { applications: MerchantPendingApplication[] }) {
  const t = useTranslations("dashboardApp.merchant.queue");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [gone, setGone] = useState<Record<string, "accepted" | "rejected">>({});

  function respond(dealId: string, accept: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        await respondToDeal(dealId, accept);
        setGone((prev) => ({ ...prev, [dealId]: accept ? "accepted" : "rejected" }));
      } catch (e) {
        setError(e instanceof Error ? e.message : t("failed"));
      }
    });
  }

  const visible = applications.filter((row) => !gone[row.dealId]);

  return (
    <section className="px-4 py-8 sm:px-8 sm:py-10">
      <p className="gl-eyebrow">{t("title")}</p>
      <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-frost-dim">{t("lede")}</p>
      {error ? <p className="mt-3 font-mono text-[12px] text-danger">{error}</p> : null}
      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState text={t("empty")} />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((row) => (
            <li key={row.dealId} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[16px] font-semibold text-frost">{row.productTitle}</p>
                  <p className="mt-1 font-mono text-[13px] text-frost-dim">
                    @{row.creatorUsername} · <TierPill tier={row.creatorTier} />
                  </p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                <div>
                  <dt className="text-frost-faint">{t("orders")}</dt>
                  <dd className="font-mono text-frost">{row.creatorOrders}</dd>
                </div>
                <div>
                  <dt className="text-frost-faint">{t("sales")}</dt>
                  <dd className="font-mono text-frost">{formatMoney(row.creatorNetSales)}</dd>
                </div>
              </dl>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => respond(row.dealId, true)}
                  className="gl-btn-primary min-h-11 disabled:opacity-40"
                >
                  {t("accept")}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => respond(row.dealId, false)}
                  className="gl-btn-ghost min-h-11 disabled:opacity-40"
                >
                  {t("reject")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
