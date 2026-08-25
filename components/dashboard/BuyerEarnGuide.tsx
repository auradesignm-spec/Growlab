"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { BuyerShareLoopData, BuyerShareProduct } from "@/lib/dashboard/buyerShare";
import { submitBuyerReel } from "@/app/(dashboard)/dashboard/content-actions";

export default function BuyerEarnGuide({ data }: { data: BuyerShareLoopData }) {
  const t = useTranslations("dashboardApp.browse");
  const steps = t.raw("steps") as Array<{ title: string; text: string }>;

  return (
    <div>
      <section className="border-b border-line px-4 py-6 sm:px-8 sm:py-8">
        <p className="text-[14px] leading-relaxed text-frost-dim">{t("trustNote")}</p>
        <ol className="mt-8 max-w-2xl space-y-6">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="font-mono text-[13px] text-frost-faint">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="text-[16px] font-semibold text-frost">{step.title}</h2>
                <p className="mt-1 text-[14px] leading-relaxed text-frost-dim">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-4 py-8 sm:px-8 sm:py-10">
        <p className="gl-eyebrow">{t("myProductsTitle")}</p>
        <p className="mt-2 max-w-xl text-[14px] text-frost-dim">{t("myProductsLede")}</p>

        {data.products.length === 0 ? (
          <p className="mt-8 max-w-md rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-[14px] text-frost-dim">
            {t("empty")}
          </p>
        ) : (
          <ul className="mt-8 max-w-2xl divide-y divide-line border-y border-line">
            {data.products.map((product) => (
              <ProductShareRow key={product.entitlementId} product={product} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProductShareRow({ product }: { product: BuyerShareProduct }) {
  const t = useTranslations("dashboardApp.browse");
  const [reelUrl, setReelUrl] = useState(product.reelUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const approved = product.reelStatus === "approved";
  const pendingReview = product.reelStatus === "pending";
  const canShare = Boolean(product.shareUrl);

  function submitReel(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await submitBuyerReel({ productId: product.productId, socialPostUrl: reelUrl });
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("reelFailed"));
      }
    });
  }

  function copyShare() {
    if (!product.shareUrl) return;
    const full = `${window.location.origin}${product.shareUrl}`;
    void navigator.clipboard.writeText(full);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function shareWhatsApp() {
    if (!product.shareUrl) return;
    const full = `${window.location.origin}${product.shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${product.productTitle} — ${full}`)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <li className="py-6">
      <p className="text-[16px] font-medium text-frost">{product.productTitle}</p>
      <p className="mt-1 text-[13px] text-frost-dim">{product.storeName}</p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-frost-faint">
        {approved
          ? t("status.approved")
          : pendingReview
            ? t("status.pending")
            : t("status.needReel")}
      </p>

      {!approved && !pendingReview ? (
        <form onSubmit={submitReel} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-[13px] text-frost-dim">{t("reelUrlLabel")}</span>
            <input
              type="url"
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              placeholder={t("reelUrlPlaceholder")}
              className="gl-input mt-1 w-full"
              required
            />
          </label>
          {error ? <p className="text-[13px] text-danger">{error}</p> : null}
          <button type="submit" disabled={pending} className="gl-btn-primary disabled:opacity-40">
            {pending ? t("reelSubmitting") : t("reelSubmit")}
          </button>
        </form>
      ) : null}

      {pendingReview ? (
        <p className="mt-3 text-[14px] text-frost-dim">{t("waitingReview")}</p>
      ) : null}

      {!product.storePublished ? (
        <p className="mt-3 rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-[13px] text-warn">
          {t("storeNotPublished")}
        </p>
      ) : null}

      {canShare ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={copyShare} className="gl-btn-primary">
            {copied ? t("copied") : t("copyProductLink")}
          </button>
          <button type="button" onClick={shareWhatsApp} className="gl-btn-ghost">
            {t("shareWhatsapp")}
          </button>
          {product.reelUrl ? (
            <a href={product.reelUrl} target="_blank" rel="noreferrer" className="gl-btn-ghost">
              {t("openMyReel")}
            </a>
          ) : null}
          <Link href={`/share/${product.claimToken}`} className="gl-btn-ghost">
            {t("openSharePage")}
          </Link>
        </div>
      ) : null}
    </li>
  );
}
