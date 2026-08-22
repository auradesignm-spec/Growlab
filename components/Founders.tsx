import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";

export default async function Founders() {
  const t = await getTranslations("marketing.founders");

  return (
    <section id="founders" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 text-display-lg">{t("title")}</h2>
        </Reveal>

        <Reveal>
          <div className="gl-glass mt-10 grid grid-cols-1 items-start gap-10 p-6 sm:p-8 md:grid-cols-[1fr_1.3fr] md:gap-14">
            <div>
              <h3 className="text-xl font-semibold text-frost">{t("name")}</h3>
              <p className="mt-1 text-[14px] text-frost-dim">{t("role")}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="gl-pill">{t("pillSecurity")}</span>
                <span className="gl-pill">{t("pillMarketing")}</span>
              </div>
            </div>

            <div>
              <p className="mb-5 text-[16px] leading-relaxed text-frost-dim">{t("p1")}</p>
              <p className="mb-5 text-[16px] leading-relaxed text-frost-dim">{t("p2")}</p>
              <p className="mb-5 text-[16px] leading-relaxed text-frost-dim">{t("p3")}</p>
              <blockquote className="mt-6 border-s-2 border-frost ps-5 text-xl font-semibold text-frost">
                “{t("quote")}”
              </blockquote>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
