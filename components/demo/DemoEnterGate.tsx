"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { startDemoExperience } from "@/lib/dev/actions";
import { signInHref, signUpHref } from "@/lib/auth/paths";

export default function DemoEnterGate({ storeSlug }: { storeSlug: string }) {
  const t = useTranslations("demo");
  const tEnter = useTranslations("enter");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"merchant" | "buyer">("merchant");
  const [pending, startTransition] = useTransition();

  function launchWithRole(role: "merchant" | "buyer") {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("role", role);
      fd.set("email", email.trim() || "demo@growlab.om");
      await startDemoExperience(fd);
    });
  }

  function handleQuickStart(e: React.FormEvent) {
    e.preventDefault();
    launchWithRole(selectedRole);
  }

  return (
    <div className="w-full max-w-2xl">
      <p className="text-sm font-semibold text-emerald-700">محاكاة تفاعلية فورية — بدون تسجيل مسبق</p>

      <h1 className="mt-3 text-display-md font-semibold text-frost">
        جرب منصة Growlab الحقيقية وتعلّم كيف تعمل
      </h1>
      <p className="gl-lede mt-2 text-[15px] text-frost-dim">
        أدخل بريدك الإلكتروني فقط للبدء في بيئة تفاعلية حية كاملة الميزات — استكشف إعداد المنتجات، محفظة العمولات، محاكي المبيعات، ومسار التوثيق بدون أي كلمات مرور أو تعقيد.
      </p>

      {/* Email Entry Card */}
      <form onSubmit={handleQuickStart} className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="demo-email" className="block text-sm font-semibold text-frost">
              البريد الإلكتروني للبدء:
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="demo-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com أو بريدك الشخصي"
                className="flex-1 rounded-xl border border-line bg-[#f8f9fa] px-4 py-3 text-sm text-frost placeholder:text-frost-faint focus:border-frost focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setEmail("demo.partner@growlab.om")}
                className="gl-btn-secondary !min-h-9 !py-1.5 !px-3 !text-xs whitespace-nowrap"
              >
                استخدام بريد تجريبي
              </button>
            </div>
            <p className="mt-1.5 text-xs text-frost-faint">
              لن نطلب منك أي كلمة مرور أو بطاقة بنكية — الدخول فوري بنقرة واحدة.
            </p>
          </div>

          {/* Role selector */}
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-frost-faint mb-3">
              اختر دورك الافتراضي في المحاكاة:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedRole("merchant")}
                className={`relative flex flex-col items-start rounded-2xl border p-4 text-start transition-all ${
                  selectedRole === "merchant"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                    : "border-line bg-[#fbfcfd] hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-frost text-sm">تاجر / صاحب متجر</span>
                </div>
                <p className="mt-2 text-xs text-frost-dim leading-relaxed">
                  تجربة إضافة المنتجات، شحن محفظة العمولات، ومحاكاة طلبات COD اللحظية.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("buyer")}
                className={`relative flex flex-col items-start rounded-2xl border p-4 text-start transition-all ${
                  selectedRole === "buyer"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                    : "border-line bg-[#fbfcfd] hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-frost text-sm">مسوّق / صانع محتوى</span>
                </div>
                <p className="mt-2 text-xs text-frost-dim leading-relaxed">
                  تصفح المنتجات، إنشاء روابط التتبع، وتجربة كسب العمولات عند التسليم.
                </p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111318] py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-black active:scale-[0.99] disabled:opacity-50"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري إطلاق البيئة الافتراضية...
              </span>
            ) : (
              <span>دخول المحاكاة التفاعلية الآن ←</span>
            )}
          </button>
        </div>
      </form>

      {/* Learning roadmap highlight */}
      <div className="mt-8 rounded-3xl border border-line bg-slate-50/80 p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-frost-dim">
          ماذا ستتعلم داخل المحاكاة الافتراضية؟
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-frost-dim">
          <div className="rounded-2xl border border-line bg-white p-3.5">
            <p className="font-bold text-frost">1. حماية الميزانية</p>
            <p className="mt-1 text-frost-faint">كيف يمنع سقف المحفظة الهدر الإعلاني ويضمن الصرف على المبيعات المحصّلة فقط.</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-3.5">
            <p className="font-bold text-frost">2. شحن مسبق الدفع</p>
            <p className="mt-1 text-frost-faint">كيف يقلل دفع رسوم التوصيل مسبقاً نسبة الإلغاءات والمرتجعات إلى أدنى مستوى.</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-3.5">
            <p className="font-bold text-frost">3. تسوية فورية للعمولات</p>
            <p className="mt-1 text-frost-faint">توزيع الأرباح ودفتر الحسابات المشفر عند استلام الزبون للطلب.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-frost-faint">
        <Link href={`/m/${storeSlug}`} className="text-frost-dim underline-offset-2 hover:underline">
          معاينة متجر تجريبي مباشر: /m/{storeSlug}
        </Link>
        <div className="flex gap-3">
          <Link href={signInHref("merchant")} className="hover:text-frost">
            {tEnter("signIn")}
          </Link>
          <span>·</span>
          <Link href={signUpHref("merchant")} className="hover:text-frost">
            {tEnter("continue")}
          </Link>
        </div>
      </div>
    </div>
  );
}

