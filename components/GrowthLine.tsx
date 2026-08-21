"use client";

import { useEffect, useRef } from "react";

export default function GrowthLine() {
  const ref = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    const line = ref.current;
    if (!line) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const length = line.getTotalLength();

    line.style.strokeDasharray = `${length}`;
    line.style.strokeDashoffset = prefersReducedMotion ? "0" : `${length}`;
    line.style.transition = prefersReducedMotion ? "none" : "stroke-dashoffset 1.8s ease-out";

    if (prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      line.style.strokeDashoffset = "0";
    }, 150);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-50"
      viewBox="0 0 1200 500"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        ref={ref}
        points="0,420 150,400 300,430 450,340 600,360 750,250 900,270 1050,140 1200,110"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-gold"
      />
    </svg>
  );
}
