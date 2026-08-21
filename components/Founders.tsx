export default function Founders() {
  return (
    <section id="founders" className="section-padding-sm bg-paper-alt">
      <div className="container-wrap">
        <div className="eyebrow">مين إحنا</div>
        <h2 className="section-heading">قصتنا</h2>

        <div className="mt-10 grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.3fr] md:gap-14">
          <div className="flex" aria-hidden="true">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-paper bg-ink font-display text-xl font-extrabold text-gold-soft">
              A
            </div>
            <div className="-ms-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-paper bg-ink font-display text-xl font-extrabold text-gold-soft">
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
            <blockquote className="mt-6 border-s-[3px] border-gold ps-5 font-display text-xl font-bold text-ink-3">
              &ldquo;ما نكسب إلا لو كسبت. هذا كل الفرق.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
