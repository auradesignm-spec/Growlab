"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import GlassBubbleTrack from "@/components/GlassBubbleTrack";
import { SIGN_IN_HREF } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";
import TourStartLink from "@/components/TourStartLink";

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const STORY_HREFS = [
  { href: "/#how", key: "method" },
  { href: "/#proof", key: "proof" },
  { href: "/#pricing", key: "pricing" },
  { href: "/#faq", key: "faq" },
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const closeMenu = useCallback(() => setOpen(false), []);
  const t = useTranslations("nav");

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
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
        </GlassBubbleTrack>

        <div className="hidden items-center gap-1 md:flex">
          <LocaleSwitcher compact tone="light" />
          <HeaderAuth t={t} />
        </div>

        <GlassBubbleTrack className="flex items-center md:hidden">
          <HeaderAuth t={t} compact />
          <button
            type="button"
            data-bubble-item
            className="relative z-[1] inline-flex min-h-11 min-w-11 items-center justify-center rounded-full"
            style={{ color: "#111318" }}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className={`gl-burger ${open ? "is-open" : ""}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </GlassBubbleTrack>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed bottom-0 left-0 right-0 top-0 z-40 bg-[rgb(17_19_24_/_0.28)] md:hidden"
            aria-label={t("closeMenu")}
            onClick={closeMenu}
          />
          <nav
            id={menuId}
            className="gl-nav-glass gl-nav-sheet relative z-50 mx-auto mt-2 w-full max-w-wrap rounded-3xl px-4 py-4 md:hidden"
            aria-label={t("mobileNav")}
          >
            <GlassBubbleTrack persistPressed className="flex flex-col">
              {STORY_HREFS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-bubble-item
                  className="relative z-[1] inline-flex min-h-12 items-center rounded-full px-3 text-[16px] leading-6 text-frost"
                  onClick={closeMenu}
                >
                  {t(link.key)}
                </a>
              ))}
            </GlassBubbleTrack>
            <HeaderAuth t={t} onNavigate={closeMenu} stacked />
            <div className="mt-3">
              <LocaleSwitcher tone="light" />
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}

function HeaderAuth({
  t,
  onNavigate,
  stacked = false,
  compact = false,
}: {
  t: ReturnType<typeof useTranslations>;
  onNavigate?: () => void;
  stacked?: boolean;
  compact?: boolean;
}) {
  const guest = compact ? (
    <TourStartLink
      href={SIGN_IN_HREF}
      guide="sign-in"
      source="header-mobile"
      bubble
      onNavigate={() => {
        track("Sign In Started", { source: "header-mobile" });
        onNavigate?.();
      }}
      className="relative z-[1] inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[15px] font-medium"
    >
      {t("signIn")}
    </TourStartLink>
  ) : (
    <div className={stacked ? "mt-4 flex flex-col items-start gap-3" : "contents"}>
      <TourStartLink
        href={SIGN_IN_HREF}
        guide="sign-in"
        source={stacked ? "header-mobile-menu" : "header"}
        onNavigate={() => {
          track("Sign In Started", { source: stacked ? "header-mobile-menu" : "header" });
          onNavigate?.();
        }}
        className="gl-btn-primary"
      >
        {t("signIn")}
      </TourStartLink>
    </div>
  );

  if (!CLERK_ENABLED) return guest;

  return (
    <>
      <SignedOut>{guest}</SignedOut>
      <SignedIn>
        {compact ? (
          <Link
            href="/dashboard"
            data-bubble-item
            className="relative z-[1] inline-flex min-h-11 items-center rounded-full px-3 text-[15px] font-medium"
            style={{ color: "#111318" }}
          >
            {t("openDashboard")}
          </Link>
        ) : (
          <div className={stacked ? "mt-4 flex items-center gap-4" : "contents"}>
            <Link href="/dashboard" className="gl-btn-primary" onClick={onNavigate}>
              {t("openDashboard")}
            </Link>
            <UserButton />
          </div>
        )}
      </SignedIn>
    </>
  );
}

