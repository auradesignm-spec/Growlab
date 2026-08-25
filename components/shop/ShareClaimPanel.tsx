"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { claimShareEntitlement } from "@/app/(dashboard)/dashboard/share-actions";
import { submitBuyerReel } from "@/app/(dashboard)/dashboard/content-actions";
import { commissionPayState } from "@/lib/shop/commissionPayState";

export default function ShareClaimPanel({
  data,
}: {
  data: {
    claimToken: string;
    status: string;
    productId: string;
    productTitle: string;
    storeName: string;
    storeUrl: string | null;
    shareUrl: string | null;
    creatorUsername: string | null;
    orderStatus: string;
    buyerName: string;
    reelStatus: string | null;
    reelUrl: string | null;
  };
}) {
  const t = useTranslations("share");
  const [phone, setPhone] = useState("");
  const [reelUrl, setReelUrl] = useState(data.reelUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const claimed = data.status === "claimed" && data.shareUrl;
  const reelPending = data.reelStatus === "pending";
  const reelApproved = data.reelStatus === "approved";

  function copyLink() {
    if (!data.shareUrl) return;
    const full = data.creatorUsername
      ? `${window.location.origin}${data.shareUrl}?ref=${encodeURIComponent(data.creatorUsername)}`
      : `${window.location.origin}${data.shareUrl}`;
    void navigator.clipboard.writeText(full);
  }

  function whatsappShare() {
    if (!data.shareUrl) return;
    const link = data.creatorUsername
      ? `${window.location.origin}${data.shareUrl}?ref=${encodeURIComponent(data.creatorUsername)}`
      : `${window.location.origin}${data.shareUrl}`;
    const text = encodeURIComponent(t("waText", { product: data.productTitle, link }));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function onClaim(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await claimShareEntitlement(data.claimToken, phone);
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("claimFailed"));
      }
    });
  }

  function onSubmitReel(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await submitBuyerReel({ productId: data.productId, socialPostUrl: reelUrl });
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("reelFailed"));
      }
    });
  }

  return (
    <div className="mt-10 max-w-xl space-y-8">
      <p className="text-[14px] text-warn">{t("strictRules")}</p>
      <p className="rounded-xl border border-line px-4 py-3 text-[14px] text-frost">
        {t(`payState.${commissionPayState([data.orderStatus])}`)}
      </p>

      {claimed ? (
        <>
          <p className="text-[15px] text-frost">{t("claimed", { user: data.creatorUsername ?? "" })}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={copyLink} className="gl-btn gl-btn-secondary">
              {t("copyLink")}
            </button>
            <button type="button" onClick={whatsappShare} className="gl-btn gl-btn-primary">
              {t("whatsapp")}
            </button>
          </div>
          {data.storeUrl ? (
            <Link href={data.storeUrl} className="inline-flex text-[14px] underline">
              {t("visitStore")}
            </Link>
          ) : null}

          <section className="border-t border-line pt-6">
            <h2 className="text-[17px] font-semibold text-frost">{t("reelTitle")}</h2>
            <p className="mt-2 text-[14px] text-frost-dim">{t("reelLede")}</p>
            {reelApproved ? (
              <p className="mt-4 text-[14px] text-pulse">{t("reelApproved")}</p>
            ) : reelPending ? (
              <p className="mt-4 text-[14px] text-frost-dim">{t("reelPending")}</p>
            ) : (
              <form onSubmit={onSubmitReel} className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-[13px] text-frost-dim">{t("reelUrlLabel")}</span>
                  <input
                    type="url"
                    value={reelUrl}
                    onChange={(e) => setReelUrl(e.target.value)}
                    placeholder={t("reelUrlPlaceholder")}
                    className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px]"
                    required
                  />
                </label>
                <button type="submit" disabled={pending} className="gl-btn gl-btn-primary">
                  {pending ? t("reelSubmitting") : t("reelSubmit")}
                </button>
              </form>
            )}
          </section>
        </>
      ) : (
        <>
          <p className="text-[15px] text-frost-dim">{t("claimHint")}</p>
          <form onSubmit={onClaim} className="space-y-4">
            <label className="block">
              <span className="text-[13px] text-frost-dim">{t("phoneLabel")}</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px]"
                placeholder={t("phonePlaceholder")}
                required
              />
            </label>
            {error ? <p className="text-[13px] text-danger">{error}</p> : null}
            <button type="submit" disabled={pending} className="gl-btn gl-btn-primary">
              {pending ? t("claiming") : t("claimCta")}
            </button>
          </form>
          <p className="text-[13px] text-frost-faint">
            {t("noAccount")}{" "}
            <Link
              href={`/sign-up?redirect_url=${encodeURIComponent(`/share/${data.claimToken}`)}`}
              className="underline"
            >
              {t("signUpToClaim")}
            </Link>
          </p>
        </>
      )}

      {error && claimed ? <p className="text-[13px] text-danger">{error}</p> : null}
    </div>
  );
}
