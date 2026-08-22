import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";

const SPANS = [
  "sm:col-span-2 lg:col-span-2 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
] as const;

export default async function Problem() {
  const t = await getTranslations("marketing.problem");
  const items = t.raw("items") as readonly { num: string; title: string; text: string }[];

  return (
    <section id="problem" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-2xl text-balance text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <Reveal key={item.num} className={SPANS[index]}>
              <article className="gl-glass gl-glass-hover flex h-full flex-col justify-between p-6 sm:p-8">
                <div className="mb-5 font-mono text-[14px] text-frost-faint">{item.num}</div>
                <div>
                  <h3 className="mb-3 text-[16px] font-semibold leading-snug text-frost">{item.title}</h3>
                  <p className="text-[14px] leading-relaxed text-frost-dim">{item.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
