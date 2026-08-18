# Growlab — موقع الشراكة (Next.js)

موقع تعريفي احترافي لـ Growlab، مبني بـ Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## التشغيل محليًا

```bash
npm install
npm run dev
```

افتح http://localhost:3000

## البناء للنشر

```bash
npm run build
npm start
```

يشتغل مباشرة على Vercel: ادفعوا الكود لمستودع GitHub وربطوه بـ Vercel، أو نفذوا `vercel` من الطرفية.

## قبل النشر الفعلي

- بدّلوا روابط الواتساب (`href="#"` في `components/Contact.tsx`) برابط حقيقي بصيغة
  `https://wa.me/968XXXXXXXX`
- اربطوا نموذج التواصل بخدمة إرسال فعلية (مثال: Resend، Formspree، أو API خاص بكم) —
  حاليًا النموذج يتحقق من الحقول ويعرض رسالة تأكيد فقط، بدون إرسال فعلي
- عدّلوا رابط "احجز مكالمة تعارف مجانية" بربطه بأداة حجز مواعيد (Calendly أو مشابه)

## هيكل المشروع

```
app/
  layout.tsx      الخطوط + إعدادات RTL العامة
  page.tsx         يجمع كل الأقسام
  globals.css       أنماط عامة (الخط المنقّط، الـ eyebrow)
components/
  Header.tsx        شريط تنقل ثابت
  Hero.tsx           القسم الرئيسي + خط النمو المتحرك
  GrowthLine.tsx      رسم SVG متحرك (Client Component)
  Problem.tsx         بطاقات المشكلة
  HowItWorks.tsx        خطوات الحل الثلاث
  Pricing.tsx        الباقتين
  Compare.tsx         جدول المقارنة
  Founders.tsx        قصة المؤسسين
  Contact.tsx        نموذج التواصل + واتساب
  Footer.tsx          تذييل الصفحة
```
