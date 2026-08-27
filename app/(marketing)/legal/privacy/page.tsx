import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-[#fbfcfd] to-[#f4f7fb]">
      <Header />
      <main className="mx-auto flex-1 w-full max-w-3xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
        <div className="rounded-3xl border border-line bg-white/90 p-8 shadow-sm backdrop-blur sm:p-12">
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <span className="font-west text-xs uppercase tracking-widest text-emerald-700 font-bold">
              Privacy Policy
            </span>
            <Link href="/" className="text-[13px] text-frost-dim hover:text-frost">
              ← الرئيسية
            </Link>
          </div>
          <h1 className="text-display-md font-semibold text-frost">سياسة الخصوصية</h1>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-frost-dim">
            <p>نجمع فقط ما يلزم لتشغيل ومعالجة الطلبات وإدارة الحملات بأعلى معايير الأمان:</p>
            <ul className="list-disc space-y-2.5 ps-5">
              <li>بيانات الحساب: الاسم، البريد، ومعرف المستخدم المعتمد.</li>
              <li>بيانات الطلب: الاسم، رقم الجوال، والعنوان المخصص للشحن والتوصيل.</li>
              <li>مستندات التحقق (KYC): مشفرة بالكامل ولا تُعرض للعامة، وتخضع للمراجعة الأمنية الداخلية فقط.</li>
              <li>ملفات تعريف الارتباط: لحفظ تفضيلات اللغة وإسناد روابط الإحالة.</li>
            </ul>
            <div className="mt-8 rounded-2xl border border-line bg-slate-50 p-4 text-xs text-frost-dim">
              نلتزم بحماية خصوصية بياناتك ولا نقوم ببيع أو مشاركة أي بيانات حساسة لأطراف خارجية غير معتمدة.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
