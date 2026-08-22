"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import CreatorStorefront from "@/components/creator/CreatorStorefront";
import { formatMoney } from "@/lib/format";
import { uniqueDealSlugs } from "@/lib/storefront";

export interface EditorDealOption {
  dealId: string;
  productTitle: string;
  lockedUnitPrice: number;
  category: string;
  tags: string;
  variants: string;
  featured: boolean;
  merchantVerified: boolean;
}

export interface StorefrontEditorInitial {
  username: string;
  name: string;
  bio: string;
  deals: EditorDealOption[];
}

type Step = "start" | "compose" | "preview" | "published";

function initialOf(name: string) {
  return Array.from(name)[0]?.toUpperCase() ?? "G";
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

const STEPS: Step[] = ["start", "compose", "preview", "published"];

export default function StorefrontEditorFlow({ initial }: { initial: StorefrontEditorInitial }) {
  const t = useTranslations("storefrontEditor");
  const eligible = initial.deals.filter((d) => d.merchantVerified);
  const defaultHero = eligible.find((d) => d.featured) ?? eligible[0];

  const [step, setStep] = useState<Step>("start");
  const [heroDealId, setHeroDealId] = useState(defaultHero?.dealId ?? "");
  const [bio, setBio] = useState(initial.bio);
  const [productNote, setProductNote] = useState("");

  const heroDeal = eligible.find((d) => d.dealId === heroDealId) ?? defaultHero;
  const otherDeals = eligible.filter((d) => d.dealId !== heroDeal?.dealId);

  const resolvedNote = productNote.trim() || (heroDeal ? [heroDeal.category, ...parseList(heroDeal.tags)].filter(Boolean).join(" · ") : "");

  const stepIndex = STEPS.indexOf(step);

  const previewProps = useMemo(() => {
    if (!heroDeal) return null;
    const slugs = uniqueDealSlugs(
      eligible.map((deal) => ({ dealId: deal.dealId, productTitle: deal.productTitle }))
    );
    return {
      username: initial.username,
      name: initial.name,
      role: bio.trim() || initial.bio,
      initial: initialOf(initial.name),
      heroProduct: {
        dealId: heroDeal.dealId,
        slug: slugs.get(heroDeal.dealId) ?? heroDeal.productTitle,
        title: heroDeal.productTitle,
        note: resolvedNote,
        priceOmr: heroDeal.lockedUnitPrice,
        currency: "OMR",
        sizes: parseList(heroDeal.variants),
      },
      otherDeals: otherDeals.map((deal) => ({
        dealId: deal.dealId,
        slug: slugs.get(deal.dealId) ?? deal.productTitle,
        title: deal.productTitle,
        priceOmr: deal.lockedUnitPrice,
        currency: "OMR",
        sizes: parseList(deal.variants),
      })),
      cartCount: 0,
    };
  }, [bio, eligible, heroDeal, initial.bio, initial.name, initial.username, otherDeals, resolvedNote]);

  if (eligible.length === 0) {
    return (
      <section className="px-5 py-16 sm:px-8">
        <p className="max-w-md border border-dashed border-white/15 px-5 py-8 font-serif text-sm italic text-frost-dim">
          {t("noDeals")}
        </p>
        <Link href="/dashboard" className="gl-btn-ghost mt-8 inline-flex">
          {t("backToPortal")}
        </Link>
      </section>
    );
  }

  return (
    <div>
      <StepBar
        steps={[
          { id: "start", label: t("steps.start") },
          { id: "compose", label: t("steps.compose") },
          { id: "preview", label: t("steps.preview") },
          { id: "published", label: t("steps.publish") },
        ]}
        activeIndex={stepIndex}
      />

      {step === "start" && (
        <section className="px-5 py-10 sm:px-8">
          <p className="gl-eyebrow">{t("kicker")}</p>
          <h2 className="mt-4 font-display text-display-md">{t("start.title")}</h2>
          <p className="mt-4 max-w-lg font-serif text-sm italic text-frost-dim">{t("start.lede")}</p>

          <fieldset className="mt-10">
            <legend className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">
              {t("start.heroLabel")}
            </legend>
            <ul className="mt-4 space-y-3">
              {eligible.map((deal) => {
                const selected = deal.dealId === heroDealId;
                return (
                  <li key={deal.dealId}>
                    <button
                      type="button"
                      onClick={() => setHeroDealId(deal.dealId)}
                      aria-pressed={selected}
                      className={`flex w-full flex-wrap items-baseline justify-between gap-3 rounded-lg border p-4 text-start transition-colors duration-150 ease-out ${
                        selected ? "border-white/25 bg-white/[0.06] text-frost" : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <p className="font-display text-lg leading-tight">{deal.productTitle}</p>
                        <p className="mt-1 font-serif text-xs italic opacity-70">{deal.category}</p>
                      </div>
                      <span className="font-mono text-sm font-bold">{formatMoney(deal.lockedUnitPrice)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={() => setStep("compose")} className="gl-btn-primary">
              {t("actions.continue")}
            </button>
            <Link href="/dashboard" className="gl-btn-ghost">
              {t("actions.cancel")}
            </Link>
          </div>
        </section>
      )}

      {step === "compose" && heroDeal && (
        <section className="px-5 py-10 sm:px-8">
          <p className="gl-eyebrow">{t("kicker")}</p>
          <h2 className="mt-4 font-display text-display-md">{t("compose.title")}</h2>
          <p className="mt-4 max-w-lg font-serif text-sm italic text-frost-dim">{t("compose.lede")}</p>

          <div className="mt-10 max-w-xl space-y-8">
            <div>
              <label htmlFor="editor-bio" className="block font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
                {t("compose.bioLabel")}
              </label>
              <input
                id="editor-bio"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t("compose.bioPlaceholder")}
                className="mt-2 w-full border border-white/15 bg-white/[0.03] px-3 py-2.5 font-serif text-base italic"
              />
              <p className="mt-2 font-serif text-xs italic text-frost-dim">{t("compose.bioHint")}</p>
            </div>

            <div>
              <label htmlFor="editor-note" className="block font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
                {t("compose.noteLabel")}
              </label>
              <textarea
                id="editor-note"
                rows={3}
                value={productNote}
                onChange={(e) => setProductNote(e.target.value)}
                placeholder={resolvedNote || t("compose.notePlaceholder")}
                className="mt-2 w-full resize-y border border-white/15 bg-white/[0.03] px-3 py-2.5 font-serif text-base italic leading-relaxed"
              />
              <p className="mt-2 font-serif text-xs italic text-frost-dim">{t("compose.noteHint")}</p>
            </div>

            <div className="border border-white/10 p-4">
              <p className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("compose.lockedTitle")}</p>
              <dl className="mt-3 space-y-1.5">
                <Row label={t("compose.lockedProduct")} value={heroDeal.productTitle} />
                <Row label={t("compose.lockedPrice")} value={formatMoney(heroDeal.lockedUnitPrice)} />
              </dl>
              <p className="mt-3 font-serif text-xs italic text-danger">{t("compose.lockedHint")}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={() => setStep("preview")} className="gl-btn-primary">
              {t("actions.preview")}
            </button>
            <button type="button" onClick={() => setStep("start")} className="gl-btn-ghost">
              {t("actions.back")}
            </button>
          </div>
        </section>
      )}

      {step === "preview" && previewProps && (
        <section>
          <div className="border-b border-white/10 bg-white/[0.04] px-5 py-6 sm:px-8">
            <p className="gl-eyebrow">{t("preview.kicker")}</p>
            <p className="mt-2 max-w-lg font-serif text-sm italic text-frost-dim">{t("preview.lede")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setStep("published")} className="gl-btn-primary">
                {t("actions.publish")}
              </button>
              <button type="button" onClick={() => setStep("compose")} className="gl-btn-ghost">
                {t("actions.back")}
              </button>
            </div>
          </div>
          <div className="pointer-events-none select-none opacity-[0.98]">
            <CreatorStorefront {...previewProps} />
          </div>
        </section>
      )}

      {step === "published" && (
        <section className="px-5 py-16 sm:px-8">
          <p className="gl-eyebrow">{t("published.kicker")}</p>
          <h2 className="mt-4 font-display text-display-md">{t("published.title")}</h2>
          <p className="mt-4 max-w-lg font-serif text-sm italic text-frost-dim">{t("published.lede")}</p>

          <div className="mt-10 border border-white/10 p-6">
            <p className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{t("published.linkLabel")}</p>
            <a
              href={`/creator/${initial.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block font-display text-2xl underline"
            >
              growlab.om/creator/{initial.username}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/dashboard" className="gl-btn-primary">
              {t("actions.backToPortal")}
            </Link>
            <button type="button" onClick={() => setStep("start")} className="gl-btn-ghost">
              {t("actions.editAgain")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function StepBar({
  steps,
  activeIndex,
}: {
  steps: Array<{ id: string; label: string }>;
  activeIndex: number;
}) {
  return (
    <div className="flex flex-wrap border-b border-white/10">
      {steps.map((stepItem, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <div
            key={stepItem.id}
            className={`flex items-center border-e border-white/10 px-5 py-3 font-west text-[11px] uppercase tracking-[0.24em] ${
              active ? "bg-white/10 text-frost" : done ? "text-frost" : "text-frost-faint"
            }`}
            aria-current={active ? "step" : undefined}
          >
            <span className="me-2 font-mono text-[10px]">{String(index + 1).padStart(2, "0")}</span>
            {stepItem.label}
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-west text-[10px] uppercase tracking-[0.16em] text-frost-dim">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
