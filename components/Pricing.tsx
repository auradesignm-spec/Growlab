import type { PricingFeature } from "@/lib/types";

const STARTER_FEATURES: readonly PricingFeature[] = [
  { text: "فيديو تسويقي واحد شهريًا" },
  { text: "إدارة كاملة لحملة إعلانات ميتا" },
  { text: "وكيل ذكاء اصطناعي أساسي للرد على العملاء" },
  { text: "بدون عقد طويل — إلغاء بأي وقت" },
] as const;

const PARTNER_FEATURES: readonly PricingFeature[] = [
  { text: "2–3 فيديوهات تسويقية شهريًا" },
  { text: "وكيل ذكاء اصطناعي متقدم ومدرّب على منتجك" },
  { text: "تقرير أسبوعي مباشر من المؤسسين" },
  { text: "نسبة من المبيعات مضافة للاشتراك" },
] as const;

export default function Pricing() {
  return (
    <section id="pricing" className="section-padding bg-paper-alt">
      <div className="container-wrap">
        <div className="eyebrow">الباقات</div>
        <h2 className="section-heading">تبدأ معنا بدون مخاطرة</h2>
        <p className="section-lead">
          شهر بشهر، بدون التزام طويل. تكبر معانا لما تشوف النتيجة.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <PricingCard
            title="باقة الانطلاق"
            subtitle="مناسبة لأول تجربة حقيقية"
            price="150–250$"
            note="شهريًا · ميزانية الإعلانات يديرها التاجر مباشرة"
            features={STARTER_FEATURES}
          />

          <PricingCard
            title="باقة الشراكة"
            subtitle="الخيار الأقوى لنمو حقيقي"
            price="300–500$ + نسبة"
            note="شهريًا · التزام ٣ أشهر قابل للتجديد"
            features={PARTNER_FEATURES}
            featured
          />
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly price: string;
  readonly note: string;
  readonly features: readonly PricingFeature[];
  readonly featured?: boolean;
}

function PricingCard({ title, subtitle, price, note, features, featured = false }: PricingCardProps) {
  return (
    <article
      className={`card-interactive relative p-8 ${
        featured ? "border-2 border-gold ring-1 ring-gold/20" : ""
      }`}
    >
      {featured && (
        <div className="absolute -top-3.5 end-7 rounded-pill bg-gold px-3.5 py-1.5 text-xs font-semibold text-goldText">
          الأكثر طلبًا
        </div>
      )}

      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1.5 text-[14.5px] text-muted">{subtitle}</p>
      <p className="mt-6 font-mono text-[30px] font-medium">{price}</p>
      <p className="mb-6 text-[13px] text-muted">{note}</p>

      <ul>
        {features.map((feature) => (
          <li
            key={feature.text}
            className="flex items-baseline gap-2.5 border-t border-line py-2.5 text-[14.5px] transition-colors duration-250 hover:text-ink_text"
          >
            <span className="font-mono text-gold" aria-hidden="true">
              —
            </span>
            {feature.text}
          </li>
        ))}
      </ul>
    </article>
  );
}
