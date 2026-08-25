import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/session";
import { loadBuyerShareLoopData } from "@/lib/dashboard/buyerShare";
import BuyerEarnGuide from "@/components/dashboard/BuyerEarnGuide";
import { AccountBanned } from "@/components/kyc/KycStatus";

export const metadata: Metadata = {
  title: "Growlab — كيف تربح بعد الشراء",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const t = await getTranslations("dashboardApp.browse");
  const tKyc = await getTranslations("kyc");
  const viewer = await getCurrentUser();

  if (viewer && viewer.accountStatus === "banned") {
    return (
      <main>
        <AccountBanned title={tKyc("banned.title")} lede={tKyc("banned.lede")} reason={viewer.banReason} />
      </main>
    );
  }

  if (!viewer?.creatorProfile) {
    return (
      <main>
        <section className="border-b border-line">
          <div className="px-4 py-8 sm:px-8 sm:py-12">
            <p className="gl-eyebrow">{t("kicker")}</p>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight text-frost sm:mt-4 sm:text-display-lg">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-frost-dim sm:mt-4">{t("lede")}</p>
          </div>
        </section>
        <div className="px-4 py-12 sm:px-8 sm:py-16">
          <p className="max-w-md rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-[14px] text-frost-dim">
            {t("buyerOnly")}
          </p>
          <Link href="/dashboard" className="gl-btn-ghost mt-8 inline-flex">
            {t("backToPortal")}
          </Link>
        </div>
      </main>
    );
  }

  const data = await loadBuyerShareLoopData(viewer.creatorProfile.id);

  return (
    <main>
      <section className="border-b border-line">
        <div className="px-4 py-8 sm:px-8 sm:py-12">
          <p className="gl-eyebrow">{t("kicker")}</p>
          <h1 className="mt-3 text-[28px] font-semibold leading-tight text-frost sm:mt-4 sm:text-display-lg">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-frost-dim sm:mt-4">{t("lede")}</p>
        </div>
      </section>
      <BuyerEarnGuide data={data} />
    </main>
  );
}
