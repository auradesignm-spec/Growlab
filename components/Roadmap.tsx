"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { signUpHref, type PartnerRole } from "@/lib/auth/paths";
import { track } from "@/lib/analytics";

interface Step {
  readonly n: string;
  readonly title: string;
  readonly text: string;
}

export default function Roadmap() {
  const t = useTranslations("marketing.roadmap");
  const [role, setRole] = useState<PartnerRole>("merchant");
  const [stepIndex, setStepIndex] = useState(0);

  const steps = t.raw(role === "merchant" ? "merchantSteps" : "creatorSteps") as Step[];
  const step = steps[stepIndex];
  const cta = role === "merchant" ? t("merchantCta") : t("creatorCta");

  const switchRole = (next: PartnerRole) => {
    setRole(next);
    setStepIndex(0);
    track("Roadmap Role Selected", { role: next });
  };

  return (
    <section id="roadmap" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-2">
          {(["merchant", "creator"] as PartnerRole[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => switchRole(id)}
              aria-pressed={role === id}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-150 ease-out ${
                role === id ? "bg-[#111318] text-white" : "border border-line bg-white text-[#111318]"
              }`}
            >
              {id === "merchant" ? t("merchantLabel") : t("creatorLabel")}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ol className="gl-glass flex flex-col p-3">
            {steps.map((item, index) => {
              const active = index === stepIndex;
              return (
                <li key={item.n}>
                  <button
                    type="button"
                    onClick={() => {
                      setStepIndex(index);
                      track("Roadmap Step Viewed", { role, step: index + 1 });
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-start transition-colors duration-150 ease-out ${
                      active ? "bg-[#F5F5F7] text-[#111318]" : "text-[#5C6573] hover:bg-[#F5F5F7]"
                    }`}
                  >
                    <span className="font-mono text-[12px]">{item.n}</span>
                    <span className="text-[14px] font-medium">{item.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="gl-glass flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="font-mono text-[12px] text-frost-faint">{step.n}</p>
              <h3 className="mt-3 text-[20px] font-semibold text-frost">{step.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-frost-dim">{step.text}</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={signUpHref(role)}
                className="gl-btn-primary"
                onClick={() => track("Sign Up Started", { role, source: "roadmap" })}
              >
                {cta}
              </Link>
              {stepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  className="gl-btn-ghost"
                  onClick={() => {
                    const next = stepIndex + 1;
                    setStepIndex(next);
                    track("Roadmap Step Viewed", { role, step: next + 1 });
                  }}
                >
                  {t("next")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
