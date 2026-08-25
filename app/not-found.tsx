import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-lg flex-col justify-center px-5 py-16">
      <p className="gl-eyebrow">404</p>
      <h1 className="mt-3 text-display-md font-semibold text-frost">الصفحة غير موجودة</h1>
      <p className="mt-3 text-[14px] text-frost-dim">الرابط قد يكون قديماً أو خاطئاً.</p>
      <Link href="/" className="gl-btn-primary mt-8 w-fit">
        العودة للرئيسية
      </Link>
    </main>
  );
}
