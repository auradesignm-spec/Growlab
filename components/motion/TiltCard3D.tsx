"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "emerald" | "cyan" | "gold" | "purple";
  tiltMax?: number;
  onClick?: () => void;
}

export default function TiltCard3D({
  children,
  className = "",
  glowColor = "emerald",
  tiltMax = 12,
  onClick,
}: TiltCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltMax, -tiltMax]), {
    damping: 20,
    stiffness: 250,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltMax, tiltMax]), {
    damping: 20,
    stiffness: 250,
  });

  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const xFromCenter = (e.clientX - rect.left) / width - 0.5;
    const yFromCenter = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(xFromCenter);
    mouseY.set(yFromCenter);

    spotlightX.set(e.clientX - rect.left);
    spotlightY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const glowStyles = {
    emerald: "rgba(16, 185, 129, 0.15)",
    cyan: "rgba(6, 182, 212, 0.15)",
    gold: "rgba(245, 158, 11, 0.15)",
    purple: "rgba(168, 85, 247, 0.15)",
  };

  const borderHoverStyles = {
    emerald: "hover:border-emerald/40 hover:shadow-glow-emerald",
    cyan: "hover:border-cyan/40 hover:shadow-glow-cyan",
    gold: "hover:border-gold/40 hover:shadow-glow-gold",
    purple: "hover:border-purple-500/40",
  };

  return (
    <motion.div
      ref={cardRef}
      style={{
        perspective: 1000,
      }}
      className="relative h-full"
      onClick={onClick}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`relative h-full rounded-2xl border border-white/10 bg-dark-card/80 p-6 backdrop-blur-xl transition-colors duration-300 overflow-hidden ${borderHoverStyles[glowColor]} ${className}`}
      >
        {/* Dynamic Spotlight Radial Mask */}
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: useTransform(
              [spotlightX, spotlightY],
              ([x, y]) =>
                `radial-gradient(400px circle at ${x}px ${y}px, ${glowStyles[glowColor]}, transparent 80%)`
            ),
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full">{children}</div>
      </motion.div>
    </motion.div>
  );
}
