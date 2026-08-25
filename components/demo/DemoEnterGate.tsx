"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { startDemoExperience } from "@/lib/dev/actions";
import { signInHref, signUpHref } from "@/lib/auth/paths";

export default function DemoEnterGate({ storeSlug }: { storeSlug: string }) {
  const t = useTranslations("demo");
  const tEnter = useTranslations("enter");
  const [pending, startTransition] = useTransition();

  function launch(role: "merchant" | "buyer") {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("role", role);
      await startDemoExperience(fd);
    });
  }

  return (
    <div className="max-w-2xl">
      <p className="gl-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-3 text-display-lg font-semibold text-frost">{t("title")}</h1>
      <p className="gl-lede mt-4">{t("lede")}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => launch("merchant")}
          className="gl-tile group p-6 text-start transition hover:border-signal/40 disabled:opacity-50"
        >
          <p className="font-west text-[10px] uppercase tracking-[0.22em] text-frost-dim">{t("merchantKicker")}</p>
          <h2 className="mt-2 text-xl font-semibold text-frost">{t("merchantTitle")}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{t("merchantLede")}</p>
          <span className="mt-4 inline-flex text-[13px] font-medium text-signal">{t("merchantCta")} →</span>
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => launch("buyer")}
          className="gl-tile group p-6 text-start transition hover:border-signal/40 disabled:opacity-50"
        >
          <p className="font-west text-[10px] uppercase tracking-[0.22em] text-frost-dim">{t("buyerKicker")}</p>
          <h2 className="mt-2 text-xl font-semibold text-frost">{t("buyerTitle")}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-frost-dim">{t("buyerLede")}</p>
          <span className="mt-4 inline-flex text-[13px] font-medium text-signal">{t("buyerCta")} →</span>
        </button>
      </div>

      <p className="mt-6 text-[13px] text-frost-faint">
        {t("storeHint")}{" "}
        <Link href={`/m/${storeSlug}`} className="text-frost-dim underline-offset-2 hover:underline">
          /m/{storeSlug}
        </Link>
      </p>

      <div className="mt-10 border-t border-line pt-8">
        <p className="text-[14px] text-frost-dim">{tEnter("signInPrompt")}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href={signInHref("merchant")} className="gl-btn-ghost">
            {tEnter("signIn")}
          </Link>
          <Link href={signUpHref("merchant")} className="gl-btn-ghost">
            {tEnter("continue")}
          </Link>
        </div>
      </div>
    </div>
  );
}
