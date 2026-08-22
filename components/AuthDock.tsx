"use client";

import { useTranslations } from "next-intl";
import { SIGN_IN_HREF, signUpHref } from "@/lib/auth/paths";

/** Always-visible auth links on small screens. Header CTAs hide below md. */
export default function AuthDock() {
  const t = useTranslations("marketing.dock");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-wrap gap-2">
        <a href={SIGN_IN_HREF} className="gl-btn-ghost min-h-10 flex-1">
          {t("signIn")}
        </a>
        <a href={signUpHref("merchant")} className="gl-btn-primary min-h-10 flex-1">
          {t("signUp")}
        </a>
      </div>
    </div>
  );
}
