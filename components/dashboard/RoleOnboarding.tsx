import { claimRole } from "@/app/(dashboard)/dashboard/onboarding-actions";

interface RoleOnboardingProps {
  readonly initialRole?: "merchant" | "creator";
}

export default function RoleOnboarding({ initialRole }: RoleOnboardingProps) {
  return (
    <div className="px-5 py-10 sm:px-8">
      <p className="gl-eyebrow">اختر دورك</p>
      <h1 className="mt-3 max-w-lg font-display text-display-lg text-frost">خطوة واحدة، وتدخل السوق.</h1>
      <p className="gl-lede mt-3">
        كل حساب له دور واحد. التاجر لا يدخل السوق إلا بعد رفع السجل التجاري وهوية المالك. المسوّق يوثّق بطاقته ووجهه قبل الترويج.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RoleCard
          role="merchant"
          title="أنا تاجر"
          lede="ارفع السجل التجاري وهوية المالك. بعد تدقيق الإدارة تضيف منتجاتك وتحدّد العمولات."
          fieldLabel="اسم المتجر أو النشاط"
          placeholder="مثال: عطور مطرح"
          cta="ابدأ كتاجر"
          highlighted={initialRole === "merchant"}
        />
        <RoleCard
          role="creator"
          title="أنا مسوّق"
          lede="صوّر بطاقتك من الأمام والخلف، ثم وجهك يمين ويسار وفوق وتحت. بعد التوثيق تبني متجرك وتختار الحملات."
          fieldLabel="اسمك أو اسمك الفني"
          placeholder="مثال: ليلى"
          cta="ابدأ كمسوّق"
          highlighted={initialRole === "creator"}
        />
      </div>
    </div>
  );
}

function RoleCard({
  role,
  title,
  lede,
  fieldLabel,
  placeholder,
  cta,
  highlighted = false,
}: {
  role: "merchant" | "creator";
  title: string;
  lede: string;
  fieldLabel: string;
  placeholder: string;
  cta: string;
  highlighted?: boolean;
}) {
  return (
    <form
      action={claimRole}
      className={`gl-glass relative flex flex-col justify-between gap-6 p-8 ${
        highlighted ? "border-white/25 bg-white/[0.04]" : ""
      }`}
    >
      {highlighted && (
        <span className="absolute end-6 top-6 text-[12px] text-frost-faint">
          اختيارك
        </span>
      )}
      <div>
        <h2 className="font-display text-2xl text-frost">{title}</h2>
        <p className="mt-2 max-w-sm text-[14.5px] text-frost-dim">{lede}</p>
      </div>
      <div>
        <input type="hidden" name="role" value={role} />
        <label className="block font-mono text-[11px] uppercase tracking-[0.2em] text-frost-faint">
          {fieldLabel}
        </label>
        <input
          name="displayName"
          required
          placeholder={placeholder}
          className="mt-2 w-full border-0 border-b border-white/15 bg-transparent px-0 py-2 text-[15px] text-frost placeholder:text-frost-faint focus-visible:border-signal/60 focus-visible:outline-none"
        />
        <button type="submit" className="gl-btn-primary mt-4">
          {cta}
        </button>
      </div>
    </form>
  );
}
