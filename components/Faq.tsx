"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ChevronDown, HelpCircle, MessageCircle, ArrowLeft, ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

export default function Faq() {
  const locale = useLocale();
  const isAr = locale !== "en";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qAr: "كيف يحسب 'مساعد ريادة' نسب التعمين المطلوبة لنشاطي؟",
      qEn: "How does Riyada Assistant calculate Omanisation quotas?",
      aAr: "يعتمد النظام على أحدث القرارات الوزارية الصادرة عن وزارة العمل في سلطنة عُمان. بمجرد اختيار نوع نشاطك وإجمالي القوى العاملة، يقارن الوكيل بين عدد العمانيين الحاليين والنسبة الإلزامية لقطاعك، وينبهك فوراً لعدد الكوادر الوطنية الإضافية المطلوب توظيفها لتفادي وقف المأذونيات أو صدور الغرامات.",
      aEn: "The agent applies latest Ministry of Labour decrees, comparing your current workforce against the mandatory quota for your specific business activity.",
    },
    {
      qAr: "كيف تصلني التنبيهات عبر تطبيق واتساب؟",
      qEn: "How do WhatsApp alerts work?",
      aAr: "عند التسجيل وربط رقم هاتفك العماني، يقوم الوكيل بإرسال تنبيهات تلقائية منظمة قبل 60 يوماً و 30 يوماً و 7 أيام من موعد استحقاق تجديد السجل التجاري، رخصة البلدية، أو تعديل نسب القوى العاملة مع روابط سريعة للإنجاز.",
      aEn: "Upon adding your phone number, the AI agent sends proactive reminders at 60, 30, and 7-day milestones ahead of license renewals or quota updates.",
    },
    {
      qAr: "هل يتطلب استخدام المنصة ربطاً معقدة مع الأنظمة الحكومية؟",
      qEn: "Does it require complex integration with government systems?",
      aAr: "لا، لا يتطلب أي ربط معقد. يمكنك إدخال بيانات مؤسستك في دقيقة واحدة، أو استخدام ميزة الفحص الذكي، أو ربط ملفاتك بسهولة. نحن نوفر لك أداة رقابة مستقلة وموثوقة ترشدك وتذكرك بكل شيء في مكان واحد.",
      aEn: "No complex integration needed. You can set up your business in under a minute.",
    },
    {
      qAr: "ما هي أبرز الغرامات التي تساعد المنصة في تفاديها؟",
      qEn: "What major fines does the platform help prevent?",
      aAr: "تشمل: غرامات عدم تحقيق نسب التعمين المقررة (تصل لـ 600 - 2,400 ر.ع سنوياً)، غرامات تأخر تجديد السجل التجاري ورخص البلدية، غرامات عدم التسجيل في منصة توطين وصندوق الحماية الاجتماعية، وغرامات عدم الامتثال لمتطلبات الفوترة الضريبية.",
      aEn: "It prevents Omanisation shortfall fines, CR and municipal late renewal fees, Tawteen registration penalties, and VAT invoicing non-compliance fines.",
    },
    {
      qAr: "هل بيانات مؤسستي وسجلاتي مشفرة وآمنة؟",
      qEn: "Are my business records safe and confidential?",
      aAr: "نعم، نلتزم بأعلى معايير الأمان والتشفير المصرفي (256-bit SSL). بيانات مؤسستك وسجلاتك محمية بالكامل ولا يتم مشاركتها مع أي جهة خارجية أو أطراف ثالثة.",
      aEn: "Yes, we apply bank-grade 256-bit encryption. Your data is strictly private and never shared.",
    },
    {
      qAr: "هل يمكنني استشارة وكيل الذكاء الاصطناعي في أي وقت؟",
      qEn: "Can I ask the AI Compliance Agent anytime?",
      aAr: "نعم، وكيل ريادة متاح على مدار الساعة طوال أيام الأسبوع (24/7) عبر لوحة التحكم وتطبيق واتساب للإجابة عن إجراءات التراخيص، نقل الكفالة، شروط بطاقات العمل، وتحديثات اللوائح العمانية.",
      aEn: "Yes, available 24/7 via dashboard and WhatsApp for all Oman labor and permit inquiries.",
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative scroll-mt-16 py-section border-t border-slate-200/80 bg-slate-50/50">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="gl-eyebrow text-emerald-700 font-semibold">
              {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
            </p>
            <h2 className="gl-heading text-display-lg font-bold text-slate-900">
              {isAr ? "كل ما تود معرفته عن مساعد ريادة" : "Everything You Need to Know"}
            </h2>
            <p className="gl-lede text-slate-600 text-sm sm:text-base">
              {isAr
                ? "إجابات واضحة ومباشرة حول كيفية عمل الوكيل الذكي وحماية مؤسستك في سلطنة عُمان."
                : "Clear answers on how the AI agent protects your business from regulatory fines."}
            </p>
          </div>
        </Reveal>

        <StageGlow className="mt-8 sm:mt-12" tone="cyan" place="center">
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <Reveal key={faq.qAr} delay={idx * 40}>
                  <div
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isOpen
                        ? "border-emerald-400 bg-white shadow-md ring-2 ring-emerald-500/10"
                        : "border-slate-200/90 bg-white hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 sm:p-5 md:p-6 flex items-center justify-between text-start gap-3 sm:gap-4 focus:outline-none"
                    >
                      <span className="font-bold text-sm sm:text-base text-slate-900">
                        {isAr ? faq.qAr : faq.qEn}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-emerald-600 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        <p>{isAr ? faq.aAr : faq.aEn}</p>
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </StageGlow>

        {/* WhatsApp Support CTA */}
        <Reveal delay={200}>
          <div className="mt-8 sm:mt-12 text-center p-4 sm:p-5 md:p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 max-w-xl mx-auto shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 text-start">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                    {isAr ? "لديك استفسار تنظيمي خاص؟" : "Have a specific question?"}
                  </span>
                  <span className="text-xs text-slate-600 block">
                    {isAr ? "تحدث مباشرة مع مستشار ريادة الذكي" : "Chat with our AI Compliance Advisor"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-compliance-quiz"))}
                className="gl-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs shrink-0"
              >
                <span>{isAr ? "اسأل الوكيل الآن" : "Ask Advisor Now"}</span>
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
