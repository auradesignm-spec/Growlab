"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const ITEMS = [
  { id: "feed", href: "/dashboard/browse" },
  { id: "store", href: "/dashboard?tab=storefront" },
  { id: "earnings", href: "/dashboard?tab=earnings" },
  { id: "account", href: "/dashboard?tab=payouts" },
] as const;

export default function MarketerAppNav() {
  const t = useTranslations("appShell.nav");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  return (
    <nav className="gl-app-nav" aria-label={t("aria")}>
      {ITEMS.map((item) => {
        const active =
          item.id === "feed"
            ? pathname.startsWith("/dashboard/browse")
            : pathname === "/dashboard" &&
              (item.id === "store"
                ? tab === "storefront" || tab === "deals" || tab === "samples" || !tab
                : item.id === "earnings"
                  ? tab === "earnings"
                  : tab === "payouts");

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`gl-app-nav-item ${active ? "is-on" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {t(item.id)}
          </Link>
        );
      })}
    </nav>
  );
}
