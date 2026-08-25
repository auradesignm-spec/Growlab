"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { StorePromo, PromoKind } from "@/lib/merchant-store/promo";
import { promoPreset } from "@/lib/merchant-store/promo";
import { suggestStorePromo } from "@/app/(dashboard)/dashboard/store-actions";

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toISOString();
}

export default function StorePromoEditor({
  promo,
  onChange,
  products,
}: {
  promo: StorePromo;
  onChange: (next: StorePromo) => void;
  products: Array<{ id: string; title: string }>;
}) {
  const t = useTranslations("merchantStoreEditor.promo");
  const locale = useLocale() as "ar" | "en";
  const [aiPrompt, setAiPrompt] = useState("");
  const [pending, startTransition] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);

  function patch(partial: Partial<StorePromo>) {
    onChange({ ...promo, ...partial });
  }

  function applyPreset(id: "second_free" | "second_20" | "cart_10" | "buy2_get1") {
    const next = promoPreset(id, locale);
    onChange({
      ...next,
      endsAt: promo.endsAt,
      productIds: promo.productIds,
    });
  }

  function askAi() {
    setAiError(null);
    startTransition(async () => {
      try {
        const suggestion = await suggestStorePromo({ locale, prompt: aiPrompt });
        onChange({
          ...suggestion,
          endsAt: promo.endsAt,
          productIds: promo.productIds,
        });
      } catch (e) {
        setAiError(e instanceof Error ? e.message : t("aiFailed"));
      }
    });
  }

  const kinds: Array<{ id: PromoKind; label: string }> = [
    { id: "bxgy_free", label: t("kinds.bxgy_free") },
    { id: "nth_percent", label: t("kinds.nth_percent") },
    { id: "cart_percent", label: t("kinds.cart_percent") },
    { id: "banner", label: t("kinds.banner") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["second_free", t("presets.secondFree")],
            ["buy2_get1", t("presets.buy2Get1")],
            ["second_20", t("presets.second20")],
            ["cart_10", t("presets.cart10")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => applyPreset(id)}
            className="min-h-10 rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 text-[11px] text-[#E4E4E7] hover:border-[#714B67]"
          >
            {label}
          </button>
        ))}
      </div>

      <label className="flex min-h-10 items-center gap-2 text-[#D4D4D8]">
        <input
          type="checkbox"
          checked={promo.active}
          onChange={(e) => patch({ active: e.target.checked })}
        />
        {t("active")}
      </label>

      {promo.active ? (
        <button
          type="button"
          onClick={() => patch({ active: false })}
          className="min-h-10 text-[12px] text-[#F87171] underline"
        >
          {t("cancelOffer")}
        </button>
      ) : null}

      <Field label={t("kind")}>
        <select
          value={promo.kind}
          onChange={(e) => patch({ kind: e.target.value as PromoKind })}
          className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 text-white"
        >
          {kinds.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("headline")}>
        <input
          value={promo.headline}
          onChange={(e) => patch({ headline: e.target.value })}
          disabled={!promo.active}
          className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 text-white disabled:opacity-40"
        />
      </Field>

      <Field label={t("body")}>
        <textarea
          value={promo.body}
          onChange={(e) => patch({ body: e.target.value })}
          disabled={!promo.active}
          rows={2}
          className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 text-white disabled:opacity-40"
        />
      </Field>

      {promo.kind === "bxgy_free" ? (
        <div className="grid grid-cols-2 gap-2">
          <Field label={t("buyQty")}>
            <input
              type="number"
              min={1}
              max={8}
              value={promo.buyQty}
              onChange={(e) => patch({ buyQty: Number(e.target.value) || 1 })}
              className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 text-white"
            />
          </Field>
          <Field label={t("getQty")}>
            <input
              type="number"
              min={1}
              max={8}
              value={promo.getQty}
              onChange={(e) => patch({ getQty: Number(e.target.value) || 1 })}
              className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 text-white"
            />
          </Field>
        </div>
      ) : null}

      {promo.kind === "nth_percent" || promo.kind === "cart_percent" ? (
        <div className="grid grid-cols-2 gap-2">
          {promo.kind === "nth_percent" ? (
            <Field label={t("buyQtyBefore")}>
              <input
                type="number"
                min={1}
                max={8}
                value={promo.buyQty}
                onChange={(e) => patch({ buyQty: Number(e.target.value) || 1 })}
                className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 text-white"
              />
            </Field>
          ) : (
            <div />
          )}
          <Field label={t("percentOff")}>
            <input
              type="number"
              min={1}
              max={90}
              value={promo.percentOff}
              onChange={(e) => patch({ percentOff: Number(e.target.value) || 1 })}
              className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 text-white"
            />
          </Field>
        </div>
      ) : null}

      <Field label={t("endsAt")}>
        <input
          type="datetime-local"
          value={toLocalInputValue(promo.endsAt)}
          onChange={(e) => patch({ endsAt: fromLocalInputValue(e.target.value) })}
          className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 text-white"
        />
        <p className="mt-1 text-[10px] text-[#A1A1AA]">{t("endsAtHint")}</p>
      </Field>

      {products.length > 0 ? (
        <Field label={t("products")}>
          <div className="max-h-36 space-y-1 overflow-y-auto rounded border border-[#3F3F46] bg-[#1F1F1F] p-2">
            <label className="flex items-center gap-2 text-[12px] text-[#D4D4D8]">
              <input
                type="checkbox"
                checked={!promo.productIds || promo.productIds.length === 0}
                onChange={() => patch({ productIds: null })}
              />
              {t("allProducts")}
            </label>
            {products.map((p) => {
              const selected = Boolean(promo.productIds?.includes(p.id));
              return (
                <label key={p.id} className="flex items-center gap-2 text-[12px] text-[#D4D4D8]">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const current = new Set(promo.productIds ?? []);
                      if (selected) current.delete(p.id);
                      else current.add(p.id);
                      const next = [...current];
                      patch({ productIds: next.length === 0 ? null : next });
                    }}
                  />
                  {p.title}
                </label>
              );
            })}
          </div>
        </Field>
      ) : null}

      <div className="rounded border border-[#3F3F46] bg-[#1F1F1F] p-3">
        <p className="mb-2 text-[11px] font-medium text-[#A1A1AA]">{t("aiTitle")}</p>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={2}
          placeholder={t("aiPlaceholder")}
          className="w-full rounded border border-[#3F3F46] bg-[#2C2C2C] px-3 py-2 text-[12px] text-white"
        />
        <button
          type="button"
          disabled={pending}
          onClick={askAi}
          className="mt-2 min-h-10 rounded bg-[#714B67] px-3 text-[12px] font-medium text-white disabled:opacity-40"
        >
          {pending ? t("aiRunning") : t("aiCta")}
        </button>
        {aiError ? <p className="mt-2 text-[11px] text-[#F87171]">{aiError}</p> : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] text-[#A1A1AA]">{label}</span>
      {children}
    </label>
  );
}
