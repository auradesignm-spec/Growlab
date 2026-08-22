import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";

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

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Reveal>
            <SplitCard
              title={t("merchantTitle")}
              subtitle={t("merchantSubtitle")}
              stat="62%"
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
    <article className={`gl-glass gl-glass-hover relative p-6 sm:p-8 ${featured ? "border-signal/40" : ""}`}>
      <h3 className="text-xl font-semibold text-frost">{title}</h3>
      <p className="mt-1 text-[14px] text-frost-dim">{subtitle}</p>
      <p className="mt-6 font-mono text-[32px] font-medium text-frost">{stat}</p>
      <p className="mb-6 text-[13px] text-frost-faint">{statNote}</p>

      <ul>
        {features.map((feature) => (
          <li key={feature} className="border-t border-white/10 py-2.5 text-[14px] text-frost-dim">
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}
