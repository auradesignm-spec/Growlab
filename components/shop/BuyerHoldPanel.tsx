"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { requestDeliveryHoldRefund } from "@/app/(shop)/hold-actions";

export default function BuyerHoldPanel({
  trackingToken,
  canRefund,
  dueLabel,
  settlementChannel,
}: {
  trackingToken: string;
  canRefund: boolean;
  dueLabel: string | null;
  settlementChannel: string;
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (settlementChannel !== "card") return null;

  return (
    <div className="mt-8 max-w-xl rounded-2xl border border-line px-5 py-5">
      <p className="text-[15px] font-semibold text-frost">{t("holdTitle")}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{t("holdLede")}</p>
      {dueLabel ? <p className="mt-2 font-mono text-[13px] text-frost-faint">{dueLabel}</p> : null}
      {canRefund ? (
        <button
          type="button"
          className="gl-btn-primary mt-4 min-h-11"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                await requestDeliveryHoldRefund(trackingToken);
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : t("orderFailed"));
              }
            });
          }}
        >
          {pending ? t("holdRefunding") : t("holdRefundCta")}
        </button>
      ) : null}
      {error ? <p className="mt-3 text-[13px] text-danger">{error}</p> : null}
    </div>
  );
}
