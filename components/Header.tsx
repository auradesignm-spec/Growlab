"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import GlassBubbleTrack from "@/components/GlassBubbleTrack";
import { SIGN_IN_HREF } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";
import TourStartLink from "@/components/TourStartLink";
import GrowlabBrand from "@/components/brand/GrowlabBrand";
import HeaderUserMenu from "@/components/HeaderUserMenu";

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const STORY_HREFS = [
  { href: "/#how", key: "method" },
  { href: "/#proof", key: "proof" },
  { href: "/#pricing", key: "pricing" },
  { href: "/#faq", key: "faq" },
  { href: "/demo", key: "demo" },
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const menuId = useId();
  const closeMenu = useCallback(() => setOpen(false), []);
  const t = useTranslations("nav");

  useEffect(() => {
    let lastScrollY = typeof window !== "undefined" ? Math.max(0, window.scrollY) : 0;
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const delta = currentScrollY - lastScrollY;

      // Always show when near the very top
      if (currentScrollY <= 40) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
      } else if (Math.abs(delta) >= 8) {
        // Significant scroll down -> hide header
        if (delta > 0 && currentScrollY > 70) {
          setIsVisible(false);
        } else if (delta < 0) {
          // Any clear scroll up -> reveal header
          setIsVisible(true);
        }
        lastScrollY = currentScrollY;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={`fixed left-0 right-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 transition-all duration-300 ease-out will-change-transform ${
        isVisible || open
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="gl-nav-glass mx-auto flex h-14 max-w-wrap items-center justify-between gap-3 rounded-full ps-4 pe-2 sm:ps-6 sm:pe-2.5">
        <GrowlabBrand ariaLabel={t("homeAria")} />

        <GlassBubbleTrack className="hidden items-center md:flex" aria-label={t("mainNav")}>
          {STORY_HREFS.map((link) => (
            <a key={link.href} href={link.href} data-bubble-item className="gl-nav-link relative z-[1] px-3 py-1.5">
              {t(link.key)}
            </a>
          ))}
        </GlassBubbleTrack>

        <div className="hidden items-center gap-2 md:flex">
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data?.authenticated && data?.user) {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(null);
          }
          setAuthChecked(true);
        }
      })
      .catch(() => {
        if (isMounted) setAuthChecked(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const guest = compact ? (
    <TourStartLink
      href={SIGN_IN_HREF}
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
        source={stacked ? "header-mobile-menu" : "header"}
        onNavigate={() => {
          track("Sign In Started", { source: stacked ? "header-mobile-menu" : "header" });
          onNavigate?.();
        }}
        className="gl-btn-primary min-h-10 !py-2 !px-4 !text-[14px]"
      >
        {t("signIn")}
      </TourStartLink>
    </div>
  );

  // If user is authenticated via API session (e.g. Clerk or dev session)
  if (currentUser) {
    return <HeaderUserMenu initialUser={currentUser} compact={compact} onNavigate={onNavigate} />;
  }

  // If Clerk is enabled, handle via Clerk's SignedIn/SignedOut
  if (CLERK_ENABLED) {
    return (
      <>
        <SignedOut>{guest}</SignedOut>
        <SignedIn>
          <HeaderUserMenu compact={compact} onNavigate={onNavigate} />
        </SignedIn>
      </>
    );
  }

  return guest;
}

