"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { addToMerchantCart } from "@/app/(shop)/m/order-actions";

export type AttrGroup = { key: string; label: string; values: string[] };

export default function MerchantAddToCartForm({
  storeSlug,
  dealId,
  sizes,
  attributeGroups = [],
  accent,
}: {
  storeSlug: string;
  dealId: string;
  sizes: readonly string[];
  attributeGroups?: readonly AttrGroup[];
  accent: string;
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const groups = useMemo(() => {
    if (attributeGroups.length > 0) return attributeGroups;
    if (sizes.length > 0) return [{ key: "size", label: "size", values: [...sizes] }];
    return [] as AttrGroup[];
  }, [attributeGroups, sizes]);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const g of groups) if (g.values[0]) init[g.key] = g.values[0];
    return init;
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function encodeOptions(): string {
    return groups
      .map((g) => selected[g.key])
      .filter(Boolean)
      .join(" · ")
      .slice(0, 120);
  }

  function add(thenCheckout: boolean) {
    setError(null);
    for (const g of groups) {
      if (!selected[g.key] || !g.values.includes(selected[g.key])) {
        setError(t("needSize"));
        return;
      }
    }
    const size = encodeOptions();
    startTransition(async () => {
      try {
        await addToMerchantCart({ storeSlug, dealId, quantity: 1, size });
        if (thenCheckout) router.push(`/m/${storeSlug}/checkout`);
        else router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : t("cartFailed"));
      }
    });
  }

  const labelFor = (key: string, fallback: string) => {
    if (key === "size") return t("attrSize");
    if (key === "color") return t("attrColor");
    if (key === "material") return t("attrMaterial");
    return fallback || key;
  };

  return (
    <div className="mt-8 space-y-4">
      {groups.map((g) => (
        <fieldset key={g.key}>
          <legend className="text-[12px] text-frost-faint">{labelFor(g.key, g.label)}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {g.values.map((option) => {
              const isOn = selected[g.key] === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelected((s) => ({ ...s, [g.key]: option }))}
                  aria-pressed={isOn}
                  className="min-w-[4.5rem] rounded-lg border px-4 py-2 text-[14px] transition-colors duration-150 ease-out"
                  style={
                    isOn
                      ? { borderColor: accent, backgroundColor: accent, color: "#fff" }
                      : { borderColor: "var(--line)", backgroundColor: "#fff", color: "#111318" }
                  }
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {error && <p className="text-[13px] text-danger">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          className="gl-btn-primary disabled:opacity-40"
          style={{ backgroundColor: accent }}
          onClick={() => add(true)}
        >
          {pending ? t("adding") : t("buyCod")}
        </button>
        <button type="button" disabled={pending} className="gl-btn-ghost disabled:opacity-40" onClick={() => add(false)}>
          {t("addToCart")}
        </button>
      </div>
      <p className="text-[13px] text-frost-faint">{t("codHint")}</p>
    </div>
  );
}
