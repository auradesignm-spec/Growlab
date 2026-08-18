"use client";

import { useState, FormEvent } from "react";
import { MessageCircle, Send, CheckCircle2, AlertCircle, Phone, Calendar, ArrowLeft, Sparkles } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    biz: "",
    phone: "",
    plan: "باقة الشراكة",
    budget: "$500 - $1,500",
    msg: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      errs.name = "يرجى كتابة اسمك الكريم";
    }
    if (!formData.biz.trim()) {
      errs.biz = "يرجى كتابة اسم نشاطك أو متجرك";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      errs.phone = "يرجى إدخال رقم هاتف/واتساب صحيح";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  const buildWhatsAppUrl = () => {
    const text = `مرحباً فريق Growlab 👋\n\nأرغب بطلب استشارة لشراكة نمو:\n• الاسم: ${formData.name || "—"}\n• النشاط: ${formData.biz || "—"}\n• الباقة المطلوبة: ${formData.plan}\n• الميزانية الإعلانية: ${formData.budget}\n• تفاصيل إضافية: ${formData.msg || "استفسار عام"}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="contact" className="bg-ink py-20 text-onDark md:py-28 relative overflow-hidden">
      
      {/* Ambient background blur */}
      <div className="pointer-events-none absolute -top-40 right-10 h-80 w-80 rounded-full bg-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-teal/15 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="eyebrow" style={{ color: "#E7CFA0" }}>
            لنبدأ رحلة النمو معاً
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl text-onDark leading-tight">
            جاهز لمضاعفة مبيعاتك وأتمتة متجرك؟
          </h2>
          <p className="mt-4 text-base sm:text-lg text-onDarkSoft leading-relaxed">
            احجز استشارة استراتيجية مجانية مدتها 15 دقيقة لتحليل متجرك، أو تواصل مباشرة مع المؤسسين عبر واتساب.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          
          {/* Form Container */}
          <div className="lg:col-span-7 rounded-2xl border border-onDark/15 bg-onDark/[0.04] p-6 sm:p-9 backdrop-blur-md shadow-2xl">
            
            {sent ? (
              <div className="py-10 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal/20 text-teal border border-teal/40">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="font-display text-2xl font-bold text-onDark mb-2">
                  تم استلام طلبك بنجاح!
                </h3>
                <p className="text-sm text-onDarkSoft max-w-md mx-auto leading-relaxed mb-6">
                  سيتواصل معك أحد مؤسسي Growlab شخصياً عبر واتساب خلال أقل من 12 ساعة لمناقشة خطة نمو متجرك.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#241A08] shadow-md hover:bg-gold-soft transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>متابعة فورية على واتساب</span>
                  </a>
                  <button
                    onClick={() => {
                      setSent(false);
                      setFormData({
                        name: "",
                        biz: "",
                        phone: "",
                        plan: "باقة الشراكة",
                        budget: "$500 - $1,500",
                        msg: "",
                      });
                    }}
                    className="w-full sm:w-auto rounded-full border border-onDark/30 px-6 py-3 text-sm font-semibold text-onDark hover:bg-onDark/10 transition-all"
                  >
                    إرسال طلب آخر
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                
                {/* Plan Selection Radios */}
                <div>
                  <label className="mb-2 block font-mono text-xs text-onDarkSoft">
                    اختر نوع الشراكة المفضل:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {["باقة الانطلاق", "باقة الشراكة"].map((p) => (
                      <label
                        key={p}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs sm:text-sm font-semibold transition-all ${
                          formData.plan === p
                            ? "border-gold bg-gold/15 text-onDark"
                            : "border-onDark/20 bg-onDark/[0.04] text-onDarkSoft hover:bg-onDark/[0.08]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="plan"
                            value={p}
                            checked={formData.plan === p}
                            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                            className="text-gold focus:ring-0"
                          />
                          <span>{p}</span>
                        </div>
                        {p === "باقة الشراكة" && (
                          <span className="rounded-md bg-gold/20 px-1.5 py-0.5 text-[10px] text-gold-soft font-mono">
                            الأكثر طلباً
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="form-name" className="mb-1.5 block font-mono text-xs text-onDarkSoft">
                    الاسم الكريم *
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    placeholder="مثال: أحمد الحارثي"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-onDark placeholder:text-onDarkSoft/40 focus:outline-none transition-colors ${
                      errors.name
                        ? "border-danger bg-danger/10 focus:border-danger"
                        : "border-onDark/20 bg-onDark/[0.06] focus:border-gold"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#E39284]">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Business Field */}
                <div>
                  <label htmlFor="form-biz" className="mb-1.5 block font-mono text-xs text-onDarkSoft">
                    اسم المتجر / النشاط التجاري *
                  </label>
                  <input
                    id="form-biz"
                    type="text"
                    value={formData.biz}
                    onChange={(e) => {
                      setFormData({ ...formData, biz: e.target.value });
                      if (errors.biz) setErrors({ ...errors, biz: "" });
                    }}
                    placeholder="مثال: متجر رواء للعطور / شركة البناء الحديث"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-onDark placeholder:text-onDarkSoft/40 focus:outline-none transition-colors ${
                      errors.biz
                        ? "border-danger bg-danger/10 focus:border-danger"
                        : "border-onDark/20 bg-onDark/[0.06] focus:border-gold"
                    }`}
                  />
                  {errors.biz && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#E39284]">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.biz}</span>
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="form-phone" className="mb-1.5 block font-mono text-xs text-onDarkSoft">
                    رقم واتساب للتواصل السريع *
                  </label>
                  <input
                    id="form-phone"
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    placeholder="+968 9XXXXXXX"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-onDark placeholder:text-onDarkSoft/40 focus:outline-none transition-colors text-right ${
                      errors.phone
                        ? "border-danger bg-danger/10 focus:border-danger"
                        : "border-onDark/20 bg-onDark/[0.06] focus:border-gold"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#E39284]">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Budget Selection */}
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-onDarkSoft">
                    الميزانية الإعلانية الشهرية المتوقعة:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["$200 - $500", "$500 - $1,500", "+$1,500"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFormData({ ...formData, budget: b })}
                        className={`rounded-lg border py-2 text-xs font-mono font-medium transition-all ${
                          formData.budget === b
                            ? "border-gold bg-gold/20 text-onDark"
                            : "border-onDark/20 bg-onDark/[0.04] text-onDarkSoft hover:bg-onDark/[0.08]"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="form-msg" className="mb-1.5 block font-mono text-xs text-onDarkSoft">
                    أهدافك أو استفسارات إضافية (اختياري)
                  </label>
                  <textarea
                    id="form-msg"
                    rows={3}
                    value={formData.msg}
                    onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                    placeholder="حدثنا باختصار عن منتجاتك والتحديات التي تواجهها حالياً..."
                    className="w-full rounded-xl border border-onDark/20 bg-onDark/[0.06] px-4 py-3 text-sm text-onDark placeholder:text-onDarkSoft/40 focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Submit Action */}
                <button
                  id="submit-contact-btn"
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-gold py-4 text-sm sm:text-base font-bold text-[#241A08] shadow-lg transition-all hover:bg-gold-soft hover:shadow-xl active:scale-98 disabled:opacity-70"
                >
                  {loading ? (
                    <span>جاري الإرسال...</span>
                  ) : (
                    <>
                      <span>إرسال طلب الاستشارة المجانية</span>
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Direct Channels & Trust Pillars */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-2xl border border-onDark/15 bg-onDark/[0.04] p-6 sm:p-7 backdrop-blur-md">
              <h3 className="font-display text-xl font-bold text-onDark mb-2">
                تفضل المحادثة المباشرة؟
              </h3>
              <p className="text-xs sm:text-sm text-onDarkSoft leading-relaxed mb-6">
                فريقنا متاح مباشرة على واتساب للإجابة على أي استفسار فوراً وبدون الحاجة لانتظار إيميلات.
              </p>

              <div className="space-y-3">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 p-4 transition-all hover:bg-[#25D366]/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366] text-white">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <b className="block text-sm text-onDark">محادثة واتساب فورية</b>
                      <span className="text-xs text-onDarkSoft">تواصل مباشر مع المؤسسين</span>
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-[#25D366] transition-transform group-hover:-translate-x-1" />
                </a>

                <a
                  href="#contact"
                  className="flex items-center gap-3 rounded-xl border border-onDark/15 bg-onDark/[0.04] p-4 text-onDark hover:bg-onDark/[0.08] transition-colors"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 text-gold">
                    <Calendar className="h-5 w-5" />
                  </span>
                  <div>
                    <b className="block text-sm text-onDark">استشارة استراتيجية (15 دقيقة)</b>
                    <span className="text-xs text-onDarkSoft">عبر Google Meet أو اتصال هاتفي</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="rounded-xl border border-onDark/10 bg-onDark/[0.02] p-5 space-y-3 text-xs text-onDarkSoft">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold shrink-0" />
                <span>نرد على كافة الاستفسارات والطلبات خلال ساعات العمل بأقل من ساعة.</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold shrink-0" />
                <span>بياناتك ونشاطك التجاري محمية بسرية تامة.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

