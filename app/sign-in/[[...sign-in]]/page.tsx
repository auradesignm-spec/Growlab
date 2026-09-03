import Link from "next/link";
import ClerkAuthScreen from "@/components/ClerkAuthScreen";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col text-frost">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-6 md:px-8">
        <Link href="/" className="text-[14px] sm:text-[15px] font-semibold">
          مساعد ريادة
        </Link>
        <Link href="/sign-up" className="gl-btn-ghost !min-h-9 !px-3 !text-sm sm:!min-h-12 sm:!px-5 sm:!text-base">
          إنشاء حساب
        </Link>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12 sm:px-6 sm:pb-16">
        <h1 className="mb-5 sm:mb-6 text-[17px] sm:text-[19px] md:text-[20px] font-semibold text-center">تسجيل دخول إلى لوحة الامتثال</h1>
        <ClerkAuthScreen mode="sign-in" enabled={Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)} />
      </div>
    </div>
  );
}
