"use client";

import { useTranslations } from "next-intl";

export default function CheckoutPaySummary({
  shipping,
  dueNow,
  dueDoor,
  currency,
}: {
  shipping: number;
  dueNow: number;
  dueDoor: number;
  currency: string;
}) {
  const t = useTranslations("shop");
  return (
    <>
      <p className="mt-4 font-mono text-[14px] text-frost-dim">
        {t("shippingPrepaid")} {shipping.toFixed(2)} {currency}
      </p>
      <p key={`now-${dueNow}`} className="gl-amount-tick mt-2 font-mono text-[18px]">
        {t("payNow")} {dueNow.toFixed(2)} {currency}
      </p>
      {dueDoor > 0 ? (
        <p key={`door-${dueDoor}`} className="gl-amount-tick mt-1 font-mono text-[14px] text-frost-dim">
          {t("payAtDoor")} {dueDoor.toFixed(2)} {currency}
        </p>
      ) : null}
    </>
  );
}
