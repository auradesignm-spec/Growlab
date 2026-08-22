"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getWhatsAppShareUrl } from "@/lib/constants";

export default function ShareSheet({
  productTitle,
  sharePath,
}: {
  productTitle: string;
  sharePath: string;
}) {
  const t = useTranslations("appShell.share");
  const [copied, setCopied] = useState(false);

  const fullLink = useMemo(() => {
    if (typeof window === "undefined") return sharePath;
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const waUrl = useMemo(
    () => getWhatsAppShareUrl(t("waText", { title: productTitle, link: fullLink })),
    [fullLink, productTitle, t]
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable in insecure contexts.
    }
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="gl-btn-primary min-h-11 text-center">
        {t("whatsapp")}
      </a>
      <button type="button" onClick={() => void copyLink()} className="gl-btn-ghost min-h-11">
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}
