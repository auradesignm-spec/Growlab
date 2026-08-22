"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";

export default function ClerkAuthScreen({
  mode,
  enabled,
}: {
  mode: "sign-in" | "sign-up";
  enabled: boolean;
}) {
  const isSignUp = mode === "sign-up";

  if (!enabled) {
    return (
      <p className="max-w-md text-center text-[15px] leading-relaxed text-[#5C6573]">
        التسجيل غير مفعّل على هذا النطاق بعد. أضف مفاتيح Clerk في Vercel ثم أعد النشر.
        <span className="mt-4 block">
          <Link href="/" className="font-medium text-[#111318] underline-offset-4 hover:underline">
            العودة للرئيسية
          </Link>
        </span>
      </p>
    );
  }

  return isSignUp ? (
    <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
  ) : (
    <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
  );
}

  const isSignUp = mode === "sign-up";

  if (!CLERK_ENABLED) {
    return (
      <p className="max-w-md text-center text-[15px] leading-relaxed text-[#5C6573]">
        التسجيل غير مفعّل على هذا النطاق بعد. أضف مفاتيح Clerk في Vercel ثم أعد النشر.
        <span className="mt-4 block">
          <Link href="/" className="font-medium text-[#111318] underline-offset-4 hover:underline">
            العودة للرئيسية
          </Link>
        </span>
      </p>
    );
  }

  return isSignUp ? (
    <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
  ) : (
    <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
  );
}
