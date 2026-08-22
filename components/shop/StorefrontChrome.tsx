import type { ReactNode } from "react";
import Link from "next/link";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function StorefrontChrome({
  username,
  cartCount,
  homeLabel,
  cartLabel,
  children,
}: {
  username: string;
  cartCount: number;
  homeLabel: string;
  cartLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pb-10 text-frost">
      <div className="flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-5 sm:px-8">
        <Link href="/" className="text-[15px] font-medium text-frost" aria-label={homeLabel}>
          {homeLabel}
          <span className="ms-3 text-[14px] font-normal text-frost-dim">@{username}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/creator/${username}/checkout`} className="text-[14px] text-frost-dim">
            {cartLabel}
            {cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
          <LocaleSwitcher compact />
        </div>
      </div>
      {children}
    </div>
  );
}
