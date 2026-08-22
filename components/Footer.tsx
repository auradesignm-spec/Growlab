"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations("nav");
  const footer = useTranslations("marketing.footer");

  return (
    <footer className="relative py-14">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <div className="gl-stage flex flex-wrap items-center justify-between gap-4 px-5 py-6 text-[14px] text-frost-faint sm:px-8">
          <p className="text-[15px] font-medium text-frost">Growlab</p>
          <nav className="flex flex-wrap items-center gap-4 text-[14px]">
            <a href="/#compare" className="hover:text-frost">
              {t("compare")}
            </a>
            <a href="/#roadmap" className="hover:text-frost">
              {t("roadmap")}
            </a>
            <a href="/sign-in?redirect_url=/dashboard" className="hover:text-frost">
              {t("signIn")}
            </a>
            <a href="/dashboard" className="hover:text-frost">
              {t("dashboard")}
            </a>
          </nav>
          <p>
            © {year} Growlab. {footer("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
