import Link from "next/link";
import ClerkAuthScreen from "@/components/ClerkAuthScreen";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col text-frost">
      <header className="flex items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="text-[15px] font-semibold">
          Growlab
        </Link>
        <Link href="/sign-up" className="gl-btn-ghost">
          إنشاء حساب
        </Link>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16">
        <h1 className="mb-6 text-[20px] font-semibold">تسجيل دخول إلى اللوحة</h1>
        <ClerkAuthScreen mode="sign-in" enabled={Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)} />
      </div>
    </div>
  );
}
