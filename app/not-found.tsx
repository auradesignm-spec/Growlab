import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-[#fbfcfd] to-[#f4f7fb]">
      <Header />
      <main className="mx-auto flex flex-1 max-w-lg flex-col items-center justify-center px-5 py-24 text-center">
        <div className="rounded-3xl border border-line bg-white/80 p-8 shadow-sm backdrop-blur sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-700">
            404 • Not Found
          </span>
          <h1 className="mt-4 text-2xl font-bold text-frost sm:text-3xl">الصفحة غير موجودة</h1>
          <p className="mt-2 text-[14px] text-frost-dim leading-relaxed">
            الرابط المطلوب قد يكون تم نقله أو غير متاح حالياً. يمكنك العودة للصفحة الرئيسية أو تجربة الديمو.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="gl-btn-primary w-full sm:w-auto">
              العودة للرئيسية
            </Link>
            <Link href="/demo" className="gl-btn-ghost w-full sm:w-auto border border-line">
              تجربة الديمو
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
