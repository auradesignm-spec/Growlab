import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default async function CreatorNotFound() {
  const t = await getTranslations("creator");

  return (
    <div className="flex min-h-screen flex-col text-frost">
      <div className="flex h-16 items-center justify-between gap-4 border-b border-white/10 px-5 sm:px-8">
        <Link href="/" className="text-[15px] font-medium text-frost" aria-label={t("home")}>
          {t("home")}
        </Link>
        <LocaleSwitcher compact />
      </div>
      <div className="flex flex-1 flex-col items-start justify-center px-6 py-24">
        <p className="gl-eyebrow">404</p>
        <h1 className="mt-2 text-display-md font-semibold">{t("notFound.title")}</h1>
        <p className="mt-4 max-w-sm text-[16px] text-frost-dim">{t("notFound.lede")}</p>
        <Link href="/" className="gl-btn-primary mt-8">
          {t("notFound.cta")}
        </Link>
      </div>
    </div>
  );
}
