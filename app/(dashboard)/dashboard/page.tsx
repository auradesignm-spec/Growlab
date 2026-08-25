import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { isAccountRestricted } from "@/lib/auth/account";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { ENTER_HREF } from "@/lib/auth/paths";
import { loadMerchantDashboardData } from "@/lib/dashboard/merchant";
import { loadCreatorDashboardData } from "@/lib/dashboard/creator";
import MerchantDashboard from "@/components/dashboard/MerchantDashboard";
import CreatorDashboard from "@/components/dashboard/CreatorDashboard";
import RoleOnboarding from "@/components/dashboard/RoleOnboarding";
import ProfileDetailsForm from "@/components/dashboard/ProfileDetailsForm";
import { hasCompletedProfile } from "@/lib/auth/profile";
import MerchantKycForm from "@/components/kyc/MerchantKycForm";
import CreatorKycCapture from "@/components/kyc/CreatorKycCapture";
import { AccountBanned, KycPending } from "@/components/kyc/KycStatus";

export const metadata: Metadata = {
  title: "Growlab, partner portal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { role?: string; tab?: string };
}) {
  const tApp = await getTranslations("dashboardApp");
  const tKyc = await getTranslations("kyc");
  const locale = await getLocale();
  const viewer = await getCurrentUser();
  const requestedRole = searchParams.role === "merchant" ? "merchant" : undefined;

  if (!viewer) {
    redirect(ENTER_HREF);
  }

  if (await isCurrentUserAdmin()) {
    redirect("/dashboard/admin");
  }

  if (
    viewer.role === "creator" &&
    viewer.creatorProfile?.verificationStatus === "verified" &&
    !searchParams.tab
  ) {
    redirect("/dashboard/browse");
  }

  return (
    <main>
      {isAccountRestricted(viewer.accountStatus) ? (
        <AccountBanned
          title={tKyc(viewer.accountStatus === "suspended" ? "suspended.title" : "banned.title")}
          lede={tKyc(viewer.accountStatus === "suspended" ? "suspended.lede" : "banned.lede")}
          reason={viewer.banReason}
        />
      ) : !hasCompletedProfile(viewer) ? (
        <ProfileDetailsForm
          initial={{
            firstName: viewer.firstName,
            lastName: viewer.lastName,
            phone: viewer.phone,
            email: viewer.email,
            emailLocked: Boolean(viewer.email),
          }}
        />
      ) : viewer.role === "unassigned" ? (
        <RoleOnboarding initialRole={requestedRole} />
      ) : viewer.role === "merchant" && viewer.merchantProfile ? (
        <MerchantGate merchant={viewer.merchantProfile} locale={locale} initialTab={searchParams.tab} />
      ) : viewer.role === "creator" && viewer.creatorProfile ? (
        <CreatorGate creator={viewer.creatorProfile} locale={locale} initialTab={searchParams.tab} />
      ) : (
        <div className="px-5 py-16 sm:px-8">
          <p className="max-w-md border border-dashed border-white/15 px-5 py-8 font-serif text-sm italic text-frost-dim">
            {tApp("noProfile")}
          </p>
        </div>
      )}
    </main>
  );
}

async function MerchantGate({
  merchant,
  locale,
  initialTab,
}: {
  merchant: NonNullable<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>["merchantProfile"]>;
  locale: string;
  initialTab?: string;
}) {
  const tKyc = await getTranslations("kyc");
  if (merchant.verificationStatus === "unsubmitted" || merchant.verificationStatus === "rejected") {
    return (
      <MerchantKycForm
        initial={{
          businessName: merchant.businessName,
          commercialRegNo: merchant.commercialRegNo,
          taxNumber: merchant.taxNumber,
          ownerFullName: merchant.ownerFullName,
          city: merchant.city,
        }}
        reviewNote={merchant.kycReviewNote}
      />
    );
  }
  if (merchant.verificationStatus === "pending") {
    return <KycPending title={tKyc("pending.title")} lede={tKyc("pending.merchant")} />;
  }

  const data = await loadMerchantDashboardData(merchant.id);
  return <MerchantDashboard data={data} locale={locale} initialTab={initialTab} />;
}

async function CreatorGate({
  creator,
  locale,
  initialTab,
}: {
  creator: NonNullable<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>["creatorProfile"]>;
  locale: string;
  initialTab?: string;
}) {
  const tKyc = await getTranslations("kyc");
  if (creator.verificationStatus === "unsubmitted" || creator.verificationStatus === "rejected") {
    return <CreatorKycCapture initialLegalName={creator.legalName} reviewNote={creator.kycReviewNote} />;
  }
  if (creator.verificationStatus === "pending") {
    return <KycPending title={tKyc("pending.title")} lede={tKyc("pending.creator")} />;
  }

  const data = await loadCreatorDashboardData(creator.id);
  return <CreatorDashboard data={data} locale={locale} initialTab={initialTab} />;
}
