"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#0b0c10] px-6 py-16 text-[#f4f4f5]">
        <main className="mx-auto max-w-lg">
          <p className="text-sm uppercase tracking-widest text-white/40">Growlab</p>
          <h1 className="mt-3 text-2xl font-semibold">حدث خطأ غير متوقع</h1>
          <p className="mt-2 text-sm text-white/60">
            أعد المحاولة. إن استمر الخطأ تواصل مع الدعم.
          </p>
          {error.digest ? (
            <p className="mt-4 font-mono text-xs text-white/30">{error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white/5"
          >
            إعادة المحاولة
          </button>
        </main>
      </body>
    </html>
  );
}
