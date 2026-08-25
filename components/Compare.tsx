"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

type Point = { title: string; us: string; them: string };

function Mark({ tone }: { tone: "good" | "bad" }) {
  return tone === "good" ? (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-ok" aria-hidden="true">
      <path d="m5 12 5 5 9-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-danger" aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Compare() {
  const t = useTranslations("marketing.compare");
  const points = t.raw("merchantPoints") as Point[];

  return (
    <section id="compare" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-2xl text-balance text-display-lg">{t("merchantHeading")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <StageGlow className="mt-8" tone="dusk">
          <div className="gl-stage p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {points.map((point) => (
              <article key={point.title} className="gl-tile flex h-full flex-col p-6">
                <div className="flex items-start gap-2">
                  <Mark tone="good" />
                  <h3 className="text-[14px] font-semibold leading-snug text-frost">{point.title}</h3>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-frost-dim">{point.us}</p>
                <div className="mt-4 flex items-start gap-2 border-t border-line pt-3">
                  <Mark tone="bad" />
                  <p className="text-[13px] leading-relaxed text-frost-faint">{point.them}</p>
                </div>
              </article>
            ))}
          </div>
          </div>
        </StageGlow>
      </div>
    </section>
  );
}
