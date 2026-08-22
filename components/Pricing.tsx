import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

export default async function Pricing() {
  const t = await getTranslations("marketing.pricing");
  const merchantFeatures = t.raw("merchantFeatures") as string[];
  const creatorFeatures = t.raw("creatorFeatures") as string[];

  return (
    <section id="pricing" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <StageGlow className="mt-10" tone="sun" place="start">
          <div className="gl-stage grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2">
          <Reveal>
            <SplitCard
              title={t("merchantTitle")}
              subtitle={t("merchantSubtitle")}
              stat={t("merchantStat")}
              statNote={t("merchantStatNote")}
              features={merchantFeatures}
            />
          </Reveal>

          <Reveal>
            <SplitCard
              title={t("creatorTitle")}
              subtitle={t("creatorSubtitle")}
              stat={t("creatorStat")}
              statNote={t("creatorStatNote")}
              features={creatorFeatures}
              featured
            />
          </Reveal>
        </div>
        </StageGlow>
      </div>
    </section>
  );
}

function SplitCard({
  title,
  subtitle,
  stat,
  statNote,
  features,
  featured = false,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly stat: string;
  readonly statNote: string;
  readonly features: readonly string[];
  readonly featured?: boolean;
}) {
  return (
    <article className={`gl-tile relative h-full p-6 sm:p-8 ${featured ? "bg-night" : ""}`}>
      <h3 className="text-xl font-semibold text-frost">{title}</h3>
      <p className="mt-1 text-[14px] text-frost-dim">{subtitle}</p>
      <p className="mt-6 font-mono text-[32px] font-medium text-frost">{stat}</p>
      <p className="mb-6 text-[13px] text-frost-faint">{statNote}</p>

      <ul>
        {features.map((feature) => (
          <li key={feature} className="border-t border-line py-2.5 text-[14px] text-frost-dim">
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}
