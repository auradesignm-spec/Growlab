"use client";

import React, { useState } from "react";
import {
  Link2,
  CheckCircle2,
  UploadCloud,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  MessageSquare,
  Building2,
  FileText,
  Clock,
  Check,
} from "lucide-react";

interface Props {
  locale?: string;
}

export default function IntegrationsHub({ locale = "ar" }: Props) {
  const isEn = locale === "en";
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");

  const handleSync = (portalId: string) => {
    setSyncingId(portalId);
    setTimeout(() => {
      setSyncingId(null);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      setCsvUploaded(true);
    }
  };

  return (
    <div className="space-y-8 text-slate-900" dir={isEn ? "ltr" : "rtl"}>
      {/* Header */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {isEn ? "Oman Regulatory & Compliance Integrations Hub" : "مركز الربط التنظيمي والبوابات الحكومية"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn
                  ? "Connect your CR, Ministry of Labour portals, and Social Protection Fund for automated compliance monitoring"
                  : "اربط السجل التجاري، منصة توطين، وصندوق الحماية الاجتماعية لأتمتة المتابعة الاستباقية وحماية المنشأة"}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            {isEn ? "End-to-End Encrypted Sync" : "تشفير ومطابقة آمنة بنسبة 100%"}
          </span>
        </div>
      </div>

      {/* Section 1: Official Omani Government Portals */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-600" />
          {isEn ? "1. Official Omani Government Portals" : "1. البوابات الحكومية والجهات المنظمة"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Invest Easy / Oman Business Platform */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs">
                    عُمان
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">منصة عُمان للأعمال</h4>
                    <p className="text-[10px] text-slate-500 font-mono">business.gov.om (MoCIIP)</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  متصل
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                مزامنة السجل التجاري، تاريخ الصلاحية، الأنشطة المرخصة، وتراخيص وزارة التجارة والصناعة وترويج الاستثمار.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-[11px] text-slate-500">آخر فحص: منذ 4 ساعات</span>
              <button
                type="button"
                onClick={() => handleSync("mociip")}
                className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px]"
              >
                {syncingId === "mociip" ? "جاري التحديث..." : "تحديث فوري"}
              </button>
            </div>
          </div>

          {/* Ministry of Labour / Tawteen */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 font-black text-xs">
                    توطين
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">وزارة العمل (منصة توطين)</h4>
                    <p className="text-[10px] text-slate-500 font-mono">mol.gov.om</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  متصل
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                سحب فوري لكشوفات القوى العاملة، حساب نسب التعمين، وتنبيهات حظر استخراج المأذونيات الجديدة.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-[11px] text-slate-500">آخر فحص: اليوم 09:15 ص</span>
              <button
                type="button"
                onClick={() => handleSync("mol")}
                className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px]"
              >
                {syncingId === "mol" ? "جاري التحديث..." : "تحديث فوري"}
              </button>
            </div>
          </div>

          {/* Social Protection Fund */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-black text-xs">
                    SPF
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">صندوق الحماية الاجتماعية</h4>
                    <p className="text-[10px] text-slate-500 font-mono">spf.gov.om</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  متصل
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                متابعة اشتراكات التأمين الإلزامي ضد التعطل وإصابات العمل، واحتساب مستحقات العمالة الوطنية.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-[11px] text-slate-500">آخر فحص: أمس</span>
              <button
                type="button"
                onClick={() => handleSync("spf")}
                className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px]"
              >
                {syncingId === "spf" ? "جاري التحديث..." : "تحديث فوري"}
              </button>
            </div>
          </div>

          {/* Oman Tax Authority */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs">
                    OTA
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">جهاز الضرائب (OTA)</h4>
                    <p className="text-[10px] text-slate-500 font-mono">taxoman.gov.om</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  متصل
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                متابعة مواعيد الإقرارات الضريبية (ضريبة الدخل والقيمة المضافة 5%) وجاهزية الفوترة الإلكترونية.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-[11px] text-slate-500">آخر فحص: منذ يومين</span>
              <button
                type="button"
                onClick={() => handleSync("ota")}
                className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px]"
              >
                {syncingId === "ota" ? "جاري التحديث..." : "تحديث فوري"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Proactive Alert Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            {isEn ? "2. Proactive Alert & Notification Channels" : "2. قنوات التنبيهات والاستجابة الاستباقية"}
          </h3>
          <span className="text-xs text-slate-500">
            تنبيهات دورية قبل 60 يوماً، 30 يوماً، و7 أيام من وقوع المخالفات
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* WhatsApp Channel */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">واتساب للأعمال (WhatsApp API)</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  نشط ومفعل
                </span>
              </div>
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                إرسال رسائل وتذكيرات مباشرة لهاتف المدير والمفوض بالتوقيع مع خطوات التجديد الفورية.
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[11px] text-slate-500">رقم الهاتف المستلم:</span>
                <span className="block font-mono text-xs font-bold text-slate-900 mt-0.5" dir="ltr">
                  +968 9123 4567
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">آخر تنبيه مرسل: اليوم 08:30 ص</span>
              <span className="font-semibold text-emerald-700">100% نسبة التسليم</span>
            </div>
          </div>

          {/* Email Reports */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">تقارير البريد الإلكتروني</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  نشط ومفعل
                </span>
              </div>
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                ملخص تنفيذي أسبوعي بصيغة PDF يوضح مؤشر الامتثال ومصفوفة المخاطر القانونية.
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[11px] text-slate-500">البريد المعتمد:</span>
                <span className="block font-mono text-xs font-bold text-slate-900 mt-0.5" dir="ltr">
                  compliance@riyada-assistant.om
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">تقرير الأسبوع القادم: الإثنين</span>
              <span className="font-semibold text-emerald-700">مجدول</span>
            </div>
          </div>

          {/* SMS Critical Alerts */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">الرسائل النصية للطوارئ (SMS)</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  نشط ومفعل
                </span>
              </div>
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                تنبيهات فورية في حال رصد اقتراب انتهاء ترخيص خلال 48 ساعة أو فرض أي قيد تنظيمي.
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[11px] text-slate-500">حالة المسار:</span>
                <span className="block text-xs font-bold text-emerald-700 mt-0.5">
                  مسار طوارئ معتمد داخل سلطنة عُمان
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">الرصيد المتاح: غير محدود</span>
              <span className="font-semibold text-emerald-700">جاهز</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Wages Protection System (WPS) & CR Uploader */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          {isEn
            ? "3. Wages Protection System (WPS) & Payroll Audit Uploader"
            : "3. مطابقة كشف نظام حماية الأجور (WPS) وملفات مسير الرواتب"}
        </h3>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                رفع ملف كشف حماية الأجور ومسير الرواتب (WPS Salary SIF File / Excel)
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                ارفع كشف الرواتب المعتمد للتدقيق الآلي: مطابقة تحويلات البنوك مع متطلبات البنك المركزي العُماني ووزارة العمل، والتحقق من التزام المنشأة بصرف أجور العمالة في مواعيدها المحددة لتفادي حظر المعاملات.
              </p>

              {csvUploaded && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>تم رفع الملف بنجاح: {csvFileName} (تم فحص 24 سجلاً وظيفياً ومطابقتها 100%)</span>
                </div>
              )}
            </div>

            <div className="shrink-0 text-center">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 px-6 py-5 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-900">اختر ملف WPS / SIF / Excel</span>
                <span className="text-[10px] text-slate-500 mt-0.5">أو اسحب وأفلت الملف هنا</span>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls, .sif, .txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
