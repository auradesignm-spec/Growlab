import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";
import ProblemFigure, { type ProblemLabels } from "@/components/ProblemFigures";

const SPANS = [
  "sm:col-span-2 lg:col-span-2 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
] as const;

const FIGURES = ["relay", "swap", "vanity", "stake"] as const;

export default async function Problem() {
  const t = await getTranslations("marketing.problem");
  const items = t.raw("items") as readonly { num: string; title: string; text: string }[];
  const labels: ProblemLabels = {
    you: t("vizYou"),
    manager: t("vizManager"),
    team: t("vizTeam"),
    days: t("vizDays"),
    causeYou: t("vizCauseYou"),
    causeManager: t("vizCauseManager"),
    causeTeam: t("vizCauseTeam"),
    relayAria: t("vizRelayAria"),
    hint: t("vizHint"),
    wait: t("vizWait"),
    sold: t("vizSold"),
    run: t("vizRun"),
    reach: t("vizReach"),
    sales: t("vizSales"),
    fee: t("vizFee"),
    win: t("vizWin"),
    fail: t("vizFail"),
  };

  return (
    <section id="problem" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-2xl text-balance text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <StageGlow className="mt-10" tone="sky" drift>
          <div className="gl-stage p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
              <Reveal key={item.num} className={SPANS[index]}>
                <article className="gl-bento gl-tile gl-tile-hover flex h-full flex-col overflow-hidden">
                  <div
                    className={`flex items-center justify-center bg-night px-4 ${
                      index === 0 ? "min-h-[280px] flex-1 px-5 py-6 sm:px-8" : "h-[112px] pt-4"
                    }`}
                  >
                    <ProblemFigure kind={FIGURES[index]} labels={labels} />
                  </div>
                  <div className="flex flex-col justify-between px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
                    <div className="mb-4 font-mono text-[14px] text-frost-faint">{item.num}</div>
                    <div>
                      <h3 className="mb-2 text-[16px] font-semibold leading-snug text-frost">{item.title}</h3>
                      <p className="text-[14px] leading-relaxed text-frost-dim">{item.text}</p>
                    </div>
                  </div>
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
