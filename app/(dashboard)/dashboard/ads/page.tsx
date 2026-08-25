import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { loadAdCoachState } from "@/app/(dashboard)/dashboard/ad-actions";
import AdCoachPanel from "@/components/dashboard/AdCoachPanel";

export default async function AdsCoachPage() {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    redirect("/dashboard");
  }
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    redirect("/dashboard");
  }

  const t = await getTranslations("dashboardApp.merchant.adCoach");
  const localeRaw = await getLocale();
  const locale = localeRaw === "en" ? "en" : "ar";
  const state = await loadAdCoachState();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--paper)]">
      <div className="relative z-[1] mx-auto max-w-wrap px-4 pb-16 pt-6 sm:px-8 sm:pt-8">
        <div className="mb-4 flex flex-wrap gap-4">
          <Link href="/dashboard" className="text-[13px] text-frost-dim hover:text-frost">
            ← {t("back")}
          </Link>
          <Link href="/dashboard/channels" className="text-[13px] text-frost-dim hover:text-frost">
            {t("toChannels")}
          </Link>
        </div>
        <AdCoachPanel
          initialDrafts={state.drafts}
          products={state.products}
          context={state.context}
          locale={locale}
          initialAdAccount={state.adAccount}
          initialLaunches={state.launches}
          whatsappPhone={state.whatsappPhone}
          whatsappConnected={state.whatsappConnected}
        />
      </div>
    </div>
  );
}
