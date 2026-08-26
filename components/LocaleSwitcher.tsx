"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import GlassBubbleTrack from "@/components/GlassBubbleTrack";

export default function LocaleSwitcher({
  compact = false,
}: {
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("nav");

  function switchTo(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <GlassBubbleTrack
      resetKey={locale}
      persistPressed
      className="flex items-center rounded-full p-0.5"
      aria-label={t("localeSwitch")}
    >
      {(["ar", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            data-bubble-item
            onClick={() => switchTo(code)}
            aria-pressed={active}
            className="relative z-[1] rounded-full px-3 py-2.5 text-[15px] font-medium text-frost-faint"
          >
            {code === "ar" ? t("localeAr") : t("localeEn")}
          </button>
        );
      })}
    </GlassBubbleTrack>
  );
}
