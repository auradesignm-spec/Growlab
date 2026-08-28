"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { MerchantProductRow } from "@/lib/dashboard/merchant";
import { EMPTY_ATTRIBUTES, type ProductAttributes } from "@/lib/catalog-db";
import { DEFAULT_PROMO, promoPreset, type StorePromo } from "@/lib/merchant-store/promo";
import { formatMoney } from "@/lib/format";
import {
  previewImportProductUrl,
  saveProductStudio,
  toggleProductActive,
} from "@/app/(dashboard)/dashboard/product-actions";
import ProductMediaPicker, { type PickedMedia } from "@/components/dashboard/ProductMediaPicker";

type Draft = {
  id: string | null;
  title: string;
  category: string;
  tags: string;
  shortDescription: string;
  descriptionPlain: string;
  basePrice: string;
  costPrice: string;
  commissionPct: string;
  deliveryDaysMax: string;
  shippingFee: string;
  attributes: ProductAttributes;
  featuresText: string;
  promo: StorePromo;
  cover: PickedMedia | null;
  sourceUrl: string;
  active: boolean;
};

function rowToDraft(p: MerchantProductRow): Draft {
  const cover = p.mediaAssets.find((a) => a.type === "image");
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    tags: p.tags.join(", "),
    shortDescription: p.shortDescription,
    descriptionPlain: p.descriptionHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    basePrice: String(p.basePrice),
    costPrice: String(p.costPrice),
    commissionPct:
      p.commissionType === "pct" ? String(Math.round(p.commissionValue * 1000) / 10) : "15",
    deliveryDaysMax: String(p.deliveryDaysMax ?? 4),
    shippingFee: String(p.shippingFee ?? 1.5),
    attributes: {
      size: [...(p.attributes?.size ?? [])],
      color: [...(p.attributes?.color ?? [])],
      material: [...(p.attributes?.material ?? [])],
      custom: [...(p.attributes?.custom ?? [])],
    },
    featuresText: (p.features ?? []).join("\n"),
    promo: { ...(p.promo ?? DEFAULT_PROMO) },
    cover: cover ? { url: cover.url, kind: "image" } : null,
    sourceUrl: p.sourceUrl ?? "",
    active: p.active,
  };
}

function emptyDraft(): Draft {
  return {
    id: null,
    title: "",
    category: "general",
    tags: "",
    shortDescription: "",
    descriptionPlain: "",
    basePrice: "",
    costPrice: "0",
    commissionPct: "15",
    deliveryDaysMax: "4",
    shippingFee: "1.5",
    attributes: { ...EMPTY_ATTRIBUTES, size: [], color: [], material: [], custom: [] },
    featuresText: "",
    promo: { ...DEFAULT_PROMO },
    cover: null,
    sourceUrl: "",
    active: true,
  };
}

function plainToHtml(plain: string): string {
  return plain
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function csvToList(value: string): string[] {
  return value
    .split(/[,،\n]/)
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 24);
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] text-frost-faint">{label}</span>
      {children}
    </label>
  );
}

export default function ProductStudio({ products }: { products: MerchantProductRow[] }) {
  const t = useTranslations("dashboardApp.merchant.productStudio");
  const tForm = useTranslations("dashboardApp.merchant.productForm");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id ?? null);
  const [draft, setDraft] = useState<Draft | null>(() =>
    products[0] ? rowToDraft(products[0]) : null
  );
  const [importUrl, setImportUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  function openProduct(p: MerchantProductRow) {
    setSelectedId(p.id);
    setDraft(rowToDraft(p));
    setError(null);
    setOk(null);
  }

  function openNew() {
    setSelectedId(null);
    setDraft(emptyDraft());
    setError(null);
    setOk(null);
  }

  function patch(partial: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...partial } : d));
  }

  function patchAttr(key: "size" | "color" | "material", valuesCsv: string) {
    setDraft((d) =>
      d ? { ...d, attributes: { ...d.attributes, [key]: csvToList(valuesCsv) } } : d
    );
  }

  function runImport() {
    setError(null);
    setOk(null);
    startTransition(async () => {
      try {
        const imported = await previewImportProductUrl(importUrl);
        setDraft((d) => {
          const base = d ?? emptyDraft();
          const sizes = imported.sizes?.length ? imported.sizes : base.attributes.size;
          const colors = imported.colors?.length ? imported.colors : base.attributes.color;
          const materials = imported.materials?.length
            ? imported.materials
            : base.attributes.material;
          const featuresText = imported.features?.length
            ? imported.features.join("\n")
            : base.featuresText;
          const descriptionPlain =
            imported.descriptionPlain ||
            imported.shortDescription ||
            base.descriptionPlain ||
            imported.title;
          return {
            ...base,
            id: null,
            title: imported.title || base.title,
            category: imported.category || base.category,
            shortDescription: imported.shortDescription || base.shortDescription,
            descriptionPlain,
            sourceUrl: imported.sourceUrl,
            cover: imported.imageUrl
              ? { url: imported.imageUrl, kind: "image" as const }
              : base.cover,
            basePrice:
              imported.priceHint && imported.priceHint > 0
                ? String(imported.priceHint)
                : base.basePrice,
            attributes: {
              ...base.attributes,
              size: sizes,
              color: colors,
              material: materials,
            },
            featuresText,
          };
        });
        setSelectedId(null);
        setOk(
          t("importOk", {
            engine: imported.engine,
            method: imported.extractionMethod,
          })
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : t("importFailed"));
      }
    });
  }

  function save() {
    if (!draft) return;
    setError(null);
    setOk(null);
    startTransition(async () => {
      try {
        const result = await saveProductStudio(draft.id, {
          title: draft.title,
          category: draft.category || "general",
          tags: csvToList(draft.tags),
          shortDescription: draft.shortDescription,
          descriptionHtml: plainToHtml(draft.descriptionPlain),
          basePrice: Number(draft.basePrice),
          costPrice: Number(draft.costPrice),
          commissionType: "pct",
          commissionValue: Number(draft.commissionPct) / 100,
          deliveryDaysMax: Number(draft.deliveryDaysMax) || 4,
          shippingFee: Number(draft.shippingFee) || 1.5,
          attributes: draft.attributes,
          features: draft.featuresText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
          promo: {
            kind: draft.promo.kind,
            headline: draft.promo.headline,
            body: draft.promo.body,
            active: draft.promo.active,
            endsAt: draft.promo.endsAt,
            buyQty: draft.promo.buyQty,
            getQty: draft.promo.getQty,
            percentOff: draft.promo.percentOff,
          },
          coverImageUrl: draft.cover?.url,
          sourceUrl: draft.sourceUrl,
          active: draft.active,
        });
        setSelectedId(result.productId);
        setDraft((d) => (d ? { ...d, id: result.productId } : d));
        setOk(t("saved"));
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : t("saveFailed"));
      }
    });
  }

  return (
    <section className="px-5 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="gl-eyebrow">{t("kicker")}</p>
          <h2 className="mt-1 font-display text-display-md">{t("title")}</h2>
          <p className="mt-2 max-w-xl text-[14px] text-frost-dim">{t("lede")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard?tab=ad_radar"
            className="gl-btn-secondary"
          >
            {locale === "en" ? "Ad Channel Radar" : "رادار المنصة الأنسب للإعلان"}
          </Link>
          <Link
            href="/dashboard?tab=analytics"
            className="gl-btn-secondary"
          >
            {locale === "en" ? "Sales & Stock Radar" : "رادار المخزون"}
          </Link>
          <button type="button" onClick={openNew} className="gl-btn-primary">
            {t("newProduct")}
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[13px] font-medium text-frost">{t("importTitle")}</p>
        <p className="mt-1 text-[12px] text-frost-dim">{t("importLede")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://…"
            dir="ltr"
            className="studio-field min-w-[16rem] flex-1"
          />
          <button
            type="button"
            disabled={pending || !importUrl.trim()}
            onClick={runImport}
            className="gl-btn-ghost min-h-11 disabled:opacity-40"
          >
            {pending ? t("importing") : t("importCta")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((p) => {
            const cover = p.mediaAssets.find((a) => a.type === "image")?.url;
            const activeCard = selectedId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => openProduct(p)}
                className={`overflow-hidden rounded-2xl border text-start transition-colors ${
                  activeCard
                    ? "border-white/40 bg-white/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                }`}
              >
                <div className="relative aspect-square bg-black/40">
                  {cover ? (
                    <Image src={cover} alt="" fill className="object-cover" sizes="200px" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[12px] text-frost-faint">
                      {t("noImage")}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {!p.active ? (
                      <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                        {locale === "en" ? "Out of Stock" : "نفاد مخزون"}
                      </span>
                    ) : p.visitCount === 0 && p.activeDealsCount === 0 ? (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        {locale === "en" ? "Dead Stock" : "مخزون راكد"}
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                        {locale === "en" ? "Active" : "نشط"}
                      </span>
                    )}
                    {p.promo?.active && (
                      <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                        {t("hasPromo")}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-[14px] font-medium text-frost">{p.title}</p>
                  <p className="mt-1 font-mono text-[12px] text-frost-dim">
                    {formatMoney(p.basePrice, p.currency)}
                  </p>
                </div>
              </button>
            );
          })}
          {products.length === 0 ? (
            <p className="col-span-full text-[14px] text-frost-dim">{t("empty")}</p>
          ) : null}
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          {!draft ? (
            <p className="text-[14px] text-frost-dim">{t("pickOrCreate")}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg text-frost">
                  {draft.id ? t("editing") : t("creating")}
                </h3>
                {draft.id && selected ? (
                  <Link
                    href={`/dashboard/products/${draft.id}/edit`}
                    className="text-[12px] text-frost-dim underline"
                  >
                    {t("advancedEdit")}
                  </Link>
                ) : null}
              </div>

              <Field label={tForm("titleLabel")}>
                <input
                  value={draft.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  className="studio-field"
                />
              </Field>

              <Field label={t("cover")}>
                <ProductMediaPicker
                  value={draft.cover}
                  onChange={(cover) => patch({ cover })}
                  accept="image"
                />
              </Field>

              <Field label={tForm("shortDescLabel")}>
                <input
                  value={draft.shortDescription}
                  onChange={(e) => patch({ shortDescription: e.target.value })}
                  className="studio-field"
                />
              </Field>

              <Field label={tForm("descriptionLabel")}>
                <textarea
                  value={draft.descriptionPlain}
                  onChange={(e) => patch({ descriptionPlain: e.target.value })}
                  rows={4}
                  className="studio-field"
                />
              </Field>

              <Field label={t("features")}>
                <textarea
                  value={draft.featuresText}
                  onChange={(e) => patch({ featuresText: e.target.value })}
                  rows={3}
                  placeholder={t("featuresHint")}
                  className="studio-field"
                />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field label={t("attrSize")}>
                  <input
                    value={draft.attributes.size.join(", ")}
                    onChange={(e) => patchAttr("size", e.target.value)}
                    className="studio-field"
                    placeholder="S, M, L"
                  />
                </Field>
                <Field label={t("attrColor")}>
                  <input
                    value={draft.attributes.color.join(", ")}
                    onChange={(e) => patchAttr("color", e.target.value)}
                    className="studio-field"
                  />
                </Field>
                <Field label={t("attrMaterial")}>
                  <input
                    value={draft.attributes.material.join(", ")}
                    onChange={(e) => patchAttr("material", e.target.value)}
                    className="studio-field"
                  />
                </Field>
                <Field label={tForm("categoryLabel")}>
                  <input
                    value={draft.category}
                    onChange={(e) => patch({ category: e.target.value })}
                    className="studio-field"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label={tForm("basePriceLabel")}>
                  <input
                    value={draft.basePrice}
                    onChange={(e) => patch({ basePrice: e.target.value })}
                    inputMode="decimal"
                    className="studio-field"
                  />
                </Field>
                <Field label={tForm("costPriceLabel")}>
                  <input
                    value={draft.costPrice}
                    onChange={(e) => patch({ costPrice: e.target.value })}
                    inputMode="decimal"
                    className="studio-field"
                  />
                </Field>
                <Field label={tForm("deliveryDaysLabel")}>
                  <input
                    value={draft.deliveryDaysMax}
                    onChange={(e) => patch({ deliveryDaysMax: e.target.value })}
                    inputMode="numeric"
                    className="studio-field"
                  />
                </Field>
                <Field label={tForm("shippingFeeLabel")}>
                  <input
                    value={draft.shippingFee}
                    onChange={(e) => patch({ shippingFee: e.target.value })}
                    inputMode="decimal"
                    className="studio-field"
                  />
                </Field>
                <Field label={t("commissionPct")}>
                  <input
                    value={draft.commissionPct}
                    onChange={(e) => patch({ commissionPct: e.target.value })}
                    inputMode="decimal"
                    className="studio-field"
                  />
                </Field>
              </div>

              <div className="rounded-xl border border-white/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-frost">{t("promoTitle")}</p>
                  <label className="flex items-center gap-2 text-[12px] text-frost-dim">
                    <input
                      type="checkbox"
                      checked={draft.promo.active}
                      onChange={(e) =>
                        patch({ promo: { ...draft.promo, active: e.target.checked } })
                      }
                    />
                    {t("promoActive")}
                  </label>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(
                    [
                      ["second_free", t("presetSecondFree")],
                      ["buy2_get1", t("presetBuy2Get1")],
                      ["second_20", t("presetSecond20")],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className="rounded border border-white/15 px-2 py-1 text-[11px] text-frost-dim hover:border-white/30"
                      onClick={() =>
                        patch({
                          promo: {
                            ...promoPreset(id, locale),
                            endsAt: draft.promo.endsAt,
                            active: true,
                          },
                        })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  value={draft.promo.headline}
                  onChange={(e) => patch({ promo: { ...draft.promo, headline: e.target.value } })}
                  placeholder={t("promoHeadline")}
                  className="studio-field mt-2"
                  disabled={!draft.promo.active}
                />
                <input
                  type="datetime-local"
                  value={toLocalInput(draft.promo.endsAt)}
                  onChange={(e) =>
                    patch({ promo: { ...draft.promo, endsAt: fromLocalInput(e.target.value) } })
                  }
                  className="studio-field mt-2"
                  disabled={!draft.promo.active}
                />
                <p className="mt-1 text-[10px] text-frost-faint">{t("promoEndsHint")}</p>
              </div>

              {draft.sourceUrl ? (
                <p className="truncate text-[11px] text-frost-faint" dir="ltr">
                  {t("source")}: {draft.sourceUrl}
                </p>
              ) : null}

              {error ? <p className="text-[13px] text-red-400">{error}</p> : null}
              {ok ? <p className="text-[13px] text-emerald-400">{ok}</p> : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={save}
                  className="gl-btn-primary disabled:opacity-40"
                >
                  {pending ? t("saving") : t("save")}
                </button>
                {draft.id ? (
                  <button
                    type="button"
                    disabled={pending}
                    className="gl-btn-ghost disabled:opacity-40"
                    onClick={() => {
                      startTransition(async () => {
                        try {
                          await toggleProductActive(draft.id!);
                          patch({ active: !draft.active });
                          router.refresh();
                        } catch (e) {
                          setError(e instanceof Error ? e.message : t("saveFailed"));
                        }
                      });
                    }}
                  >
                    {draft.active ? t("deactivate") : t("activate")}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
