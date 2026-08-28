import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";

export default async function TrustProof() {
  const t = await getTranslations("marketing.trust");
  const facts = t.raw("facts") as readonly { title: string; text: string }[];

  return (
    <section id="proof" className="relative scroll-mt-24 pb-10 pt-2 sm:pb-14" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 id="trust-heading" className="gl-heading mt-2 max-w-2xl text-balance">
            {t("title")}
          </h2>
          <p className="gl-lede mt-3 max-w-2xl">{t("lede")}</p>
        </Reveal>

        <p className="mt-8 text-[13px] font-semibold text-frost">{t("pathsEyebrow")}</p>
        <Reveal stagger className="mt-3">
          <ul data-guide="proof-paths" className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:auto-rows-fr">
            {(t.raw("paths") as readonly { title: string; text: string }[]).map((path) => (
              <li key={path.title} className="gl-tile gl-tile-hover flex h-full flex-col rounded-2xl p-5 sm:p-6">
                <h3 className="text-[15px] font-semibold leading-snug text-frost">{path.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{path.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal stagger className="mt-4">
          <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:auto-rows-fr">
            {facts.map((fact, index) => (
              <li
                key={fact.title}
                className={`gl-tile gl-tile-hover flex h-full flex-col rounded-2xl p-5 sm:p-6${index === facts.length - 1 && facts.length % 2 === 1 ? " sm:col-span-2" : ""}`}
              >
                <p className="text-[15px] font-semibold leading-snug text-frost">{fact.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{fact.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <p className="mt-6 text-[14px] font-normal text-frost-faint">{t("served")}</p>
      </div>
    </section>
  );
}
