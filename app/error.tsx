"use client";

import React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black text-white mb-4">عذراً، حدث خطأ ما</h1>
      <p className="text-slate-400 mb-8">{error.message || "حدث خطأ غير متوقع في النظام."}</p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all"
      >
        حاول مرة أخرى
      </button>
    </div>
  );
}
