"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatMoney, formatPct } from "@/lib/format";
import type { MerchantProductRow } from "@/lib/dashboard/merchant";
import ProductForm from "@/components/dashboard/ProductForm";
import { toggleProductActive } from "@/app/(dashboard)/dashboard/product-actions";

export default function ProductPricingEditor({ product }: { product: MerchantProductRow }) {
  const t = useTranslations("dashboardApp.merchant.productForm");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const commissionLabel =
    product.commissionType === "fixed"
      ? formatMoney(product.commissionValue, product.currency)
      : formatPct(product.commissionValue, 0);

  return (
    <div className="border-t border-white/10 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 font-west text-[10px] uppercase tracking-[0.22em] text-frost-dim"
        >
          {t("editCta")}
          <span aria-hidden="true">{open ? "▲" : "▼"}</span>
        </button>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-frost-dim">
          <span>
            {t("costPriceLabel")}: <span className="text-frost">{formatMoney(product.costPrice, product.currency)}</span>
          </span>
          <span>
            {t("commissionLabel")}: <span className="text-frost">{commissionLabel}</span>
          </span>
          <span>
            {t("previewMerchantNet")}:{" "}
            <span className="font-bold text-frost">{formatMoney(product.simpleSplit.merchantNet, product.currency)}</span>
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleProductActive(product.id))}
            className="font-west uppercase tracking-[0.2em] text-frost underline disabled:opacity-40"
          >
            {product.active ? t("deactivateCta") : t("activateCta")}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4">
          <ProductForm
            initial={{
              productId: product.id,
              title: product.title,
              category: product.category,
              tags: product.tags.join(", "),
              variants: product.variants.join(", "),
              basePrice: product.basePrice,
              costPrice: product.costPrice,
              commissionType: product.commissionType,
              commissionValue: product.commissionValue,
            }}
            onSaved={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
