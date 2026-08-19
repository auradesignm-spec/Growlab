"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { Bot, CheckCircle2, Heart } from "lucide-react";

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="relative border-t border-white/10 bg-dark-2/90 pt-16 pb-12 text-onDarkSoft">
      <div className="max-w-wrap mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald text-dark font-extrabold shadow-glow-emerald">
                <Bot className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white font-display">
                SENTHORA AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-onDarkSoft max-w-sm leading-relaxed font-body">
              {t.footer.tagline}
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-3 py-1 text-xs font-mono font-bold text-emerald border border-emerald/30">
              <span className="h-2 w-2 rounded-full bg-emerald animate-ping" />
              <span>{t.footer.systemStatus}</span>
            </div>
          </div>

          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              {t.footer.productHeading}
            </h4>
            <ul className="space-y-2 text-xs font-body">
              <li>
                <a href="#features" className="hover:text-emerald transition-colors">
                  {lang === "ar" ? "وكيل المبيعات الذكي" : "AI Sales Closer"}
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald transition-colors">
                  {lang === "ar" ? "إعلانات ميتا وتيك توك" : "Meta & TikTok Engine"}
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-emerald transition-colors">
                  {lang === "ar" ? "المختبر الحي" : "Interactive Sandbox"}
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-emerald transition-colors">
                  {lang === "ar" ? "حاسبة العائد" : "ROI Calculator"}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              {t.footer.solutionsHeading}
            </h4>
            <ul className="space-y-2 text-xs font-body">
              <li>
                <a href="#comparison" className="hover:text-emerald transition-colors">
                  {lang === "ar" ? "متاجر العطور والجمال" : "Perfumes & Beauty"}
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-emerald transition-colors">
                  {lang === "ar" ? "الإلكترونيات والأجهزة" : "Electronics & Gadgets"}
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-emerald transition-colors">
                  {lang === "ar" ? "الأزياء والإكسسوارات" : "Fashion & Apparel"}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              {t.footer.companyHeading}
            </h4>
            <ul className="space-y-2 text-xs font-body">
              <li>
                <a href="#testimonials" className="hover:text-emerald transition-colors">
                  {lang === "ar" ? "قصص النجاح" : "Customer Stories"}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald transition-colors">
                  {lang === "ar" ? "الأسئلة الشائعة" : "FAQ & Knowledge Base"}
                </a>
              </li>
              <li>
                <span className="text-muted font-mono text-[11px]">
                  WhatsApp Support: +968 9000 0000
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted">
          <div>{t.footer.rights}</div>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="text-white font-bold">Senthora Growlab Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
