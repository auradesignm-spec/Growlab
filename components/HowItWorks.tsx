import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";
import { signUpHref } from "@/lib/auth/paths";

export default async function HowItWorks() {
  const t = await getTranslations("marketing.how");
  const steps = t.raw("steps") as readonly { n: string; title: string; text: string }[];

  return (
    <section id="how" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <div className="relative mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.n} className="h-full" delay={index * 70}>
              <div className="gl-glass gl-glass-hover flex h-full flex-col p-6 sm:p-8">
                <span className="font-mono text-[12px] text-frost-faint" aria-hidden="true">
                  {step.n}
                </span>
                <h3 className="mt-8 text-[20px] font-semibold leading-snug text-frost">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={signUpHref("merchant")} className="gl-btn-primary">
            {t("startMerchant")}
          </Link>
          <Link href={signUpHref("creator")} className="gl-btn-ghost">
            {t("startCreator")}
          </Link>
        </div>
      </div>
    </section>
  );
}
