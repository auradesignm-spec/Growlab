import type { CompareRow } from "@/lib/types";

const ROWS: readonly CompareRow[] = [
  { label: "التواصل", us: "مباشر مع المؤسسين", them: "عبر مدير حساب" },
  { label: "من يدير حسابك", us: "المؤسسين أنفسهم", them: "موظف جونيور غالبًا" },
  { label: "التقارير", us: "أسبوعية، ومربوطة بمبيعاتك", them: "شهرية ومعقدة" },
  { label: "الالتزام بالنتيجة", us: "نسبة من نتائجك جزء من الاتفاق", them: "بدون ضمان" },
  { label: "مدة الالتزام", us: "شهر بشهر", them: "عقود طويلة غالبًا" },
] as const;

export default function Compare() {
  return (
    <section id="compare" className="section-padding">
      <div className="container-wrap">
        <div className="eyebrow">الفرق واضح</div>
        <h2 className="section-heading">Growlab مقابل وكالات التسويق التقليدية</h2>

        <div className="mt-10 overflow-x-auto rounded-card border border-line bg-white shadow-card">
          <table className="w-full min-w-[520px] border-collapse text-[14.5px]">
            <caption className="sr-only">
              مقارنة بين Growlab والوكالات التقليدية
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[36%] bg-paper-alt p-4 text-start text-sm font-semibold text-muted"
                />
                <th
                  scope="col"
                  className="bg-teal-soft p-4 text-start text-sm font-semibold text-teal"
                >
                  Growlab
                </th>
                <th
                  scope="col"
                  className="bg-paper-alt p-4 text-start text-sm font-semibold text-muted"
                >
                  الوكالات التقليدية
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="group transition-colors duration-250 hover:bg-paper/50">
                  <th scope="row" className="border-t border-line p-4 text-start font-normal">
                    {row.label}
                  </th>
                  <td className="border-t border-line bg-teal-muted p-4 font-medium text-ink-3 group-hover:bg-teal-soft/80">
                    {row.us}
                  </td>
                  <td className="border-t border-line p-4 text-muted">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
