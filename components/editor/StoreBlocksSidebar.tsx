"use client";

import { useTranslations } from "next-intl";
import type { MerchantStoreTheme } from "@/lib/merchant-store/theme";
import { ACCENT_PRESETS } from "@/lib/merchant-store/theme";
import {
  STORE_BLOCK_TYPES,
  moveBlock,
  setBlockEnabled,
  type StoreBlockType,
} from "@/lib/merchant-store/layout";
import { ODOO_PURPLE } from "@/lib/merchant-store/configurator";
import type { StorePromo } from "@/lib/merchant-store/promo";
import StorePromoEditor from "@/components/editor/StorePromoEditor";

export type StoreEditorPanel = "blocks" | "content" | "design" | "theme";

const BLOCK_ICONS: Record<StoreBlockType, string> = {
  offer: "%",
  intro: "▣",
  hero: "▦",
  catalog: "▤",
  contact: "✉",
};

export function StoreBlocksSidebar({
  panel,
  setPanel,
  theme,
  setTheme,
  selectedBlock,
  setSelectedBlock,
  tagline,
  setTagline,
  aboutPlain,
  setAboutPlain,
  setOfferHeadline,
  setOfferBody,
  setOfferActive,
  promo,
  setPromo,
  heroProductId,
  setHeroProductId,
  products,
  slug,
  setSlug,
  showAdvancedSlug,
  setShowAdvancedSlug,
  onReconfigure,
  onRestart,
}: {
  panel: StoreEditorPanel;
  setPanel: (p: StoreEditorPanel) => void;
  theme: MerchantStoreTheme;
  setTheme: (t: MerchantStoreTheme) => void;
  selectedBlock: StoreBlockType | null;
  setSelectedBlock: (t: StoreBlockType | null) => void;
  tagline: string;
  setTagline: (v: string) => void;
  aboutPlain: string;
  setAboutPlain: (v: string) => void;
  setOfferHeadline: (v: string) => void;
  setOfferBody: (v: string) => void;
  setOfferActive: (v: boolean) => void;
  promo: StorePromo;
  setPromo: (p: StorePromo) => void;
  heroProductId: string | null;
  setHeroProductId: (id: string | null) => void;
  products: Array<{ id: string; title: string }>;
  slug: string;
  setSlug: (v: string) => void;
  showAdvancedSlug: boolean;
  setShowAdvancedSlug: (v: boolean) => void;
  onReconfigure: () => void;
  onRestart: () => void;
}) {
  const t = useTranslations("merchantStoreEditor");
  const layout = theme.layout;

  function patchLayout(next: typeof layout) {
    setTheme({ ...theme, layout: next });
  }

  function activateBlock(type: StoreBlockType) {
    patchLayout(setBlockEnabled(layout, type, true));
    setSelectedBlock(type);
    setPanel("content");
    if (type === "offer") {
      setOfferActive(true);
      setPromo({ ...promo, active: true, headline: promo.headline || t("fields.offerHeadline") });
    }
  }

  return (
    <aside className="border-b border-[#E4E4E7] bg-[#2C2C2C] text-white lg:border-b-0 lg:border-e lg:border-[#3F3F46]">
      <div className="flex gap-1 border-b border-[#3F3F46] p-2">
        {(
          [
            ["content", t("odoo.tabs.content")],
            ["design", t("odoo.tabs.design")],
            ["theme", t("odoo.tabs.theme")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPanel(id)}
            className={`min-h-10 flex-1 rounded px-2 py-1.5 text-[11px] font-medium transition-colors ${
              panel === id ? "bg-[#714B67] text-white" : "text-[#A1A1AA] hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {panel === "blocks" ? (
        <div className="space-y-4 p-3">
          <p className="text-[11px] text-[#A1A1AA]">{t("odoo.blocks.libraryHint")}</p>
          <div className="grid grid-cols-2 gap-2">
            {STORE_BLOCK_TYPES.map((type) => {
              const active = layout.blocks.find((b) => b.type === type)?.enabled;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => activateBlock(type)}
                  className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-center text-[12px] transition-colors ${
                    active
                      ? "border-[#714B67] bg-[#714B67]/25 text-white"
                      : "border-[#3F3F46] bg-[#363636] text-[#E4E4E7] hover:border-[#714B67]"
                  }`}
                >
                  <span className="text-[18px] text-[#C4B5C8]" aria-hidden>
                    {BLOCK_ICONS[type]}
                  </span>
                  {t(`odoo.blocks.${type}` as "odoo.blocks.intro")}
                  <span className="text-[10px] text-[#A1A1AA]">
                    {active ? t("odoo.blocks.onPage") : t("odoo.blocks.add")}
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <p className="mb-2 text-[11px] font-medium text-[#A1A1AA]">{t("odoo.blocks.pageStructure")}</p>
            <ul className="space-y-1">
              {layout.blocks.map((block, index) => (
                <li
                  key={block.id}
                  className={`flex items-center gap-1 rounded border px-2 py-1.5 ${
                    block.enabled ? "border-[#3F3F46] bg-[#1F1F1F]" : "border-transparent opacity-50"
                  } ${selectedBlock === block.type ? "ring-1 ring-[#714B67]" : ""}`}
                >
                  <button
                    type="button"
                    className="min-h-10 flex-1 text-start text-[12px]"
                    onClick={() => {
                      setSelectedBlock(block.type);
                      setPanel("content");
                    }}
                  >
                    {t(`odoo.blocks.${block.type}` as "odoo.blocks.intro")}
                    {!block.enabled ? (
                      <span className="ms-1 text-[10px] text-[#71717A]">({t("odoo.blocks.hidden")})</span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    aria-label={t("odoo.blocks.moveUp")}
                    disabled={index === 0}
                    className="min-h-10 min-w-10 rounded text-[#A1A1AA] hover:bg-white/5 disabled:opacity-30"
                    onClick={() => patchLayout(moveBlock(layout, block.type, -1))}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={t("odoo.blocks.moveDown")}
                    disabled={index === layout.blocks.length - 1}
                    className="min-h-10 min-w-10 rounded text-[#A1A1AA] hover:bg-white/5 disabled:opacity-30"
                    onClick={() => patchLayout(moveBlock(layout, block.type, 1))}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="min-h-10 rounded px-2 text-[11px] text-[#A1A1AA] hover:bg-white/5"
                    onClick={() => {
                      patchLayout(setBlockEnabled(layout, block.type, !block.enabled));
                      if (block.type === "offer" && block.enabled) {
                        setOfferActive(false);
                        setPromo({ ...promo, active: false });
                      }
                    }}
                  >
                    {block.enabled ? t("odoo.blocks.hide") : t("odoo.blocks.show")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {panel === "content" ? (
        <div className="space-y-4 p-4 text-[13px]">
          <p className="text-[11px] text-[#A1A1AA]">
            {selectedBlock
              ? t("odoo.blocks.editing", {
                  block: t(`odoo.blocks.${selectedBlock}` as "odoo.blocks.intro"),
                })
              : t("odoo.blocks.pickBlock")}
          </p>

          {(!selectedBlock || selectedBlock === "intro") && (
            <>
              <FieldLight label={t("fields.tagline")}>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 text-white"
                />
              </FieldLight>
              <FieldLight label={t("fields.about")}>
                <textarea
                  value={aboutPlain}
                  onChange={(e) => setAboutPlain(e.target.value)}
                  rows={5}
                  className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 leading-relaxed text-white"
                />
              </FieldLight>
            </>
          )}

          {selectedBlock === "hero" || selectedBlock === "catalog" ? (
            <FieldLight label={t("fields.hero")}>
              <div className="space-y-1">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setHeroProductId(p.id)}
                    className={`block min-h-10 w-full rounded border px-3 py-2 text-start ${
                      p.id === heroProductId ? "border-[#714B67] bg-[#714B67]/30" : "border-[#3F3F46]"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
                {products.length === 0 ? (
                  <p className="text-[12px] text-[#A1A1AA]">{t("noProducts")}</p>
                ) : null}
              </div>
            </FieldLight>
          ) : null}

          {(!selectedBlock || selectedBlock === "offer") && (
            <StorePromoEditor
              promo={promo}
              products={products}
              onChange={(next) => {
                setPromo(next);
                setOfferHeadline(next.headline);
                setOfferBody(next.body);
                setOfferActive(next.active);
                patchLayout(setBlockEnabled(layout, "offer", next.active));
              }}
            />
          )}

          {selectedBlock === "contact" ? (
            <p className="rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-3 text-[12px] leading-relaxed text-[#A1A1AA]">
              {t("odoo.blocks.contactHint")}
            </p>
          ) : null}

          <button
            type="button"
            className="min-h-10 text-[12px] text-[#A1A1AA] underline"
            onClick={() => setShowAdvancedSlug(!showAdvancedSlug)}
          >
            {showAdvancedSlug ? t("fields.hideUrl") : t("fields.changeUrl")}
          </button>
          {showAdvancedSlug ? (
            <FieldLight label={t("fields.slug")}>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                dir="ltr"
                className="w-full rounded border border-[#3F3F46] bg-[#1F1F1F] px-3 py-2 font-mono text-white"
              />
            </FieldLight>
          ) : (
            <p className="font-mono text-[11px] text-[#71717A]" dir="ltr">
              /m/{slug}
            </p>
          )}
        </div>
      ) : null}

      {panel === "design" ? (
        <div className="space-y-4 p-4">
          <FieldLight label={t("fields.layout")}>
            <div className="grid grid-cols-2 gap-2">
              {(["split", "center"] as const).map((layoutId) => (
                <button
                  key={layoutId}
                  type="button"
                  onClick={() => setTheme({ ...theme, heroStyle: layoutId })}
                  className={`min-h-11 rounded border px-3 py-2 text-[12px] ${
                    theme.heroStyle === layoutId ? "border-[#714B67] bg-[#714B67]/30" : "border-[#3F3F46]"
                  }`}
                >
                  {t(`fields.layout_${layoutId}`)}
                </button>
              ))}
            </div>
          </FieldLight>
          <FieldLight label={t("fields.tone")}>
            <div className="grid grid-cols-2 gap-2">
              {(["modern", "classic"] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setTheme({ ...theme, fontTone: tone })}
                  className={`min-h-11 rounded border px-3 py-2 text-[12px] ${
                    theme.fontTone === tone ? "border-[#714B67] bg-[#714B67]/30" : "border-[#3F3F46]"
                  }`}
                >
                  {t(`fields.tone_${tone}`)}
                </button>
              ))}
            </div>
          </FieldLight>
        </div>
      ) : null}

      {panel === "theme" ? (
        <div className="space-y-4 p-4">
          <FieldLight label={t("fields.accent")}>
            <div className="flex flex-wrap gap-2">
              {[...ACCENT_PRESETS, { id: "odoo", hex: ODOO_PURPLE }].map((preset) => {
                const selected = theme.accent.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={preset.id}
                    onClick={() => setTheme({ ...theme, accent: preset.hex })}
                    className={`size-10 rounded-full border-2 ${selected ? "border-white" : "border-transparent"}`}
                    style={{ backgroundColor: preset.hex }}
                  />
                );
              })}
            </div>
          </FieldLight>
          <button type="button" onClick={onReconfigure} className="min-h-10 text-[12px] text-[#A1A1AA] underline">
            {t("odoo.toolbar.reconfigure")}
          </button>
          <button type="button" onClick={onRestart} className="ms-3 min-h-10 text-[12px] text-[#A1A1AA] underline">
            {t("odoo.toolbar.restart")}
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function FieldLight({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] text-[#A1A1AA]">{label}</span>
      {children}
    </label>
  );
}
