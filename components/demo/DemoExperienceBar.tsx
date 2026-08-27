"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { startDemoExperience, clearDemoExperience } from "@/lib/dev/actions";
import DemoTourGuide from "@/components/demo/DemoTourGuide";

export interface DemoBarProps {
  role: "merchant" | "buyer" | "other";
  storeSlug: string;
  orderToken: string;
  shareClaimToken: string | null;
}

export default function DemoExperienceBar({
  role,
  storeSlug,
  orderToken,
  shareClaimToken,
}: DemoBarProps) {
  const t = useTranslations("demo");
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function switchRole(next: "merchant" | "buyer") {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("role", next);
      await startDemoExperience(fd);
    });
  }

  const onStore = pathname.startsWith(`/m/${storeSlug}`);

  return (
    <div className="border-b border-signal/30 bg-[#111318] px-4 py-2.5 text-frost sm:px-8">
      <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-3">
        <span className="rounded-full border border-signal/40 bg-signal/10 px-2.5 py-0.5 font-west text-[10px] uppercase tracking-[0.22em] text-signal">
          {t("badge")}
        </span>
        <span className="text-[13px] text-frost-dim">
          {role === "merchant" ? t("asMerchant") : role === "buyer" ? t("asBuyer") : t("asGuest")}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending || role === "merchant"}
            onClick={() => switchRole("merchant")}
            className="rounded-full border border-white/15 px-3 py-1 text-[12px] disabled:opacity-40"
          >
            {t("switchMerchant")}
          </button>
          <button
            type="button"
            disabled={pending || role === "buyer"}
            onClick={() => switchRole("buyer")}
            className="rounded-full border border-white/15 px-3 py-1 text-[12px] disabled:opacity-40"
          >
            {t("switchBuyer")}
          </button>
          {!onStore ? (
            <Link href={`/m/${storeSlug}`} className="rounded-full border border-white/15 px-3 py-1 text-[12px]">
              {t("visitStore")}
            </Link>
          ) : null}
          {shareClaimToken ? (
            <Link href={`/share/${shareClaimToken}`} className="rounded-full border border-white/15 px-3 py-1 text-[12px]">
              {t("shareLink")}
            </Link>
          ) : (
            <Link href={`/order/${orderToken}`} className="rounded-full border border-white/15 px-3 py-1 text-[12px]">
              {t("sampleOrder")}
            </Link>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => clearDemoExperience())}
            className="rounded-full px-3 py-1 text-[12px] text-frost-faint underline-offset-2 hover:underline disabled:opacity-40"
          >
            {t("exit")}
          </button>
        </div>
      </div>

      {/* Floating Interactive Branching Tour Guide */}
      <DemoTourGuide />
    </div>
  );
}
