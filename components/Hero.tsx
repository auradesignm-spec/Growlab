"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { SIGN_IN_HREF, signUpHref } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";

const BILLS = [
  { src: 1, dx: -156, dy: -78, fall: 118, sway: 22, w: 38, delay: 0, spin: -18, dur: 2.4 },
  { src: 2, dx: 142, dy: -92, fall: 104, sway: -18, w: 34, delay: 180, spin: 22, dur: 3.15 },
  { src: 3, dx: -36, dy: -118, fall: 132, sway: 24, w: 36, delay: 420, spin: 8, dur: 2.7 },
  { src: 1, dx: 96, dy: 54, fall: 96, sway: -16, w: 30, delay: 90, spin: -14, dur: 3.45 },
  { src: 2, dx: -108, dy: 62, fall: 124, sway: 20, w: 32, delay: 310, spin: 16, dur: 2.55 },
  { src: 3, dx: 168, dy: 8, fall: 110, sway: -14, w: 28, delay: 540, spin: -26, dur: 3.0 },
  { src: 2, dx: -178, dy: -8, fall: 88, sway: 18, w: 30, delay: 150, spin: 28, dur: 2.85 },
  { src: 3, dx: 48, dy: 88, fall: 102, sway: -12, w: 32, delay: 390, spin: -10, dur: 3.3 },
  { src: 1, dx: -72, dy: -48, fall: 140, sway: 20, w: 26, delay: 70, spin: 19, dur: 2.5 },
  { src: 2, dx: 78, dy: -64, fall: 112, sway: -16, w: 28, delay: 260, spin: -21, dur: 3.6 },
  { src: 3, dx: -198, dy: 36, fall: 90, sway: 22, w: 34, delay: 480, spin: 12, dur: 2.65 },
  { src: 1, dx: 188, dy: -40, fall: 128, sway: -15, w: 26, delay: 210, spin: -30, dur: 3.2 },
  { src: 2, dx: 12, dy: 72, fall: 108, sway: 19, w: 30, delay: 600, spin: 25, dur: 2.35 },
  { src: 3, dx: -130, dy: -100, fall: 86, sway: -13, w: 24, delay: 330, spin: -8, dur: 3.5 },
  { src: 1, dx: 124, dy: 28, fall: 136, sway: 21, w: 36, delay: 40, spin: 17, dur: 2.95 },
  { src: 2, dx: -54, dy: 96, fall: 94, sway: -17, w: 28, delay: 450, spin: -24, dur: 2.75 },
  { src: 3, dx: 210, dy: 48, fall: 100, sway: 14, w: 24, delay: 120, spin: 11, dur: 3.4 },
  { src: 1, dx: -210, dy: -52, fall: 120, sway: -19, w: 32, delay: 370, spin: -16, dur: 2.6 },
  { src: 2, dx: 62, dy: -110, fall: 78, sway: 11, w: 22, delay: 520, spin: 29, dur: 3.1 },
  { src: 3, dx: -88, dy: 18, fall: 148, sway: -23, w: 34, delay: 240, spin: -12, dur: 2.8 },
] as const;

export default function Hero() {
  const t = useTranslations("marketing.hero");
  const locale = useLocale();
  const words = t("title").split(/\s+/).filter(Boolean);

  return (
    <section
      id="manifesto"
      className="relative overflow-hidden scroll-mt-24 px-5 pb-10 pt-32 sm:px-8 sm:pb-14 sm:pt-40"
    >
      <div className="gl-hero-cash" aria-hidden="true">
        {BILLS.map((bill, index) => (
          <span
            key={index}
            className="gl-bill"
            style={
              {
                "--dx": `${bill.dx}px`,
                "--dy": `${bill.dy}px`,
                "--fall": `${bill.fall}px`,
                "--sway": `${bill.sway}px`,
                "--turn": `${bill.spin > 0 ? 200 + bill.spin * 3 : -200 + bill.spin * 3}deg`,
                "--bill-w": `${bill.w}px`,
                "--bill-delay": `${bill.delay}ms`,
                "--path-dur": `${bill.dur}s`,
              } as CSSProperties
            }
          >
              <img src={`/hero-bill-${bill.src}.png`} alt="" />
          </span>
        ))}
      </div>

      <div className="relative z-[1] mx-auto max-w-wrap text-center">
        <h1
          key={locale}
          className="mx-auto max-w-3xl text-balance text-display-xl font-semibold"
          style={{ color: "#111318" }}
        >
          {words.map((word, index) => (
            <span key={`${locale}-${index}`} className="gl-word">
              <span className="gl-word-inner" style={{ animationDelay: `${90 + index * 78}ms` }}>
                {word}
              </span>
            </span>
          ))}
        </h1>
        <p className="gl-enter-2 mx-auto mt-4 max-w-lg text-[16px] leading-relaxed" style={{ color: "#5C6573" }}>
          {t("lede")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={signUpHref("merchant")}
            className="gl-btn-primary"
            onClick={() => track("Sign Up Started", { role: "merchant", source: "hero" })}
          >
            {t("ctaMerchant")}
          </a>
          <a
            href={signUpHref("creator")}
            className="gl-btn-ghost"
            onClick={() => track("Sign Up Started", { role: "creator", source: "hero" })}
          >
            {t("ctaCreator")}
          </a>
        </div>
        <p className="mt-4 text-[14px]" style={{ color: "#5C6573" }}>
          {t("hasAccount")}{" "}
          <a
            href={SIGN_IN_HREF}
            className="font-medium underline underline-offset-4"
            style={{ color: "#111318" }}
            onClick={() => track("Sign In Started", { source: "hero" })}
          >
            {t("signIn")}
          </a>
        </p>
      </div>
    </section>
  );
}
