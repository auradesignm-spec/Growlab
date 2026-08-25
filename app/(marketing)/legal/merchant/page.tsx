import Link from "next/link";

export default function MerchantTermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <Link href="/" className="text-[14px] text-frost-dim underline">
        Growlab
      </Link>
      <h1 className="mt-8 text-display-lg font-semibold">اتفاق التاجر</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-frost-dim">
        <p>بفتح حساب تاجر على Growlab فإنك توافق على:</p>
        <ul className="list-disc space-y-2 ps-5">
          <li>رفع السجل التجاري وهوية المالك (KYC) قبل نشر المنتجات والحملات.</li>
          <li>شحن محفظة العمولات قبل تفعيل حملات الأداء وتأكيد التحصيل.</li>
          <li>تحديد سقف ميزانية لكل حملة — لا صرف فوق السقف.</li>
          <li>الدفع على شراء محصّل ومشاهدات ريل معتمدة فقط — لا أجر على نقرات الرابط.</li>
          <li>تأكيد التحصيل فقط بعد استلام النقد من الزبون.</li>
          <li>الموافقة على محتوى UGC قبل أي أجر مشاهدات.</li>
          <li>دقة بيانات المنتج والأسعار في متجرك وحملاتك.</li>
        </ul>
        <p>Growlab ليست وكالة إعلان — أنت تشتري أداءً بسقف، لا وعود وصول.</p>
      </div>
    </main>
  );
}
