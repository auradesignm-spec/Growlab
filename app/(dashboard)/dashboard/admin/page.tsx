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
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-frost-dim">{t("lede")}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/knowledge-base"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition shadow-sm shadow-emerald-500/10"
            >
              <span>قاعدة المعرفة التشريعية (Document Versioning)</span>
              <span>←</span>
            </Link>
          </div>
        </div>
      </section>
      <AdminDashboard data={data} />
    </main>
  );
}
