"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { ENTER_HREF } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";

const BILLS = [
  { src: 1, dx: -168, dy: -64, fall: 88, sway: 18, w: 38, delay: 0, spin: -18, dur: 2.4 },
  { src: 2, dx: 154, dy: -78, fall: 82, sway: -16, w: 34, delay: 180, spin: 22, dur: 3.15 },
  { src: 3, dx: -42, dy: -102, fall: 96, sway: 20, w: 36, delay: 420, spin: 8, dur: 2.7 },
  { src: 1, dx: 108, dy: 48, fall: 72, sway: -14, w: 30, delay: 90, spin: -14, dur: 3.45 },
  { src: 2, dx: -118, dy: 56, fall: 92, sway: 16, w: 32, delay: 310, spin: 16, dur: 2.55 },
  { src: 3, dx: 176, dy: 10, fall: 84, sway: -12, w: 28, delay: 540, spin: -26, dur: 3.0 },
  { src: 2, dx: -188, dy: -8, fall: 68, sway: 16, w: 30, delay: 150, spin: 28, dur: 2.85 },
  { src: 3, dx: 56, dy: 76, fall: 78, sway: -10, w: 32, delay: 390, spin: -10, dur: 3.3 },
  { src: 1, dx: -80, dy: -42, fall: 104, sway: 16, w: 26, delay: 70, spin: 19, dur: 2.5 },
  { src: 2, dx: 86, dy: -56, fall: 86, sway: -14, w: 28, delay: 260, spin: -21, dur: 3.6 },
  { src: 3, dx: -204, dy: 32, fall: 70, sway: 18, w: 34, delay: 480, spin: 12, dur: 2.65 },
  { src: 1, dx: 196, dy: -36, fall: 94, sway: -13, w: 26, delay: 210, spin: -30, dur: 3.2 },
  { src: 2, dx: 14, dy: 64, fall: 80, sway: 16, w: 30, delay: 600, spin: 25, dur: 2.35 },
  { src: 3, dx: -142, dy: -88, fall: 66, sway: -11, w: 24, delay: 330, spin: -8, dur: 3.5 },
  { src: 1, dx: 132, dy: 24, fall: 100, sway: 18, w: 36, delay: 40, spin: 17, dur: 2.95 },
  { src: 2, dx: -60, dy: 84, fall: 72, sway: -14, w: 28, delay: 450, spin: -24, dur: 2.75 },
  { src: 3, dx: 216, dy: 42, fall: 76, sway: 12, w: 24, delay: 120, spin: 11, dur: 3.4 },
  { src: 1, dx: -220, dy: -46, fall: 90, sway: -16, w: 32, delay: 370, spin: -16, dur: 2.6 },
  { src: 2, dx: 70, dy: -96, fall: 60, sway: 10, w: 22, delay: 520, spin: 29, dur: 3.1 },
  { src: 3, dx: -96, dy: 16, fall: 110, sway: -20, w: 34, delay: 240, spin: -12, dur: 2.8 },
] as const;

function isCashWord(word: string, locale: string): boolean {
  const clean = word.replace(/[^\p{L}]/gu, "").toLowerCase();
  return locale === "ar" ? clean === "اربح" : clean === "earn";
}

export default function Hero() {
  const t = useTranslations("marketing.hero");
  const locale = useLocale();
  const words = t("title").split(/\s+/).filter(Boolean);

  return (
    <section
      id="manifesto"
      className="relative overflow-hidden scroll-mt-24 pb-8 pt-20 sm:pb-10 sm:pt-28"
    >
      <div className="relative z-[1] mx-auto max-w-wrap px-5 sm:px-8">
        <div className="relative max-w-4xl overflow-hidden px-3 pt-20 sm:px-4 sm:pt-24">
          <h1
            key={locale}
            className="gl-hero-title relative z-[1] text-start font-semibold text-frost"
          >
            {words.map((word, index) => {
              const cashWord = isCashWord(word, locale);
              return (
                <span key={`${locale}-${index}`} className={cashWord ? "gl-word-cash" : undefined}>
                  {cashWord ? (
                    <span className="gl-hero-cash" aria-hidden="true">
                      {BILLS.map((bill, billIndex) => (
                        <span
                          key={billIndex}
                          className="gl-bill"
                          style={
                            {
                              "--dx": `${bill.dx * 0.78}px`,
                              "--dy": `${bill.dy * 0.72}px`,
                              "--fall": `${bill.fall * 0.7}px`,
                              "--sway": `${bill.sway * 0.85}px`,
                              "--turn": `${bill.spin > 0 ? 200 + bill.spin * 3 : -200 + bill.spin * 3}deg`,
                              "--bill-w": `${Math.round(bill.w * 1.15)}px`,
                              "--bill-delay": `${bill.delay}ms`,
                              "--path-dur": `${bill.dur}s`,
                            } as CSSProperties
                          }
                        >
                          <img src={`/hero-bill-${bill.src}.png`} alt="" />
                        </span>
                      ))}
                    </span>
                  ) : null}
                  <span className="gl-word">
                    <span className="gl-word-inner" style={{ animationDelay: `${90 + index * 78}ms` }}>
                      {word}
                    </span>
                  </span>
                </span>
              );
            })}
          </h1>
          <p className="gl-enter-2 relative z-[1] mt-6 max-w-md text-start text-[16px] leading-relaxed text-frost-dim">
            {t("lede")}
          </p>
          <div className="relative z-[1] mt-6 flex flex-wrap items-center justify-start gap-3">
            <a
              href={ENTER_HREF}
              className="gl-btn-primary"
              onClick={() => track("Sign Up Started", { source: "hero-earn" })}
            >
              {t("startEarning")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
