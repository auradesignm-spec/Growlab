const steps = [
  {
    n: "01",
    title: "محتوى وإعلانات مصممة لك",
    text: "نصمم فيديو تسويقي ومحتوى خاص بمنتجك، وندير حملتك على ميتا يوميًا — مو قالب جاهز يتكرر لكل عميل.",
  },
  {
    n: "02",
    title: "وكيل ذكاء اصطناعي يقفل المبيعات",
    text: "يرد على كل عميل محتمل فورًا، يتابعه، ويساعد يقفل البيع — حتى وأنت نايم أو بمحاضرة.",
  },
  {
    n: "03",
    title: "لوحة تحكم شفافة بالكامل",
    text: "تتابع كل رقم — مبيعات، مصروف إعلانات، أرباح — بلوحة تحكم خاصة فيك، تتحدث أول بأول.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 md:py-24">
      <div className="mx-auto max-w-wrap px-6">
        <div className="eyebrow">كيف نشتغل</div>
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">ثلاث خطوات، وضوح كامل</h2>
        <p className="mt-3.5 max-w-xl text-lg text-muted">
          من أول محتوى تسويقي، إلى بيع فعلي، إلى رقم تشوفه بعينك.
        </p>

        <div className="mt-10">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`grid grid-cols-[56px_1fr] gap-6 border-t border-line py-8 md:grid-cols-[90px_1fr] ${
                i === steps.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="font-mono text-2xl font-medium text-gold md:text-[28px]">{s.n}</div>
              <div>
                <h3 className="mb-2 text-[19px] font-bold">{s.title}</h3>
                <p className="max-w-xl text-[15.5px] text-muted">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
