import type { StepItem } from "@/lib/types";

const STEPS: readonly StepItem[] = [
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
] as const;

export default function HowItWorks() {
  return (
    <section id="how" className="section-padding">
      <div className="container-wrap">
        <div className="eyebrow">كيف نشتغل</div>
        <h2 className="section-heading">ثلاث خطوات، وضوح كامل</h2>
        <p className="section-lead">
          من أول محتوى تسويقي، إلى بيع فعلي، إلى رقم تشوفه بعينك.
        </p>

        <ol className="mt-10 list-none">
          {STEPS.map((step, index) => (
            <li
              key={step.n}
              className={`grid grid-cols-[56px_1fr] gap-6 border-t border-line py-8 transition-colors duration-250 hover:bg-paper/40 md:grid-cols-[90px_1fr] ${
                index === STEPS.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="font-mono text-2xl font-medium text-gold md:text-[28px]" aria-hidden="true">
                {step.n}
              </span>
              <div>
                <h3 className="mb-2 text-[19px] font-bold">{step.title}</h3>
                <p className="max-w-xl text-[15.5px] text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
