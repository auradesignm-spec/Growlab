import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";
import LedgerPlayground from "@/components/LedgerPlayground";

export default async function LedgerPreview() {
  const t = await getTranslations("marketing.ledger");

  return (
    <section className="relative py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-xl text-balance text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4 max-w-xl">{t("lede")}</p>
        </Reveal>

        <Reveal>
          <StageGlow className="mt-8" tone="sun">
            <LedgerPlayground />
          </StageGlow>
        </Reveal>
      </div>
    </section>
  );
}
