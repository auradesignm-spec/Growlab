"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  FileSearch,
  MessageCircle,
  Receipt,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  calculateTaxPenalty,
  evaluateInvoiceCompliance,
  getTaxClassification,
  InvoiceComplianceStatus,
  TaxTreatment,
  TaxViolationType,
} from "@/utils/compliance";

type InstantComplianceToolsProps = {
  businessName: string;
  crNumber: string;
  initialWhatsapp: string;
};

const VIOLATION_OPTIONS: Array<{ value: TaxViolationType; labelAr: string }> = [
  { value: TaxViolationType.LATE_FILING, labelAr: "تأخير تقديم الإقرار (المادة 100)" },
  { value: TaxViolationType.LATE_PAYMENT, labelAr: "تأخير سداد الضريبة (المادة 51)" },
  { value: TaxViolationType.NON_REGISTRATION, labelAr: "عدم التسجيل الضريبي (المادة 101)" },
];

function formatOmr(value: number): string {
  return `${value.toLocaleString("en-OM", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ر.ع`;
}

export default function InstantComplianceTools({
  businessName,
  crNumber,
  initialWhatsapp,
}: InstantComplianceToolsProps) {
  const [taxAmount, setTaxAmount] = useState(1200);
  const [delayMonths, setDelayMonths] = useState(2);
  const [violationType, setViolationType] = useState<TaxViolationType>(TaxViolationType.LATE_FILING);

  const [invoiceFlags, setInvoiceFlags] = useState({
    hasTIN: true,
    isMathCorrect: true,
    hasSupplierName: true,
    hasDate: true,
    hasInvoiceNumber: false,
  });

  const [keyword, setKeyword] = useState("تمور عمانية");
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);

  const penalty = useMemo(() => {
    try {
      return calculateTaxPenalty({ taxAmount, delayMonths, violationType });
    } catch {
      return null;
    }
  }, [taxAmount, delayMonths, violationType]);

  const invoice = useMemo(() => evaluateInvoiceCompliance(invoiceFlags), [invoiceFlags]);
  const classification = useMemo(() => getTaxClassification(keyword), [keyword]);

  const invoiceBox =
    invoice.status === InvoiceComplianceStatus.COMPLIANT
      ? "border-emerald-500/30 bg-emerald-500/10"
      : invoice.status === InvoiceComplianceStatus.WARNING
        ? "border-amber-500/30 bg-amber-500/10"
        : "border-rose-500/30 bg-rose-500/10";

  const taxBox =
    classification.category === TaxTreatment.STANDARD
      ? "border-sky-500/30 bg-sky-500/10"
      : classification.category === TaxTreatment.ZERO_RATED
        ? "border-emerald-500/30 bg-emerald-500/10"
        : "border-amber-500/30 bg-amber-500/10";

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-[#0E1528] to-[#0E1424] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-400">أدوات الامتثال الفورية</p>
            <h2 className="mt-1 text-lg font-bold text-white">محرك الغرامات والفواتير وتصنيف الضريبة</h2>
            <p className="mt-1 text-xs text-white/60">
              {businessName} • السجل {crNumber} • تنبيهات واتساب: {whatsapp}
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
            المرسوم 121/2020 • القرار 53/2021
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0E1424] p-5">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">محاكي الغرامات — ماذا لو؟</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs text-white/70">
              الضريبة المستحقة (ر.ع)
              <input
                type="number"
                min={0}
                value={taxAmount}
                onChange={(e) => setTaxAmount(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-xs text-white/70">
              أشهر التأخير
              <input
                type="number"
                min={0}
                value={delayMonths}
                onChange={(e) => setDelayMonths(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-xs text-white/70">
              نوع المخالفة
              <select
                value={violationType}
                onChange={(e) => setViolationType(e.target.value as TaxViolationType)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-[#090D18] px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                {VIOLATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.labelAr}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {penalty ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] text-white/50">الغرامة الثابتة</p>
                <p className="mt-1 font-mono text-sm font-bold text-white">{formatOmr(penalty.baseFine)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] text-white/50">فائدة 1% شهرياً</p>
                <p className="mt-1 font-mono text-sm font-bold text-amber-300">{formatOmr(penalty.interestAmount)}</p>
              </div>
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                <p className="text-[10px] text-rose-200">الإجمالي المستحق</p>
                <p className="mt-1 font-mono text-sm font-bold text-rose-100">{formatOmr(penalty.totalPenalty)}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-300">تعذر احتساب الغرامة. تحقق من المدخلات.</p>
          )}
          {penalty && <p className="text-[11px] leading-relaxed text-white/55">{penalty.legalCitation}</p>}
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0E1424] p-5">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">مدقق الفاتورة الضريبية (المادتان 67 و 68)</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(
              [
                ["hasTIN", "الرقم الضريبي TIN"],
                ["isMathCorrect", "حسبة الضريبة 5% صحيحة"],
                ["hasSupplierName", "اسم المورد"],
                ["hasDate", "تاريخ الفاتورة"],
                ["hasInvoiceNumber", "الرقم التسلسلي"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/80">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={invoiceFlags[key]}
                  onChange={(e) => setInvoiceFlags((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 accent-emerald-500"
                />
              </label>
            ))}
          </div>
          <div className={`rounded-xl border p-4 ${invoiceBox}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                {invoice.status === InvoiceComplianceStatus.COMPLIANT ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                <span>
                  {invoice.status === InvoiceComplianceStatus.COMPLIANT
                    ? "فاتورة مطابقة"
                    : invoice.status === InvoiceComplianceStatus.WARNING
                      ? "تحتاج تصحيحاً ثانوياً"
                      : "غير مطابقة — لا تُخصم ضريبة المدخلات"}
                </span>
              </div>
              <span className="font-mono text-lg font-black text-white">{invoice.totalScore}/100</span>
            </div>
            {invoice.actionableRecommendations.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-white/70">
                {invoice.actionableRecommendations.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0E1424] p-5">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">مصنف السلع والخدمات (5% / 0% / معفى)</h3>
          </div>
          <label className="block text-xs text-white/70">
            ابحث عن سلعة أو خدمة
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="مثال: أدوية، إيجار سكني، تمور"
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-emerald-400 focus:outline-none"
            />
          </label>
          <div className={`rounded-xl border p-4 ${taxBox} space-y-2`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-white">{classification.matchedItem}</p>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs text-white">
                {classification.rateDisplay}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-white/70">{classification.officialLegalNote}</p>
            <p className="text-[10px] text-white/45">{classification.legalCitation}</p>
            <p className="text-[11px] text-white/80">
              خصم ضريبة المدخلات: {classification.isInputTaxDeductible ? "مسموح" : "غير مسموح"}
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0E1424] p-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">تنبيه واتساب استباقي</h3>
          </div>
          <label className="block text-xs text-white/70">
            رقم واتساب المنشأة
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </label>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-white/70">
            <p className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              سيتم إرسال ملخص الغرامة وتصنيف الضريبة إلى {whatsapp || "رقم غير محدد"}
            </p>
            <p className="mt-2">
              التنبيه يشمل أقرب استحقاق ضريبي، حالة الفاتورة، وهل السلعة خاضعة لـ 5% أو النسبة الصفرية أو الإعفاء.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/45">
            <Receipt className="h-3.5 w-3.5" />
            لا يُرسل إنفاق إعلاني من هذه الشاشة — أداة امتثال فقط.
          </div>
        </section>
      </div>
    </div>
  );
}
