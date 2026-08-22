"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import GlassBubbleTrack from "@/components/GlassBubbleTrack";
import { SIGN_IN_HREF, signUpHref } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";

const STORY_HREFS = [
  { href: "/#manifesto", key: "idea" },
  { href: "/#compare", key: "compare" },
  { href: "/#roadmap", key: "roadmap" },
  { href: "/#how", key: "method" },
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const closeMenu = useCallback(() => setOpen(false), []);
  const t = useTranslations("nav");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="gl-nav-glass mx-auto flex h-14 max-w-wrap items-center justify-between gap-3 rounded-full px-3 sm:px-4">
        <Link
          href="/"
          className="shrink-0 px-2 text-[15px] font-semibold"
          style={{ color: "#111318" }}
          aria-label={t("homeAria")}
        >
          {t("brand")}
        </Link>

        <GlassBubbleTrack className="hidden items-center md:flex" aria-label={t("mainNav")}>
          {STORY_HREFS.map((link) => (
            <a key={link.href} href={link.href} data-bubble-item className="gl-nav-link relative z-[1] px-3 py-1.5">
              {t(link.key)}
            </a>
          ))}
          <Link href="/dashboard" data-bubble-item className="gl-nav-link relative z-[1] px-3 py-1.5">
            {t("dashboard")}
          </Link>
        </GlassBubbleTrack>

        <div className="hidden items-center gap-1 md:flex">
          <LocaleSwitcher compact tone="light" />
          <SignedOut>
            <Link
              href={SIGN_IN_HREF}
              className="gl-nav-link px-3 py-1.5"
              onClick={() => track("Sign In Started", { source: "header" })}
            >
              {t("signIn")}
            </Link>
            <Link
              href={signUpHref("creator")}
              className="gl-btn-ghost gl-bubble-btn"
              onClick={() => track("Sign Up Started", { role: "creator", source: "header" })}
            >
              {t("ctaCreator")}
            </Link>
            <Link
              href={signUpHref("merchant")}
              className="gl-btn-primary"
              onClick={() => track("Sign Up Started", { role: "merchant", source: "header" })}
            >
              {t("ctaMerchant")}
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="gl-btn-primary">
              {t("openDashboard")}
            </Link>
            <UserButton />
          </SignedIn>
        </div>

        <GlassBubbleTrack className="flex items-center md:hidden">
          <a
            href={SIGN_IN_HREF}
            data-bubble-item
            className="relative z-[1] inline-flex h-9 items-center rounded-full px-3 text-[14px] font-medium"
            style={{ color: "#111318" }}
            onClick={() => track("Sign In Started", { source: "header-mobile" })}
          >
            {t("signIn")}
          </a>
          <button
            type="button"
            data-bubble-item
            className="relative z-[1] inline-flex h-9 items-center rounded-full px-3 text-[14px]"
            style={{ color: "#111318" }}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? t("close") : t("index")}
          </button>
        </GlassBubbleTrack>
      </div>

      {open && (
        <nav id={menuId} className="gl-nav-glass mx-auto mt-2 max-w-wrap rounded-3xl px-5 py-6 md:hidden" aria-label={t("mobileNav")}>
          <GlassBubbleTrack className="flex flex-col gap-1">
            {STORY_HREFS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-bubble-item
                className="relative z-[1] rounded-full px-3 py-2 text-xl text-frost"
                onClick={closeMenu}
              >
                {t(link.key)}
              </a>
            ))}
            <Link
              href="/dashboard"
              data-bubble-item
              className="relative z-[1] rounded-full px-3 py-2 text-xl text-frost"
              onClick={closeMenu}
            >
              {t("partnerPortal")}
            </Link>
          </GlassBubbleTrack>
          <SignedOut>
            <div className="mt-4 flex flex-col items-start gap-3">
              <Link href={SIGN_IN_HREF} className="gl-btn-ghost" onClick={closeMenu}>
                {t("signIn")}
              </Link>
              <Link href={signUpHref("merchant")} className="gl-btn-primary" onClick={closeMenu}>
                {t("ctaMerchant")}
              </Link>
              <Link href={signUpHref("creator")} className="gl-btn-ghost gl-bubble-btn" onClick={closeMenu}>
                {t("ctaCreator")}
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="mt-4 flex items-center gap-4">
              <Link href="/dashboard" className="gl-btn-primary" onClick={closeMenu}>
                {t("openDashboard")}
              </Link>
              <UserButton />
            </div>
          </SignedIn>
          <div className="mt-4">
            <LocaleSwitcher tone="light" />
          </div>
        </nav>
      )}
    </header>
  );
}
