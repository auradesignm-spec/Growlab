import type { ProblemItem } from "@/lib/types";

const ITEMS: readonly ProblemItem[] = [
  {
    num: "٠١",
    title: "بيروقراطية بطيئة",
    text: "تتواصل مع مدير حساب، والمدير يرجع لفريق تنفيذ. أي تعديل بسيط ياخذ أيام.",
  },
  {
    num: "٠٢",
    title: "موظف جديد على حسابك",
    text: "الشخص اللي باعك العقد غير الشخص اللي يشتغل فعليًا على حملتك.",
  },
  {
    num: "٠٣",
    title: "تقارير ما تعني شي",
    text: "أرقام وصول وانطباعات، بدون ربط واضح بمبيعاتك الفعلية.",
  },
  {
    num: "٠٤",
    title: "صفر مسؤولية عن النتيجة",
    text: "تدفع نفس المبلغ سواء نجحت الحملة أو فشلت.",
  },
] as const;

export default function Problem() {
  return (
    <section id="problem" className="section-padding">
      <div className="container-wrap">
        <div className="eyebrow">المشكلة</div>
        <h2 className="section-heading max-w-2xl text-balance">
          ليش أغلب أصحاب الأعمال يخسرون فلوسهم مع وكالات التسويق؟
        </h2>
        <p className="section-lead">
          نفس المشكلة تتكرر بغض النظر عن حجم الوكالة — والحل يبدأ من فهمها.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <article
              key={item.num}
              className="card-interactive bg-white p-7 shadow-none hover:translate-y-0"
            >
              <div className="mb-3.5 font-mono text-[13px] text-danger">{item.num}</div>
              <h3 className="mb-2.5 text-[17px] font-bold">{item.title}</h3>
              <p className="text-[14.5px] text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
