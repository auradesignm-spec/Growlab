"use client";

import { useTranslations } from "next-intl";
import TourStartLink from "@/components/TourStartLink";
import { enterHref } from "@/lib/auth/paths";

/** Always-visible auth links on small screens. Header CTAs hide below md. */
export default function AuthDock() {
  const t = useTranslations("marketing.dock");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#111318] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
      <div className="mx-auto flex max-w-wrap">
        <TourStartLink
          href={enterHref("merchant")}
          guide="open-account"
          source="auth-dock"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white text-[16px] font-medium text-[#111318]"
        >
          {t("startCampaign")}
        </TourStartLink>
      </div>
    </div>
  );
}
