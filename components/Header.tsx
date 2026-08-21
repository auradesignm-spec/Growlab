"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type { NavLink } from "@/lib/types";

const NAV_LINKS: readonly NavLink[] = [
  { href: "#problem", label: "المشكلة" },
  { href: "#how", label: "كيف نشتغل" },
  { href: "#pricing", label: "الباقات" },
  { href: "#compare", label: "لماذا نحن" },
  { href: "#founders", label: "قصتنا" },
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeMenu]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 shadow-header backdrop-blur-md supports-[backdrop-filter]:bg-paper/80">
      <div className="container-wrap flex items-center justify-between py-4">
        <a
          href="#"
          className="font-display text-xl font-black text-ink_text transition-opacity duration-250 hover:opacity-80 focus-visible:opacity-80"
          aria-label="Growlab — الصفحة الرئيسية"
        >
          Growlab<span className="text-gold">.</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="التنقل الرئيسي">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="btn-ghost hidden px-5 py-2.5 text-sm md:inline-flex">
          تواصل معنا
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink_text transition-colors duration-250 hover:bg-ink/5 focus-visible:bg-ink/5 md:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="sr-only">{open ? "إغلاق" : "فتح"} القائمة</span>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id={menuId}
          className="animate-fade-in-down border-t border-line bg-paper px-4 pb-5 pt-2 md:hidden"
          aria-label="قائمة الجوال"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-[15px] text-muted transition-colors duration-250 hover:bg-ink/5 hover:text-ink_text focus-visible:bg-ink/5"
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="btn-ghost mt-2 w-full py-3 text-center text-sm"
              onClick={closeMenu}
            >
              تواصل معنا
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
