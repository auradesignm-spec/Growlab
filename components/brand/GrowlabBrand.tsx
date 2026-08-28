"use client";

import Link from "next/link";
import Image from "next/image";

interface GrowlabBrandProps {
  ariaLabel?: string;
  className?: string;
}

export default function GrowlabBrand({
  ariaLabel = "Growlab Home",
  className = "",
}: GrowlabBrandProps) {
  return (
    <Link
      href="/"
      aria-label={ariaLabel}
      className={`group relative inline-flex items-center gap-2.5 py-1 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#111318] focus-visible:ring-offset-2 rounded-xl transition-opacity active:opacity-80 ${className}`}
    >
      <div className="relative flex shrink-0 items-center justify-center">
        <Image
          src="/logo-header.png"
          alt="Growlab"
          width={34}
          height={34}
          priority
          className="h-[34px] w-[34px] shrink-0 object-contain"
        />
      </div>

      <span
        className="block whitespace-nowrap text-[16.5px] font-bold tracking-tight text-[#111318] font-sans"
        style={{ letterSpacing: "-0.02em" }}
      >
        Growlab
      </span>
    </Link>
  );
}
