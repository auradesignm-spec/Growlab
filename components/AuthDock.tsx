"use client";

import { useTranslations } from "next-intl";
import TourStartLink from "@/components/TourStartLink";
import { enterHref } from "@/lib/auth/paths";

/** Always-visible auth links on small screens. Header CTAs hide below md. */
export default function AuthDock() {
  const t = useTranslations("marketing.dock");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-wrap">
        <TourStartLink
          href={enterHref("merchant")}
          guide="open-account"
          source="auth-dock"
          className="gl-btn-primary min-h-10 w-full"
        >
          {t("startCampaign")}
        </TourStartLink>
      </div>
    </div>
  );
}
