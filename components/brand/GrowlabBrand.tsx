"use client";

import Link from "next/link";
import GrowlabAnimatedLogo from "./GrowlabAnimatedLogo";

interface GrowlabBrandProps {
  ariaLabel?: string;
  className?: string;
  theme?: "light" | "dark";
  trigger?: "entrance" | "hover" | "interval" | "always" | "manual";
}

export default function GrowlabBrand({
  ariaLabel = "Growlab Home",
  className = "",
  theme = "light",
  trigger = "entrance",
}: GrowlabBrandProps) {
  return (
    <Link
      href="/"
      aria-label={ariaLabel}
      className={`inline-flex items-center select-none outline-none focus-visible:ring-2 focus-visible:ring-[#111318] focus-visible:ring-offset-2 rounded-xl ${className}`}
    >
      <GrowlabAnimatedLogo theme={theme} trigger={trigger} />
    </Link>
  );
}


