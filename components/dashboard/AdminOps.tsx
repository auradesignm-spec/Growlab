"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { AdminCreatorRow, AdminDashboardData, AdminMerchantRow } from "@/lib/dashboard/admin";
import {
  adminCreateMerchant,
  adminCreditMerchantWallet,
  adminEditCreator,
  adminEditMerchant,
  adminSetAccountStatus,
  adminSetCreatorVerification,
  adminSetMerchantPlan,
  adminSetMerchantVerification,
} from "@/app/(dashboard)/dashboard/admin-actions";
import { formatMoney } from "@/lib/format";
import { EmptyState } from "@/components/dashboard/ui";
import type { VerificationStatus } from "@/lib/domain/enums";

export function KycQueueTab({ data }: { data: AdminDashboardData }) {
  const t = useTranslations("dashboardApp.admin.kyc");
  const [filter, setFilter] = useState<"all" | "cr" | "freelancer" | "creator">("all");
  const [activeDocPreview, setActiveDocPreview] = useState<{ id: string; kind: string; title: string } | null>(null);

  const pendingMerchants = data.merchants.filter((m) => m.verificationStatus === "pending");
  const pendingCreators = data.creators.filter((c) => c.verificationStatus === "pending");

  const crMerchants = pendingMerchants.filter((m) => m.businessType !== "freelancer");
  const freelancerMerchants = pendingMerchants.filter((m) => m.businessType === "freelancer");

  const filteredMerchants =
    filter === "all"
      ? pendingMerchants
      : filter === "cr"
        ? crMerchants
        : filter === "freelancer"
          ? freelancerMerchants
          : [];

  const filteredCreators = filter === "all" || filter === "creator" ? pendingCreators : [];

  const totalPending = pendingMerchants.length + pendingCreators.length;

  return (
    <section className="space-y-6 px-4 py-8 sm:px-8">
      {/* 24-Hour SLA & Support Team Audit Header */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-transparent p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>⏱️ مركز تدقيق الهويات والسجلات التجارية · معيار الاعتماد خلال 24 ساعة</span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-frost sm:text-2xl">
              طلبات التوثيق والتحقق المالي والأمني المعلقة
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-frost-dim sm:text-sm">
              مراجعة وتدقيق هويات التجار والمشاريع وصناع المحتوى ومطابقة السجلات الرسمية لمنح شارة التوثيق الزرقاء ✓.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-line bg-white/80 px-4 py-2.5 text-center shadow-xs dark:bg-slate-900/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-frost-dim">الطلبات المعلقة</p>
              <p className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">{totalPending}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white/80 px-4 py-2.5 text-center shadow-xs dark:bg-slate-900/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-frost-dim">الهدف الزمني (SLA)</p>
              <p className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">24h</p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-5 flex flex-wrap gap-2 pt-2 border-t border-line/60">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filter === "all"
                ? "bg-frost text-white shadow-xs"
                : "border border-line bg-white/60 text-frost-dim hover:bg-white dark:bg-slate-800/60"
            }`}
          >
            جميع الطلبات ({totalPending})
          </button>
          <button
            type="button"
            onClick={() => setFilter("cr")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filter === "cr"
                ? "bg-frost text-white shadow-xs"
                : "border border-line bg-white/60 text-frost-dim hover:bg-white dark:bg-slate-800/60"
            }`}
          >
            سجلات تجارية CR ({crMerchants.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("freelancer")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filter === "freelancer"
                ? "bg-frost text-white shadow-xs"
                : "border border-line bg-white/60 text-frost-dim hover:bg-white dark:bg-slate-800/60"
            }`}
          >
            مشاريع منزلية / حرة ({freelancerMerchants.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("creator")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filter === "creator"
                ? "bg-frost text-white shadow-xs"
                : "border border-line bg-white/60 text-frost-dim hover:bg-white dark:bg-slate-800/60"
            }`}
          >
            صناع المحتوى ({pendingCreators.length})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredMerchants.length === 0 && filteredCreators.length === 0 ? (
        <div className="rounded-3xl border border-line bg-slate-50/50 p-12 text-center dark:bg-slate-900/50">
          <h3 className="text-base font-bold text-frost">لا توجد طلبات تدقيق معلقة في هذا القسم</h3>
          <p className="mt-1 text-xs text-frost-dim">
            تمت مراجعة وتدقيق جميع طلبات التوثيق وفق أعلى معايير الأمان (24h SLA Clean).
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Merchants */}
          {filteredMerchants.map((m) => (
            <MerchantAuditCard
              key={m.id}
              merchant={m}
              onPreviewDoc={(docId, kind) =>
                setActiveDocPreview({ id: docId, kind, title: `${m.businessName} · ${kind}` })
              }
              onApprove={() => adminSetMerchantVerification(m.id, "verified")}
              onReject={(note) => adminSetMerchantVerification(m.id, "rejected", note)}
            />
          ))}

          {/* Pending Creators */}
          {filteredCreators.map((c) => (
            <CreatorAuditCard
              key={c.id}
              creator={c}
              onPreviewDoc={(docId, kind) =>
                setActiveDocPreview({ id: docId, kind, title: `@${c.username} · ${kind}` })
              }
              onApprove={() => adminSetCreatorVerification(c.id, "verified")}
              onReject={(note) => adminSetCreatorVerification(c.id, "rejected", note)}
            />
          ))}
        </div>
      )}

      {/* Document Full View Modal */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {activeDocPreview.kind}
                </p>
                <p className="text-sm font-semibold">{activeDocPreview.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDocPreview(null)}
                className="rounded-full bg-white/10 p-2 text-sm text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            <div className="flex max-h-[75vh] items-center justify-center overflow-auto p-4 bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/kyc/${activeDocPreview.id}`}
                alt={activeDocPreview.kind}
                className="max-h-[70vh] w-auto rounded-xl object-contain shadow-lg"
              />
            </div>
            <div className="flex items-center justify-between border-t border-white/10 p-3 bg-slate-950 text-xs text-frost-dim">
              <span>عرض بجودة المصدر للتدقيق الأمني</span>
              <a
                href={`/api/kyc/${activeDocPreview.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline"
              >
                فتح في نافذة جديدة ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MerchantAuditCard({
  merchant,
  onPreviewDoc,
  onApprove,
  onReject,
}: {
  merchant: AdminMerchantRow;
  onPreviewDoc: (docId: string, kind: string) => void;
  onApprove: () => Promise<void>;
  onReject: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isFreelancer = merchant.businessType === "freelancer";

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <article className="rounded-3xl border border-line bg-white p-5 shadow-xs transition dark:bg-slate-900 sm:p-6">
      {/* Top Card Info Bar */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isFreelancer
                  ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                  : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30"
              }`}
            >
              {isFreelancer ? "مشروع منزلي / فردي (بدون CR)" : "منشأة تجارية معتمدة (سجل CR)"}
            </span>
            {merchant.kycSubmittedAt && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                تم التقديم: {new Date(merchant.kycSubmittedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-lg font-bold text-frost sm:text-xl">{merchant.businessName}</h3>
          <p className="text-xs text-frost-dim">
            المالك: <strong>{merchant.ownerFullName || `${merchant.firstName} ${merchant.lastName}`}</strong> · المدينة: <strong>{merchant.city || "—"}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(onApprove)}
            className="gl-btn-primary !min-h-10 !px-4 !text-xs font-bold shadow-xs disabled:opacity-40"
          >
            اعتماد ومنح الشارة
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => onReject(note || "الوثائق المرفوعة غير مطابقة أو غير واضحة"))}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 text-xs font-bold text-rose-600 hover:bg-rose-500/20 disabled:opacity-40"
          >
            رفض الطلب
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <div className="rounded-2xl border border-line bg-slate-50/60 p-3 dark:bg-slate-800/40">
          <p className="text-[10px] font-bold uppercase text-frost-faint">
            {isFreelancer ? "نوع النشاط" : "رقم السجل التجاري"}
          </p>
          <p className="mt-0.5 font-bold font-mono text-frost truncate">
            {isFreelancer ? "مشروع منزلي / فردي" : merchant.commercialRegNo || "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-slate-50/60 p-3 dark:bg-slate-800/40">
          <p className="text-[10px] font-bold uppercase text-frost-faint">بيانات التواصل</p>
          <p className="mt-0.5 font-mono text-frost truncate">{merchant.phone || merchant.email || "—"}</p>
        </div>

        <div className="rounded-2xl border border-line bg-slate-50/60 p-3 dark:bg-slate-800/40">
          <p className="text-[10px] font-bold uppercase text-frost-faint">حساب الإنستجرام (Instagram)</p>
          {merchant.instagramUrl ? (
            <a
              href={merchant.instagramUrl.startsWith("http") ? merchant.instagramUrl : `https://${merchant.instagramUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block font-bold text-rose-500 hover:underline truncate"
            >
              {merchant.instagramUrl} ↗
            </a>
          ) : (
            <p className="mt-0.5 text-frost-dim">— غير مضاف</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-slate-50/60 p-3 dark:bg-slate-800/40">
          <p className="text-[10px] font-bold uppercase text-frost-faint">حساب التيك توك (TikTok)</p>
          {merchant.tiktokUrl ? (
            <a
              href={merchant.tiktokUrl.startsWith("http") ? merchant.tiktokUrl : `https://${merchant.tiktokUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block font-bold text-slate-800 dark:text-slate-200 hover:underline truncate"
            >
              {merchant.tiktokUrl} ↗
            </a>
          ) : (
            <p className="mt-0.5 text-frost-dim">— غير مضاف</p>
          )}
        </div>
      </div>

      {isFreelancer && merchant.projectDescription && (
        <div className="mt-3 rounded-2xl border border-line bg-purple-500/5 p-3 text-xs">
          <p className="font-bold text-purple-900 dark:text-purple-300">نبذة ونشاط المشروع المنزلي:</p>
          <p className="mt-1 text-frost-dim">{merchant.projectDescription}</p>
        </div>
      )}

      {/* Documents Gallery */}
      <div className="mt-4">
        <p className="text-xs font-bold text-frost mb-2">وثائق التحقق المرفوعة ({merchant.documents.length}):</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {merchant.documents.map((doc) => {
            const kindLabels: Record<string, string> = {
              commercial_register: "وثيقة السجل التجاري",
              owner_id_front: "الهوية (الأمام)",
              owner_id_back: "الهوية (الخلف)",
              face_scan: "الفحص الحي للوجه",
            };
            return (
              <div
                key={doc.id}
                onClick={() => onPreviewDoc(doc.id, kindLabels[doc.kind] || doc.kind)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-slate-100 dark:bg-slate-800 text-center transition hover:border-amber-500 shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/kyc/${doc.id}`}
                  alt={doc.kind}
                  className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
                />
                <div className="p-2 text-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs">
                  <p className="text-[11px] font-bold text-frost truncate">
                    {kindLabels[doc.kind] || doc.kind}
                  </p>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400">تكبير للمعاينة</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rejection Note Box */}
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="سبب الرفض أو ملاحظة للتوجيه (مثال: يرجى تصوير البطاقة بدقة أعلى)..."
          className="gl-input flex-1 text-xs"
        />
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setNote("صورة البطاقة الشخصية غير واضحة")}
            className="rounded-lg border border-line bg-slate-50 px-2 py-1 text-[10px] text-frost hover:bg-slate-100 dark:bg-slate-800"
          >
            + بطاقة غير واضحة
          </button>
          <button
            type="button"
            onClick={() => setNote("يرجى إرفاق رابط الحساب التجاري الصحيح")}
            className="rounded-lg border border-line bg-slate-50 px-2 py-1 text-[10px] text-frost hover:bg-slate-100 dark:bg-slate-800"
          >
            + رابط غير صحيح
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-xs font-bold text-danger">{error}</p>}
    </article>
  );
}

function CreatorAuditCard({
  creator,
  onPreviewDoc,
  onApprove,
  onReject,
}: {
  creator: AdminCreatorRow;
  onPreviewDoc: (docId: string, kind: string) => void;
  onApprove: () => Promise<void>;
  onReject: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <article className="rounded-3xl border border-line bg-white p-5 shadow-xs transition dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            مدير الموارد البشرية / شريك الامتثال
          </span>
          <h3 className="mt-1.5 text-lg font-bold text-frost sm:text-xl">@{creator.username}</h3>
          <p className="text-xs text-frost-dim">
            الاسم القانوني: <strong>{creator.legalName || `${creator.firstName} ${creator.lastName}` || "—"}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(onApprove)}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-sky-700 disabled:opacity-40 active:scale-95"
          >
            <span>✓</span> اعتماد ومنح الشارة الزرقاء
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => onReject(note || "البيانات أو الوثائق غير مطابقة"))}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 text-xs font-bold text-rose-600 hover:bg-rose-500/20 disabled:opacity-40"
          >
            رفض
          </button>
        </div>
      </div>

      {/* Documents */}
      <div className="mt-4">
        <p className="text-xs font-bold text-frost mb-2">الوثائق المرفوعة ({creator.documents.length}):</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {creator.documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onPreviewDoc(doc.id, doc.kind)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-slate-100 dark:bg-slate-800 text-center transition hover:border-amber-500 shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/kyc/${doc.id}`}
                alt={doc.kind}
                className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
              />
              <div className="p-2 text-center bg-white/90 dark:bg-slate-900/90">
                <p className="text-[11px] font-bold text-frost truncate">{doc.kind}</p>
                <span className="text-[10px] text-sky-600 dark:text-sky-400">معاينة</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="سبب الرفض إن وجد..."
        className="gl-input mt-4 text-xs"
      />
      {error && <p className="mt-2 text-xs font-bold text-danger">{error}</p>}
    </article>
  );
}

export function AddMerchantTab() {
  const t = useTranslations("dashboardApp.admin.addMerchant");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    setDone(false);
    startTransition(async () => {
      try {
        await adminCreateMerchant({
          businessName: String(formData.get("businessName") ?? ""),
          commercialRegNo: String(formData.get("commercialRegNo") ?? ""),
          ownerFullName: String(formData.get("ownerFullName") ?? ""),
          city: String(formData.get("city") ?? ""),
          inviteEmail: String(formData.get("inviteEmail") ?? ""),
          verifyNow: formData.get("verifyNow") === "on",
        });
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="max-w-lg font-serif text-sm italic text-frost-dim">{t("hint")}</p>
      <form action={onSubmit} className="mt-6 max-w-xl space-y-4">
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("businessName")}</span>
          <input name="businessName" required className="gl-input mt-1.5" />
        </label>
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("commercialRegNo")}</span>
          <input name="commercialRegNo" required className="gl-input mt-1.5" />
        </label>
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("ownerFullName")}</span>
          <input name="ownerFullName" required className="gl-input mt-1.5" />
        </label>
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("city")}</span>
          <input name="city" required className="gl-input mt-1.5" />
        </label>
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("inviteEmail")}</span>
          <input name="inviteEmail" type="email" required className="gl-input mt-1.5" />
        </label>
        <label className="flex items-center gap-2 font-serif text-sm italic text-frost-dim">
          <input name="verifyNow" type="checkbox" defaultChecked className="accent-signal" />
          {t("verifyNow")}
        </label>
        {error && <p className="font-mono text-xs text-danger">{error}</p>}
        {done && <p className="font-serif text-sm italic text-pulse">{t("done")}</p>}
        <button type="submit" disabled={pending} className="gl-btn-primary disabled:opacity-40">
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>
    </section>
  );
}

export function MerchantAccountRow({
  merchant,
  t,
  tStatus,
}: {
  merchant: AdminMerchantRow;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
}) {
  const [open, setOpen] = useState(false);
  const [banReason, setBanReason] = useState(merchant.banReason ?? "");
  const [topup, setTopup] = useState("");
  const [planNote, setPlanNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <tr className="border-b border-white/10 align-top">
      <td className="px-4 py-3">
        <p className="font-display text-base">{merchant.businessName}</p>
        <p className="font-mono text-[11px] text-frost-dim">
          {merchant.commercialRegNo || "—"} · {merchant.city || "—"}
        </p>
        <p className="mt-1 text-[12px] text-frost-dim">
          {[merchant.firstName, merchant.lastName].filter(Boolean).join(" ") || merchant.ownerFullName}
        </p>
        {merchant.phone ? <p className="font-mono text-[11px] text-frost-dim">{merchant.phone}</p> : null}
        {(merchant.email || merchant.inviteEmail) && (
          <p className="font-mono text-[11px] text-pulse">{merchant.email || merchant.inviteEmail}</p>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-sm">{merchant.productsCount}</td>
      <td className="px-4 py-3">
        <p className="font-west text-[11px] uppercase tracking-[0.16em] text-frost-dim">
          {merchant.plan === "pro" ? t("merchants.planPro") : t("merchants.planFree")}
        </p>
        {merchant.planExpiresAt ? (
          <p className="font-mono text-[10px] text-frost-faint">
            {new Date(merchant.planExpiresAt).toLocaleDateString()}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetMerchantPlan(merchant.id, "pro", { note: planNote }))}
            className="gl-btn-ghost text-[10px] disabled:opacity-40"
          >
            {t("merchants.setPro")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetMerchantPlan(merchant.id, "free", { note: planNote }))}
            className="gl-btn-ghost text-[10px] disabled:opacity-40"
          >
            {t("merchants.setFree")}
          </button>
        </div>
        <input
          value={planNote}
          onChange={(e) => setPlanNote(e.target.value)}
          placeholder={t("merchants.planNote")}
          className="gl-input mt-1 w-full max-w-[10rem] text-[11px]"
        />
      </td>
      <td className="px-4 py-3">
        <p className="font-mono text-sm text-frost">{formatMoney(merchant.walletAvailable)}</p>
        <p className="font-mono text-[11px] text-frost-dim">
          {t("merchants.walletReserved", { amount: formatMoney(merchant.walletReserved) })}
        </p>
        <form
          className="mt-2 flex max-w-[11rem] gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const amount = Number(topup);
            run(async () => {
              await adminCreditMerchantWallet(merchant.id, amount, t("merchants.walletTopupNote"));
              setTopup("");
            });
          }}
        >
          <input
            value={topup}
            onChange={(e) => setTopup(e.target.value)}
            placeholder={t("merchants.walletTopup")}
            className="gl-input w-20"
          />
          <button type="submit" disabled={pending} className="gl-btn-ghost disabled:opacity-40">
            {t("merchants.walletCredit")}
          </button>
        </form>
      </td>
      <td className="px-4 py-3">
        <p className="font-west text-[11px] uppercase tracking-[0.16em] text-frost-dim">
          {tStatus(`verification.${merchant.verificationStatus}` as "verification.pending")}
        </p>
        <p className="mt-1 font-west text-[10px] uppercase tracking-[0.16em] text-danger">
          {merchant.accountStatus === "banned" ? t("merchants.banned") : ""}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetMerchantVerification(merchant.id, "verified"))}
            className="gl-btn-ghost disabled:opacity-40"
          >
            {t("merchants.approve")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetMerchantVerification(merchant.id, "rejected", "Rejected by admin"))}
            className="gl-btn-ghost disabled:opacity-40"
          >
            {t("merchants.reject")}
          </button>
          {merchant.accountStatus === "banned" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => adminSetAccountStatus(merchant.userId, "active"))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("merchants.unban")}
            </button>
          ) : (
            <div className="flex min-w-[12rem] flex-col gap-2">
              <input
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={t("merchants.banReason")}
                className="gl-input"
              />
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => adminSetAccountStatus(merchant.userId, "banned", banReason))}
                className="gl-btn-ghost disabled:opacity-40"
              >
                {t("merchants.ban")}
              </button>
            </div>
          )}
          <button type="button" onClick={() => setOpen((v) => !v)} className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
            {t("merchants.edit")}
          </button>
        </div>
        {open && (
          <form
            className="mt-3 grid max-w-lg grid-cols-2 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              run(() =>
                adminEditMerchant(merchant.id, {
                  businessName: String(form.get("businessName") ?? ""),
                  commercialRegNo: String(form.get("commercialRegNo") ?? ""),
                  ownerFullName: String(form.get("ownerFullName") ?? ""),
                  city: String(form.get("city") ?? ""),
                })
              );
            }}
          >
            <input name="businessName" defaultValue={merchant.businessName} className="gl-input col-span-2" />
            <input name="commercialRegNo" defaultValue={merchant.commercialRegNo} className="gl-input" />
            <input name="city" defaultValue={merchant.city} className="gl-input" />
            <input name="ownerFullName" defaultValue={merchant.ownerFullName} className="gl-input col-span-2" />
            <button type="submit" disabled={pending} className="gl-btn-primary col-span-2 disabled:opacity-40">
              {t("merchants.save")}
            </button>
          </form>
        )}
        {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}

export function CreatorAccountRow({
  creator,
  t,
  tStatus,
}: {
  creator: AdminCreatorRow;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [banReason, setBanReason] = useState(creator.banReason ?? "");

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <tr className="border-b border-white/10 align-top">
      <td className="px-4 py-3">
        <p className="font-display text-base">@{creator.username}</p>
        <p className="text-[12px] text-frost-dim">
          {[creator.firstName, creator.lastName].filter(Boolean).join(" ") || creator.legalName || "—"}
        </p>
        {creator.phone ? <p className="font-mono text-[11px] text-frost-dim">{creator.phone}</p> : null}
        {creator.email ? <p className="font-mono text-[11px] text-pulse">{creator.email}</p> : null}
      </td>
      <td className="px-4 py-3 font-mono text-sm">{creator.tier}</td>
      <td className="px-4 py-3 font-mono text-sm">{creator.dealsCount}</td>
      <td className="px-4 py-3 font-west text-[11px] uppercase tracking-[0.16em] text-frost-dim">
        {tStatus(`verification.${creator.verificationStatus}` as "verification.pending")}
        {creator.accountStatus === "banned" ? ` · ${t("creators.banned")}` : ""}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetCreatorVerification(creator.id, "verified" as VerificationStatus))}
            className="gl-btn-ghost disabled:opacity-40"
          >
            {t("creators.approve")}
          </button>
          {creator.accountStatus === "banned" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => adminSetAccountStatus(creator.userId, "active"))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("creators.unban")}
            </button>
          ) : (
            <div className="flex min-w-[12rem] flex-col gap-2">
              <input
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={t("creators.banReason")}
                className="gl-input"
              />
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => adminSetAccountStatus(creator.userId, "banned", banReason))}
                className="gl-btn-ghost disabled:opacity-40"
              >
                {t("creators.ban")}
              </button>
            </div>
          )}
          <button type="button" onClick={() => setOpen((v) => !v)} className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
            {t("creators.edit")}
          </button>
        </div>
        {open && (
          <form
            className="mt-3 grid max-w-lg gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              run(() =>
                adminEditCreator(creator.id, {
                  username: String(form.get("username") ?? ""),
                  legalName: String(form.get("legalName") ?? ""),
                })
              );
            }}
          >
            <input name="username" defaultValue={creator.username} className="gl-input" />
            <input name="legalName" defaultValue={creator.legalName} className="gl-input" />
            <button type="submit" disabled={pending} className="gl-btn-primary disabled:opacity-40">
              {t("creators.save")}
            </button>
          </form>
        )}
        {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}
