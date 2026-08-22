# Growlab

سوق عمولة عماني: تاجر ينشر منتجاً، مسوّق يبيع عبر رابط، المشتري يطلب كضيف ويدفع نقداً عند الاستلام. العمولة و6٪ تُخصم من محفظة التاجر بعد التحصيل فقط.

## التشغيل محلياً

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

افتح http://localhost:3000

القاعدة المحلية الافتراضية SQLite (`DATABASE_URL=file:./prisma/dev.db`).

## الإنتاج (Vercel + Neon)

1. أنشئ قاعدة Postgres على [Neon](https://neon.tech) وانسخ سلسلة الاتصال.
2. في Vercel اضبط `DATABASE_URL` على تلك السلسلة (تبدأ بـ `postgresql://`).
3. اضبط مفاتيح Clerk و`ADMIN_CLERK_USER_IDS`.
4. انشر. البناء يشغّل `prisma generate` ثم `migrate deploy` **بدون زرع ديمو**. البيانات تبقى.

لا تضع `ALLOW_DEV_IMPERSONATION` على Vercel.

## واتساب

رقم العمل في `lib/constants.ts`. نموذج التواصل يحفظ الطلب في القاعدة ويفتح واتساب.
