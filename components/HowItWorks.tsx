"use client";

import { useState } from "react";
import { Video, Bot, LineChart, Sparkles, MessageSquare, Check, ArrowLeft, Play } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Video,
    tag: "المحتوى والإعلانات",
    title: "محتوى فيديو مخصص وإدارة حملات يومية",
    text: "نصنع فيديوهات تسويقية عصرية لمنتجك (UGC / Reels) مصممة لإقناع العميل، وندير مزادات إعلانات ميتا (إنستغرام وفيسبوك) يوميًا باختبار مستمر للفئات الإعلانية لتقليل تكلفة الاستحواذ.",
    bullets: ["فيديوهات قصيرة جذابة", "استهداف دقيق للمشترين الجادين", "تحسين يومي للميزانيات"],
  },
  {
    n: "02",
    icon: Bot,
    tag: "الأتمتة والذكاء الاصطناعي",
    title: "وكيل ذكاء اصطناعي يقفل المبيعات 24/7",
    text: "نبرمج وكيل ذكاء اصطناعي خبير بمنتجاتك وسياساتك، يتحدث بلهجة محلية طبيعية، يرد على الرسائل والتعليقات في ثوانٍ، يجيب على الاستفسارات المعقدة، ويثبت عنوان وطلب العميل مباشرة.",
    bullets: ["رد فوري خلال أقل من 5 ثوانٍ", "تدريب مخصص على كتالوج منتجاتك", "تثبيت بيانات الشحن والدفع"],
  },
  {
    n: "03",
    icon: LineChart,
    tag: "الشفافية والنتائج",
    title: "لوحة تحكم حية وتقارير مبيعات فعلية",
    text: "تحصل على لوحة تحكم خاصة ومحدثة لحظيًا توضح: كم صرفت بالإعلانات، كم عميل تواصل، وكم مبيعة مؤكدة أغلقت. لا أرقام وهمية، كل شيء شفاف وواضح.",
    bullets: ["تتبع العائد على الإنفاق (ROAS)", "تحديثات أسبوعية من المؤسسين", "حساب عمولة الأداء بشفافية"],
  },
];

const samplePrompts = [
  { q: "عندكم توصيل لصلالة وكم يستغرق؟", a: "أهلاً بك! نعم نوصل لجميع ولايات سلطنة عمان بما فيها صلالة خلال 48 ساعة فقط والدفع عند الاستلام متاح 🚚✨" },
  { q: "هل يوجد ضمان على المنتج في حال وجود عيب؟", a: "أكيد! كل منتجاتنا مشمولة بضمان استبدال فوري مجاني لمدة 14 يوماً مع استرجاع كامل في حال وجود أي ملاحظة." },
  { q: "أبغى أطلب قطعتين، هل في خصم خاص؟", a: "يسعدنا ذلك! وفرنا لك كود خصم خاص (GROW10) يخصم لك 10% إضافية عند طلب قطعتين أو أكثر. تحب نسجل طلبك الآن؟" },
];

export default function HowItWorks() {
  const [selectedPrompt, setSelectedPrompt] = useState(0);

  return (
    <section id="how" className="py-20 md:py-28 bg-paper">
      <div className="mx-auto max-w-wrap px-5 md:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow justify-center">آلية العمل المتكاملة</div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-ink leading-tight">
            ثلاث خطوات ذكية.. من النقرة إلى الكاش
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted">
            نجمع بين قوة الإعلانات المستهدفة وسرعة الذكاء الاصطناعي لنحول كل زائر إلى عميل دائم.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="group relative rounded-2xl border border-line bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Step Top Bar */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-mono text-3xl font-bold text-line transition-colors group-hover:text-gold/40">
                      {s.n}
                    </span>
                  </div>

                  <span className="inline-block rounded-full bg-paper-alt px-3 py-1 font-mono text-xs font-semibold text-teal mb-3">
                    {s.tag}
                  </span>

                  <h3 className="font-display text-xl font-bold text-ink mb-3 leading-snug">
                    {s.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-muted mb-6">
                    {s.text}
                  </p>
                </div>

                {/* Bullets */}
                <div className="border-t border-line/60 pt-4 space-y-2">
                  {s.bullets.map((b) => (
                    <div key={b} className="flex items-center gap-2 text-xs font-medium text-ink">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive AI Agent Live Experience Box */}
        <div className="mt-16 rounded-2xl border border-gold/40 bg-ink p-6 sm:p-8 text-onDark shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 relative z-10">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 text-gold-soft text-xs font-mono mb-2">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>تجربة تفاعلية حية</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-onDark mb-3">
                جرّب كيف يرد وكيل الذكاء الاصطناعي على عملائك
              </h3>
              <p className="text-sm text-onDarkSoft leading-relaxed mb-5">
                اضغط على أي استفسار شائع وشاهد دقة وسرعة الرد الذكي المجهز لإغلاق الصفقة مباشرة:
              </p>

              <div className="space-y-2">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={p.q}
                    onClick={() => setSelectedPrompt(idx)}
                    className={`w-full text-right p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                      selectedPrompt === idx
                        ? "border-gold bg-gold/15 text-onDark shadow-xs"
                        : "border-onDark/15 bg-onDark/[0.04] text-onDarkSoft hover:bg-onDark/[0.08] hover:text-onDark"
                    }`}
                  >
                    💬 &ldquo;{p.q}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-xl border border-onDark/20 bg-ink-2/80 p-5 shadow-inner">
                <div className="flex items-center justify-between border-b border-onDark/10 pb-3 mb-4 text-xs font-mono text-onDarkSoft">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-gold" />
                    <span>محادثة واتساب مباشرة — محاكاة حية</span>
                  </div>
                  <span className="text-teal">● متصل الآن</span>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tr-xs bg-onDark/[0.12] p-3.5 text-onDark max-w-[85%]">
                      <span className="block font-mono text-[10px] text-onDarkSoft mb-1">العميل</span>
                      {samplePrompts[selectedPrompt].q}
                    </div>
                  </div>

                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="rounded-2xl rounded-tl-xs bg-teal/30 border border-teal/40 p-3.5 text-onDark max-w-[88%]">
                      <div className="flex items-center justify-between font-mono text-[10px] text-gold-soft mb-1">
                        <span>وكيل Growlab (رد في 2.1 ثانية)</span>
                        <span className="flex items-center gap-1 text-[#25D366]">
                          <Check className="h-3 w-3" />
                          <Check className="h-3 w-3 -mr-2" />
                        </span>
                      </div>
                      {samplePrompts[selectedPrompt].a}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-onDark/10 flex items-center justify-between text-xs text-onDarkSoft font-mono">
                  <span>تم تدريب النموذج بالكامل على منتجاتك</span>
                  <a href="#contact" className="text-gold underline hover:text-gold-soft transition-colors">
                    اطلب تهيئة متجرك ←
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

