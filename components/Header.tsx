"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";

const STORY_LINKS = [
  { href: "/#manifesto", label: "البيان" },
  { href: "/#gallery", label: "المعرض" },
  { href: "/#method", label: "المنهج" },
  { href: "/#club", label: "النادي" },
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  return (
    <header className="relative z-40 border-b border-obsidian bg-linen">
      <div className="flex items-stretch justify-between">
        <Link
          href="/"
          className="flex items-center gap-4 px-5 py-5 sm:px-8"
          aria-label="Growlab — الصفحة الرئيسية"
        >
          <span className="font-west text-[13px] font-black uppercase tracking-[0.38em]">
            Growlab
          </span>
          <span className="hidden font-serif text-[13px] italic text-muted sm:inline">
            Vol. I — Private Club
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 border-s border-obsidian px-8 md:flex"
          aria-label="التنقل الرئيسي"
        >
          {STORY_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-mast">
              {link.label}
            </a>
          ))}
          <Link href="/shop" className="nav-mast">
            المتجر
          </Link>
          <Link href="/dashboard" className="nav-mast">
            البوابة
          </Link>
        </nav>

        <a
          href="/#contact"
          className="hidden items-center border-s border-obsidian bg-obsidian px-7 font-west text-[11px] uppercase tracking-[0.28em] text-linen hover:bg-blood md:inline-flex"
        >
          اطلب الدخول
        </a>

        <button
          type="button"
          className="inline-flex items-center border-s border-obsidian px-5 font-west text-[11px] uppercase tracking-[0.24em] md:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "إغلاق" : "فهرس"}
        </button>
      </div>

      {open && (
        <nav
          id={menuId}
          className="border-t border-obsidian bg-linen px-5 py-8 md:hidden"
          aria-label="قائمة الجوال"
        >
          <div className="flex flex-col gap-5">
            {STORY_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-display text-3xl"
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
            <Link href="/shop" className="font-display text-3xl" onClick={closeMenu}>
              المتجر العام
            </Link>
            <Link href="/dashboard" className="font-display text-3xl" onClick={closeMenu}>
              بوابة الشركاء
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
