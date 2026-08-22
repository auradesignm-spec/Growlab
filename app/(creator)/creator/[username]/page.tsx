import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import CreatorStorefront from "@/components/creator/CreatorStorefront";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { getCreatorStorefront } from "@/lib/storefront";
import { cartItemCount, readCartCookie } from "@/lib/shop/cookies";

interface CreatorPageProps {
  params: { username: string };
}

function initialOf(name: string) {
  return Array.from(name)[0]?.toUpperCase() ?? "G";
}

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  const username = decodeURIComponent(params.username);
  return {
    title: `@${username} - Growlab`,
    description: "القطعة الظاهرة في الفيديو. اطلب الآن، الدفع عند الاستلام.",
    robots: { index: true, follow: true },
  };
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const t = await getTranslations("creator");
  const storefront = await getCreatorStorefront(params.username);
  const cartCount = cartItemCount(readCartCookie());

  if (!storefront) {
    notFound();
  }

  if (!storefront.heroDeal) {
    return (
      <div className="flex min-h-screen flex-col text-frost">
        <div className="flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-4 sm:px-8">
          <Link href="/" className="text-[15px] font-medium text-frost" aria-label={t("home")}>
            {t("home")}
            <span className="ms-3 text-[14px] font-normal text-frost-dim">@{storefront.username}</span>
          </Link>
          <LocaleSwitcher compact />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <p className="gl-eyebrow">{storefront.name}</p>
          <h1 className="mt-4 font-display text-display-md">{t("emptyStorefront.title")}</h1>
          <p className="mt-4 max-w-sm text-[16px] text-frost-dim">
            {t("emptyStorefront.lede")}
          </p>
        </div>
      </div>
    );
  }

  const hero = storefront.heroDeal;
  const noteParts = [hero.category, ...hero.tags].filter(Boolean);

  return (
    <CreatorStorefront
      username={storefront.username}
      name={storefront.name}
      role={storefront.bio || t("role")}
      initial={initialOf(storefront.name)}
      heroProduct={{
        dealId: hero.dealId,
        title: hero.productTitle,
        note: noteParts.join(" · "),
        priceOmr: hero.priceOmr,
        currency: hero.currency,
        sizes: hero.variants,
      }}
      otherDeals={storefront.otherDeals.map((deal) => ({
        dealId: deal.dealId,
        title: deal.productTitle,
        priceOmr: deal.priceOmr,
        currency: deal.currency,
        sizes: deal.variants,
      }))}
      cartCount={cartCount}
    />
  );
}
