export default function Founders() {
  return (
    <section id="founders" className="py-20" style={{ backgroundColor: "#E6E9E0" }}>
      <div className="mx-auto max-w-wrap px-6">
        <div className="eyebrow">مين إحنا</div>
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">قصتنا</h2>

        <div className="mt-10 grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.3fr] md:gap-14">
          <div className="flex">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-paper bg-ink font-display text-xl font-extrabold text-gold-soft" style={{ color: "#E7CFA0" }}>
              A
            </div>
            <div className="-mr-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-paper bg-ink font-display text-xl font-extrabold" style={{ color: "#E7CFA0" }}>
              M
            </div>
          </div>

          <div>
            <p className="mb-5 text-base text-muted">
              إحنا طالبين بسنة ثالثة، قررنا نبني الشراكة اللي كنا نتمناها لو كنا أصحاب مشروع: تواصل
              مباشر، شفافية كاملة، ومصلحة مشتركة.
            </p>
            <p className="mb-5 text-base text-muted">
              ما عندنا فريق ضخم ولا مكتب فخم — عندنا وقت كامل لكل عميل، وتقنية حديثة تعوض الفرق
              بالحجم.
            </p>
            <div className="mt-6 border-r-[3px] border-gold pr-5 font-display text-xl font-bold text-ink-3">
              "ما نكسب إلا لو كسبت. هذا كل الفرق."
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
