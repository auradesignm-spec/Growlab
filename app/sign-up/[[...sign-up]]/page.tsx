import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#F5F5F7", color: "#111318" }}>
      <header className="flex items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="text-[15px] font-semibold">
          Growlab
        </Link>
        <Link href="/sign-in?redirect_url=/dashboard" className="gl-btn-ghost">
          دخول
        </Link>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16">
        <h1 className="mb-6 text-[20px] font-semibold">إنشاء حساب شريك</h1>
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
