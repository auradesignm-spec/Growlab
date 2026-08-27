"use client";

import React from "react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  showLabel?: boolean;
  className?: string;
  tooltip?: string;
}

export default function VerifiedBadge({
  size = "md",
  label = "موثق رسمياً",
  showLabel = false,
  className = "",
  tooltip = "حساب موثق ومطابق رسمياً في منصة Growlab",
}: VerifiedBadgeProps) {
  const sizeMap = {
    sm: {
      icon: "h-3.5 w-3.5",
      text: "text-[10px]",
      gap: "gap-1",
      container: "py-0.5 px-1.5",
    },
    md: {
      icon: "h-4.5 w-4.5",
      text: "text-xs",
      gap: "gap-1.5",
      container: "py-1 px-2.5",
    },
    lg: {
      icon: "h-5 w-5",
      text: "text-sm",
      gap: "gap-2",
      container: "py-1.5 px-3",
    },
    xl: {
      icon: "h-6 w-6",
      text: "text-base",
      gap: "gap-2.5",
      container: "py-2 px-3.5",
    },
  };

  const current = sizeMap[size] || sizeMap.md;

  const badgeIcon = (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${current.icon}`}
      title={tooltip}
      aria-label="Verified Account Badge"
    >
      {/* 8-pointed star / scalloped blue rosette */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full text-sky-500 drop-shadow-[0_1px_4px_rgba(14,165,233,0.45)]"
      >
        <path
          d="M12 2L14.7 4.2C15.2 4.6 15.8 4.8 16.4 4.7L19.8 4.2L20.4 7.6C20.5 8.2 20.8 8.8 21.3 9.2L23.7 11.5L22 14.5C21.7 15.1 21.6 15.7 21.8 16.3L22.6 19.6L19.3 20.4C18.7 20.5 18.2 20.9 17.8 21.4L15.6 24L12.5 22.5C12 22.3 11.4 22.3 10.9 22.5L7.8 24L5.6 21.4C5.2 20.9 4.7 20.5 4.1 20.4L0.8 19.6L1.6 16.3C1.8 15.7 1.7 15.1 1.4 14.5L-0.3 11.5L2.1 9.2C2.6 8.8 2.9 8.2 3 7.6L3.6 4.2L7 4.7C7.6 4.8 8.2 4.6 8.7 4.2L12 2Z"
          fill="#0284C7"
        />
        <path
          d="M12 3L14.5 5C15 5.4 15.6 5.6 16.2 5.5L19.3 5L19.9 8.1C20 8.7 20.3 9.3 20.8 9.7L23 11.8L21.4 14.6C21.1 15.2 21 15.8 21.2 16.4L21.9 19.4L18.9 20.1C18.3 20.2 17.8 20.6 17.4 21.1L15.4 23.5L12.5 22.1C12 21.9 11.4 21.9 10.9 22.1L8 23.5L6 21.1C5.6 20.6 5.1 20.2 4.5 20.1L1.5 19.4L2.2 16.4C2.4 15.8 2.3 15.2 2 14.6L0.4 11.8L2.6 9.7C3.1 9.3 3.4 8.7 3.5 8.1L4.1 5L7.2 5.5C7.8 5.6 8.4 5.4 8.9 5L12 3Z"
          fill="#38BDF8"
        />
        {/* Crisp checkmark */}
        <path
          d="M8.5 12L11 14.5L16 9"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  if (!showLabel) {
    return <span className={`inline-flex items-center ${className}`}>{badgeIcon}</span>;
  }

  return (
    <span
      className={`inline-flex items-center ${current.gap} rounded-full border border-sky-500/30 bg-sky-500/10 ${current.container} font-semibold text-sky-700 dark:text-sky-300 shadow-xs ${className}`}
      title={tooltip}
    >
      {badgeIcon}
      <span className={current.text}>{label}</span>
    </span>
  );
}
