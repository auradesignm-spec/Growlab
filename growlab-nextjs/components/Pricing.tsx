const starter = [
  "فيديو تسويقي واحد شهريًا",
  "إدارة كاملة لحملة إعلانات ميتا",
  "وكيل ذكاء اصطناعي أساسي للرد على العملاء",
  "بدون عقد طويل — إلغاء بأي وقت",
];

const partner = [
  "2–3 فيديوهات تسويقية شهريًا",
  "وكيل ذكاء اصطناعي متقدم ومدرّب على منتجك",
  "تقرير أسبوعي مباشر من المؤسسين",
  "نسبة من المبيعات مضافة للاشتراك",
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-paper-alt py-20 md:py-24" style={{ backgroundColor: "#E6E9E0" }}>
      <div className="mx-auto max-w-wrap px-6">
        <div className="eyebrow">الباقات</div>
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">تبدأ معنا بدون مخاطرة</h2>
        <p className="mt-3.5 max-w-xl text-lg text-muted">
          شهر بشهر، بدون التزام طويل. تكبر معانا لما تشوف النتيجة.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-card border border-line bg-white p-8">
            <h3 className="text-xl font-bold">باقة الانطلاق</h3>
            <div className="mt-1.5 text-[14.5px] text-muted">مناسبة لأول تجربة حقيقية</div>
            <div className="mt-6 font-mono text-[30px] font-medium">150–250$</div>
            <div className="mb-6 text-[13px] text-muted">
              شهريًا · ميزانية الإعلانات يديرها التاجر مباشرة
            </div>
            <ul>
              {starter.map((it) => (
                <li
                  key={it}
                  className="flex items-baseline gap-2.5 border-t border-line py-2.5 text-[14.5px]"
                >
                  <span className="font-mono text-gold">—</span>
                  {it}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-card border-2 border-gold bg-white p-8">
            <div className="absolute -top-3.5 right-7 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-[#241A08]">
              الأكثر طلبًا
            </div>
            <h3 className="text-xl font-bold">باقة الشراكة</h3>
            <div className="mt-1.5 text-[14.5px] text-muted">الخيار الأقوى لنمو حقيقي</div>
            <div className="mt-6 font-mono text-[30px] font-medium">300–500$ + نسبة</div>
            <div className="mb-6 text-[13px] text-muted">شهريًا · التزام ٣ أشهر قابل للتجديد</div>
            <ul>
              {partner.map((it) => (
                <li
                  key={it}
                  className="flex items-baseline gap-2.5 border-t border-line py-2.5 text-[14.5px]"
                >
                  <span className="font-mono text-gold">—</span>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
