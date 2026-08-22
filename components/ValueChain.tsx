"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";

export default function ValueChain() {
  const t = useTranslations("marketing.valueChain");
  const nodes = t.raw("nodes") as readonly { id: string; title: string; desc: string }[];
  const [active, setActive] = useState(0);

  return (
    <section id="value-chain" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-2xl text-balance text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <Reveal>
          <div className="mt-10 flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-0">
            {nodes.map((node, index) => {
              const isActive = active === index;
              const isLast = index === nodes.length - 1;

              return (
                <div
                  key={node.id}
                  className={`flex flex-col lg:flex-1 ${isLast ? "" : "lg:flex-row lg:items-center"}`}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    aria-pressed={isActive}
                    className={`px-3 py-2 text-start text-[14px] font-medium transition-colors duration-150 ease-out lg:text-center ${
                      isActive ? "text-frost" : "text-frost-dim hover:text-frost"
                    }`}
                  >
                    {node.title}
                  </button>
                  {!isLast && (
                    <div
                      className="mx-3 h-8 w-px bg-white/10 lg:mx-0 lg:h-px lg:w-full lg:flex-1"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal>
          <div className="gl-glass mt-8 p-6 sm:p-8">
            <p className="font-mono text-[12px] text-frost-faint">
              {String(active + 1).padStart(2, "0")} / {String(nodes.length).padStart(2, "0")}{" "}
              {nodes[active]?.title}
            </p>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-frost-dim">
              {nodes[active]?.desc}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
