"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { buyerAnswerReceive } from "@/app/(shop)/receive-actions";

export default function BuyerReceiveForm({
  token,
  trackingToken,
}: {
  token: string;
  trackingToken: string;
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function answer(received: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await buyerAnswerReceive(token, received);
        router.push(`/order/${result.trackingToken || trackingToken}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("orderFailed"));
      }
    });
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      <button type="button" disabled={pending} className="gl-btn-primary min-h-11" onClick={() => answer(true)}>
        {pending ? t("receiveWorking") : t("receiveYes")}
      </button>
      <button type="button" disabled={pending} className="gl-btn-ghost min-h-11" onClick={() => answer(false)}>
        {t("receiveNo")}
      </button>
      {error ? <p className="text-[13px] text-danger">{error}</p> : null}
    </div>
  );
}
