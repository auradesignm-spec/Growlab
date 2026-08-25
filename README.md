# Growlab

**MVP:** شبكة توزيع أدائي عمانية — تاجر ينشر متجراً، مشتري يطلب COD، ثم يشارك الرابط ويربح على **مشتريات محصّلة** فقط. التاجر يدفع بسقف ميزانية من المحفظة.

## حلقة الـ MVP

```
تسجيل تاجر → KYC → متجر (/dashboard/store/edit) → منتج → حملة → نشر /m/[slug]
→ شراء COD → تفعيل رابط مشاركة → ?ref= → شراء محصّل → خصم محفظة التاجر
```

خارج الـ MVP (موجود لكن غير مُسوَّق): واجهة `/creator` القديمة، طابور صفقات، عينات، AI المتجر (Pro).

## التشغيل محلياً

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run smoke:onboarding
npm run dev
```

افتح http://localhost:3000

القاعدة المحلية الافتراضية SQLite (`DATABASE_URL=file:./prisma/dev.db`).

للديمو التفاعلي على localhost: `ALLOW_DEMO_MODE=true` و `NEXT_PUBLIC_DEMO_MODE=true` (لا تضعها على Vercel).

## الإنتاج (Vercel + Neon)

1. أنشئ قاعدة Postgres على [Neon](https://neon.tech) وانسخ سلسلة الاتصال.
2. في Vercel اضبط `DATABASE_URL` على تلك السلسلة (تبدأ بـ `postgresql://`).
3. اضبط مفاتيح Clerk ثم `ADMIN_EMAILS` ببريدك (أو `ADMIN_CLERK_USER_IDS`).
4. اختياري: Stripe Pro (`STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`).
5. اختياري: `CLERK_WEBHOOK_SECRET` لـ `/api/clerk/webhook`، `OPENAI_API_KEY` لنسخ المتجر.
6. اختياري — Meta/WhatsApp Cloud API (ربط التجار + CTWA): راجع [docs/META_CONNECT.md](docs/META_CONNECT.md). مدرب الإعلان + إطلاق CTWA Advantage+: [docs/META_AD_AGENT.md](docs/META_AD_AGENT.md) و [docs/META_AD_LAUNCH.md](docs/META_AD_LAUNCH.md) (`META_ADS_DRY_RUN` للتجربة المحلية).
7. انشر. البناء يشغّل `prisma generate` ثم `migrate deploy` **بدون زرع ديمو**.

بعد تسجيل الدخول بذلك البريد تُفتح غرفة العمليات على `/dashboard/admin`. محلياً: ازرع القاعدة ثم اختر حساب `admin — قصي` من شريط التطوير (`qusay@growlab.local`).

لا تضع `ALLOW_DEV_IMPERSONATION` أو `ALLOW_DEMO_MODE` على Vercel.

## قواعد الأداء (ملخص)

| الحدث | يدفع؟ |
|--------|--------|
| زيارة الرابط | لا |
| شراء محصّل (fulfill) من `?ref=` | نعم — من سقف الحملة + المحفظة |
| مشاهدات ريل معتمدة (attest) | نعم — CPM للأصل |

## واتساب

رقم العمل في `lib/constants.ts`. نموذج التواصل يحفظ الطلب في القاعدة ويفتح واتساب.
