import GrowthLine from "@/components/GrowthLine";
import type { BadgeItem } from "@/lib/types";

const BADGES: readonly BadgeItem[] = [
  { title: "تواصل مباشر", desc: "مع المؤسسين، مو مدير حساب" },
  { title: "رد فوري 24/7", desc: "وكيل ذكاء اصطناعي يتابع كل عميل محتمل" },
  { title: "شفافية كاملة", desc: "لوحة تحكم حية بمبيعاتك وأرباحك" },
] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-section text-onDark">
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial-gold" aria-hidden="true" />
      <GrowthLine />

      <div className="container-wrap relative z-10">
        <div className="eyebrow eyebrow-light animate-fade-in">Growlab — شريك نمو رقمي</div>

        <h1 className="animate-fade-in animate-delay-100 max-w-3xl text-balance font-display text-display-lg font-extrabold">
          وكالات التسويق تبيعك خدمة.
          <br />
          إحنا <span className="text-gold-soft">نشاركك نتيجتك</span>.
        </h1>

        <p className="animate-fade-in animate-delay-200 mt-6 max-w-xl text-lg text-onDarkSoft md:text-xl">
          ندير إعلاناتك على ميتا، ونشغّل وكيل ذكاء اصطناعي يرد على عملائك ويساعد يقفل مبيعاتك على
          مدار الساعة. نجاحك هو دخلنا.
        </p>

        <div className="animate-fade-in animate-delay-300 mt-8 flex flex-wrap gap-3.5">
          <a href="#contact" className="btn-primary">
            احجز استشارة مجانية
          </a>
          <a href="#contact" className="btn-secondary">
            تواصل عبر واتساب
          </a>
        </div>

        <p className="mt-7 font-mono text-[13px] text-onDarkSoft">
          بدون عقود طويلة · نسبة من نتائجك، مو فاتورة ثابتة بس
        </p>

        <div className="mt-14 flex flex-col gap-4 border-t border-onDark/15 pt-5 md:flex-row md:gap-0">
          {BADGES.map((badge, index) => (
            <div
              key={badge.title}
              className={`flex-1 text-sm text-onDarkSoft transition-colors duration-250 md:px-4 md:first:ps-0 ${
                index > 0
                  ? "border-t border-onDark/15 pt-4 md:border-t-0 md:border-s md:border-onDark/15 md:pt-0"
                  : ""
              }`}
            >
              <strong className="mb-1 block font-mono text-sm text-onDark">{badge.title}</strong>
              {badge.desc}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
