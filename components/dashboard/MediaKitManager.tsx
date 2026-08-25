"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { MerchantMediaAssetRow } from "@/lib/dashboard/merchant";
import { addMediaAsset, removeMediaAsset } from "@/app/(dashboard)/dashboard/media-actions";
import ProductMediaPicker, { type PickedMedia } from "@/components/dashboard/ProductMediaPicker";

export default function MediaKitManager({
  productId,
  assets,
}: {
  productId: string;
  assets: MerchantMediaAssetRow[];
}) {
  const t = useTranslations("dashboardApp.merchant.products.mediaKit");
  const [open, setOpen] = useState(assets.length === 0);
  const [picked, setPicked] = useState<PickedMedia | null>(null);
  const [caption, setCaption] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (!picked) return;
    setError(null);
    startTransition(async () => {
      try {
        await addMediaAsset(productId, picked.kind, picked.url, caption);
        setPicked(null);
        setCaption("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  function handleRemove(assetId: string) {
    startTransition(async () => {
      try {
        await removeMediaAsset(assetId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div className="border-t border-white/10 px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 font-west text-[10px] uppercase tracking-[0.22em] text-frost-dim"
      >
        {t("manageCta")} ({assets.length})
        <span aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="font-serif text-xs italic text-frost-dim">{t("hint")}</p>

          {assets.length === 0 ? (
            <p className="font-serif text-xs italic text-frost-dim">{t("empty")}</p>
          ) : (
            <ul className="space-y-1.5">
              {assets.map((asset) => (
                <li key={asset.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    {asset.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <video src={asset.url} className="h-10 w-10 rounded-lg object-cover" muted playsInline />
                    )}
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] uppercase text-frost-faint">
                        {asset.type === "image" ? t("typeImage") : t("typeVideo")}
                      </span>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate font-mono text-xs text-frost-dim"
                      >
                        {asset.url}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleRemove(asset.id)}
                    className="shrink-0 font-west text-[10px] uppercase tracking-[0.2em] text-danger disabled:opacity-40"
                  >
                    {t("removeCta")}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {assets.length < 8 && (
            <div className="space-y-3 rounded-xl border border-white/10 p-3">
              <ProductMediaPicker value={picked} onChange={setPicked} accept="both" />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t("captionPlaceholder")}
                  className="min-w-[10rem] flex-1 border border-white/15 bg-white/[0.03] px-3 py-1.5 font-serif text-xs italic"
                />
                <button
                  type="button"
                  disabled={pending || !picked}
                  onClick={handleAdd}
                  className="gl-btn-ghost disabled:opacity-40"
                >
                  {t("addCta")}
                </button>
              </div>
            </div>
          )}
          <p className="font-mono text-[10px] text-frost-dim">{t("limitNote")}</p>
          {error && <p className="font-mono text-xs text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
