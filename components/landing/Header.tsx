"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/motion/LanguageSwitcher";
import MagneticButton from "@/components/motion/MagneticButton";
import { Bot, Sparkles, Menu, X, ArrowUpRight, ArrowLeft, ArrowRight, Zap, Layers } from "lucide-react";

interface HeaderProps {
  onOpenDashboard?: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export default function Header({ onOpenDashboard, onScrollToSection }: HeaderProps) {
  const { t, isRtl, lang } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "features", label: t.nav.features },
    { id: "showcase", label: t.nav.showcase },
    { id: "calculator", label: t.nav.calculator },
    { id: "comparison", label: t.nav.comparison },
    { id: "testimonials", label: t.nav.testimonials },
    { id: "faq", label: t.nav.faq },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-dark/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-teal shadow-glow-emerald border border-emerald-soft/40 transition-transform duration-300 group-hover:scale-105">
              <Bot className="h-5 w-5 text-dark" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-soft opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald" />
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-display">
                  SENTHORA
                </span>
                <span className="inline-block rounded-md bg-emerald/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald border border-emerald/30">
                  AI 3.0
                </span>
              </div>
              <span className="text-[10px] text-onDarkSoft font-mono tracking-wider">
                GROWLAB ENGINE
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 rounded-2xl bg-dark-2/80 p-1.5 border border-white/10 backdrop-blur-md">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                onMouseEnter={() => setHoveredNav(link.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className="relative px-3.5 py-1.5 text-xs font-semibold text-onDarkSoft hover:text-onDark transition-colors duration-200 cursor-pointer"
              >
                <span className="relative z-10">{link.label}</span>
                {hoveredNav === link.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-xl bg-white/10"
                    transition={{ duration: 0.15 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Controls: Language Switcher & CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSwitcher />

            <MagneticButton
              variant="primary"
              size="sm"
              onClick={onOpenDashboard}
              className="gap-2 font-bold"
            >
              <Zap className="h-4 w-4" />
              <span>{t.nav.openDashboard}</span>
              {isRtl ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </MagneticButton>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-2 border border-white/10 text-onDark hover:bg-dark-3 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 z-40 bg-dark/95 backdrop-blur-2xl border-b border-white/10 p-6 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-2 text-left rtl:text-right font-medium text-sm text-onDark hover:bg-dark-3 hover:text-emerald transition-colors"
                >
                  <span>{link.label}</span>
                  {isRtl ? (
                    <ArrowLeft className="h-4 w-4 text-muted" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted" />
                  )}
                </button>
              ))}

              <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
                <MagneticButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenDashboard) onOpenDashboard();
                  }}
                  className="w-full justify-center"
                >
                  <Zap className="h-4 w-4" />
                  <span>{t.nav.openDashboard}</span>
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
