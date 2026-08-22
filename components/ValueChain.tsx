"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";
import { MarketingFeedMock, ProductFeedPost } from "@/components/marketing/ProductFeedPost";

type NodeId = "feed" | "apply" | "accept" | "transfer" | "earn";

export default function ValueChain() {
  const t = useTranslations("marketing.valueChain");
  const nodes = t.raw("nodes") as readonly { id: NodeId; title: string; desc: string }[];
  const [active, setActive] = useState(0);
  const current = nodes[active];

  return (
    <section id="value-chain" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-2xl text-balance text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <Reveal>
          <StageGlow className="mt-10" tone="dusk" place="start">
            <div className="gl-stage p-3 sm:p-4">
              <div className="flex flex-col gap-1 rounded-2xl bg-night p-2 lg:flex-row lg:items-center lg:gap-1">
                {nodes.map((node, index) => {
                  const isActive = active === index;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      aria-pressed={isActive}
                      className={`min-h-11 flex-1 touch-manipulation rounded-xl px-4 py-3 text-start text-[14px] font-medium transition-colors duration-150 ease-out lg:text-center ${
                        isActive ? "bg-white text-frost" : "text-frost-dim hover:bg-white/70 hover:text-frost"
                      }`}
                    >
                      {node.title}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
                <ChainFigure id={current?.id ?? "feed"} />
                <div>
                  <p className="font-mono text-[12px] text-frost-faint">
                    {String(active + 1).padStart(2, "0")} / {String(nodes.length).padStart(2, "0")}{" "}
                    {current?.title}
                  </p>
                  <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-frost-dim">{current?.desc}</p>
                </div>
              </div>
            </div>
          </StageGlow>
        </Reveal>
      </div>
    </section>
  );
}

function ChainFigure({ id }: { id: NodeId }) {
  const t = useTranslations("marketing.valueChain");
  const gallery = useTranslations("marketing.gallery");

  if (id === "feed") {
    return (
      <div aria-hidden="true">
        <MarketingFeedMock />
      </div>
    );
  }

  if (id === "apply") {
    return (
      <div className="mx-auto w-full max-w-[240px]" aria-hidden="true">
        <ProductFeedPost
          name={gallery("productA")}
          src="/feed/attar-night.png"
          priceLabel={gallery("priceLabel")}
          price={`28.00 ${gallery("omr")}`}
          commissionLabel={gallery("yourCommission")}
          commission={`5.60 ${gallery("omr")}`}
          media="image"
          videoLabel={gallery("videoBadge")}
        />
        <p className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-frost px-4 text-[13px] font-medium text-white">
          {t("vizApply")}
        </p>
      </div>
    );
  }

  if (id === "accept") {
    return (
      <div className="space-y-2" aria-hidden="true">
        <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3">
          <span className="text-[13px] text-frost">{t("vizFeedItem")}</span>
          <span className="font-mono text-[12px] text-frost">{t("vizAccept")}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3">
          <span className="text-[13px] text-frost-faint">{t("vizFeedItem")}</span>
          <span className="font-mono text-[12px] text-frost-faint">{t("vizPending")}</span>
        </div>
      </div>
    );
  }

  if (id === "transfer") {
    return (
      <div className="space-y-2" aria-hidden="true">
        <div className="grid grid-cols-3 gap-2">
          <KitTile label={t("vizPhoto")} />
          <KitTile label={t("vizVideo")} />
          <KitTile label={t("vizDetail")} />
        </div>
        <div className="rounded-2xl border border-line bg-white px-4 py-3">
          <p className="text-[11px] text-frost-faint">{t("vizLink")}</p>
          <p className="mt-1 truncate font-mono text-[13px] text-frost">{t("shareUrl")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="rounded-2xl border border-line bg-white px-4 py-3">
        <p className="text-[11px] text-frost-faint">{t("vizLink")}</p>
        <p className="mt-1 truncate font-mono text-[13px] text-frost">{t("shareUrl")}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <KitTile label={t("splitMerchant")} />
        <KitTile label={t("splitMarketer")} />
        <KitTile label={t("splitPlatform")} />
      </div>
    </div>
  );
}

function KitTile({ label }: { label: string }) {
  return (
    <div className="flex min-h-[72px] items-center justify-center rounded-2xl border border-line bg-white px-2 text-center text-[12px] font-medium text-frost">
      {label}
    </div>
  );
}
