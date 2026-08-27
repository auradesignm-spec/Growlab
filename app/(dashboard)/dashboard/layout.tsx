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
import DemoExperienceBar from "@/components/demo/DemoExperienceBar";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { isActiveDevImpersonation, listDevUsers } from "@/lib/dev/session";
import { isDemoExperienceEnabled } from "@/lib/dev/guard";
import { resolveDemoPersonas, DEMO_MERCHANT_EMAIL, DEMO_BUYER_EMAIL } from "@/lib/dev/demo";
import { loadCreatorAlerts, loadMerchantAlerts } from "@/lib/dashboard/alerts";
import VerifiedBadge from "@/components/dashboard/VerifiedBadge";

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
          label: `${user.email === "qusay@growlab.local" ? "admin" : user.role} — ${user.merchantProfile?.businessName ?? user.creatorProfile?.username ?? user.name}`,
        }))
      : [];

  const demoEnabled = isDemoExperienceEnabled() && isActiveDevImpersonation();
  const demoPersonas = demoEnabled ? await resolveDemoPersonas() : null;
  const demoRole =
    viewer?.email === DEMO_MERCHANT_EMAIL
      ? ("merchant" as const)
      : viewer?.email === DEMO_BUYER_EMAIL
        ? ("buyer" as const)
        : ("other" as const);

  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <AppShell>
      {demoEnabled && demoPersonas ? (
        <DemoExperienceBar
          role={demoRole}
          storeSlug={demoPersonas.storeSlug}
          orderToken={demoPersonas.orderToken}
          shareClaimToken={demoPersonas.shareClaimToken}
        />
      ) : null}
      {devUsers.length > 0 && !demoEnabled ? (
        <DevRoleSwitcher users={devUsers} currentUserId={viewer?.id ?? null} />
      ) : null}
      <header className="relative z-40 border-b border-line bg-white pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex max-w-wrap items-stretch justify-between px-4 sm:px-8">
          <Link
            href={isAdmin ? "/dashboard/admin" : isVerifiedCreator ? "/dashboard/browse" : "/"}
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
              <div className="flex items-center gap-1.5">
                {clerkEnabled ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <span
                    title={viewer?.name || "Growlab User"}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-frost border border-line dark:bg-slate-800"
                  >
                    {viewer?.name?.charAt(0) || "👤"}
                  </span>
                )}
                {(isVerifiedMerchant || isVerifiedCreator) && (
                  <VerifiedBadge size="sm" tooltip="حساب موثق رسمياً ✓ (Verified Profile)" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {alerts.length > 0 ? <AppAlerts alerts={alerts} /> : null}
      <PwaInstall />
      <div className={isVerifiedCreator ? "pb-24" : ""}>{children}</div>
      {isVerifiedCreator && !isAdmin ? (
        <Suspense fallback={null}>
          <MarketerAppNav />
        </Suspense>
      ) : null}
    </AppShell>
  );
}
