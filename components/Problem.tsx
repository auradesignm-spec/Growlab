import { Clock, UserX, FileSpreadsheet, Scale, AlertTriangle, ArrowDown } from "lucide-react";

const items = [
  {
    num: "٠١",
    icon: Clock,
    title: "بيروقراطية وبطء تنفيذ",
    text: "تتواصل مع مدير حساب، والمدير يرجع لفريق تنفيذ. أي تعديل إعلاني بسيط يأخذ أيامًا ويضيع الفرص الموسمية.",
    tag: "تضييع للوقت",
  },
  {
    num: "٠٢",
    icon: UserX,
    title: "موظف متدرب يدير حسابك",
    text: "الشخص الخبير الذي أقنعك بالعقد غير الشخص الذي يمسك حملاتك فعليًا، والنتيجة تجارب على حساب ميزانيتك.",
    tag: "غياب الكفاءة",
  },
  {
    num: "٠٣",
    icon: FileSpreadsheet,
    title: "تقارير مضللة بلا مبيعات",
    text: "يغرقونك بأرقام وصول (Reach) وانطباعات (Impressions) براقة، لكن الكاش بالبنك والمبيعات الفعلية ما تحركت.",
    tag: "أرقام وهمية",
  },
  {
    num: "٠٤",
    icon: Scale,
    title: "صفر مسؤولية عن النتيجة",
    text: "الوكالة تستلم راتبها الشهري كاملًا سواء ربحت أو خسرت.. ما عندهم أي حافز حقيقي لزيادة صافي أرباحك.",
    tag: "انعدام الشراكة",
  },
];

export default function Problem() {
  return (
    <section id="problem" className="py-20 md:py-28">
      <div className="mx-auto max-w-wrap px-5 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <div className="eyebrow">المشكلة التي يواجهها التجار</div>
            <h2 className="max-w-2xl font-display text-2xl font-extrabold sm:text-3xl md:text-4xl text-ink leading-tight">
              لماذا يخسر أغلب أصحاب المتاجر ميزانياتهم مع الوكالات التقليدية؟
            </h2>
          </div>
          <p className="mt-4 md:mt-0 max-w-md text-base text-muted leading-relaxed">
            النموذج التقليدي مبني على بيع ساعات العمل وليس النتائج. هذه الثغرات تتكرر مع ٩ من أصل ١٠ مشاريع:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.num}
                className="group relative rounded-card border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-danger/40 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger transition-colors group-hover:bg-danger group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-paper-alt px-2.5 py-0.5 font-mono text-xs font-semibold text-danger">
                      {it.num}
                    </span>
                  </div>

                  <h3 className="mb-2.5 font-display text-lg font-bold text-ink group-hover:text-danger transition-colors">
                    {it.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">{it.text}</p>
                </div>

                <div className="mt-5 border-t border-line/50 pt-3">
                  <span className="text-[11px] font-medium text-danger/80 bg-danger/5 px-2 py-0.5 rounded">
                    {it.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

