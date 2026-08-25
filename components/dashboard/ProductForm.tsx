"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatMoney, formatPct } from "@/lib/format";
import {
  COMMISSION_QUICK_PICKS,
  HIGH_MARGIN_COMMISSION_PCT,
  computeSimpleSplit,
  isHighMarginProduct,
} from "@/lib/domain/commission";
import { createProduct, updateProduct, type ProductFormInput } from "@/app/(dashboard)/dashboard/product-actions";
import { htmlToPlain, plainToHtml } from "@/lib/merchant-store/plainHtml";
import ProductMediaPicker, { type PickedMedia } from "@/components/dashboard/ProductMediaPicker";

export interface ProductFormInitial {
  productId?: string;
  title: string;
  category: string;
  tags: string; // comma-separated for the input field
  variants: string; // comma-separated for the input field
  slug?: string;
  shortDescription?: string;
  descriptionHtml?: string;
  basePrice: number;
  costPrice: number;
  commissionType: string;
  commissionValue: number;
  deliveryDaysMax?: number;
  shippingFee?: number;
}

const CATEGORY_SUGGESTIONS = ["attar", "dates", "home", "electronics", "fashion", "accessories"];

export default function ProductForm({
  initial,
  onSaved,
}: {
  initial?: ProductFormInitial;
  onSaved?: () => void;
}) {
  const t = useTranslations("dashboardApp.merchant.productForm");
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [descriptionPlain, setDescriptionPlain] = useState(htmlToPlain(initial?.descriptionHtml ?? ""));
  const [coverImage, setCoverImage] = useState<PickedMedia | null>(null);
  const [coverVideo, setCoverVideo] = useState<PickedMedia | null>(null);
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [variants, setVariants] = useState(initial?.variants ?? "");
  const [basePrice, setBasePrice] = useState(String(initial?.basePrice ?? ""));
  const [costPrice, setCostPrice] = useState(String(initial?.costPrice ?? ""));
  const [commissionType, setCommissionType] = useState(initial?.commissionType ?? "pct");
  const [commissionPct, setCommissionPct] = useState(
    initial?.commissionType === "fixed" ? "" : String((initial?.commissionValue ?? 0.15) * 100)
  );
  const [commissionFixed, setCommissionFixed] = useState(
    initial?.commissionType === "fixed" ? String(initial?.commissionValue ?? "") : ""
  );
  const [deliveryDaysMax, setDeliveryDaysMax] = useState(String(initial?.deliveryDaysMax ?? 4));
  const [shippingFee, setShippingFee] = useState(String(initial?.shippingFee ?? 1.5));

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const basePriceNum = Number(basePrice) || 0;
  const costPriceNum = Number(costPrice) || 0;
  const commissionValueNum =
    commissionType === "fixed" ? Number(commissionFixed) || 0 : (Number(commissionPct) || 0) / 100;

  const preview = useMemo(
    () =>
      computeSimpleSplit({
        retailPrice: basePriceNum,
        costPrice: costPriceNum,
        commissionType,
        commissionValue: commissionValueNum,
        settlementChannel: "cod",
      }),
    [basePriceNum, costPriceNum, commissionType, commissionValueNum]
  );
  const highMargin = isHighMarginProduct(basePriceNum, costPriceNum);
  const marginBlocked = basePriceNum > 0 && (preview.merchantNet <= 0 || (costPriceNum > 0 && preview.merchantNetAfterCogs < 0));
  const commissionPicks = highMargin
    ? [...COMMISSION_QUICK_PICKS, HIGH_MARGIN_COMMISSION_PCT]
    : COMMISSION_QUICK_PICKS;

  function handleSubmit() {
    setError(null);
    const input: ProductFormInput = {
      title,
      category,
      tags: tags.split(",").map((v) => v.trim()).filter(Boolean),
      variants: variants.split(",").map((v) => v.trim()).filter(Boolean),
      basePrice: basePriceNum,
      costPrice: costPriceNum,
      commissionType,
      commissionValue: commissionValueNum,
      deliveryDaysMax: Number(deliveryDaysMax) || 4,
      shippingFee: Number(shippingFee) || 1.5,
      coverImageUrl: coverImage?.kind === "image" ? coverImage.url : undefined,
      coverVideoUrl: coverVideo?.kind === "video" ? coverVideo.url : undefined,
      shortDescription,
      descriptionHtml: plainToHtml(descriptionPlain),
    };

    startTransition(async () => {
      try {
        if (initial?.productId) {
          await updateProduct(initial.productId, input);
        } else {
          await createProduct(input);
        }
        if (onSaved) {
          onSaved();
        } else {
          router.push("/dashboard");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-5">
        <Field label={t("titleLabel")}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-white/15 bg-white/[0.03] px-3 py-2 text-sm" />
        </Field>

        <Field label={t("shortDescLabel")} hint={t("shortDescHint")}>
          <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="min-h-[72px] w-full border border-white/15 bg-white/[0.03] px-3 py-2 text-sm leading-relaxed" placeholder={t("shortDescPlaceholder")} />
        </Field>

        <Field label={t("descriptionLabel")} hint={t("descriptionHint")}>
          <textarea value={descriptionPlain} onChange={(e) => setDescriptionPlain(e.target.value)} className="min-h-[140px] w-full border border-white/15 bg-white/[0.03] px-3 py-2 text-sm leading-relaxed" placeholder={t("descriptionPlaceholder")} />
        </Field>

        {!initial?.productId ? (
          <div className="space-y-5">
            <div>
              <span className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{t("coverLabel")}</span>
              <span className="mt-0.5 block font-serif text-[11px] italic text-frost-dim">{t("coverHint")}</span>
              <div className="mt-1.5">
                <ProductMediaPicker value={coverImage} onChange={setCoverImage} accept="image" />
              </div>
            </div>
            <div>
              <span className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{t("videoLabel")}</span>
              <span className="mt-0.5 block font-serif text-[11px] italic text-frost-dim">{t("videoHint")}</span>
              <div className="mt-1.5">
                <ProductMediaPicker value={coverVideo} onChange={setCoverVideo} accept="video" />
              </div>
            </div>
          </div>
        ) : null}

        <Field label={t("categoryLabel")}>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="category-suggestions"
            className="w-full border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t("tagsLabel")}>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm" />
          </Field>
          <Field label={t("variantsLabel")}>
            <input value={variants} onChange={(e) => setVariants(e.target.value)} className="w-full border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t("basePriceLabel")}>
            <input
              type="number"
              min="0"
              step="0.001"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
            />
          </Field>
          <Field label={t("costPriceLabel")} hint={t("costPriceHint")}>
            <input
              type="number"
              min="0"
              step="0.001"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="w-full border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
            />
          </Field>
        </div>

        <Field label={t("deliveryDaysLabel")} hint={t("deliveryDaysHint")}>
          <input
            type="number"
            min={1}
            max={14}
            step={1}
            value={deliveryDaysMax}
            onChange={(e) => setDeliveryDaysMax(e.target.value)}
            className="w-full border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
          />
        </Field>

        <Field label={t("shippingFeeLabel")} hint={t("shippingFeeHint")}>
          <input
            type="number"
            min={0.1}
            max={50}
            step={0.1}
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
            className="w-full border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
          />
        </Field>

        <fieldset>
          <legend className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">
            {t("commissionLabel")}
          </legend>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setCommissionType("pct")}
              className={`border px-3.5 py-1.5 font-west text-[11px] uppercase tracking-[0.16em] ${
                commissionType === "pct" ? "border-white/10 bg-white/10 text-frost" : "border-white/15 text-frost-dim"
              }`}
            >
              {t("commissionTypePct")}
            </button>
            <button
              type="button"
              onClick={() => setCommissionType("fixed")}
              className={`border px-3.5 py-1.5 font-west text-[11px] uppercase tracking-[0.16em] ${
                commissionType === "fixed" ? "border-white/10 bg-white/10 text-frost" : "border-white/15 text-frost-dim"
              }`}
            >
              {t("commissionTypeFixed")}
            </button>
          </div>

          {commissionType === "pct" ? (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {commissionPicks.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setCommissionPct(String(pct * 100))}
                    className={`border px-3 py-1.5 font-mono text-xs ${
                      Number(commissionPct) === pct * 100
                        ? "border-white/10 bg-white/10 text-frost"
                        : "border-white/15 text-frost-dim"
                    }`}
                  >
                    {formatPct(pct, 0)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="90"
                step="1"
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                placeholder={t("commissionCustomPct")}
                className="w-40 border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
              />
            </div>
          ) : (
            <input
              type="number"
              min="0"
              step="0.001"
              value={commissionFixed}
              onChange={(e) => setCommissionFixed(e.target.value)}
              placeholder={t("commissionCustomFixed")}
              className="mt-3 w-40 border border-white/15 bg-white/[0.03] px-3 py-2 font-mono text-sm"
            />
          )}
        </fieldset>

        {marginBlocked && (
          <p className="font-mono text-xs text-danger">{t("marginBlocked")}</p>
        )}
        {error && <p className="font-mono text-xs text-danger">{error}</p>}

        <button type="button" disabled={pending || marginBlocked} onClick={handleSubmit} className="gl-btn-primary disabled:opacity-40">
          {initial?.productId ? t("saveCta") : t("createCta")}
        </button>
      </div>

      <div className="border border-white/10 bg-white/[0.02] p-5">
        <p className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{t("previewTitle")}</p>
        <p className="mt-1 font-serif text-xs italic text-frost-dim">{t("previewHint")}</p>

        <ul className="mt-4 space-y-2.5">
          <PreviewLine label={t("previewRetail")} value={formatMoney(basePriceNum)} />
          <PreviewLine label={t("previewCommission")} value={`− ${formatMoney(preview.marketerCommission)}`} negative />
          <PreviewLine label={t("previewPlatformFee")} value={`− ${formatMoney(preview.platformFee)}`} negative />
          {preview.paymentFee > 0 ? (
            <PreviewLine label={t("previewPaymentFee")} value={`− ${formatMoney(preview.paymentFee)}`} negative />
          ) : (
            <PreviewLine label={t("previewCodNoGateway")} value={t("previewCodZero")} />
          )}
          <PreviewLine label={t("previewMerchantNet")} value={formatMoney(preview.merchantNet)} emphasis />
          <PreviewLine
            label={t("previewAfterCogs")}
            value={formatMoney(preview.merchantNetAfterCogs)}
            negative={preview.merchantNetAfterCogs < 0}
            emphasis
          />
        </ul>

        <p className="mt-4 font-mono text-[11px] text-frost-dim">
          {t("previewMargin", { amount: formatMoney(Math.max(0, basePriceNum - costPriceNum)) })}
        </p>
        {!highMargin && costPriceNum > 0 && (
          <p className="mt-2 font-mono text-[11px] text-frost-dim">{t("highMarginHint")}</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{label}</span>
      {hint && <span className="mt-0.5 block font-serif text-[11px] italic text-frost-dim">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function PreviewLine({
  label,
  value,
  negative,
  emphasis,
}: {
  label: string;
  value: string;
  negative?: boolean;
  emphasis?: boolean;
}) {
  return (
    <li
      className={`flex items-baseline justify-between gap-4 border-b border-white/10 pb-2 ${
        emphasis ? "pt-2" : ""
      }`}
    >
      <span className="font-west text-[10px] uppercase tracking-[0.18em] text-frost-dim">{label}</span>
      <span
        className={`font-mono text-sm ${negative ? "text-danger" : "text-frost"} ${emphasis ? "font-bold" : ""}`}
      >
        {value}
      </span>
    </li>
  );
}
