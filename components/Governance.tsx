import { getTranslations } from "next-intl/server";
import Reveal from "@/components/Reveal";

type GovernanceIcon = "floor" | "lock" | "clock" | "ledger" | "shield" | "link";

function ItemIcon({ icon }: { icon: GovernanceIcon }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5 shrink-0 text-frost-dim",
    "aria-hidden": true,
  };

  switch (icon) {
    case "floor":
      return (
        <svg {...common}>
          <path d="M4 19h16" />
          <path d="M7 19v-5.5M12 19V8M17 19v-9" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5.5" y="11" width="13" height="9" rx="1.5" />
          <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4.2l3 2" />
        </svg>
      );
    case "ledger":
      return (
        <svg {...common}>
          <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
          <path d="M8.3 8h7.4M8.3 12h7.4M8.3 16h4.5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3.5 19 6.3v5.4c0 4.4-2.9 7.4-7 8.8-4.1-1.4-7-4.4-7-8.8V6.3z" />
          <path d="M9 12.5 12 9M9 9l3 3.5" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M14.5 4 17 6.5 14.5 9M9.5 15l2.5 2.5-2.5 2.5" />
          <path d="M4 6.5h9.6M10.4 17.5H20" />
        </svg>
      );
  }
}

export default async function Governance() {
  const t = await getTranslations("marketing.governance");
  const items = t.raw("items") as readonly { icon: GovernanceIcon; title: string; text: string }[];

  return (
    <section id="governance" className="relative scroll-mt-24 py-section">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <Reveal>
          <p className="gl-eyebrow">{t("eyebrow")}</p>
          <h2 className="gl-heading mt-2 max-w-2xl text-balance text-display-lg">{t("title")}</h2>
          <p className="gl-lede mt-4">{t("lede")}</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <Reveal key={item.title} className="h-full">
              <article className="gl-glass gl-glass-hover flex h-full items-start gap-4 p-6 sm:p-8">
                <ItemIcon icon={item.icon} />
                <div>
                  <h3 className="text-[16px] font-semibold leading-snug text-frost">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{item.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
