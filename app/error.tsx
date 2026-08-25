"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-lg px-5 py-16">
      <p className="gl-eyebrow">خطأ</p>
      <h1 className="mt-3 text-display-md font-semibold text-frost">تعذّر تحميل الصفحة</h1>
      <p className="mt-3 text-[14px] text-frost-dim">
        {error.message || "حدث خطأ. أعد المحاولة أو عد للرئيسية."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="gl-btn-primary">
          إعادة المحاولة
        </button>
        <Link href="/" className="gl-btn-ghost">
          الرئيسية
        </Link>
      </div>
    </main>
  );
}
