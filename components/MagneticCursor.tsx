"use client";

import { useEffect, useRef } from "react";

export default function MagneticCursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      el.style.display = "none";
      return;
    }

    document.body.style.cursor = "none";
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let scale = 1;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest("a, button, input, textarea, label");
      scale = interactive ? 2.4 : 1;
    };

    const tick = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    frame = requestAnimationFrame(tick);

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={dot}
      className="pointer-events-none fixed start-0 top-0 z-[90] hidden h-3 w-3 bg-blood mix-blend-multiply md:block"
      aria-hidden="true"
    />
  );
}
