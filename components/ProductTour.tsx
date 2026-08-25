"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SIGN_IN_HREF } from "@/lib/auth/paths";
import { markTourDone, PRODUCT_TOUR_EVENT, TOUR_STEPS, visibleGuideEl } from "@/lib/productTour";

type Spot = { top: number; left: number; width: number; height: number; radius: string };

export default function ProductTour() {
  const t = useTranslations("marketing.tour");
  const ar = useLocale() === "ar";
  const [index, setIndex] = useState<number | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);

  const stop = useCallback(() => {
    document.querySelectorAll("[data-guide].is-guide").forEach((el) => el.classList.remove("is-guide"));
    setIndex(null);
    setSpot(null);
  }, []);

  useEffect(() => {
    const onStart = () => setIndex(0);
    window.addEventListener(PRODUCT_TOUR_EVENT, onStart);
    return () => window.removeEventListener(PRODUCT_TOUR_EVENT, onStart);
  }, []);

  useEffect(() => {
    if (index == null) return;
    const id = TOUR_STEPS[index]?.id;
    if (!id) {
      stop();
      return;
    }
    const el = visibleGuideEl(id);
    if (!el) {
      if (index >= TOUR_STEPS.length - 1) {
        setSpot({ top: 72, left: 16, width: 132, height: 40, radius: "999px" });
        return;
      }
      setIndex((i) => (i == null ? null : i + 1));
      return;
    }
    document.querySelectorAll("[data-guide].is-guide").forEach((node) => node.classList.remove("is-guide"));
    el.classList.add("is-guide");
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const place = () => {
      const r = el.getBoundingClientRect();
      setSpot({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        radius: getComputedStyle(el).borderRadius || "999px",
      });
    };
    const t1 = window.setTimeout(place, 380);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.clearTimeout(t1);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      el.classList.remove("is-guide");
    };
  }, [index, stop]);

  if (index == null || !spot) return null;
  const step = TOUR_STEPS[index];
  const last = index === TOUR_STEPS.length - 1;
  const tipTop = spot.top + spot.height + 14;
  const flip = tipTop + 200 > window.innerHeight;
  const top = flip ? Math.max(12, spot.top - 188) : tipTop;
  const left = Math.min(Math.max(16, spot.left), window.innerWidth - 304);

  function next() {
    if (last) {
      markTourDone();
      stop();
      window.location.href = SIGN_IN_HREF;
      return;
    }
    setIndex((i) => (i == null ? 0 : i + 1));
  }

  return (
    <div className="gl-spot-layer" role="dialog" aria-live="polite">
      <div
        className="gl-spot-frame"
        style={{
          top: spot.top,
          left: spot.left,
          width: spot.width,
          height: spot.height,
          borderRadius: spot.radius,
        }}
      >
        <span className="gl-spot-ring" />
        <span className="gl-spot-ring" />
        <span className="gl-spot-ring" />
      </div>
      <div className="gl-spot-tip" style={{ top, left }}>
        <p className="gl-survey-kicker">
          {t("progress", { current: index + 1, total: TOUR_STEPS.length })}
        </p>
        <p className="gl-spot-tip-title">{ar ? step.title.ar : step.title.en}</p>
        <p className="gl-spot-tip-body">{ar ? step.body.ar : step.body.en}</p>
        <div className="gl-survey-actions">
          {index > 0 ? (
            <button type="button" className="gl-survey-btn-ghost" onClick={() => setIndex(index - 1)}>
              {t("back")}
            </button>
          ) : null}
          <button type="button" className="gl-survey-btn-ink" onClick={next}>
            {last ? t("start") : t("next")}
          </button>
          <button
            type="button"
            className="gl-survey-skip"
            onClick={() => {
              markTourDone();
              stop();
            }}
          >
            {t("skip")}
          </button>
        </div>
      </div>
    </div>
  );
}
