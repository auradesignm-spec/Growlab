import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { loadChannelState } from "@/app/(dashboard)/dashboard/channel-actions";
import MetaChannelsPanel from "@/components/dashboard/MetaChannelsPanel";

export default async function ChannelsPage() {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    redirect("/dashboard");
  }
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    redirect("/dashboard");
  }

  const t = await getTranslations("dashboardApp.merchant.channels");
  const state = await loadChannelState();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--paper)]">
      <div className="relative z-[1] mx-auto max-w-wrap px-4 pb-16 pt-6 sm:px-8 sm:pt-8">
        <div className="mb-4 flex flex-wrap gap-4">
          <Link href="/dashboard" className="text-[13px] text-frost-dim hover:text-frost">
            ← {t("back")}
          </Link>
          <Link href="/dashboard/ads" className="text-[13px] text-frost-dim hover:text-frost">
            {t("toAds")}
          </Link>
        </div>
        <MetaChannelsPanel
          initialConnection={state.connection}
          initialLeads={state.leads}
          initialStats={state.stats}
        />
      </div>
    </div>
  );
}
