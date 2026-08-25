"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import MerchantStorefront from "@/components/merchant/MerchantStorefront";
import StoreConfigurator, { type ConfiguratorResult } from "@/components/editor/StoreConfigurator";
import StoreBuildingScreen from "@/components/editor/StoreBuildingScreen";
import StartNowForm, { type StartNowValues } from "@/components/editor/odoo/StartNowForm";
import type { MerchantStoreTheme } from "@/lib/merchant-store/theme";
import { htmlToPlain, plainToHtml } from "@/lib/merchant-store/plainHtml";
import { slugifyStoreName } from "@/lib/merchant-store/slugs";
import {
  inferBusinessTypeFromProducts,
  seedCopyFromConfig,
  ODOO_PURPLE,
  VALUE_PROPS,
} from "@/lib/merchant-store/configurator";
import {
  applyAiProductCopy,
  bootstrapOdooStoreStart,
  saveMerchantStore,
  suggestMerchantStoreWithAi,
} from "@/app/(dashboard)/dashboard/store-actions";
import { StoreBlocksSidebar } from "@/components/editor/StoreBlocksSidebar";
import type { StoreBlockType } from "@/lib/merchant-store/layout";
import { parseThemeJson } from "@/lib/merchant-store/theme";
import { DEFAULT_PROMO, type StorePromo } from "@/lib/merchant-store/promo";

type SeededStore = {
  tagline: string;
  aboutPlain: string;
  offerHeadline: string;
  offerBody: string;
  theme: MerchantStoreTheme;
};

export interface MerchantStoreEditorInitial {
  businessName: string;
  city: string;
  slug: string;
  tagline: string;
  aboutHtml: string;
  theme: MerchantStoreTheme;
  offerHeadline: string;
  offerBody: string;
  offerActive: boolean;
  promo?: StorePromo;
  heroProductId: string | null;
  published: boolean;
  isPro: boolean;
  ownerName?: string;
  email?: string;
  phone?: string;
  products: Array<{ id: string; title: string; category: string; price: number; coverUrl: string | null }>;
}

type Phase = "start" | "config" | "building" | "edit";
type EditPanel = "blocks" | "content" | "design" | "theme";

export default function MerchantStoreEditorFlow({
  initial,
  forceFresh = false,
}: {
  initial: MerchantStoreEditorInitial;
  forceFresh?: boolean;
}) {
  const t = useTranslations("merchantStoreEditor");
  const locale = useLocale() as "ar" | "en";

  const inferredType = useMemo(
    () => inferBusinessTypeFromProducts(initial.products),
    [initial.products]
  );

  const [phase, setPhase] = useState<Phase>(() => {
    if (forceFresh) return "start";
    if (initial.published || initial.tagline) return "edit";
    if (initial.businessName && initial.slug) return "config";
    return "start";
  });
  const [panel, setPanel] = useState<EditPanel>("content");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [ownerEmail, setOwnerEmail] = useState(initial.email ?? "");
  const [slug, setSlug] = useState(initial.slug || slugifyStoreName(initial.businessName));
  const [tagline, setTagline] = useState(initial.tagline);
  const [aboutPlain, setAboutPlain] = useState(htmlToPlain(initial.aboutHtml));
  const [theme, setTheme] = useState(() => parseThemeJson(JSON.stringify(initial.theme)));
  const [offerHeadline, setOfferHeadline] = useState(initial.offerHeadline);
  const [offerBody, setOfferBody] = useState(initial.offerBody);
  const [offerActive, setOfferActive] = useState(initial.offerActive);
  const [promo, setPromo] = useState<StorePromo>(
    () =>
      initial.promo ?? {
        ...DEFAULT_PROMO,
        headline: initial.offerHeadline,
        body: initial.offerBody,
        active: initial.offerActive,
      }
  );
  const [heroProductId, setHeroProductId] = useState<string | null>(
    initial.heroProductId ?? initial.products[0]?.id ?? null
  );
  const [published, setPublished] = useState(initial.published);
  const [showAdvancedSlug, setShowAdvancedSlug] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<StoreBlockType | null>("intro");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState<SeededStore | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({
      slug: initial.slug,
      tagline: initial.tagline,
      aboutPlain: htmlToPlain(initial.aboutHtml),
      theme: parseThemeJson(JSON.stringify(initial.theme)),
      offerHeadline: initial.offerHeadline,
      offerBody: initial.offerBody,
      offerActive: initial.offerActive,
      promo:
        initial.promo ?? {
          ...DEFAULT_PROMO,
          headline: initial.offerHeadline,
          body: initial.offerBody,
          active: initial.offerActive,
        },
      heroProductId: initial.heroProductId ?? initial.products[0]?.id ?? null,
      published: initial.published,
    })
  );

  const aboutHtml = useMemo(() => plainToHtml(aboutPlain), [aboutPlain]);

  const previewStore = useMemo(() => {
    const hero = initial.products.find((p) => p.id === heroProductId) ?? initial.products[0];
    return {
      slug,
      businessName,
      city: initial.city,
      tagline,
      aboutHtml,
      theme,
      offerHeadline,
      offerBody,
      offerActive,
      promo,
      heroProduct: hero
        ? {
            id: hero.id,
            slug: "preview",
            title: hero.title,
            shortDescription: "",
            descriptionHtml: "",
            category: hero.category,
            tags: [],
            variants: [],
            price: hero.price,
            currency: "OMR",
            coverUrl: hero.coverUrl,
            storeDealId: "",
            features: [],
            attributeGroups: [],
            promo: null,
            deliveryDaysMax: 4,
            shippingFee: 1.5,
          }
        : null,
      products: initial.products
        .filter((p) => p.id !== hero?.id)
        .map((p) => ({
          id: p.id,
          slug: p.title,
          title: p.title,
          shortDescription: "",
          descriptionHtml: "",
          category: p.category,
          tags: [],
          variants: [],
          price: p.price,
          currency: "OMR",
          coverUrl: p.coverUrl,
          storeDealId: "",
          features: [],
          attributeGroups: [],
          promo: null,
          deliveryDaysMax: 4,
          shippingFee: 1.5,
        })),
    };
  }, [
    aboutHtml,
    businessName,
    heroProductId,
    initial.city,
    initial.products,
    offerActive,
    offerBody,
    offerHeadline,
    promo,
    slug,
    tagline,
    theme,
  ]);

  const buildSteps = useMemo(
    () => [
      {
        id: "ecom",
        label: t("odoo.build.ecommerce"),
        labelAlt: locale === "ar" ? "…Installing eCommerce" : "تثبيت المتجر…",
      },
      {
        id: "colors",
        label: t("odoo.build.colors"),
        labelAlt: locale === "ar" ? "…Applying colors & design" : "تطبيق الألوان والتصميم…",
      },
      {
        id: "images",
        label: t("odoo.build.images"),
        labelAlt: locale === "ar" ? "…Searching your images" : "البحث عن صورك…",
      },
      {
        id: "copy",
        label: t("odoo.build.copy"),
        labelAlt: locale === "ar" ? "…Writing inspiring text" : "جاري كتابة نص ملهم…",
      },
      {
        id: "activate",
        label: t("odoo.build.activate"),
        labelAlt: locale === "ar" ? "…Activating your website" : "تفعيل متجرك.",
      },
    ],
    [locale, t]
  );

  async function handleStartNow(values: StartNowValues) {
    const result = await bootstrapOdooStoreStart({
      fullName: values.fullName,
      websiteName: values.websiteName,
      email: values.email,
      phone: values.phone,
      locale: values.language,
    });
    setBusinessName(result.businessName);
    setSlug(result.slug);
    setOwnerEmail(values.email);
    setPhase("config");
  }

  const applyConfig = useCallback(
    (result: ConfiguratorResult) => {
      const next = seedCopyFromConfig({
        locale,
        businessName,
        city: initial.city,
        businessType: result.businessType,
        valueProp: result.valueProp,
        businessDetail: result.businessDetail,
      });
      setTagline(next.tagline);
      setAboutPlain(next.aboutPlain);
      setOfferHeadline(next.offerHeadline);
      setOfferBody(next.offerBody);
      setTheme(next.theme);
      setOfferActive(true);
      if (!slug) setSlug(slugifyStoreName(businessName));
      setSeeded(next);
      setPhase("building");
    },
    [businessName, initial.city, locale, slug]
  );

  const finishBuilding = useCallback(() => {
    startTransition(async () => {
      try {
        let nextTagline = seeded?.tagline ?? tagline;
        let nextAbout = seeded?.aboutPlain ?? aboutPlain;
        let nextOfferHeadline = seeded?.offerHeadline ?? offerHeadline;
        let nextOfferBody = seeded?.offerBody ?? offerBody;
        let nextTheme = seeded?.theme ?? theme;

        if (initial.isPro) {
          try {
            const suggestion = await suggestMerchantStoreWithAi(locale);
            if (suggestion.tagline) nextTagline = suggestion.tagline;
            if (suggestion.aboutHtml) nextAbout = htmlToPlain(suggestion.aboutHtml);
            if (suggestion.offerHeadline) nextOfferHeadline = suggestion.offerHeadline;
            if (suggestion.offerBody) nextOfferBody = suggestion.offerBody;
            if (suggestion.theme) nextTheme = suggestion.theme;
            if (suggestion.productCopy?.length) {
              await applyAiProductCopy(suggestion.productCopy);
            }
          } catch {
            // Keep seeded copy.
          }
        }

        setTagline(nextTagline);
        setAboutPlain(nextAbout);
        setOfferHeadline(nextOfferHeadline);
        setOfferBody(nextOfferBody);
        setOfferActive(true);
        setPromo((prev) => ({
          ...prev,
          active: true,
          headline: nextOfferHeadline || prev.headline,
          body: nextOfferBody || prev.body,
          kind: prev.kind === "banner" ? "banner" : prev.kind,
        }));
        setTheme(nextTheme);

        const nextSlug = slug || slugifyStoreName(businessName);
        await saveMerchantStore({
          slug: nextSlug,
          tagline: nextTagline,
          aboutHtml: plainToHtml(nextAbout),
          theme: nextTheme,
          offerHeadline: nextOfferHeadline,
          offerBody: nextOfferBody,
          offerActive: true,
          heroProductId,
          published: false,
        });
        setSlug(nextSlug);
        setPanel("content");
        setPhase("edit");
      } catch (e) {
        setError(e instanceof Error ? e.message : t("saveFailed"));
        setPhase("edit");
      }
    });
  }, [
    aboutPlain,
    businessName,
    heroProductId,
    initial.isPro,
    locale,
    offerBody,
    offerHeadline,
    seeded,
    slug,
    t,
    tagline,
    theme,
  ]);

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        slug,
        tagline,
        aboutPlain,
        theme,
        offerHeadline,
        offerBody,
        offerActive,
        promo,
        heroProductId,
        published,
      }),
    [
      aboutPlain,
      heroProductId,
      offerActive,
      offerBody,
      offerHeadline,
      promo,
      published,
      slug,
      tagline,
      theme,
    ]
  );
  const dirty = currentSnapshot !== savedSnapshot;

  function persist(nextPublished: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const themeToSave = parseThemeJson(JSON.stringify(theme));
        await saveMerchantStore({
          slug,
          tagline,
          aboutHtml,
          theme: themeToSave,
          offerHeadline,
          offerBody,
          offerActive,
          promo,
          heroProductId,
          published: nextPublished,
        });
        setPublished(nextPublished);
        setTheme(themeToSave);
        setSavedSnapshot(
          JSON.stringify({
            slug,
            tagline,
            aboutPlain,
            theme: themeToSave,
            offerHeadline,
            offerBody,
            offerActive,
            promo,
            heroProductId,
            published: nextPublished,
          })
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : t("saveFailed"));
      }
    });
  }

  function discardChanges() {
    const snap = JSON.parse(savedSnapshot) as {
      slug: string;
      tagline: string;
      aboutPlain: string;
      theme: MerchantStoreTheme;
      offerHeadline: string;
      offerBody: string;
      offerActive: boolean;
      promo: StorePromo;
      heroProductId: string | null;
      published: boolean;
    };
    setSlug(snap.slug);
    setTagline(snap.tagline);
    setAboutPlain(snap.aboutPlain);
    setTheme(parseThemeJson(JSON.stringify(snap.theme)));
    setOfferHeadline(snap.offerHeadline);
    setOfferBody(snap.offerBody);
    setOfferActive(snap.offerActive);
    setPromo(snap.promo);
    setHeroProductId(snap.heroProductId);
    setPublished(snap.published);
    setError(null);
  }

  function skipConfig() {
    const fallbackValue = (VALUE_PROPS[inferredType.id] ?? VALUE_PROPS.ecommerce)[0];
    applyConfig({
      businessType: inferredType,
      valueProp: fallbackValue,
      businessDetail: businessName,
    });
  }

  // Products help the collage; wizard runs before the first product too.
  if (phase === "start") {
    return (
      <div>
        <p className="border-b border-[#E4E4E7] bg-white py-3 text-center text-[14px] text-[#71717A]">
          {t("odoo.start.freeAccess")}
        </p>
        <StartNowForm
          initial={{
            fullName: initial.ownerName || "",
            websiteName: initial.businessName || "",
            email: initial.email || "",
            phone: initial.phone || "+968",
            country: "om",
            language: locale,
          }}
          labels={{
            title: t("odoo.start.title"),
            freeAccess: t("odoo.start.freeAccess"),
            fullName: t("odoo.start.fullName"),
            websiteName: t("odoo.start.websiteName"),
            email: t("odoo.start.email"),
            phone: t("odoo.start.phone"),
            country: t("odoo.start.country"),
            countryOman: t("odoo.start.countryOman"),
            language: t("odoo.start.language"),
            languageAr: t("odoo.start.languageAr"),
            languageEn: t("odoo.start.languageEn"),
            legal: t("odoo.start.legal"),
            cta: t("odoo.start.cta"),
            submitting: t("odoo.start.submitting"),
          }}
          onSubmit={handleStartNow}
        />
      </div>
    );
  }

  if (phase === "config") {
    return (
      <StoreConfigurator
        locale={locale}
        businessName={businessName}
        initialType={inferredType}
        onComplete={applyConfig}
        onSkip={skipConfig}
        labels={{
          want: t("odoo.config.want"),
          ecommerce: t("odoo.config.ecommerce"),
          forMy: t("odoo.config.forMy"),
          business: t("odoo.config.business"),
          withA: t("odoo.config.withA"),
          detailPlaceholder: t("odoo.config.detailPlaceholder"),
          skip: t("odoo.config.skip"),
          continue: t("odoo.config.continue"),
          pickType: t("odoo.config.pickType"),
          pickValue: t("odoo.config.pickValue"),
        }}
      />
    );
  }

  if (phase === "building") {
    return (
      <StoreBuildingScreen
        brand="Growlab"
        title={t("odoo.build.title")}
        titleFinale={t("odoo.build.titleFinale")}
        steps={buildSteps}
        onDone={finishBuilding}
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-[#F4F4F5]">
      {published && initial.products.length === 0 ? (
        <div className="border-b border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-center sm:px-6">
          <p className="text-[14px] text-[#92400E]">{t("odoo.nextProductHint")}</p>
          <Link
            href="/dashboard/products/new"
            className="mt-2 inline-flex rounded px-4 py-2 text-[13px] font-medium text-white"
            style={{ backgroundColor: ODOO_PURPLE }}
          >
            {t("addProduct")}
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E4E7] bg-white px-3 py-2 sm:px-4">
        <span className="me-2 text-[13px] font-medium text-[#18181B]">{t("odoo.appName")}</span>
        <Link
          href="/dashboard/products/new"
          className="rounded border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-1.5 text-[13px] text-[#3F3F46]"
        >
          {t("addProduct")}
        </Link>
        <div className="flex items-center gap-1 rounded border border-[#E4E4E7] p-0.5">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`rounded px-2 py-1 text-[12px] ${device === "desktop" ? "bg-[#E4E4E7] text-[#18181B]" : "text-[#71717A]"}`}
          >
            {t("odoo.toolbar.desktop")}
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`rounded px-2 py-1 text-[12px] ${device === "mobile" ? "bg-[#E4E4E7] text-[#18181B]" : "text-[#71717A]"}`}
          >
            {t("odoo.toolbar.mobile")}
          </button>
        </div>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={published}
            disabled={pending}
            onClick={() => persist(!published)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-40 ${
              published ? "bg-[#16A34A]" : "bg-[#D4D4D8]"
            }`}
          >
            <span
              className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${
                published ? "translate-x-4 rtl:-translate-x-4" : "translate-x-0.5 rtl:-translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-[13px] text-[#3F3F46]">
            {published ? t("odoo.toolbar.published") : t("odoo.toolbar.draft")}
          </span>
          {published ? (
            <Link
              href={`/m/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-[#E4E4E7] px-3 py-1.5 text-[13px] text-[#3F3F46]"
            >
              {t("published.viewLive")}
            </Link>
          ) : null}
          {dirty ? (
            <button
              type="button"
              disabled={pending}
              onClick={discardChanges}
              className="rounded px-3 py-1.5 text-[13px] text-[#DC2626] disabled:opacity-40"
            >
              {t("odoo.toolbar.discard")}
            </button>
          ) : null}
          <button
            type="button"
            disabled={pending || !dirty}
            onClick={() => persist(published)}
            className="rounded px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "#16A34A" }}
          >
            {pending ? t("saving") : t("odoo.toolbar.save")}
          </button>
        </div>
      </div>

      {error ? (
        <p className="border-b border-[#FECACA] bg-[#FEF2F2] px-4 py-2 text-[13px] text-[#B91C1C]">{error}</p>
      ) : null}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[320px_1fr]">
        <StoreBlocksSidebar
          panel={panel}
          setPanel={setPanel}
          theme={theme}
          setTheme={setTheme}
          selectedBlock={selectedBlock}
          setSelectedBlock={setSelectedBlock}
          tagline={tagline}
          setTagline={setTagline}
          aboutPlain={aboutPlain}
          setAboutPlain={setAboutPlain}
          setOfferHeadline={setOfferHeadline}
          setOfferBody={setOfferBody}
          setOfferActive={setOfferActive}
          promo={promo}
          setPromo={setPromo}
          heroProductId={heroProductId}
          setHeroProductId={setHeroProductId}
          products={initial.products}
          slug={slug}
          setSlug={setSlug}
          showAdvancedSlug={showAdvancedSlug}
          setShowAdvancedSlug={setShowAdvancedSlug}
          onReconfigure={() => setPhase("config")}
          onRestart={() => setPhase("start")}
        />

        <div className={`overflow-auto bg-[#E8E8E8] p-4 sm:p-6 ${device === "mobile" ? "flex justify-center" : ""}`}>
          <div
            className={`overflow-hidden rounded-lg border border-[#D4D4D8] bg-white shadow-sm ${
              device === "mobile" ? "w-[390px]" : "mx-auto w-full max-w-4xl"
            }`}
          >
            <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto">
              <MerchantStorefront
                store={previewStore}
                productsHeading={t("preview.products")}
                contactHeading={t("preview.contact")}
                contactLede={t("preview.contactLede")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
