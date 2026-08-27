import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MerchantTermsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-[#fbfcfd] to-[#f4f7fb]">
      <Header />
      <main className="mx-auto flex-1 w-full max-w-3xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
        <div className="rounded-3xl border border-line bg-white/90 p-8 shadow-sm backdrop-blur sm:p-12">
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <span className="font-west text-xs uppercase tracking-widest text-emerald-700 font-bold">
              Merchant Agreement
            </span>
            <Link href="/" className="text-[13px] text-frost-dim hover:text-frost">
              ← الرئيسية
            </Link>
          </div>
          <h1 className="text-display-md font-semibold text-frost">اتفاقية التاجر والشركاء</h1>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-frost-dim">
            <p>بفتح حساب تاجر على Growlab فإنك توافق على:</p>
            <ul className="list-disc space-y-2.5 ps-5">
              <li>رفع السجل التجاري وهوية المالك (KYC) قبل نشر المنتجات وتفعيل الحملات.</li>
              <li>شحن محفظة العمولات المسبقة قبل بدء حملات الأداء لضمان تسوية مستحقات الشركاء.</li>
              <li>تحديد سقف ميزانية لكل حملة — لا يتم صرف أي مبالغ تتجاوز السقف المحدد.</li>
              <li>الدفع على الطلبات المحصّلة فعلياً (COD) فقط — دون رسوم على مجرد النقرات.</li>
              <li>تأكيد التحصيل بدقة بعد استلام النقد والتسليم من شركة الشحن.</li>
              <li>الموافقة على المحتوى الترويجي (UGC) قبل اعتماده في الحملات.</li>
              <li>صحة ودقة مواصفات وأسعار المنتجات المعروضة في المتجر.</li>
            </ul>
            <div className="mt-8 rounded-2xl border border-line bg-slate-50 p-4 text-xs text-frost-dim">
              Growlab منصة أداء متكاملة تدعم توسع تجارتك مع الحفاظ على هوامش أرباحك الصافية.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
