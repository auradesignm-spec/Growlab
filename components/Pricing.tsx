import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";
import TourStartLink from "@/components/TourStartLink";
import { enterHref } from "@/lib/auth/paths";

export default async function Pricing() {
  const t = await getTranslations("marketing.pricing");

  const freeFeatures = t.raw("freeFeatures") as string[];
  const proFeatures = t.raw("proFeatures") as string[];

  return (
    <section id="pricing" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <StageGlow className="mt-10" tone="sun" place="start">
          <div className="gl-stage grid gap-3 p-3 sm:grid-cols-2 sm:p-4">
            <Reveal>
              <PlanCard
                title={t("freeTitle")}
                subtitle={t("freeSubtitle")}
                stat={t("freeStat")}
                statNote={t("freeStatNote")}
                features={freeFeatures}
                cta={t("cta")}
                href={enterHref("merchant")}
              />
            </Reveal>
            <Reveal delay={80}>
              <PlanCard
                title={t("proTitle")}
                subtitle={t("proSubtitle")}
                stat={t("proStat")}
                statNote={t("proStatNote")}
                features={proFeatures}
                cta={t("cta")}
                href={enterHref("merchant")}
                highlight
              />
            </Reveal>
          </div>
        </StageGlow>

        <Reveal delay={120}>
          <p className="mt-8 max-w-2xl text-[14px] text-frost-dim">{t("performanceNote")}</p>
        </Reveal>
      </div>
    </section>
  );
}

function PlanCard({
  title,
  subtitle,
  stat,
  statNote,
  features,
  highlight,
  cta,
  href,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly stat: string;
  readonly statNote: string;
  readonly features: readonly string[];
  readonly highlight?: boolean;
  readonly cta: string;
  readonly href: string;
}) {
  return (
    <article
      data-guide={highlight ? "pricing" : undefined}
      className={`gl-tile relative flex h-full flex-col p-6 sm:p-8 ${highlight ? "ring-1 ring-signal/30" : ""}`}
    >
      <h3 className="text-xl font-semibold text-frost">{title}</h3>
      <p className="mt-1 text-[14px] text-frost-dim">{subtitle}</p>
      <p className="mt-6 font-mono text-[32px] font-medium text-frost">{stat}</p>
      <p className="mb-6 text-[13px] text-frost-faint">{statNote}</p>

      <ul className="flex-1">
        {features.map((feature) => (
          <li key={feature} className="border-t border-line py-2.5 text-[14px] text-frost-dim">
            {feature}
          </li>
        ))}
      </ul>
      <TourStartLink
        href={href}
        source={highlight ? "pricing-pro" : "pricing-free"}
        className={`mt-6 inline-flex ${highlight ? "gl-btn-primary" : "gl-btn-ghost"}`}
      >
        {cta}
      </TourStartLink>
    </article>
  );
}
