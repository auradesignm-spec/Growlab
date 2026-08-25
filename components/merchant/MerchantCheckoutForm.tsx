"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { placeMerchantStoreCheckout } from "@/app/(shop)/m/order-actions";

interface Line {
  dealId: string;
  title: string;
  priceOmr: number;
  listPriceOmr?: number;
  lineDiscount?: number;
  currency: string;
  quantity: number;
  size: string;
}

export default function MerchantCheckoutForm({
  storeSlug,
  lines,
  discountTotal = 0,
  subtotal,
  promoLabel,
}: {
  storeSlug: string;
  lines: Line[];
  discountTotal?: number;
  subtotal?: number;
  promoLabel?: string | null;
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const computedSubtotal =
    subtotal ?? lines.reduce((sum, line) => sum + (line.listPriceOmr ?? line.priceOmr) * line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.priceOmr * line.quantity, 0);
  const currency = lines[0]?.currency ?? "OMR";

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await placeMerchantStoreCheckout({
          storeSlug,
          buyerName: String(formData.get("buyerName") ?? ""),
          buyerPhone: String(formData.get("buyerPhone") ?? ""),
          buyerAddress: String(formData.get("buyerAddress") ?? ""),
          buyerCity: String(formData.get("buyerCity") ?? ""),
        });
        router.push(`/order/${result.trackingToken}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("orderFailed"));
      }
    });
  }

  return (
    <div className="mx-auto grid max-w-wrap grid-cols-1 gap-8 px-5 py-10 sm:px-8 lg:grid-cols-12">
      <section className="lg:col-span-7">
        <h1 className="text-display-lg font-semibold">{t("checkoutTitle")}</h1>
        <p className="gl-lede mt-3">{t("checkoutLede")}</p>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {lines.map((line) => (
            <li key={`${line.dealId}-${line.size}`} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{line.title}</p>
                <p className="text-[13px] text-frost-dim">
                  {line.size ? `${line.size} · ` : ""}
                  {line.priceOmr.toFixed(2)} {line.currency}
                  {line.listPriceOmr != null && line.listPriceOmr > line.priceOmr + 0.001 ? (
                    <span className="ms-2 line-through opacity-60">
                      {line.listPriceOmr.toFixed(2)} {line.currency}
                    </span>
                  ) : null}
                </p>
              </div>
              <span className="font-mono text-[14px]">× {line.quantity}</span>
            </li>
          ))}
        </ul>
        {discountTotal > 0 ? (
          <div className="mt-4 space-y-1 text-[14px]">
            {promoLabel ? <p className="text-frost-dim">{promoLabel}</p> : null}
            <p className="font-mono text-frost-dim">
              {t("subtotal")} {computedSubtotal.toFixed(2)} {currency}
            </p>
            <p className="font-mono text-emerald-700">
              {t("discount")} −{discountTotal.toFixed(2)} {currency}
            </p>
          </div>
        ) : null}
        <p className="mt-4 font-mono text-[18px]">
          {t("total")} {total.toFixed(2)} {currency}
        </p>
      </section>

      <section className="lg:col-span-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(new FormData(event.currentTarget));
          }}
          className="gl-stage space-y-4 p-6"
        >
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-frost-dim">{t("buyerName")}</span>
            <input name="buyerName" required className="gl-input w-full" autoComplete="name" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-frost-dim">{t("buyerPhone")}</span>
            <input name="buyerPhone" required className="gl-input w-full" autoComplete="tel" dir="ltr" />
            <span className="mt-1 block text-[11px] text-frost-faint">{t("phoneTrackHint")}</span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-frost-dim">{t("buyerCity")}</span>
            <input name="buyerCity" required className="gl-input w-full" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-frost-dim">{t("buyerAddress")}</span>
            <textarea name="buyerAddress" required rows={3} className="gl-input w-full" />
          </label>
          {error ? <p className="text-[13px] text-danger">{error}</p> : null}
          <button type="submit" disabled={pending} className="gl-btn-primary w-full disabled:opacity-40">
            {pending ? t("placing") : t("placeOrder")}
          </button>
        </form>
      </section>
    </div>
  );
}
