import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import StorefrontEditorFlow from "@/components/editor/StorefrontEditorFlow";
import { getCurrentUser } from "@/lib/auth/session";
import { loadCreatorDashboardData } from "@/lib/dashboard/creator";
import { productTags, productVariants } from "@/lib/catalog-db";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Growlab, storefront editor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StorefrontEditPage() {
  const t = await getTranslations("storefrontEditor");
  const viewer = await getCurrentUser();

  if (!viewer?.creatorProfile || viewer.accountStatus === "banned" || viewer.creatorProfile.verificationStatus !== "verified") {
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
            {t("creatorOnly")}
          </p>
          <Link href="/dashboard" className="gl-btn-ghost mt-8 inline-flex">
            {t("backToPortal")}
          </Link>
        </div>
      </main>
    );
  }

  const [dashboard, creatorRecord] = await Promise.all([
    loadCreatorDashboardData(viewer.creatorProfile.id),
    prisma.creatorProfile.findUniqueOrThrow({
      where: { id: viewer.creatorProfile.id },
      include: {
        user: true,
        deals: {
          where: { status: "active" },
          include: { product: { include: { merchant: true } } },
        },
      },
    }),
  ]);

  const deals = creatorRecord.deals
    .filter((deal) => deal.product.active)
    .map((deal) => ({
      dealId: deal.id,
      productTitle: deal.product.title,
      lockedUnitPrice: deal.lockedUnitPrice,
      category: deal.product.category,
      tags: productTags(deal.product).join(", "),
      variants: productVariants(deal.product).join(", "),
      featured: deal.featured,
      merchantVerified: deal.product.merchant.verificationStatus === "verified",
    }));

  return (
    <main>
      <section className="border-b border-white/10">
        <div className="px-5 py-12 sm:px-8">
          <p className="gl-eyebrow">{t("kicker")}</p>
          <h1 className="mt-4 font-display text-display-lg">{t("title")}</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-frost-dim">{t("lede")}</p>
          <p className="mt-2 font-serif text-sm italic text-frost-dim">
            @{dashboard.creator.username} · {viewer.name}
          </p>
        </div>
      </section>

      <StorefrontEditorFlow
        initial={{
          username: dashboard.creator.username,
          name: viewer.name,
          bio: dashboard.creator.bio ?? "",
          deals,
        }}
      />
    </main>
  );
}
