"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { placeCodCheckout, updateCartItem } from "@/app/(creator)/creator/order-actions";

interface Line {
  dealId: string;
  title: string;
  priceOmr: number;
  currency: string;
  quantity: number;
  size: string;
}

export default function CheckoutForm({
  username,
  lines,
}: {
  username: string;
  lines: Line[];
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const total = lines.reduce((sum, line) => sum + line.priceOmr * line.quantity, 0);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await placeCodCheckout({
          username,
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

  function changeQty(dealId: string, size: string, quantity: number) {
    startTransition(async () => {
      await updateCartItem(dealId, size, quantity);
      router.refresh();
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
                  {line.priceOmr} {line.currency}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="gl-btn-ghost px-3 py-1"
                  onClick={() => changeQty(line.dealId, line.size, line.quantity - 1)}
                >
                  −
                </button>
                <span className="font-mono text-[14px]">{line.quantity}</span>
                <button
                  type="button"
                  className="gl-btn-ghost px-3 py-1"
                  onClick={() => changeQty(line.dealId, line.size, line.quantity + 1)}
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[18px]">
          {t("total")} {total.toFixed(2)} {lines[0]?.currency ?? "OMR"}
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
            <span className="text-[13px] text-frost-faint">{t("buyerName")}</span>
            <input name="buyerName" required minLength={2} className="gl-input mt-1.5" autoComplete="name" />
          </label>
          <label className="block">
            <span className="text-[13px] text-frost-faint">{t("buyerPhone")}</span>
            <input name="buyerPhone" required type="tel" className="gl-input mt-1.5" autoComplete="tel" placeholder="+968…" />
            <span className="mt-1.5 block text-[12px] leading-relaxed text-frost-dim">{t("phoneTrackHint")}</span>
          </label>
          <label className="block">
            <span className="text-[13px] text-frost-faint">{t("buyerCity")}</span>
            <input name="buyerCity" required minLength={2} className="gl-input mt-1.5" autoComplete="address-level2" />
          </label>
          <label className="block">
            <span className="text-[13px] text-frost-faint">{t("buyerAddress")}</span>
            <textarea name="buyerAddress" required minLength={6} className="gl-input mt-1.5 min-h-[88px]" />
          </label>
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <button type="submit" disabled={pending} className="gl-btn-primary disabled:opacity-40">
            {pending ? t("placing") : t("placeOrder")}
          </button>
        </form>
      </section>
    </div>
  );
}
