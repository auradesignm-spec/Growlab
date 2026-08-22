"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { track } from "@/lib/analytics";

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
  const [audience, setAudience] = useState<"merchant" | "creator">("merchant");
  const heading = audience === "merchant" ? t("merchantHeading") : t("creatorHeading");
  const points = t.raw(audience === "merchant" ? "merchantPoints" : "creatorPoints") as Point[];

  return (
    <section id="compare" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-2xl text-balance text-display-lg">{heading}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-2">
          {(["merchant", "creator"] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={audience === id}
              onClick={() => {
                setAudience(id);
                track("Comparison Track Selected", { role: id });
              }}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-150 ease-out ${
                audience === id ? "bg-[#111318] text-white" : "border border-line bg-white text-[#111318]"
              }`}
            >
              {id === "merchant" ? t("merchantLabel") : t("creatorLabel")}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {points.map((point) => (
            <article key={point.title} className="gl-glass gl-glass-hover flex h-full flex-col p-6">
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
    </section>
  );
}
