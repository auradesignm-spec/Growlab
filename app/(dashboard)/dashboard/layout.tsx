import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import AppShell from "@/components/AppShell";
import { isCurrentUserAdmin } from "@/lib/auth/admin";

// Real Clerk session now guards this layout (see middleware.ts). The dev-only
// cookie switcher (components/dev/DevRoleSwitcher.tsx, lib/dev/session.ts) is
// intentionally no longer wired in here — kept as dead code, safe to delete later.

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("dashboard");
  const nav = await getTranslations("nav");
  const isAdmin = await isCurrentUserAdmin();

  return (
    <AppShell>
      <header className="relative z-40 border-b border-line bg-white">
        <div className="mx-auto flex max-w-wrap items-stretch justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center py-5 text-[15px] font-medium text-frost"
            aria-label={nav("homeAria")}
          >
            {nav("brand")}
            <span className="text-signal-soft">.</span>
            <span className="ms-3 hidden text-[14px] font-normal text-frost-faint sm:inline">
              {t("kicker")}
            </span>
          </Link>
          <div className="flex items-stretch">
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center border-s border-white/10 px-5 text-[14px] text-frost-dim sm:px-7"
              >
                {nav("admin")}
              </Link>
            )}
            <div className="flex items-center border-s border-white/10 px-5">
              <LocaleSwitcher compact tone="light" />
            </div>
            <Link
              href="/"
              className="gl-nav-link inline-flex items-center border-s border-white/10 px-5 sm:px-7"
            >
              {nav("backHome")}
            </Link>
            <div className="flex items-center border-s border-white/10 px-5">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>
      {children}
    </AppShell>
  );
}
