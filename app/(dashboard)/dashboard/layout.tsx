import { Suspense } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import AppShell from "@/components/AppShell";
import PwaInstall from "@/components/PwaInstall";
import MarketerAppNav from "@/components/dashboard/MarketerAppNav";
import AppAlerts from "@/components/dashboard/AppAlerts";
import DevRoleSwitcher from "@/components/dev/DevRoleSwitcher";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { isActiveDevImpersonation, listDevUsers } from "@/lib/dev/session";
import { loadCreatorAlerts, loadMerchantAlerts } from "@/lib/dashboard/alerts";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("dashboard");
  const nav = await getTranslations("nav");
  const isAdmin = await isCurrentUserAdmin();
  const viewer = await getCurrentUser();
  const isVerifiedCreator =
    viewer?.role === "creator" && viewer.creatorProfile?.verificationStatus === "verified";
  const isVerifiedMerchant =
    viewer?.role === "merchant" && viewer.merchantProfile?.verificationStatus === "verified";

  const alerts = isVerifiedCreator && viewer.creatorProfile
    ? await loadCreatorAlerts(viewer.creatorProfile.id)
    : isVerifiedMerchant && viewer.merchantProfile
      ? await loadMerchantAlerts(viewer.merchantProfile.id)
      : [];

  const devUsers = isActiveDevImpersonation()
      ? (await listDevUsers()).map((user) => ({
          id: user.id,
          name: user.name,
          role: user.role,
          label: `${user.role} — ${user.merchantProfile?.businessName ?? user.creatorProfile?.username ?? user.name}`,
        }))
      : [];

  return (
    <AppShell>
      {devUsers.length > 0 ? (
        <DevRoleSwitcher users={devUsers} currentUserId={viewer?.id ?? null} />
      ) : null}
      <header className="relative z-40 border-b border-line bg-white pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex max-w-wrap items-stretch justify-between px-4 sm:px-8">
          <Link
            href={isVerifiedCreator ? "/dashboard/browse" : "/"}
            className="flex min-h-11 items-center py-3 text-[15px] font-medium text-frost sm:py-5"
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
                className="gl-web-only hidden items-center border-s border-white/10 px-5 text-[14px] text-frost-dim sm:inline-flex sm:px-7"
              >
                {nav("admin")}
              </Link>
            )}
            <div className="flex items-center border-s border-white/10 px-3 sm:px-5">
              <LocaleSwitcher compact tone="light" />
            </div>
            <Link
              href="/"
              className="gl-web-only gl-nav-link hidden items-center border-s border-white/10 px-5 sm:inline-flex sm:px-7"
            >
              {nav("backHome")}
            </Link>
            <div className="flex items-center border-s border-white/10 px-4 sm:px-5">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>
      {alerts.length > 0 ? <AppAlerts alerts={alerts} /> : null}
      <PwaInstall />
      <div className={isVerifiedCreator ? "pb-24" : ""}>{children}</div>
      {isVerifiedCreator ? (
        <Suspense fallback={null}>
          <MarketerAppNav />
        </Suspense>
      ) : null}
    </AppShell>
  );
}
