const rows = [
  { label: "التواصل", us: "مباشر مع المؤسسين", them: "عبر مدير حساب" },
  { label: "من يدير حسابك", us: "المؤسسين أنفسهم", them: "موظف جونيور غالبًا" },
  { label: "التقارير", us: "أسبوعية، ومربوطة بمبيعاتك", them: "شهرية ومعقدة" },
  { label: "الالتزام بالنتيجة", us: "نسبة من نتائجك جزء من الاتفاق", them: "بدون ضمان" },
  { label: "مدة الالتزام", us: "شهر بشهر", them: "عقود طويلة غالبًا" },
];

export default function Compare() {
  return (
    <section id="compare" className="py-20 md:py-24">
      <div className="mx-auto max-w-wrap px-6">
        <div className="eyebrow">الفرق واضح</div>
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">
          Growlab مقابل وكالات التسويق التقليدية
        </h2>

        <div className="mt-10 overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[520px] border-collapse text-[14.5px]">
            <thead>
              <tr>
                <th className="w-[36%] bg-paper-alt p-4 text-right text-sm font-semibold text-muted" style={{ backgroundColor: "#E6E9E0" }}></th>
                <th
                  className="p-4 text-right text-sm font-semibold text-teal"
                  style={{ backgroundColor: "#E4EEEA" }}
                >
                  Growlab
                </th>
                <th className="bg-paper-alt p-4 text-right text-sm font-semibold text-muted" style={{ backgroundColor: "#E6E9E0" }}>
                  الوكالات التقليدية
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="border-t border-line p-4">{r.label}</td>
                  <td
                    className="border-t border-line p-4 font-medium text-ink-3"
                    style={{ backgroundColor: "#F2F7F4" }}
                  >
                    {r.us}
                  </td>
                  <td className="border-t border-line p-4 text-muted">{r.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
