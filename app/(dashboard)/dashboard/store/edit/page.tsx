import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import MerchantStoreEditorFlow from "@/components/editor/MerchantStoreEditorFlow";
import { getCurrentUser } from "@/lib/auth/session";
import { getMerchantStoreEditorData } from "@/app/(dashboard)/dashboard/store-actions";
import { ODOO_PURPLE } from "@/lib/merchant-store/configurator";

export const metadata: Metadata = {
  title: "Growlab — المتجر الإلكتروني",
};

export default async function MerchantStoreEditPage({
  searchParams,
}: {
  searchParams?: { fresh?: string };
}) {
  const t = await getTranslations("merchantStoreEditor");
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant") {
    redirect("/enter?role=merchant");
  }

  const initial = await getMerchantStoreEditorData();
  const forceFresh = searchParams?.fresh === "1";

  return (
    <main className="min-h-dvh bg-[#F8F9FA] text-[#18181B]">
      <header className="flex items-center justify-between border-b border-[#E4E4E7] bg-[#F4F4F5] px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-8 items-center justify-center rounded"
            style={{ backgroundColor: `${ODOO_PURPLE}22`, color: ODOO_PURPLE }}
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M6 7V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v1h2.2A1.8 1.8 0 0 1 22 8.8v2.4a2 2 0 0 1-1.2 1.8V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1-1.2-1.8V8.8A1.8 1.8 0 0 1 3.8 7H6Zm2 0h8V6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1Z" />
            </svg>
          </span>
          <span className="text-[15px] font-medium" style={{ letterSpacing: "normal" }}>
            {t("odoo.appName")}
          </span>
        </div>
        <Link
          href="/dashboard?tab=store"
          className="rounded px-3 py-1.5 text-[13px] hover:bg-white"
          style={{ color: ODOO_PURPLE }}
        >
          {t("odoo.changeApps")}
        </Link>
      </header>
      <MerchantStoreEditorFlow initial={initial} forceFresh={forceFresh} />
    </main>
  );
}
