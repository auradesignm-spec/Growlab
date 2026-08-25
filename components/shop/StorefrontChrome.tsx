import type { ReactNode } from "react";
import Link from "next/link";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import CartBadgeLink from "@/components/shop/CartBadgeLink";

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
          <CartBadgeLink href={`/creator/${username}/checkout`} label={cartLabel} count={cartCount} />
          <LocaleSwitcher compact />
        </div>
      </div>
      {children}
    </div>
  );
}
