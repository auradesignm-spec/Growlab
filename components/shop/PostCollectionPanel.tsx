"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { CommissionPayState } from "@/lib/shop/commissionPayState";
import type { ShareLinkInfo } from "@/lib/shop/tracking";

export default function PostCollectionPanel({
  share,
  payState,
  creatorShare,
  currency,
}: {
  share: ShareLinkInfo;
  payState: CommissionPayState;
  creatorShare: number | null;
  currency: string;
}) {
  const t = useTranslations("shop");

  function openWhatsapp() {
    const origin = window.location.origin;
    const claimUrl = `${origin}/share/${share.claimToken}`;
    const storeLink =
      share.status === "claimed" && share.storeUrl && share.refUsername
        ? `${origin}${share.storeUrl}?ref=${encodeURIComponent(share.refUsername)}`
        : claimUrl;
    const text = encodeURIComponent(
      t("waShareText", { product: share.productTitle, link: storeLink })
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-8 max-w-xl rounded-xl border border-signal/30 bg-signal/5 p-5">
      <p className="text-[12px] font-medium uppercase tracking-wide text-frost-faint">{t("payEyebrow")}</p>
      <p className="mt-2 text-[18px] font-semibold text-frost">{t(`payTitle.${payState}`)}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{t(`payLede.${payState}`)}</p>
      {creatorShare != null && payState === "confirmed" ? (
        <p className="mt-3 font-mono text-[15px] text-frost">
          {t("payAmount", { amount: creatorShare.toFixed(2), currency })}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={openWhatsapp} className="gl-btn-primary min-h-11">
          {t("whatsappShare")}
        </button>
        <Link href={`/share/${share.claimToken}`} className="gl-btn-ghost inline-flex min-h-11 items-center">
          {t("shareCta")}
        </Link>
      </div>
    </div>
  );
}
