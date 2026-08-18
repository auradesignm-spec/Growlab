"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ArrowLeft, Menu, X, Sparkles } from "lucide-react";

const links = [
  { href: "#problem", label: "المشكلة" },
  { href: "#how", label: "كيف نشتغل" },
  { href: "#pricing", label: "الباقات" },
  { href: "#compare", label: "لماذا نحن" },
  { href: "#founders", label: "قصتنا" },
];

interface HeaderProps {
  onOpenDashboard?: () => void;
}

export default function Header({ onOpenDashboard }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line/80 bg-paper/95 shadow-sm backdrop-blur-md py-3"
          : "border-b border-line/40 bg-paper/90 backdrop-blur-sm py-4"
      }`}
    >
      <div className="mx-auto flex max-w-wrap items-center justify-between px-5 md:px-6">
        {/* Brand Logo & Status Tag */}
        <div className="flex items-center gap-3.5">
          <a
            href="#"
            className="group font-display text-2xl font-black tracking-tight text-ink transition-colors hover:text-teal"
          >
            Growlab
            <span className="inline-block text-gold transition-transform group-hover:scale-125">.</span>
          </a>
          <span className="hidden items-center gap-1.5 rounded-full border border-teal/20 bg-teal/10 px-2.5 py-0.5 text-[11px] font-medium text-teal lg:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
            منصة نمو وأتمتة مبيعات
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-[14.5px] font-medium text-muted md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative py-1 transition-colors hover:text-ink after:absolute after:bottom-0 after:right-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-4 py-2 text-xs font-bold text-[#AD7A2A] shadow-xs transition-all hover:bg-gold hover:text-[#241A08] active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>لوحة تحكم الشركات (SaaS)</span>
            </button>
          )}

          <a
            href="https://wa.me/?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D9%81%D8%B1%D9%8A%D9%82%20Growlab%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%D9%83%D9%85"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-xs transition-all hover:border-gold hover:bg-gold/5"
            aria-label="تواصل عبر واتساب"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            <span>واتساب</span>
          </a>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-onDark shadow-md transition-all hover:bg-ink-2 hover:shadow-lg active:scale-95"
          >
            <span>احجز استشارة</span>
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          id="mobile-menu-btn"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white/80 text-ink transition-colors hover:bg-white md:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div
          id="mobile-nav-panel"
          className="border-t border-line/60 bg-paper/98 px-6 py-5 shadow-xl backdrop-blur-lg md:hidden animate-in fade-in slide-in-from-top-2"
        >
          <div className="mb-3 flex items-center justify-between border-b border-line/40 pb-3">
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              شريك نمو واستشارات رقمية
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-medium text-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-ping" />
              متاح
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-ink transition-colors hover:bg-paper-alt"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2.5 border-t border-line/60 pt-4">
            {onOpenDashboard && (
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenDashboard();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/50 bg-gold/15 py-2.5 text-center text-sm font-bold text-[#AD7A2A] shadow-xs active:scale-98"
              >
                <Sparkles className="h-4 w-4 text-gold" />
                <span>لوحة تحكم الشركات ورفع المنتجات</span>
              </button>
            )}
            <a
              href="#contact"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-center text-sm font-semibold text-onDark shadow-md active:scale-98"
              onClick={() => setOpen(false)}
            >
              <span>ابدأ الآن واحجز استشارة</span>
              <ArrowLeft className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D9%81%D8%B1%D9%8A%D9%82%20Growlab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white py-2.5 text-center text-sm font-medium text-ink shadow-xs"
              onClick={() => setOpen(false)}
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <span>محادثة سريعة عبر واتساب</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

