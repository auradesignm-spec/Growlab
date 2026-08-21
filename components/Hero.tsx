export default function Hero() {
  return (
    <section id="manifesto" className="relative overflow-hidden border-b border-obsidian">
      <div className="grid min-h-[92vh] grid-cols-1 lg:grid-cols-12">
        <div className="relative flex flex-col justify-end overflow-hidden px-5 pb-16 pt-20 sm:px-8 lg:col-span-8 lg:pb-20">
          <p className="issue-kicker animate-fade-in">Issue 01 · مسقط · 2026</p>

          <div className="relative mt-8">
            <span
              className="pointer-events-none absolute -top-8 start-0 font-west text-[12vw] font-thin uppercase leading-none text-obsidian/[0.07] lg:-top-16"
              aria-hidden="true"
            >
              GROW
            </span>
            <h1 className="relative z-10 animate-rise-slow">
              <span className="block font-display text-display-xl">وكالات تبيعك</span>
              <span className="mt-2 block font-display text-display-xl text-blood">خدمة.</span>
              <span className="relative mt-3 block font-west text-[clamp(2.4rem,8vw,7.2rem)] font-black uppercase leading-[0.8] tracking-tight">
                We share
                <em className="absolute -bottom-6 start-8 font-display text-[clamp(2rem,5vw,4.2rem)] font-bold not-italic text-obsidian mix-blend-multiply lg:start-24">
                  نتيجتك
                </em>
              </span>
            </h1>
          </div>

          <p className="animate-rise-slow mt-16 max-w-md text-[17px] leading-relaxed text-muted delay-200">
            نادي خاص لصنّاع المحتوى والتجار الذين ملّوا من الفاتورة الشهرية بلا دم. ندير ميتا،
            ونشغّل وكيلاً يقفل البيع — ودخلنا مربوط بنجاحك.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a href="#contact" className="btn-cut">
              طلب عضوية
            </a>
            <a href="#gallery" className="btn-ghost-cut">
              دخول المعرض
            </a>
          </div>
        </div>

        <aside className="relative flex min-h-[50vh] flex-col justify-between border-t border-obsidian bg-obsidian p-6 text-linen lg:col-span-4 lg:min-h-full lg:border-t-0 lg:border-s">
          <p className="font-west text-[10px] uppercase tracking-[0.4em] text-linen/50">
            Index / 04 notes
          </p>
          <ul className="mt-10 space-y-8">
            {[
              ["01", "تواصل مع المؤسسين", "لا مدير حساب، لا طوابير."],
              ["02", "ردّ على مدار الساعة", "الوكيل لا ينام على رسالة."],
              ["03", "دفتر مكشوف", "مبيعاتك ظاهرة، لا تقرير تجميل."],
              ["04", "نسبة من الدم", "نكسب إن كسبت. وإلا فلا."],
            ].map(([n, t, d]) => (
              <li key={n} className="border-t border-linen/20 pt-4">
                <span className="font-west text-[10px] tracking-[0.3em] text-blood">{n}</span>
                <h2 className="mt-2 font-display text-2xl leading-tight">{t}</h2>
                <p className="mt-1 font-serif text-sm italic text-linen/55">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-12 font-west text-[10px] uppercase tracking-[0.28em] text-linen/40">
            No retainers · No theatre
          </p>
        </aside>
      </div>
    </section>
  );
}
