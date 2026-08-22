import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/session";
import { loadCreatorBrowseData } from "@/lib/dashboard/browse";
import BrowseCatalog from "@/components/dashboard/BrowseCatalog";
import { AccountBanned } from "@/components/kyc/KycStatus";

export const metadata: Metadata = {
  title: "Growlab — Browse products",
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

  if (!viewer?.creatorProfile || viewer.creatorProfile.verificationStatus !== "verified") {
    return (
      <main>
        <section className="border-b border-line">
          <div className="px-5 py-12 sm:px-8">
            <p className="gl-eyebrow">{t("kicker")}</p>
            <h1 className="mt-4 font-display text-display-lg">{t("title")}</h1>
          </div>
        </section>
        <div className="px-5 py-16 sm:px-8">
          <p className="max-w-md rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-[14px] text-frost-dim">
            {t("creatorOnly")}
          </p>
          <Link href="/dashboard" className="gl-btn-ghost mt-8 inline-flex">
            {t("backToPortal")}
          </Link>
        </div>
      </main>
    );
  }

  const data = await loadCreatorBrowseData(viewer.creatorProfile.id);

  return (
    <main>
      <section className="border-b border-line">
        <div className="px-5 py-12 sm:px-8">
          <p className="gl-eyebrow">{t("kicker")}</p>
          <h1 className="mt-4 font-display text-display-lg">{t("title")}</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-frost-dim">{t("lede")}</p>
        </div>
      </section>
      <BrowseCatalog data={data} />
    </main>
  );
}
