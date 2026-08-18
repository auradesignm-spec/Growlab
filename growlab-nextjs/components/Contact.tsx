"use client";

import { useState, FormEvent } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const biz = (form.elements.namedItem("biz") as HTMLInputElement).value.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value.trim();

    if (!name || !biz || !phone) {
      setError("عبّي الاسم، اسم النشاط، ورقم واتساب قبل الإرسال.");
      return;
    }
    setError("");
    setSent(true);
    form.reset();
  }

  return (
    <section id="contact" className="bg-ink py-20 text-onDark md:py-24">
      <div className="mx-auto max-w-wrap px-6">
        <div className="eyebrow" style={{ color: "#E7CFA0" }}>
          لنبدأ
        </div>
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">جاهز تشوف الفرق؟</h2>
        <p className="mt-3.5 max-w-xl text-lg text-onDarkSoft">
          احجز استشارة مجانية 15 دقيقة، أو تواصل معنا مباشرة على واتساب.
        </p>

        <div className="mt-11 grid grid-cols-1 items-start gap-14 md:grid-cols-2">
          <form onSubmit={handleSubmit}>
            <Field id="name" label="الاسم" placeholder="اسمك الكامل" type="text" />
            <Field id="biz" label="اسم النشاط التجاري" placeholder="مثال: متجر أثاث المنزل" type="text" />
            <Field id="phone" label="رقم واتساب" placeholder="+968 XXXXXXXX" type="tel" />

            <div className="mb-4">
              <label htmlFor="msg" className="mb-1.5 block font-mono text-[13.5px] text-onDarkSoft">
                وش تحتاج بالضبط؟
              </label>
              <textarea
                id="msg"
                name="msg"
                placeholder="حدثنا شوي عن نشاطك وهدفك"
                className="min-h-[100px] w-full rounded-lg border border-onDark/25 bg-onDark/[0.06] px-3.5 py-3 text-[15px] text-onDark placeholder:text-onDarkSoft/50 focus:border-gold focus:outline-none"
              />
            </div>

            {error && <p className="mb-3 text-sm text-[#E39284]">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-gold py-3.5 text-[15px] font-semibold text-[#241A08] transition-transform active:scale-95"
            >
              أرسل الطلب
            </button>

            {sent && (
              <p className="mt-3 text-[13px] text-onDarkSoft">
                وصلنا طلبك. بنرجع لك خلال ٢٤ ساعة على واتساب.
              </p>
            )}
          </form>

          <div className="pt-2">
            <a
              href="#"
              className="mb-4 flex items-center gap-3.5 rounded-xl border border-onDark/20 bg-onDark/[0.06] px-5 py-4.5"
            >
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-teal" />
              <span>
                <b className="block text-[15px] text-onDark">تواصل مباشر على واتساب</b>
                <span className="text-[13px] text-onDarkSoft">رد سريع خلال ساعات العمل</span>
              </span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3.5 rounded-xl border border-onDark/20 bg-onDark/[0.06] px-5 py-4.5"
            >
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gold" />
              <span>
                <b className="block text-[15px] text-onDark">احجز مكالمة تعارف مجانية</b>
                <span className="text-[13px] text-onDarkSoft">١٥ دقيقة، بدون أي التزام</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  placeholder,
  type,
}: {
  id: string;
  label: string;
  placeholder: string;
  type: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block font-mono text-[13.5px] text-onDarkSoft">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-onDark/25 bg-onDark/[0.06] px-3.5 py-3 text-[15px] text-onDark placeholder:text-onDarkSoft/50 focus:border-gold focus:outline-none"
      />
    </div>
  );
}
