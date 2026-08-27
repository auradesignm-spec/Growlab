import Image from "next/image";
import Link from "next/link";
import type { MerchantStoreData } from "@/lib/merchant-store/load";
import { enabledBlocks, type StoreBlockType } from "@/lib/merchant-store/layout";
import { isPromoLive } from "@/lib/merchant-store/promo";
import VerifiedBadge from "@/components/dashboard/VerifiedBadge";

export default function MerchantStorefront({
  store,
  productsHeading = "Products",
  contactHeading = "Contact",
  contactLede = "Order COD from the product page — we deliver to your address.",
}: {
  store: MerchantStoreData;
  productsHeading?: string;
  contactHeading?: string;
  contactLede?: string;
}) {
  const accent = store.theme.accent;
  const centered = store.theme.heroStyle === "center";
  const blocks = enabledBlocks(store.theme.layout ?? { blocks: [] });
  const promo = store.promo;
  const live = isPromoLive(promo);

  return (
    <div className={store.theme.fontTone === "classic" ? "font-serif" : undefined}>
      {blocks.map((block) => (
        <BlockSection
          key={block.id}
          type={block.type}
          store={store}
          accent={accent}
          centered={centered}
          productsHeading={productsHeading}
          contactHeading={contactHeading}
          contactLede={contactLede}
          promoLive={live}
        />
      ))}
    </div>
  );
}

function BlockSection({
  type,
  store,
  accent,
  centered,
  productsHeading,
  contactHeading,
  contactLede,
  promoLive,
}: {
  type: StoreBlockType;
  store: MerchantStoreData;
  accent: string;
  centered: boolean;
  productsHeading: string;
  contactHeading: string;
  contactLede: string;
  promoLive: boolean;
}) {
  if (type === "offer") {
    if (!promoLive || !store.promo.headline) return null;
    const ends = store.promo.endsAt ? new Date(store.promo.endsAt) : null;
    return (
      <div className="border-b border-line px-5 py-3 text-center text-[14px]" style={{ backgroundColor: `${accent}14` }}>
        <strong style={{ color: accent }}>{store.promo.headline}</strong>
        {store.promo.body ? <span className="ms-2 text-frost-dim">{store.promo.body}</span> : null}
        {ends && Number.isFinite(ends.getTime()) ? (
          <span className="ms-2 font-mono text-[12px] text-frost-faint">
            · {ends.toLocaleString()}
          </span>
        ) : null}
      </div>
    );
  }

  if (type === "intro") {
    return (
      <section className={`mx-auto max-w-wrap px-5 py-12 sm:px-8 ${centered ? "text-center" : ""}`}>
        <p className="gl-eyebrow">{store.city || "Growlab"}</p>
        <div className={`mt-2 flex flex-wrap items-center gap-3 ${centered ? "justify-center" : ""}`}>
          <h1 className={`text-display-lg font-semibold ${centered ? "max-w-2xl" : "max-w-3xl"}`}>
            {store.tagline || store.businessName}
          </h1>
          {store.verificationStatus === "verified" && (
            <VerifiedBadge size="md" showLabel label="متجر موثق رسمياً ✓" />
          )}
        </div>
        {store.aboutHtml ? (
          <div
            className={`prose-store mt-6 text-[16px] leading-relaxed text-frost-dim ${centered ? "mx-auto max-w-xl" : "max-w-2xl"}`}
            dangerouslySetInnerHTML={{ __html: store.aboutHtml }}
          />
        ) : null}
      </section>
    );
  }

  if (type === "hero") {
    if (!store.heroProduct) return null;
    return (
      <section className="mx-auto max-w-wrap px-5 pb-12 sm:px-8">
        <HeroCard
          storeSlug={store.slug}
          product={store.heroProduct}
          accent={accent}
          featured
          centered={centered}
        />
      </section>
    );
  }

  if (type === "catalog") {
    if (store.products.length === 0) return null;
    return (
      <section className="mx-auto max-w-wrap px-5 pb-16 sm:px-8">
        <h2 className={`text-[20px] font-semibold ${centered ? "text-center" : ""}`}>{productsHeading}</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {store.products.map((product) => (
            <HeroCard key={product.id} storeSlug={store.slug} product={product} accent={accent} />
          ))}
        </div>
      </section>
    );
  }

  // contact
  return (
    <section className={`mx-auto max-w-wrap border-t border-line px-5 py-12 sm:px-8 ${centered ? "text-center" : ""}`}>
      <h2 className="text-[20px] font-semibold">{contactHeading}</h2>
      <p className={`mt-3 text-[15px] leading-relaxed text-frost-dim ${centered ? "mx-auto max-w-md" : "max-w-lg"}`}>
        {contactLede}
      </p>
      <p className="mt-4 text-[14px] text-frost">
        {store.businessName}
        {store.city ? ` · ${store.city}` : ""}
      </p>
    </section>
  );
}

function HeroCard({
  storeSlug,
  product,
  accent,
  featured = false,
  centered = false,
}: {
  storeSlug: string;
  product: NonNullable<MerchantStoreData["heroProduct"]>;
  accent: string;
  featured?: boolean;
  centered?: boolean;
}) {
  const split = featured && !centered;
  return (
    <Link
      href={`/m/${storeSlug}/p/${product.slug}`}
      className={`gl-tile gl-lift block overflow-hidden transition-colors hover:bg-night ${split ? "lg:grid lg:grid-cols-2 lg:gap-0" : ""} ${centered && featured ? "mx-auto max-w-lg" : ""}`}
    >
      <div className={`relative bg-night ${featured ? "min-h-[16rem]" : "aspect-[4/3]"}`}>
        {product.coverUrl ? (
          <Image src={product.coverUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-frost-faint">—</div>
        )}
      </div>
      <div className={`p-5 ${centered ? "text-center" : ""}`}>
        <p className="text-[12px] text-frost-faint">{product.category}</p>
        <h3 className="mt-1 text-[18px] font-semibold">{product.title}</h3>
        {product.shortDescription ? (
          <p className="mt-2 line-clamp-2 text-[14px] text-frost-dim">{product.shortDescription}</p>
        ) : null}
        <p className="mt-4 font-mono text-[18px]" style={{ color: accent }}>
          {product.price.toFixed(2)} {product.currency}
        </p>
      </div>
    </Link>
  );
}
