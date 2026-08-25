import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";

export default async function Faq() {
  const t = await getTranslations("marketing.faq");
  const items = t.raw("items") as readonly { q: string; a: string }[];

  return (
    <section id="faq" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 text-display-lg">{t("title")}</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Reveal key={item.q}>
              <article className="gl-tile h-full p-6">
                <h3 className="text-[17px] font-semibold text-frost">{item.q}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{item.a}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
