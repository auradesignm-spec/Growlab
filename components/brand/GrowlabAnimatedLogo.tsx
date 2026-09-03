"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface GrowlabAnimatedLogoProps {
  /** Custom icon component or image. Defaults to Growlab Bag Icon */
  icon?: React.ReactNode;
  /** Trigger mode: 'entrance' (default: animates from left to right on mount and stays visible), 'hover', 'always', or 'replay' */
  trigger?: "entrance" | "hover" | "always" | "replay";
  /** Delay before entrance animation begins (in ms) */
  enterDelayMs?: number;
  /** Animation duration in seconds (default: 0.85s) */
  duration?: number;
  /** Theme variant */
  theme?: "light" | "dark";
  /** Optional container class name */
  className?: string;
  /** Custom text styling classes */
  textClassName?: string;
  /** Custom size of the icon in pixels */
  iconSize?: number;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

// Cubic bezier matching the exact fluid velocity of the logo reveal video
const easeTransition = [0.16, 1, 0.3, 1];

export default function GrowlabAnimatedLogo({
  icon,
  trigger = "entrance",
  enterDelayMs = 150,
  duration = 0.85,
  theme = "light",
  className = "",
  textClassName = "",
  iconSize = 36,
  onAnimationComplete,
}: GrowlabAnimatedLogoProps) {
  const isDark = theme === "dark";
  const textRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState<number>(86);
  const [hasStarted, setHasStarted] = useState<boolean>(trigger === "always");
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Measure text width accurately on mount and resize
  useEffect(() => {
    if (textRef.current) {
      const measured = textRef.current.scrollWidth;
      if (measured > 0) {
        setTextWidth(measured);
      }
    }
  }, []);

  // Entrance trigger on mount
  useEffect(() => {
    if (trigger === "entrance" || trigger === "replay") {
      const timer = setTimeout(() => {
        setHasStarted(true);
      }, enterDelayMs);
      return () => clearTimeout(timer);
    }
  }, [trigger, enterDelayMs]);

  // Handle replay on hover if in replay mode
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (trigger === "hover" && !hasStarted) {
      setHasStarted(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // The icon travels across the exact text width + small gap
  const travelDistance = textWidth + 4;

  return (
    <div
      dir="ltr"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex items-center select-none cursor-pointer p-1 rounded-xl focus:outline-none ${className}`}
      aria-label="مساعد ريادة"
    >
      {/* Container holding both Logo Icon (Left) and Text (Right) in strict LTR order */}
      <div dir="ltr" className="relative inline-flex items-center">
        {/* 1. Bag Icon: Starts on the far right (travel distance over the text) and slides to the LEFT (x: 0) */}
        <motion.div
          initial={
            trigger === "always"
              ? { x: 0 }
              : { x: textWidth > 0 ? textWidth + 4 : 90 }
          }
          animate={
            hasStarted
              ? { x: 0 }
              : { x: textWidth > 0 ? textWidth + 4 : 90 }
          }
          transition={{
            duration: duration,
            ease: easeTransition,
          }}
          onAnimationComplete={onAnimationComplete}
          className="relative z-30 flex shrink-0 items-center justify-center"
        >
          {/* Natural soft shadow on hover */}
          <span
            className={`pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-4 rounded-full blur-[2px] opacity-0 transition-all duration-300 group-hover:opacity-80 group-hover:w-6 group-hover:translate-y-0.5 ${
              isDark ? "bg-black/80" : "bg-[#111318]/25"
            }`}
            aria-hidden="true"
          />

          {/* Interactive tilt & lift on hover */}
          <motion.div
            animate={
              isHovered
                ? { y: -3.5, rotate: -6, scale: 1.05 }
                : { y: 0, rotate: 0, scale: 1 }
            }
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
            }}
            whileTap={{ scale: 0.95, y: 0, rotate: 0 }}
          >
            {icon ? (
              icon
            ) : (
              <Image
                src={isDark ? "/logo-footer.png" : "/logo-header.png"}
                alt="شعار مساعد ريادة"
                width={iconSize * 2}
                height={iconSize * 2}
                quality={100}
                priority
                style={{ width: iconSize, height: iconSize }}
                className="object-contain shrink-0"
              />
            )}
          </motion.div>
        </motion.div>

        {/* 2. Text "Growlab": Unmasks in exact sync as the icon sweeps from right to left */}
        <motion.div
          ref={textRef}
          initial={
            trigger === "always"
              ? { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }
              : { clipPath: "inset(0% 0% 0% 100%)", opacity: 0 }
          }
          animate={
            hasStarted
              ? { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }
              : { clipPath: "inset(0% 0% 0% 100%)", opacity: 0 }
          }
          transition={{
            duration: duration,
            ease: easeTransition,
            opacity: { duration: 0.2, ease: "easeOut" },
          }}
          className="relative z-10 overflow-hidden pl-1"
        >
          <span
            className={`block whitespace-nowrap text-[19px] font-bold tracking-tight leading-none ${
              isDark ? "text-white" : "text-[#111318]"
            } ${textClassName}`}
            style={{ letterSpacing: "-0.02em" }}
          >
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 me-1">مساعد</span>
            <span
              className={`font-bold ${
                isDark ? "text-white" : "text-[#111318]"
              }`}
            >
              ريادة
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}
