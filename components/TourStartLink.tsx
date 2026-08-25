"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import { startProductTour, tourIsDone } from "@/lib/productTour";

export default function TourStartLink({
  href,
  className,
  children,
  source,
  guide,
  bubble,
  onNavigate,
}: {
  readonly href: string;
  readonly className?: string;
  readonly children: ReactNode;
  readonly source: string;
  readonly guide?: string;
  readonly bubble?: boolean;
  readonly onNavigate?: () => void;
}) {
  return (
    <a
      href={href}
      className={className}
      data-guide={guide}
      data-bubble-item={bubble ? true : undefined}
      style={bubble ? { color: "#111318" } : undefined}
      onClick={(event) => {
        onNavigate?.();
        if (tourIsDone()) return;
        event.preventDefault();
        track("Product Tour Started", { source });
        startProductTour();
      }}
    >
      {children}
    </a>
  );
}
