"use client";

import { useState } from "react";

const links = [
  { href: "#problem", label: "المشكلة" },
  { href: "#how", label: "كيف نشتغل" },
  { href: "#pricing", label: "الباقات" },
  { href: "#compare", label: "لماذا نحن" },
  { href: "#founders", label: "قصتنا" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-wrap items-center justify-between px-6 py-4">
        <div className="font-display text-xl font-black">
          Growlab<span className="text-gold">.</span>
        </div>

        <nav className="hidden gap-7 text-[15px] text-muted md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ink_text transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-onDark md:inline-block"
        >
          تواصل معنا
        </a>

        <button
          className="text-2xl text-ink_text md:hidden"
          aria-label="فتح القائمة"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-line px-6 py-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="py-2 text-[15px] text-muted"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-2 rounded-full bg-ink px-5 py-2.5 text-center text-sm font-semibold text-onDark"
            onClick={() => setOpen(false)}
          >
            تواصل معنا
          </a>
        </div>
      )}
    </header>
  );
}
