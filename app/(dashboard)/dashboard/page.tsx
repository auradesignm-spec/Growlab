import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/session";
import { loadMerchantDashboardData } from "@/lib/dashboard/merchant";
import { loadCreatorDashboardData } from "@/lib/dashboard/creator";
import MerchantDashboard from "@/components/dashboard/MerchantDashboard";
import CreatorDashboard from "@/components/dashboard/CreatorDashboard";
import RoleOnboarding from "@/components/dashboard/RoleOnboarding";
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
  searchParams: { role?: string };
}) {
  const t = await getTranslations("dashboard");
  const tApp = await getTranslations("dashboardApp");
  const tKyc = await getTranslations("kyc");
  const locale = await getLocale();
  const viewer = await getCurrentUser();
  const requestedRole = searchParams.role === "creator" ? "creator" : searchParams.role === "merchant" ? "merchant" : undefined;

  return (
    <main>
      <section className="border-b border-white/10">
        <div className="px-5 py-12 sm:px-8">
          <p className="gl-eyebrow">{t("kicker")}</p>
          <h1 className="mt-4 font-display text-display-lg">{t("title")}</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-frost-dim">{t("lede")}</p>
        </div>
      </section>

      {!viewer ? (
        <div className="px-5 py-16 sm:px-8">
          <p className="max-w-md text-[16px] leading-relaxed text-frost-dim">
            ادخل بحسابك لفتح لوحة التاجر أو المسوّق. الطلبات والدفتر يظهران بعد التسجيل.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/sign-in?redirect_url=/dashboard" className="gl-btn-primary">
              دخول
            </a>
            <a href="/sign-up?redirect_url=/dashboard" className="gl-btn-ghost">
              إنشاء حساب
            </a>
          </div>
        </div>
      ) : viewer.accountStatus === "banned" ? (
        <AccountBanned title={tKyc("banned.title")} lede={tKyc("banned.lede")} reason={viewer.banReason} />
      ) : viewer.role === "unassigned" ? (
        <RoleOnboarding initialRole={requestedRole} />
      ) : viewer.role === "merchant" && viewer.merchantProfile ? (
        <MerchantGate merchant={viewer.merchantProfile} locale={locale} />
      ) : viewer.role === "creator" && viewer.creatorProfile ? (
        <CreatorGate creator={viewer.creatorProfile} locale={locale} />
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
}: {
  merchant: NonNullable<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>["merchantProfile"]>;
  locale: string;
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
  return <MerchantDashboard data={data} locale={locale} />;
}

async function CreatorGate({
  creator,
  locale,
}: {
  creator: NonNullable<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>["creatorProfile"]>;
  locale: string;
}) {
  const tKyc = await getTranslations("kyc");
  if (creator.verificationStatus === "unsubmitted" || creator.verificationStatus === "rejected") {
    return <CreatorKycCapture initialLegalName={creator.legalName} reviewNote={creator.kycReviewNote} />;
  }
  if (creator.verificationStatus === "pending") {
    return <KycPending title={tKyc("pending.title")} lede={tKyc("pending.creator")} />;
  }

  const data = await loadCreatorDashboardData(creator.id);
  return <CreatorDashboard data={data} locale={locale} />;
}
