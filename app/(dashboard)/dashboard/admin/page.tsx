import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { loadAdminDashboardData } from "@/lib/dashboard/admin";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export const metadata: Metadata = {
  title: "Growlab, admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const t = await getTranslations("dashboardApp.admin");
  const allowed = await isCurrentUserAdmin();

  if (!allowed) {
    return (
      <main>
        <section className="border-b border-white/10">
          <div className="px-5 py-12 sm:px-8">
            <p className="gl-eyebrow">{t("kicker")}</p>
            <h1 className="mt-4 font-display text-display-lg">{t("title")}</h1>
          </div>
        </section>
        <div className="px-5 py-16 sm:px-8">
          <p className="max-w-md border border-dashed border-white/15 px-5 py-8 font-serif text-sm italic text-frost-dim">
            {t("forbidden")}
          </p>
          <Link href="/dashboard" className="gl-btn-ghost mt-8 inline-flex">
            {t("backToPortal")}
          </Link>
        </div>
      </main>
    );
  }

  const data = await loadAdminDashboardData();

  return (
    <main>
      <section className="border-b border-white/10">
        <div className="px-5 py-12 sm:px-8">
          <p className="gl-eyebrow">{t("kicker")}</p>
          <h1 className="mt-4 font-display text-display-lg">{t("title")}</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-frost-dim">{t("lede")}</p>
        </div>
      </section>
      <AdminDashboard data={data} />
    </main>
  );
}
