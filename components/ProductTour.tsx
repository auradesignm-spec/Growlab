"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SIGN_IN_HREF } from "@/lib/auth/paths";
import { markSurveyDone } from "@/lib/needSurvey";
import { findGuideEl, markTourDone, PRODUCT_TOUR_EVENT, TOUR_STEPS } from "@/lib/productTour";

type Spot = { top: number; left: number; width: number; height: number; radius: string };

export default function ProductTour() {
  const t = useTranslations("marketing.tour");
  const ar = useLocale() === "ar";
  const [index, setIndex] = useState<number | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [narrow, setNarrow] = useState(false);

  const stop = useCallback(() => {
    document.documentElement.classList.remove("gl-tour-on");
    document.querySelectorAll("[data-guide].is-guide").forEach((el) => el.classList.remove("is-guide"));
    setIndex(null);
    setSpot(null);
  }, []);

  useEffect(() => {
    const onStart = () => {
      markSurveyDone();
      setIndex(0);
    };
    window.addEventListener(PRODUCT_TOUR_EVENT, onStart);
    return () => window.removeEventListener(PRODUCT_TOUR_EVENT, onStart);
  }, []);

  useEffect(() => {
    if (index == null) {
      document.documentElement.classList.remove("gl-tour-on");
      return;
    }
    document.documentElement.classList.add("gl-tour-on");
    return () => document.documentElement.classList.remove("gl-tour-on");
  }, [index]);

  useEffect(() => {
    if (index == null) return;
    const id = TOUR_STEPS[index]?.id;
    if (!id) {
      stop();
      return;
    }
    const el = findGuideEl(id);
    if (!el) {
      if (index >= TOUR_STEPS.length - 1) stop();
      else setIndex(index + 1);
      return;
    }
    document.querySelectorAll("[data-guide].is-guide").forEach((node) => node.classList.remove("is-guide"));
    el.classList.add("is-guide");
    const header = 88;
    const y = el.getBoundingClientRect().top + window.scrollY - header;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    const place = () => {
      const r = el.getBoundingClientRect();
      setNarrow(window.innerWidth < 720);
      setSpot({
        top: r.top,
        left: r.left,
        width: r.width,
        height: Math.min(r.height, window.innerHeight * 0.38),
        radius: getComputedStyle(el).borderRadius || "16px",
      });
    };
    const t1 = window.setTimeout(place, 480);
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
  const tipW = Math.min(320, window.innerWidth - 32);
  const gap = 14;
  const spaceBelow = window.innerHeight - (spot.top + spot.height) - 24;
  const spaceAbove = spot.top - 24;
  const dockBottom = narrow || (spaceBelow < 140 && spaceAbove < 140);
  const placeBelow = !dockBottom && spaceBelow >= spaceAbove;
  const top = placeBelow ? spot.top + spot.height + gap : Math.max(12, spot.top - 210 - gap);
  const left = Math.min(Math.max(16, spot.left), window.innerWidth - tipW - 16);

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
      <div
        className="gl-spot-tip"
        style={
          dockBottom
            ? { top: "auto", bottom: 16, left: 16, right: 16, width: "auto" }
            : { top, left, width: tipW }
        }
      >
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
