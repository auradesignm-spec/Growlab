"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstall() {
  const t = useTranslations("appShell.install");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone) {
      setHidden(true);
      return;
    }

    const dismissed = window.localStorage.getItem("gl-pwa-dismissed") === "1";
    if (dismissed) setHidden(true);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
    if (isIos && isSafari) setIosHint(true);

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || (!deferred && !iosHint)) return null;

  function dismiss() {
    window.localStorage.setItem("gl-pwa-dismissed", "1");
    setHidden(true);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setHidden(true);
  }

  return (
    <div className="gl-pwa-banner">
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-frost">{iosHint && !deferred ? t("iosHint") : t("lede")}</p>
      <div className="flex shrink-0 items-center gap-2">
        {deferred ? (
          <button type="button" onClick={() => void install()} className="gl-btn-primary min-h-10 px-4 py-2 text-[13px]">
            {t("cta")}
          </button>
        ) : null}
        <button type="button" onClick={dismiss} className="min-h-10 px-2 text-[13px] text-frost-dim">
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
