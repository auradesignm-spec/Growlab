import { claimRole } from "@/app/(dashboard)/dashboard/onboarding-actions";

interface RoleOnboardingProps {
  readonly initialRole?: "merchant" | "creator";
}

/** Public registration is merchant-only. Buyer→marketer happens via share-claim after purchase. */
export default function RoleOnboarding({ initialRole: _initialRole }: RoleOnboardingProps) {
  return (
    <div className="px-5 py-10 sm:px-8">
      <p className="gl-eyebrow">حساب التاجر</p>
      <h1 className="mt-3 max-w-lg font-display text-display-lg text-frost">خطوة واحدة، وتدخل السوق.</h1>
      <p className="gl-lede mt-3">
        التسجيل هنا للتجار فقط. ارفع السجل التجاري وهوية المالك بعد إنشاء الحساب. المشتري يصبح مسوّقاً عبر رابط المشاركة بعد الشراء — لا تسجيل مسوّق منفصل.
      </p>

      <div className="mt-10 max-w-lg">
        <form action={claimRole} className="gl-glass flex flex-col justify-between gap-6 p-8">
          <div>
            <h2 className="font-display text-2xl text-frost">أنا تاجر</h2>
            <p className="mt-2 max-w-sm text-[14.5px] text-frost-dim">
              ارفع السجل التجاري وهوية المالك. بعد تدقيق الإدارة تضيف منتجاتك وتفتح حملات الأداء.
            </p>
          </div>
          <div>
            <input type="hidden" name="role" value="merchant" />
            <label className="block font-mono text-[11px] uppercase tracking-[0.2em] text-frost-faint">
              اسم المتجر أو النشاط
            </label>
            <input
              name="displayName"
              required
              minLength={2}
              maxLength={80}
              placeholder="مثال: عطور مطرح"
              className="mt-2 w-full border border-white/15 bg-white/[0.03] px-3 py-2.5 text-[15px] text-frost outline-none focus:border-white/30"
            />
            <button type="submit" className="gl-btn-primary mt-5 w-full sm:w-auto">
              ابدأ كتاجر
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
