"use client";

import { useEffect, useRef, useState } from "react";
import { ODOO_PURPLE } from "@/lib/merchant-store/configurator";

export interface BuildStep {
  id: string;
  label: string;
  /** Optional second-language line (Odoo-style bilingual checklist). */
  labelAlt?: string;
}

const BLOCKS = [
  { color: "#FBBF24", top: "18%", left: "14%", w: 72, h: 48, rot: -8 },
  { color: "#34D399", top: "32%", left: "48%", w: 64, h: 56, rot: 6 },
  { color: "#60A5FA", top: "48%", left: "22%", w: 80, h: 44, rot: 4 },
  { color: "#C084FC", top: "28%", left: "62%", w: 56, h: 64, rot: -12 },
  { color: "#F472B6", top: "58%", left: "52%", w: 68, h: 40, rot: 10 },
];

export default function StoreBuildingScreen({
  title,
  titleFinale,
  brand,
  steps,
  onDone,
}: {
  title: string;
  titleFinale?: string;
  brand: string;
  steps: BuildStep[];
  onDone: () => void;
}) {
  const [doneCount, setDoneCount] = useState(0);
  const finished = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (doneCount >= steps.length) {
      if (finished.current) return;
      finished.current = true;
      const t = window.setTimeout(() => onDoneRef.current(), 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setDoneCount((n) => n + 1), 700);
    return () => window.clearTimeout(t);
  }, [doneCount, steps.length]);

  const progress = Math.min(
    100,
    Math.round(((doneCount + (doneCount < steps.length ? 0.35 : 0)) / steps.length) * 100)
  );
  const assembling = doneCount < Math.max(2, Math.floor(steps.length * 0.6));
  const heading = doneCount >= steps.length - 1 && titleFinale ? titleFinale : title;

  return (
    <div className="grid min-h-[75vh] grid-cols-1 lg:grid-cols-[1.4fr_0.85fr]">
      <div className="relative flex items-center justify-center overflow-hidden bg-[#1A2233]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            transform: "perspective(600px) rotateX(12deg) scale(1.2)",
            transformOrigin: "center bottom",
          }}
          aria-hidden
        />

        {assembling ? (
          <div className="relative z-[1] h-64 w-72" aria-hidden>
            {BLOCKS.map((block) => (
              <div
                key={block.color}
                className="absolute rounded-md opacity-75 shadow-lg motion-safe:animate-pulse"
                style={{
                  backgroundColor: block.color,
                  width: block.w,
                  height: block.h,
                  top: block.top,
                  left: block.left,
                  transform: `rotate(${block.rot}deg)`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="relative z-[1] size-28">
            <div className="absolute inset-0 animate-spin rounded-full border border-white/25 border-t-white/70 [animation-duration:2.4s]" />
            <div className="absolute inset-3 animate-spin rounded-full border border-white/20 border-b-white/60 [animation-duration:3.2s] [animation-direction:reverse]" />
          </div>
        )}
      </div>

      <aside className="relative flex flex-col bg-white px-8 py-10 sm:px-10">
        <p className="text-[22px] font-semibold tracking-tight" style={{ color: ODOO_PURPLE }}>
          {brand}
        </p>
        <h2 className="mt-10 text-[22px] font-medium text-[#18181B]" style={{ letterSpacing: "normal" }}>
          {heading}
        </h2>

        <ul className="mt-8 flex-1 space-y-4">
          {steps.map((step, index) => {
            const done = index < doneCount;
            const active = index === doneCount;
            return (
              <li
                key={step.id}
                className="flex items-start gap-3 text-[14px] text-[#52525B]"
                style={{ letterSpacing: "normal" }}
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                  {done ? (
                    <svg viewBox="0 0 20 20" className="size-5 text-[#16A34A]" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3-4 4a1 1 0 0 1-1.4 0l-2-2a1 1 0 1 1 1.4-1.4L9 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4Z"
                      />
                    </svg>
                  ) : active ? (
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-[#D4D4D8] border-t-[#714B67]"
                      aria-hidden
                    />
                  ) : (
                    <span className="size-2 rounded-full bg-[#E4E4E7]" aria-hidden />
                  )}
                </span>
                <span className={done || active ? "text-[#18181B]" : ""}>
                  <span className="block">{step.label}</span>
                  {step.labelAlt ? (
                    <span className="mt-0.5 block text-[12px] text-[#A1A1AA]">{step.labelAlt}</span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-[#E4E4E7]">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${progress}%`, backgroundColor: ODOO_PURPLE }}
          />
        </div>
      </aside>
    </div>
  );
}
