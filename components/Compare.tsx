import { Check, X, Sparkles } from "lucide-react";

const rows = [
  {
    label: "طريقة التواصل",
    us: "مباشر وفوري مع المؤسسين (واتساب خاص)",
    them: "عبر مدير حساب وبيروقراطية إيميلات",
    usWins: true,
  },
  {
    label: "من يدير وينفذ الحملات",
    us: "المؤسسون المتخصصون أنفسهم",
    them: "موظفون متدربون جدد على حسابك",
    usWins: true,
  },
  {
    label: "متابعة وإغلاق العملاء",
    us: "وكيل ذكاء اصطناعي 24/7 يرد بثوانٍ ويقفل الطلبات",
    them: "ردود متأخرة بالدوام الرسمي وضياع المشترين",
    usWins: true,
  },
  {
    label: "وضوح التقارير والأرباح",
    us: "لوحة تحكم حية مربوطة برقم الكاش والمبيعات",
    them: "تقارير PDF معقدة بأرقام وصول بلا مبيعات",
    usWins: true,
  },
  {
    label: "الالتزام بنتيجة الحملة",
    us: "شراكة بنسبة.. لا نكسب إلا إذا زادت مبيعاتك",
    them: "راتب شهري ثابت سواء ربحت أو خسرت",
    usWins: true,
  },
  {
    label: "مدة الالتزام والتعاقد",
    us: "شهر بشهر أو 3 أشهر تجدد حسب رضاك التام",
    them: "عقود ملزمة لـ ٦ أو ١٢ شهرًا مع شروط جزائية",
    usWins: true,
  },
];

export default function Compare() {
  return (
    <section id="compare" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-wrap px-5 md:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="eyebrow justify-center">المقارنة الشاملة</div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-ink leading-tight">
            Growlab مقابل وكالات التسويق التقليدية
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted">
            لماذا يختار أصحاب المتاجر والمشاريع النمو الذكي معنا بدلاً من الوكالات التقليدية؟
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="overflow-hidden rounded-2xl border border-line bg-paper/30 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-right text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-paper">
                  <th className="p-4 sm:p-5 font-bold text-ink w-[30%]">المعيار</th>
                  <th className="p-4 sm:p-5 font-bold text-teal bg-teal/10 w-[38%] border-x border-teal/20">
                    <div className="flex items-center gap-1.5 font-display text-base sm:text-lg text-teal">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <span>Growlab (شريك النمو)</span>
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 font-semibold text-muted w-[32%]">الوكالات التقليدية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {rows.map((r, i) => (
                  <tr
                    key={r.label}
                    className={`transition-colors hover:bg-paper-alt/50 ${
                      i % 2 === 0 ? "bg-white" : "bg-paper/20"
                    }`}
                  >
                    <td className="p-4 sm:p-5 font-medium text-ink">
                      {r.label}
                    </td>
                    
                    {/* Growlab Column */}
                    <td className="p-4 sm:p-5 bg-teal/[0.04] border-x border-teal/15 font-semibold text-ink">
                      <div className="flex items-start gap-2 text-ink">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/20 text-teal mt-0.5">
                          <Check className="h-3 w-3 text-teal" />
                        </span>
                        <span>{r.us}</span>
                      </div>
                    </td>

                    {/* Traditional Agency Column */}
                    <td className="p-4 sm:p-5 text-muted">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger mt-0.5">
                          <X className="h-3 w-3 text-danger" />
                        </span>
                        <span>{r.them}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}

