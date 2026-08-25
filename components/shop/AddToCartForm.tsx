"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { addToCart } from "@/app/(creator)/creator/order-actions";
import { announceCartAdded } from "@/lib/shop/cartMotion";

export default function AddToCartForm({
  username,
  dealId,
  sizes,
}: {
  username: string;
  dealId: string;
  sizes: readonly string[];
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const [size, setSize] = useState(sizes[0] ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function add(thenCheckout: boolean) {
    setError(null);
    if (sizes.length > 0 && !size) {
      setError(t("needSize"));
      return;
    }
    startTransition(async () => {
      try {
        await addToCart({ username, dealId, quantity: 1, size });
        announceCartAdded();
        if (thenCheckout) router.push(`/creator/${username}/checkout`);
        else {
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1400);
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : t("cartFailed"));
      }
    });
  }

  return (
    <div className="mt-8 space-y-4">
      {sizes.length > 0 && (
        <fieldset>
          <legend className="text-[12px] text-frost-faint">{t("size")}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((option) => {
              const selected = option === size;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  aria-pressed={selected}
                  className={`min-h-11 min-w-[4.5rem] rounded-lg border px-4 py-2 text-[14px] transition-colors duration-150 ease-out ${
                    selected
                      ? "border-[rgba(17,19,24,0.2)] bg-[#111318] text-white"
                      : "border-line bg-white text-[#111318]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {error && <p className="text-[13px] text-danger" role="alert">{error}</p>}
      <p className="sr-only" aria-live="polite">
        {added ? t("cartAdded") : ""}
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={pending} className="gl-btn-primary min-h-11 disabled:opacity-40" onClick={() => add(true)}>
          {pending ? t("adding") : t("buyCod")}
        </button>
        <button
          type="button"
          disabled={pending}
          className={`gl-btn-ghost min-h-11 disabled:opacity-40${added ? " is-added" : ""}`}
          onClick={() => add(false)}
        >
          {added ? t("cartAdded") : t("addToCart")}
        </button>
      </div>
      <p className="text-[13px] text-frost-faint">{t("codHint")}</p>
    </div>
  );
}
