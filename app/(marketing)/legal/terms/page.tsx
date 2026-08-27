import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-[#fbfcfd] to-[#f4f7fb]">
      <Header />
      <main className="mx-auto flex-1 w-full max-w-3xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
        <div className="rounded-3xl border border-line bg-white/90 p-8 shadow-sm backdrop-blur sm:p-12">
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <span className="font-west text-xs uppercase tracking-widest text-emerald-700 font-bold">
              Legal & Compliance
            </span>
            <Link href="/" className="text-[13px] text-frost-dim hover:text-frost">
              ← الرئيسية
            </Link>
          </div>
          <h1 className="text-display-md font-semibold text-frost">شروط الاستخدام</h1>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-frost-dim">
            <p>Growlab شبكة توزيع بالدفع عند الاستلام. باستخدام المنصة توافق على:</p>
            <ul className="list-disc space-y-2.5 ps-5">
              <li>الدفع عند الاستلام (COD) كقناة أساسية وموثوقة لتحصيل المبيعات.</li>
              <li>محفظة عمولات مسبقة الدفع لتغطية أداء الشبكة عند تأكيد التحصيل الفعلي.</li>
              <li>سقف ميزانية محكم لكل حملة — الصرف يتوقف تلقائياً عند بلوغ السقف لمنع الهدر.</li>
              <li>مراجعة KYC للتجار والشركات قبل نشر المتجر أو تفعيل الحملات الإعلانية.</li>
              <li>الالتزام بتتبع وإسناد الطلبات عبر الروابط الرسمية للمنصة.</li>
            </ul>
            <div className="mt-8 rounded-2xl border border-line bg-slate-50 p-4 text-xs text-frost-dim">
              لأي استفسارات قانونية أو تنظيمية، تواصل مع فريق العمليات عبر الدعم الفني المعتمد.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
