import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-white mb-4">404</h1>
      <p className="text-slate-400 mb-8">الصفحة التي تبحث عنها غير موجودة.</p>
      <Link
        href="/"
        className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
