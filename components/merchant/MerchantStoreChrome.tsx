import type { ReactNode } from "react";
import Link from "next/link";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import CartBadgeLink from "@/components/shop/CartBadgeLink";

export default function MerchantStoreChrome({
  storeSlug,
  businessName,
  accent,
  cartCount,
  homeLabel,
  cartLabel,
  children,
}: {
  storeSlug: string;
  businessName: string;
  accent: string;
  cartCount: number;
  homeLabel: string;
  cartLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pb-10 text-frost" style={{ ["--store-accent" as string]: accent }}>
      <div className="flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-5 sm:px-8">
        <Link href={`/m/${storeSlug}`} className="text-[15px] font-medium text-frost">
          {businessName}
        </Link>
        <div className="flex items-center gap-3">
          <CartBadgeLink href={`/m/${storeSlug}/checkout`} label={cartLabel} count={cartCount} />
          <LocaleSwitcher compact />
        </div>
      </div>
      {children}
    </div>
  );
}
