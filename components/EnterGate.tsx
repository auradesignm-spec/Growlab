"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { signInHref, signUpHref } from "@/lib/auth/paths";

export default function EnterGate() {
  const t = useTranslations("enter");

  return (
    <div className="max-w-xl">
      <p className="gl-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-3 text-display-lg font-semibold text-frost">{t("confirmMerchant")}</h1>
      <p className="gl-lede mt-4">{t("merchantNext")}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href={signUpHref("merchant")} className="gl-btn-primary">
          {t("continue")}
        </Link>
      </div>
      <p className="mt-8 text-[14px] text-frost-dim">
        {t("signInPrompt")}{" "}
        <Link href={signInHref("merchant")} className="font-medium text-frost underline-offset-4 hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
