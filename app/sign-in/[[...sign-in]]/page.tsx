import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#F5F5F7", color: "#111318" }}>
      <header className="flex items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="text-[15px] font-semibold">
          Growlab
        </Link>
        <Link href="/sign-up" className="gl-btn-ghost">
          إنشاء حساب
        </Link>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16">
        <h1 className="mb-6 text-[20px] font-semibold">دخول إلى اللوحة</h1>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
        <p className="mt-6 text-[14px] text-[#5C6573]">
          الصفحة تفتح نموذج Clerk. إذا لم يظهر، حدّث الصفحة أو ارجع لـ{" "}
          <Link href="/" className="font-medium text-[#111318] underline-offset-4 hover:underline">
            الرئيسية
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
