"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import TourStartLink from "@/components/TourStartLink";
import { enterHref } from "@/lib/auth/paths";

const HIDE_MS = 60_000;
const SHOW_MS = 3_200;

/** Mobile CTA: pops in, then hides for a minute so it does not fight iOS scroll chrome. */
export default function AuthDock() {
  const t = useTranslations("marketing.dock");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) return;

    let hideTimer = 0;
    let showTimer = 0;
    let resting = false;

    const hide = () => {
      setVisible(false);
      window.clearTimeout(first);
      window.clearTimeout(hideTimer);
      window.clearTimeout(showTimer);
      resting = true;
      showTimer = window.setTimeout(() => {
        resting = false;
        setVisible(true);
        hideTimer = window.setTimeout(hide, SHOW_MS);
      }, HIDE_MS);
    };

    const first = window.setTimeout(() => {
      if (resting) return;
      setVisible(true);
      hideTimer = window.setTimeout(hide, SHOW_MS);
    }, 1400);

    const onScroll = () => {
      if (resting) return;
      hide();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(hideTimer);
      window.clearTimeout(showTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={`gl-auth-dock md:hidden${visible ? " is-on" : ""}`} aria-hidden={!visible}>
      <div className="mx-auto flex max-w-wrap px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <TourStartLink
          href={enterHref("merchant")}
          guide="open-account"
          source="auth-dock"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white text-[16px] font-medium text-[#111318]"
        >
          {t("startCampaign")}
        </TourStartLink>
      </div>
    </div>
  );
}
