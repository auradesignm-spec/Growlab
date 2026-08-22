"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { BrowseProductRow, CreatorBrowseData } from "@/lib/dashboard/browse";
import ApplyCampaignModal from "@/components/dashboard/ApplyCampaignModal";
import type { CampaignApplyPath } from "@/lib/domain/enums";

export default function BrowseCatalog({ data }: { data: CreatorBrowseData }) {
  const t = useTranslations("dashboardApp.browse");
  const tStatus = useTranslations("dashboardApp.status");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Record<string, CampaignApplyPath>>({});
  const [modalProduct, setModalProduct] = useState<BrowseProductRow | null>(null);

  const filterByCategory = (rows: BrowseProductRow[]) =>
    activeCategory ? rows.filter((r) => r.category === activeCategory) : rows;

  const suggested = useMemo(() => filterByCategory(data.suggested), [data.suggested, activeCategory]);
  const others = useMemo(() => filterByCategory(data.others), [data.others, activeCategory]);

  if (data.suggested.length === 0 && data.others.length === 0) {
    return (
      <section className="px-5 py-16 sm:px-8">
        <p className="max-w-md border border-dashed border-white/15 px-5 py-8 font-serif text-sm italic text-frost-dim">
          {t("empty")}
        </p>
      </section>
    );
  }

  return (
    <div>
      <section className="border-b border-white/10 px-5 py-5 sm:px-8">
        <p className="font-serif text-sm italic text-frost-dim">{t("trustNote")}</p>
      </section>

      {data.categories.length > 0 && (
        <section className="flex flex-wrap gap-2 border-b border-white/10 px-5 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`border px-3.5 py-1.5 font-west text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
              activeCategory === null ? "border-white/10 bg-white/10 text-frost" : "border-white/15 text-frost-dim"
            }`}
          >
            {t("allCategories")}
          </button>
          {data.categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`border px-3.5 py-1.5 font-west text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                activeCategory === category ? "border-white/10 bg-white/10 text-frost" : "border-white/15 text-frost-dim"
              }`}
            >
              {category}
            </button>
          ))}
        </section>
      )}

      {suggested.length > 0 && (
        <section className="px-5 py-10 sm:px-8">
          <p className="gl-eyebrow">{t("suggestedTitle")}</p>
          <p className="mt-2 max-w-lg font-serif text-sm italic text-frost-dim">{t("suggestedHint")}</p>
          <ProductGrid
            rows={suggested}
            t={t}
            tStatus={tStatus}
            showScore
            appliedIds={appliedIds}
            onOpenApply={setModalProduct}
          />
        </section>
      )}

      {others.length > 0 && (
        <section className="border-t border-white/10 px-5 py-10 sm:px-8">
          <p className="gl-eyebrow">{t("othersTitle")}</p>
          <ProductGrid
            rows={others}
            t={t}
            tStatus={tStatus}
            showScore={false}
            appliedIds={appliedIds}
            onOpenApply={setModalProduct}
          />
        </section>
      )}

      {modalProduct && (
        <ApplyCampaignModal
          row={modalProduct}
          onClose={() => setModalProduct(null)}
          onApplied={(path) => {
            setAppliedIds((prev) => ({ ...prev, [modalProduct.productId]: path }));
          }}
        />
      )}
    </div>
  );
}

function ProductGrid({
  rows,
  t,
  tStatus,
  showScore,
  appliedIds,
  onOpenApply,
}: {
  rows: BrowseProductRow[];
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
  showScore: boolean;
  appliedIds: Record<string, CampaignApplyPath>;
  onOpenApply: (row: BrowseProductRow) => void;
}) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <ProductCard
          key={row.productId}
          row={row}
          t={t}
          tStatus={tStatus}
          showScore={showScore}
          applied={appliedIds[row.productId] ?? null}
          onOpenApply={onOpenApply}
        />
      ))}
    </div>
  );
}

function ProductCard({
  row,
  t,
  tStatus,
  showScore,
  applied,
  onOpenApply,
}: {
  row: BrowseProductRow;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
  showScore: boolean;
  applied: CampaignApplyPath | null;
  onOpenApply: (row: BrowseProductRow) => void;
}) {
  const sampleStatus = applied === "sample_ugc" ? "pending" : row.sampleStatus;

  return (
    <div className="flex flex-col justify-between border border-white/10 p-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-lg leading-tight">{row.title}</p>
          {showScore && row.suggestionScore !== null && (
            <span className="shrink-0 font-mono text-xs text-pulse">{t("score", { score: row.suggestionScore })}</span>
          )}
        </div>
        <p className="mt-1 font-serif text-xs italic text-frost-dim">{row.merchantBusinessName}</p>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <p className="font-mono text-sm font-bold">{formatMoney(row.basePrice, row.currency)}</p>
          <span className="font-mono text-[11px] text-pulse">
            {t("commissionLabel", { amount: formatMoney(row.estimatedNetProfit, row.currency) })}
          </span>
        </div>
        <p className="mt-1 font-west text-[10px] uppercase tracking-[0.18em] text-frost-dim">
          {row.category}
          {row.tags.length > 0 ? ` · ${row.tags.join(", ")}` : ""}
        </p>
        {row.mediaAssets.length > 0 && (
          <p className="mt-2 font-mono text-[11px] text-frost-dim">
            {t("applyModal.mediaKitCount", { count: row.mediaAssets.length })}
          </p>
        )}
        {row.suggestionReasons.length > 0 && (
          <p className="mt-2 font-serif text-xs italic text-frost-dim">{row.suggestionReasons.join(" · ")}</p>
        )}
      </div>

      <div className="mt-4">
        {applied === "media_kit" ? (
          <p className="text-center font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
            {t("alreadyInStore")}
          </p>
        ) : sampleStatus ? (
          <p className="text-center font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
            {tStatus(`sample.${sampleStatus}` as "sample.pending")}
          </p>
        ) : (
          <button type="button" onClick={() => onOpenApply(row)} className="gl-btn-primary w-full">
            {t("applyCta")}
          </button>
        )}
      </div>
    </div>
  );
}
