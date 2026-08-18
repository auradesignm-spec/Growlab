import { Quote, HeartHandshake, ShieldCheck, Award } from "lucide-react";

export default function Founders() {
  return (
    <section id="founders" className="py-20 md:py-28 bg-[#E6E9E0]">
      <div className="mx-auto max-w-wrap px-5 md:px-6">
        
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* Left Column: Avatar & Trust Badge */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="eyebrow">من نحن ونهجنا</div>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-ink leading-tight mb-6">
              قصة شراكة حقيقية تضع مصلحتك أولاً
            </h2>

            {/* Founder Avatars */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-gold bg-ink font-display text-xl font-extrabold text-gold-soft shadow-lg"
                  style={{ color: "#E7CFA0" }}
                >
                  A
                </div>
                <div
                  className="-mr-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-gold bg-ink-2 font-display text-xl font-extrabold shadow-lg"
                  style={{ color: "#E7CFA0" }}
                >
                  M
                </div>
              </div>

              <div>
                <span className="block font-bold text-ink text-sm">المؤسسون والمطورون</span>
                <span className="text-xs text-muted">فريق عماني متخصص بالنمو الرقمي والأتمتة</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/80 px-4 py-2.5 text-xs text-ink shadow-xs">
              <ShieldCheck className="h-4 w-4 text-teal" />
              <span>التزام كامل بعدد محدود من الشركاء شهرياً لضمان الجودة القصوى</span>
            </div>
          </div>

          {/* Right Column: Founder Manifesto */}
          <div className="lg:col-span-7 rounded-2xl border border-line bg-white p-8 sm:p-10 shadow-sm relative">
            <Quote className="h-10 w-10 text-gold/20 absolute top-6 left-6" />

            <p className="text-base sm:text-lg text-ink leading-relaxed mb-5">
              نحن شابان بدأنا Growlab بدافع تجربة شخصية: رأينا كيف تخسر المتاجر ميزانياتها مع وكالات تسوق أوهامًا وتقارير بلا مبيعات.
            </p>

            <p className="text-sm sm:text-base text-muted leading-relaxed mb-6">
              قررنا بناء الشراكة التي نتمنى أن نراها لو كنا أصحاب مشاريع: تواصل مباشر ومستمر عبر واتساب، شفافية كاملة في كل ريال يصرف، ووكيل ذكاء اصطناعي لا ينام حتى لا تضيع منك أي مبيعة.
            </p>

            <div className="rounded-xl border-r-4 border-gold bg-paper p-5">
              <p className="font-display text-base sm:text-lg font-bold text-ink leading-snug">
                &ldquo;نحن لا نربح إلا إذا حققت مبيعات حقيقية.. هذه المعادلة الوحيدة العادلة.&rdquo;
              </p>
              <span className="mt-2 block font-mono text-xs text-muted">
                — فريق مؤسسي Growlab
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

