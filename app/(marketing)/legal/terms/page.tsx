import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <Link href="/" className="text-[14px] text-frost-dim underline">
        Growlab
      </Link>
      <h1 className="mt-8 text-display-lg font-semibold">شروط الاستخدام</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-frost-dim">
        <p>Growlab شبكة توزيع بالدفع عند الاستلام. باستخدام المنصة توافق على:</p>
        <ul className="list-disc space-y-2 ps-5">
          <li>الدفع عند الاستلام (COD) كقناة أساسية في النسخة الأولى.</li>
          <li>محفظة عمولات مسبقة الدفع لتغطية أداء الشبكة عند تأكيد التحصيل.</li>
          <li>سقف ميزانية لكل حملة — الصرف يتوقف تلقائياً عند النفاد.</li>
          <li>مراجعة KYC للتجار قبل نشر المتجر أو تفعيل الحملات.</li>
          <li>عدم التحايل على الدفتر أو إسناد الطلبات خارج المنصة.</li>
        </ul>
        <p>للاستفسارات: wa.me/96897844742</p>
      </div>
    </main>
  );
}
