import GrowthLine from "@/components/GrowthLine";

const badges = [
  { title: "تواصل مباشر", desc: "مع المؤسسين، مو مدير حساب" },
  { title: "رد فوري 24/7", desc: "وكيل ذكاء اصطناعي يتابع كل عميل محتمل" },
  { title: "شفافية كاملة", desc: "لوحة تحكم حية بمبيعاتك وأرباحك" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-onDark md:py-28">
      <GrowthLine />
      <div className="relative z-10 mx-auto max-w-wrap px-6">
        <div className="eyebrow">Growlab — شريك نمو رقمي</div>
        <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight md:text-6xl">
          وكالات التسويق تبيعك خدمة.
          <br />
          إحنا <span className="text-gold-soft" style={{ color: "#E7CFA0" }}>نشاركك نتيجتك</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-onDarkSoft md:text-xl">
          ندير إعلاناتك على ميتا، ونشغّل وكيل ذكاء اصطناعي يرد على عملائك ويساعد يقفل مبيعاتك على
          مدار الساعة. نجاحك هو دخلنا.
        </p>

        <div className="mt-8 flex flex-wrap gap-3.5">
          <a
            href="#contact"
            className="rounded-full bg-gold px-6 py-3.5 text-[15px] font-semibold text-[#241A08] transition-transform active:scale-95"
          >
            احجز استشارة مجانية
          </a>
          <a
            href="#contact"
            className="rounded-full border border-onDarkSoft/40 px-6 py-3.5 text-[15px] font-semibold text-onDark transition-transform active:scale-95"
          >
            تواصل عبر واتساب
          </a>
        </div>

        <div className="mt-7 font-mono text-[13px] text-onDarkSoft">
          بدون عقود طويلة · نسبة من نتائجك، مو فاتورة ثابتة بس
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-onDark/15 pt-5 md:flex-row md:gap-0">
          {badges.map((b, i) => (
            <div
              key={b.title}
              className={`flex-1 text-sm text-onDarkSoft md:px-4 md:first:pr-0 ${
                i > 0 ? "border-t border-onDark/15 pt-4 md:border-t-0 md:border-r md:pt-0" : ""
              }`}
            >
              <b className="mb-1 block font-mono text-sm text-onDark">{b.title}</b>
              {b.desc}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
