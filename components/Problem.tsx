const items = [
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
];

export default function Problem() {
  return (
    <section id="problem" className="py-20 md:py-24">
      <div className="mx-auto max-w-wrap px-6">
        <div className="eyebrow">المشكلة</div>
        <h2 className="max-w-2xl font-display text-3xl font-extrabold md:text-4xl">
          ليش أغلب أصحاب الأعمال يخسرون فلوسهم مع وكالات التسويق؟
        </h2>
        <p className="mt-3.5 max-w-xl text-lg text-muted">
          نفس المشكلة تتكرر بغض النظر عن حجم الوكالة — والحل يبدأ من فهمها.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.num} className="bg-white p-7">
              <div className="mb-3.5 font-mono text-[13px] text-danger">{it.num}</div>
              <h3 className="mb-2.5 text-[17px] font-bold">{it.title}</h3>
              <p className="text-[14.5px] text-muted">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
