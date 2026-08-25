import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <Link href="/" className="text-[14px] text-frost-dim underline">
        Growlab
      </Link>
      <h1 className="mt-8 text-display-lg font-semibold">سياسة الخصوصية</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-frost-dim">
        <p>نجمع فقط ما يلزم لتشغيل الطلبات والحملات:</p>
        <ul className="list-disc space-y-2 ps-5">
          <li>بيانات الحساب (Clerk): الاسم، البريد، معرف المستخدم.</li>
          <li>بيانات الطلب: الاسم، الجوال، العنوان — للشحن والتواصل عبر المنصة.</li>
          <li>مستندات KYC: تُخزّن بشكل آمن ولا تُعرض للعامة.</li>
          <li>ملفات تعريف الارتباط: لغة الواجهة وإسناد روابط الإحالة.</li>
        </ul>
        <p>لا نبيع بياناتك. لا نشارك KYC إلا مع فريق المراجعة المخوّل.</p>
      </div>
    </main>
  );
}
