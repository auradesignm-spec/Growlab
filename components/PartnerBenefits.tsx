import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

export default async function PartnerBenefits() {
  const t = await getTranslations("marketing.partners");
  const items = t.raw("items") as readonly { title: string; text: string }[];

  return (
    <section id="partners" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-2xl text-balance text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <StageGlow className="mt-10" tone="meadow">
          <div className="gl-stage p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {items.map((item) => (
              <Reveal key={item.title} className="h-full">
                <article className="gl-tile gl-tile-hover flex h-full flex-col p-6 sm:p-8">
                  <h3 className="text-[16px] font-semibold leading-snug text-frost">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-frost-dim">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          </div>
        </StageGlow>
      </div>
    </section>
  );
}
