"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import GlassBubbleTrack from "@/components/GlassBubbleTrack";
import { SIGN_IN_HREF } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";
import TourStartLink from "@/components/TourStartLink";
import GrowlabBrand from "@/components/brand/GrowlabBrand";
import HeaderUserMenu from "@/components/HeaderUserMenu";

const COMPACT_AUTH_LINK_CLASS =
  "group relative z-[1] inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[15px] font-medium min-w-[100px] overflow-hidden";

const PRIMARY_AUTH_LINK_CLASS =
  "group relative gl-btn-primary min-h-10 !py-2 !px-5 !text-[14px] min-w-[124px] overflow-hidden inline-flex items-center justify-center";

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
      className={`fixed left-0 right-0 top-0 z-50 px-2 xs:px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-6 transition-all duration-300 ease-out will-change-transform ${
        isVisible || open
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="gl-nav-glass mx-auto flex h-12 sm:h-14 max-w-wrap items-center justify-between gap-2 sm:gap-3 rounded-full ps-3 pe-1.5 sm:ps-6 sm:pe-2.5">
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
            className="gl-nav-glass gl-nav-sheet relative z-50 mx-auto mt-2 w-full max-w-wrap rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-3 sm:py-4 md:hidden"
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
  const [isGuestFueling, setIsGuestFueling] = useState(false);
  const [isGuestClimax, setIsGuestClimax] = useState(false);
  const [showGuestShockwave, setShowGuestShockwave] = useState(false);
  const [guestPopups, setGuestPopups] = useState<
    Array<{ id: number; text: string; x: number; rot: number }>
  >([]);
  const guestFuelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const guestClimaxIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const spawnGuestParticle = useCallback((customText?: string) => {
    const symbols = ["+OMR", "OMR", "+OMR 50", "+OMR 100", "+100%", "+OMR 500"];
    const text = customText || symbols[Math.floor(Math.random() * symbols.length)];
    const newPop = {
      id: Date.now() + Math.random(),
      text,
      x: (Math.random() - 0.5) * 50,
      rot: (Math.random() - 0.5) * 35,
    };
    setGuestPopups((prev) => [...prev.slice(-12), newPop]);
    setTimeout(() => {
      setGuestPopups((prev) => prev.filter((p) => p.id !== newPop.id));
    }, 1000);
  }, []);

  useEffect(() => {
    const handleFuel = () => {
      setIsGuestFueling(true);
      spawnGuestParticle();

      if (guestFuelTimeoutRef.current) clearTimeout(guestFuelTimeoutRef.current);
      guestFuelTimeoutRef.current = setTimeout(() => {
        setIsGuestFueling(false);
      }, 1600);
    };

    const handleClimax = (e: Event) => {
      const customEvent = e as CustomEvent<{ durationMs?: number }>;
      const duration = customEvent.detail?.durationMs || 1850;

      setIsGuestFueling(true);
      setIsGuestClimax(true);
      setShowGuestShockwave(true);

      let count = 0;
      if (guestClimaxIntervalRef.current) clearInterval(guestClimaxIntervalRef.current);
      guestClimaxIntervalRef.current = setInterval(() => {
        spawnGuestParticle();
        count++;
        if (count > 10) {
          if (guestClimaxIntervalRef.current) clearInterval(guestClimaxIntervalRef.current);
        }
      }, 120);

      setTimeout(() => {
        setIsGuestClimax(false);
        setIsGuestFueling(false);
        setShowGuestShockwave(false);
        if (guestClimaxIntervalRef.current) clearInterval(guestClimaxIntervalRef.current);
      }, duration);
    };

    window.addEventListener("money-fuel-pulse", handleFuel);
    window.addEventListener("money-fuel-climax", handleClimax);
    return () => {
      window.removeEventListener("money-fuel-pulse", handleFuel);
      window.removeEventListener("money-fuel-climax", handleClimax);
      if (guestFuelTimeoutRef.current) clearTimeout(guestFuelTimeoutRef.current);
      if (guestClimaxIntervalRef.current) clearInterval(guestClimaxIntervalRef.current);
    };
  }, [spawnGuestParticle]);

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
    <div className="relative inline-block">
      {/* Luminous Emerald Shockwave on 100% Full Tank */}
      {showGuestShockwave && (
        <span
          className="gl-fuel-shockwave-ring pointer-events-none absolute inset-0 rounded-full z-40 border border-emerald-400"
          aria-hidden="true"
        />
      )}

      {/* Floating Fuel Status HUD Badge */}
      {isGuestClimax && (
        <div
          className="gl-fuel-status-badge pointer-events-none absolute -top-8 left-1/2 z-50 whitespace-nowrap"
          aria-hidden="true"
        >
          <div className="flex items-center gap-1 rounded-full bg-slate-950/95 border border-emerald-400 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 shadow-[0_4px_16px_rgba(16,185,129,0.5)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>100% FUELLED</span>
          </div>
        </div>
      )}

      {guestPopups.map((popup) => (
        <div
          key={popup.id}
          className="gl-fuel-dollar pointer-events-none absolute -top-3 left-1/2 z-50 flex items-center justify-center font-black text-emerald-600 text-[11px]"
          style={{
            ["--pop-x" as string]: `${popup.x}px`,
            ["--pop-rot" as string]: `${popup.rot}deg`,
          }}
        >
          <span className="rounded-full bg-emerald-100/95 border border-emerald-400 px-1.5 py-0.5 text-[9px] text-emerald-800 font-extrabold shadow-sm">
            {popup.text}
          </span>
        </div>
      ))}
      <TourStartLink
        href={SIGN_IN_HREF}
        id="header-user-menu-trigger"
        source="header-mobile"
        bubble
        onNavigate={() => {
          track("Sign In Started", { source: "header-mobile" });
          onNavigate?.();
        }}
        className={`${COMPACT_AUTH_LINK_CLASS} ${
          isGuestClimax
            ? "gl-tank-climax !bg-gradient-to-r !from-emerald-500 !via-green-400 !to-teal-400 !text-white !border-emerald-300 !shadow-[0_0_35px_rgba(16,185,129,1)] ring-4 ring-emerald-400/60"
            : isGuestFueling
            ? "gl-tank-active !bg-gradient-to-r !from-emerald-500 !via-green-400 !to-teal-500 !text-white !border-emerald-300 !shadow-[0_0_25px_rgba(16,185,129,0.9)]"
            : ""
        }`}
      >
        {/* Normal Text */}
        <span className="transition-all duration-300 ease-out group-hover:opacity-0 group-hover:scale-75 group-hover:-translate-y-1">
          {t("signIn")}
        </span>

        {/* Hover Login Icon */}
        <span
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 scale-50 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M9 3.5h7.5A3 3 0 0 1 19.5 6.5v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-1.5" />
            <path d="M6 8V6.5A3 3 0 0 1 9 3.5" />
            <g className="group-hover-login-arrow">
              <path d="M2.5 12h11" />
              <path d="M9.5 8l4 4-4 4" />
            </g>
          </svg>
        </span>
      </TourStartLink>
    </div>
  ) : (
    <div className={stacked ? "mt-4 flex flex-col items-start gap-3" : "relative inline-block"}>
      {/* Luminous Emerald Shockwave on 100% Full Tank */}
      {showGuestShockwave && (
        <span
          className="gl-fuel-shockwave-ring pointer-events-none absolute inset-0 rounded-full z-40 border border-emerald-400"
          aria-hidden="true"
        />
      )}

      {/* Floating Fuel Status HUD Badge */}
      {isGuestClimax && (
        <div
          className="gl-fuel-status-badge pointer-events-none absolute -top-8 left-1/2 z-50 whitespace-nowrap"
          aria-hidden="true"
        >
          <div className="flex items-center gap-1 rounded-full bg-slate-950/95 border border-emerald-400 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 shadow-[0_4px_16px_rgba(16,185,129,0.5)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>خزان الامتثال 100% | حماية شاملة</span>
          </div>
        </div>
      )}

      {guestPopups.map((popup) => (
        <div
          key={popup.id}
          className="gl-fuel-dollar pointer-events-none absolute -top-3 left-1/2 z-50 flex items-center justify-center font-black text-emerald-600 text-[11px]"
          style={{
            ["--pop-x" as string]: `${popup.x}px`,
            ["--pop-rot" as string]: `${popup.rot}deg`,
          }}
        >
          <span className="rounded-full bg-emerald-100/95 border border-emerald-400 px-1.5 py-0.5 text-[10px] text-emerald-800 font-extrabold shadow-sm">
            {popup.text}
          </span>
        </div>
      ))}
      <TourStartLink
        href={SIGN_IN_HREF}
        id="header-user-menu-trigger"
        source={stacked ? "header-mobile-menu" : "header"}
        onNavigate={() => {
          track("Sign In Started", { source: stacked ? "header-mobile-menu" : "header" });
          onNavigate?.();
        }}
        className={`${PRIMARY_AUTH_LINK_CLASS} ${
          isGuestClimax
            ? "gl-tank-climax !bg-gradient-to-r !from-emerald-500 !via-green-400 !to-teal-400 !text-white !border-emerald-300 !shadow-[0_0_45px_rgba(16,185,129,1),0_0_20px_rgba(52,211,153,1)] ring-4 ring-emerald-400/60"
            : isGuestFueling
            ? "gl-tank-active !bg-gradient-to-r !from-emerald-500 !via-green-400 !to-teal-500 !text-white !border-emerald-300 !shadow-[0_0_30px_rgba(16,185,129,0.9),0_0_12px_rgba(52,211,153,1)] ring-4 ring-emerald-400/50"
            : ""
        }`}
      >
        {/* Normal Text: Fades and scales down smoothly on hover */}
        <span className="transition-all duration-300 ease-out group-hover:opacity-0 group-hover:scale-75 group-hover:-translate-y-1 inline-block">
          {t("signIn")}
        </span>

        {/* Hover Login Icon: Appears in center and arrow bounces twice */}
        <span
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 scale-50 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 text-white"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            {/* Rounded portal door outline from image */}
            <path d="M9 3.5h7.5A3 3 0 0 1 19.5 6.5v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-1.5" />
            <path d="M6 8V6.5A3 3 0 0 1 9 3.5" />
            {/* Arrow entering with double bounce */}
            <g className="group-hover-login-arrow">
              <path d="M2.5 12h11" />
              <path d="M9.5 8l4 4-4 4" />
            </g>
          </svg>
        </span>
      </TourStartLink>
    </div>
  );

  // If user is authenticated via API session (e.g. Clerk or dev session)
  if (currentUser) {
    return <HeaderUserMenu initialUser={currentUser} compact={compact} onNavigate={onNavigate} />;
  }

  // Always render the sign-in CTA right away. Gating it behind Clerk's
  // <SignedOut> made the header button vanish whenever the Clerk client
  // never resolved in the visitor's browser (publishable key baked in at
  // build time but unreachable/invalid at runtime), leaving the header
  // with no CTA at all. The session fetch above already swaps in the user
  // menu for signed-in users, so the Clerk gate added nothing but risk.
  return guest;
}

