"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";

interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Liquid hover/tap bubble — same spring on desktop and phone; coarse pointers skip move-tracking. */
export default function GlassBubbleTrack({
  children,
  className = "",
  resetKey,
  persistPressed = false,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  resetKey?: string | number;
  persistPressed?: boolean;
  "aria-label"?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [enableBubble, setEnableBubble] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  const clearHot = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.querySelectorAll("[data-bubble-item].is-bubble-hot").forEach((node) => {
      node.classList.remove("is-bubble-hot");
    });
  }, []);

  const moveTo = useCallback(
    (el: HTMLElement | null) => {
      const track = trackRef.current;
      if (!track || !el) return;
      activeRef.current = el;
      clearHot();
      el.classList.add("is-bubble-hot");
      const nav = track.getBoundingClientRect();
      const item = el.getBoundingClientRect();
      setBox({
        x: item.left - nav.left,
        y: item.top - nav.top,
        w: item.width,
        h: item.height,
      });
    },
    [clearHot],
  );

  const hide = useCallback(() => {
    activeRef.current = null;
    clearHot();
    setBox(null);
  }, [clearHot]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      setReduceMotion(motion.matches);
      setFinePointer(fine.matches);
      setEnableBubble(!motion.matches && fine.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
    };
  }, []);

  const parkPressed = useCallback(() => {
    const track = trackRef.current;
    if (!track || !persistPressed || !enableBubble) {
      hide();
      return;
    }
    const pressed = track.querySelector<HTMLElement>('[data-bubble-item][aria-pressed="true"]');
    if (pressed) moveTo(pressed);
    else hide();
  }, [enableBubble, hide, moveTo, persistPressed]);

  useEffect(() => {
    parkPressed();
  }, [parkPressed, resetKey]);

  const onPointer = (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    if (!enableBubble) return;
    const item = (event.target as HTMLElement).closest("[data-bubble-item]");
    if (!(item instanceof HTMLElement)) return;
    if (item === activeRef.current) return;
    moveTo(item);
  };

  return (
    <div
      ref={trackRef}
      className={`relative ${className}`}
      aria-label={ariaLabel}
      onPointerDown={enableBubble ? onPointer : undefined}
      onPointerEnter={enableBubble && finePointer ? onPointer : undefined}
      onPointerMove={enableBubble && finePointer ? onPointer : undefined}
      onPointerLeave={enableBubble && finePointer ? (persistPressed ? parkPressed : hide) : undefined}
      onFocusCapture={enableBubble ? onPointer : undefined}
      onBlurCapture={
        enableBubble
          ? (event) => {
              if (!trackRef.current?.contains(event.relatedTarget as Node)) {
                if (persistPressed) parkPressed();
                else hide();
              }
            }
          : undefined
      }
    >
      {enableBubble && box ? (
        <span
          className="gl-liquid-bubble"
          aria-hidden="true"
          style={{
            width: box.w,
            height: box.h,
            transform: `translate3d(${box.x}px, ${box.y}px, 0)`,
            transitionDuration: reduceMotion ? "0.01ms" : undefined,
          }}
        />
      ) : null}
      {children}
    </div>
  );
}
