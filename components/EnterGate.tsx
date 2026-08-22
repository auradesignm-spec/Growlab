"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { signInHref, signUpHref, type PartnerRole } from "@/lib/auth/paths";

export default function EnterGate({ initialRole }: { initialRole?: PartnerRole }) {
  const t = useTranslations("enter");
  const [role, setRole] = useState<PartnerRole | undefined>(initialRole);

  return (
    <div className="max-w-xl">
      <p className="gl-eyebrow">{t("eyebrow")}</p>
      {role ? (
        <ConfirmStep role={role} onChange={() => setRole(undefined)} />
      ) : (
        <>
          <h1 className="mt-3 text-display-lg font-semibold text-frost">{t("title")}</h1>
          <p className="gl-lede mt-4">{t("lede")}</p>
          <div className="mt-10 flex flex-col gap-3">
            <Choice
              title={t("merchantTitle")}
              lede={t("merchantLede")}
              onPick={() => setRole("merchant")}
            />
            <Choice
              title={t("creatorTitle")}
              lede={t("creatorLede")}
              onPick={() => setRole("creator")}
            />
          </div>
        </>
      )}
      <p className="mt-8 text-[14px] text-frost-dim">
        {t("signInPrompt")}{" "}
        <Link href={signInHref(role)} className="font-medium text-frost underline-offset-4 hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}

function Choice({
  title,
  lede,
  onPick,
}: {
  title: string;
  lede: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="gl-tile gl-tile-hover w-full p-6 text-start sm:p-8"
    >
      <span className="block text-[20px] font-semibold leading-snug text-frost sm:text-[22px]">{title}</span>
      <span className="mt-2 block text-[15px] leading-relaxed text-frost-dim">{lede}</span>
    </button>
  );
}

function ConfirmStep({ role, onChange }: { role: PartnerRole; onChange: () => void }) {
  const t = useTranslations("enter");
  const confirm = role === "merchant" ? t("confirmMerchant") : t("confirmCreator");
  const next = role === "merchant" ? t("merchantNext") : t("creatorNext");

  return (
    <>
      <h1 className="mt-3 text-display-lg font-semibold text-frost">{confirm}</h1>
      <p className="gl-lede mt-4">{next}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href={signUpHref(role)} className="gl-btn-primary">
          {t("continue")}
        </Link>
        <button type="button" onClick={onChange} className="gl-btn-ghost">
          {t("change")}
        </button>
      </div>
    </>
  );
}
