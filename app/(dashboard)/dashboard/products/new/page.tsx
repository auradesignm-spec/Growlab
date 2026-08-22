import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/session";
import ProductForm from "@/components/dashboard/ProductForm";

export const metadata: Metadata = {
  title: "Growlab — Add product",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const t = await getTranslations("dashboardApp.merchant.productForm");
  const viewer = await getCurrentUser();

  if (!viewer?.merchantProfile || viewer.accountStatus === "banned" || viewer.merchantProfile.verificationStatus !== "verified") {
    return (
      <main>
        <section className="border-b border-white/10">
          <div className="px-5 py-12 sm:px-8">
            <p className="gl-eyebrow">{t("kicker")}</p>
            <h1 className="mt-4 font-display text-display-lg">{t("newTitle")}</h1>
          </div>
        </section>
        <div className="px-5 py-16 sm:px-8">
          <p className="max-w-md border border-dashed border-white/15 px-5 py-8 font-serif text-sm italic text-frost-dim">
            {t("merchantOnly")}
          </p>
          <Link href="/dashboard" className="gl-btn-ghost mt-8 inline-flex">
            {t("backToPortal")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="border-b border-white/10">
        <div className="px-5 py-12 sm:px-8">
          <p className="gl-eyebrow">{t("kicker")}</p>
          <h1 className="mt-4 font-display text-display-lg">{t("newTitle")}</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-frost-dim">{t("newLede")}</p>
        </div>
      </section>

      <div className="px-5 py-12 sm:px-8">
        <ProductForm />
      </div>
    </main>
  );
}
