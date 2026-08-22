"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { BrowseMediaAsset, BrowseProductRow, CreatorBrowseData } from "@/lib/dashboard/browse";
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
        <p className="max-w-md rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-[14px] text-frost-dim">
          {t("empty")}
        </p>
      </section>
    );
  }

  return (
    <div>
      <section className="border-b border-line px-5 py-5 sm:px-8">
        <p className="text-[14px] text-frost-dim">{t("trustNote")}</p>
      </section>

      {data.categories.length > 0 && (
        <section className="flex flex-wrap gap-2 border-b border-line px-5 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`min-h-11 rounded-full border px-4 text-[13px] font-medium transition-colors duration-150 ease-out ${
              activeCategory === null
                ? "border-frost bg-frost text-white"
                : "border-line bg-white text-frost-dim hover:border-[rgba(17,19,24,0.2)]"
            }`}
          >
            {t("allCategories")}
          </button>
          {data.categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`min-h-11 rounded-full border px-4 text-[13px] font-medium transition-colors duration-150 ease-out ${
                activeCategory === category
                  ? "border-frost bg-frost text-white"
                  : "border-line bg-white text-frost-dim hover:border-[rgba(17,19,24,0.2)]"
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
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-frost-dim">{t("suggestedHint")}</p>
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
        <section className="border-t border-line px-5 py-10 sm:px-8">
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
    <div className="mx-auto mt-6 grid max-w-3xl gap-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
      {rows.map((row) => (
        <ProductPost
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

function ProductPost({
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
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <PostMedia
        assets={row.mediaAssets}
        title={row.title}
        videoLabel={t("videoBadge")}
      />
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[16px] font-semibold leading-snug text-frost">{row.title}</p>
          {showScore && row.suggestionScore !== null && (
            <span className="shrink-0 font-mono text-[11px] text-frost-faint">
              {t("score", { score: row.suggestionScore })}
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] text-frost-dim">{row.merchantBusinessName}</p>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[14px] text-frost">{formatMoney(row.basePrice, row.currency)}</p>
          <span className="font-mono text-[12px] text-frost-dim">
            {t("commissionLabel", { amount: formatMoney(row.estimatedNetProfit, row.currency) })}
          </span>
        </div>

        <div className="mt-4">
          {applied === "media_kit" ? (
            <p className="py-2 text-center text-[13px] text-frost-dim">{t("alreadyInStore")}</p>
          ) : sampleStatus ? (
            <p className="py-2 text-center text-[13px] text-frost-dim">
              {tStatus(`sample.${sampleStatus}` as "sample.pending")}
            </p>
          ) : (
            <button type="button" onClick={() => onOpenApply(row)} className="gl-btn-primary w-full">
              {t("applyCta")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function pickCover(assets: BrowseMediaAsset[]) {
  const image = assets.find((asset) => asset.type === "image") ?? null;
  const video = assets.find((asset) => asset.type === "video") ?? null;
  return { image, video, cover: image ?? video };
}

function isPlayableVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function PostMedia({
  assets,
  title,
  videoLabel,
}: {
  assets: BrowseMediaAsset[];
  title: string;
  videoLabel: string;
}) {
  const { image, video, cover } = pickCover(assets);

  if (!cover) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-night px-6">
        <p className="text-center text-[15px] font-medium text-frost">{title}</p>
      </div>
    );
  }

  const showVideo = Boolean(video && isPlayableVideo(video.url) && !image);

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-night">
      {showVideo && video ? (
        <video src={video.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover.url} alt="" className="h-full w-full object-cover" />
      )}
      {video ? (
        <span className="absolute start-3 top-3 rounded-md bg-white px-2 py-0.5 font-mono text-[10px] text-frost">
          {videoLabel}
        </span>
      ) : null}
    </div>
  );
}
