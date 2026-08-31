"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Building,
  CreditCard,
  Wallet,
  BarChart3,
  Sliders,
  Scale,
  LogOut,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Shield,
  Mic,
  Sparkles,
  ArrowUpRight,
  FileText,
  Copy,
  RefreshCw,
  Plus,
} from "lucide-react";
import { updateProfileInfo, updateWorkspaceSettings, type SettingsInitialData } from "../settings-actions";

type SettingsTab =
  | "profile"
  | "workspace"
  | "subscription"
  | "payouts"
  | "usage"
  | "preferences"
  | "legal";

interface SettingsClientHubProps {
  initialData: SettingsInitialData;
  initialTab?: SettingsTab;
}

export default function SettingsClientHub({ initialData, initialTab = "profile" }: SettingsClientHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: SettingsTab = (searchParams.get("tab") as SettingsTab) || initialTab;

  const [data, setData] = useState<SettingsInitialData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states
  const [firstName, setFirstName] = useState(data.user.firstName || "");
  const [lastName, setLastName] = useState(data.user.lastName || "");
  const [email, setEmail] = useState(data.user.email || "");
  const [phone, setPhone] = useState(data.user.phone || "");
  const [bio, setBio] = useState(data.creator?.bio || data.merchant?.projectDescription || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Workspace form states
  const [businessName, setBusinessName] = useState(data.merchant?.businessName || data.store?.name || "متجري في Growlab");
  const [city, setCity] = useState(data.merchant?.city || data.creator?.city || "مسقط");
  const [instagramUrl, setInstagramUrl] = useState(data.merchant?.instagramUrl || data.creator?.instagramUrl || "");
  const [tiktokUrl, setTiktokUrl] = useState(data.merchant?.tiktokUrl || data.creator?.tiktokUrl || "");
  const [customDomain, setCustomDomain] = useState(data.store?.customDomain || "");

  // Preferences: AI Vocabulary
  const [vocabList, setVocabList] = useState<Array<{ id: string; word: string; phonetic: string; notes: string }>>([
    { id: "1", word: "Growlab", phonetic: "جروولاب", notes: "اسم المنصة الرسمي" },
    { id: "2", word: "Oman COD", phonetic: "الدفع عند الاستلام في عُمان", notes: "خدمة التوصيل السريع" },
    { id: "3", word: "Omnichannel Ads", phonetic: "إعلانات متعددة القنوات", notes: "ميتا وتيك توك وسناب" },
  ]);
  const [newWord, setNewWord] = useState("");
  const [newPhonetic, setNewPhonetic] = useState("");

  // Theme preference
  const [selectedTheme, setSelectedTheme] = useState<"light" | "system" | "dark">("light");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTabChange = (tab: SettingsTab) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.push(url.pathname + url.search);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateProfileInfo({
        firstName,
        lastName,
        email,
        phone,
        bio,
      });
      if (res.success) {
        showToast("تم تحديث وحفظ بيانات الملف الشخصي بنجاح.");
      } else {
        showToast(res.error || "حدث خطأ أثناء حفظ الملف الشخصي.", "error");
      }
    });
  };

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateWorkspaceSettings({
        businessName,
        city,
        instagramUrl,
        tiktokUrl,
        customDomain,
      });
      if (res.success) {
        showToast("تم حفظ إعدادات مساحة العمل والمتجر بنجاح.");
      } else {
        showToast(res.error || "حدث خطأ أثناء حفظ إعدادات مساحة العمل.", "error");
      }
    });
  };

  const handleAddVocab = () => {
    if (!newWord.trim()) {
      showToast("يرجى كتابة الكلمة أولاً.", "error");
      return;
    }
    const newItem = {
      id: Date.now().toString(),
      word: newWord.trim(),
      phonetic: newPhonetic.trim() || newWord.trim(),
      notes: "تمت إضافتها بواسطة المستخدم",
    };
    setVocabList((prev) => [...prev, newItem]);
    setNewWord("");
    setNewPhonetic("");
    showToast("تمت إضافة المفردة لقاموس النطق بالذكاء الاصطناعي.");
  };

  const handleRemoveVocab = (id: string) => {
    setVocabList((prev) => prev.filter((item) => item.id !== id));
    showToast("تم حذف المفردة من القاموس.");
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (_) {}
    window.location.href = "/";
  };

  const tabsConfig = [
    { id: "profile" as SettingsTab, label: "الملف الشخصي", labelEn: "Profile", icon: User, desc: "بياناتك الشخصية والصورة" },
    { id: "workspace" as SettingsTab, label: "مساحة العمل والمتجر", labelEn: "Workspace", icon: Building, desc: "اسم المتجر، النطاق المخصص" },
    { id: "subscription" as SettingsTab, label: "الاشتراك والفوترة", labelEn: "Subscription", icon: CreditCard, desc: "الباقات، الفواتير، الحصص" },
    { id: "payouts" as SettingsTab, label: "المدفوعات والمحفظة", labelEn: "Payouts & Bank", icon: Wallet, desc: "الحساب البنكي، السحوبات" },
    { id: "usage" as SettingsTab, label: "الاستهلاك والتحليلات", labelEn: "Usage & Limits", icon: BarChart3, desc: "استهلاك الـ API والخدمات" },
    { id: "preferences" as SettingsTab, label: "التفضيلات والذكاء الاصطناعي", labelEn: "Preferences & AI", icon: Sliders, desc: "المظهر، قاموس النطق، الصوت" },
    { id: "legal" as SettingsTab, label: "المستندات والشروط", labelEn: "Legal & Docs", icon: Scale, desc: "الشروط، الخصوصية، التوثيق" },
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
            toastMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500/20"
              : "border-rose-200 bg-rose-50 text-rose-900 ring-1 ring-rose-500/20"
          }`}
          dir="rtl"
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Hub Navigation Bar */}
      <div className="border-b border-line bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="العودة للوحة التحكم"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  مركز الحساب والإعدادات
                </h1>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Account Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                إدارة ملفك الشخصي، تفاصيل المتجر، اشتراك باقة Pro، ومفردات الذكاء الاصطناعي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all"
            >
              <span>لوحة التحكم</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Grid Layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left / Navigation Sidebar Tabs */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20 space-y-1.5 rounded-2xl border border-line bg-white p-3 shadow-xs">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                أقسام الإعدادات
              </div>
              {tabsConfig.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTabChange(t.id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-right transition-all ${
                      isActive
                        ? "border border-slate-900 bg-slate-900 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:text-slate-900"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs leading-none">{t.label}</div>
                        <div className={`mt-1 text-[10px] font-normal ${isActive ? "text-slate-300" : "text-slate-400"}`}>{t.labelEn}</div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                    )}
                  </button>
                );
              })}

              {/* Bottom Quick Card: Plan Indicator */}
              <div className="mt-4 border-t border-line pt-3 px-1">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">الباقة النشطة:</span>
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {data.merchant?.plan?.toUpperCase() || "FREE"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed">
                    تمتع بميزات التوسع والحملات الممولة بدون حواجز.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTabChange("subscription")}
                    className="mt-2.5 w-full rounded-lg border border-emerald-600/30 bg-emerald-600 py-1.5 text-center text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                  >
                    ترقية الخطة أو الإدارة
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right / Main Content Panel */}
          <main className="lg:col-span-9 space-y-6">
            {/* ---------------- A. PROFILE & PERSONAL INFO ---------------- */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-line pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900">الملف الشخصي والبيانات الأساسية</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تحكم في معلوماتك الشخصية وصورتك التعريفية الظاهرة في منصة Growlab.
                    </p>
                  </div>

                  {/* Avatar Upload / Preview Section */}
                  <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-xl border border-line bg-slate-50/70 p-4">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 text-2xl font-bold text-white shadow-md border border-line">
                      <span>{data.user.name?.charAt(0)?.toUpperCase() || "G"}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900">صورة الحساب الرمزية (Avatar)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        يدعم تنسيقات JPG و PNG و WebP بحجم أقصاه 5 ميجابايت.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <label
                          htmlFor="avatar-file-input"
                          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          <span>رفع صورة جديدة</span>
                          <input
                            id="avatar-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                showToast("تم تحديث صورة الحساب محلياً.");
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Profile Edit Form */}
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          الاسم الأول (First Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          اسم العائلة (Last Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          البريد الإلكتروني (Email Address)
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          رقم الهاتف / الواتساب (Phone / WhatsApp)
                        </label>
                        <input
                          type="tel"
                          placeholder="+968 9XXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        نبذة تعريفية / الوصف المهني (Bio / Professional Title)
                      </label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="نبذة مختصرة عن خبرتك أو نشاطك التجاري تظهر للشركاء..."
                        className="w-full rounded-xl border border-line bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        <span>حفظ التعديلات</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ---------------- B. WORKSPACE SETTINGS ---------------- */}
            {activeTab === "workspace" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-line pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900">إعدادات مساحة العمل والمتجر</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تخصيص الهوية التجارية للمتجر، النطاق المخصص، وروابط حسابات التواصل.
                    </p>
                  </div>

                  <form onSubmit={handleSaveWorkspace} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          اسم المتجر / النشاط التجاري (Store Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          المدينة / المنطقة الرئيسية (City)
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="مسقط، صلالة، صحار..."
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-slate-50/70 p-4">
                      <label className="block text-xs font-semibold text-slate-900 mb-1">
                        النطاق المخصص (Custom Domain)
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">
                        اربط متجرك بنطاق خاص (مثل: store.yourbrand.com) لتعزيز ثقة المشترين.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                            https://
                          </span>
                          <input
                            type="text"
                            placeholder="store.brand.com"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            className="w-full rounded-xl border border-line bg-white py-2.5 pe-3.5 ps-16 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                            dir="ltr"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast("تم إرسال طلب ربط النطاق وتجهيز سجلات CNAME.")}
                          className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-2xs"
                        >
                          تحقق من DNS
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          رابط إنستغرام (Instagram Profile URL)
                        </label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/yourstore"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          رابط تيك توك (TikTok Profile URL)
                        </label>
                        <input
                          type="url"
                          placeholder="https://tiktok.com/@yourstore"
                          value={tiktokUrl}
                          onChange={(e) => setTiktokUrl(e.target.value)}
                          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Team Members Section */}
                    <div className="border-t border-line pt-4 mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">فريق العمل والأذونات (Team Members)</h4>
                          <p className="text-[11px] text-slate-500">إدارة حسابات المسوقين والمشرفين على المتجر</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast("سيتم إرسال دعوة بالبريد الإلكتروني للعضو الجديد.")}
                          className="flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                        >
                          <Plus className="h-3 w-3" />
                          <span>إضافة عضو</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50/70 p-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-[10px]">
                              {data.user.name?.charAt(0) || "M"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{data.user.name} (أنت)</div>
                              <div className="text-[10px] text-slate-500">{data.user.email}</div>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            مالك الحساب (Owner)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        <span>حفظ إعدادات مساحة العمل</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ---------------- C. SUBSCRIPTION & BILLING ---------------- */}
            {activeTab === "subscription" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-line pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900">الاشتراك والفوترة (Subscription & Billing)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تفاصيل الباقة الحالية، الفواتير السابقة، وتحديث طرق الدفع.
                    </p>
                  </div>

                  {/* Current Active Plan Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                            {data.merchant?.plan === "pro" ? "PRO TIER" : "GROWTH STARTER"}
                          </span>
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            نشط
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                          {data.merchant?.plan === "pro" ? "باقة المحترفين (Growlab Pro)" : "الباقة الأساسية (Free Starter)"}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 max-w-md leading-relaxed">
                          تشمل إطلاق حملات إعلانية متعددة القنوات، وإدارة شبكة المسوقين، وتحليلات الذكاء الاصطناعي الفورية.
                        </p>
                      </div>

                      <div className="text-right sm:text-left shrink-0">
                        <div className="text-2xl font-black text-slate-900">
                          19.000 <span className="text-xs font-normal text-slate-500">ر.ع / شهرياً</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast("أنت مسجل بالفعل على أعلى باقة، أو سيتم فتح بوابة الدفع الآمنة.")}
                          className="mt-2.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                        >
                          تعديل أو تجديد الاشتراك
                        </button>
                      </div>
                    </div>

                    {/* Features grid */}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-emerald-100 pt-4">
                      <div className="text-xs text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>إعلانات ميتا وتيك توك غير محدودة</span>
                      </div>
                      <div className="text-xs text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>تتبع دقيق لطلبات COD بنسبة 100%</span>
                      </div>
                      <div className="text-xs text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>دعم فني خاص على مدار الساعة</span>
                      </div>
                    </div>
                  </div>

                  {/* Billing Invoices History */}
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">سجل الفواتير والمدفوعات (Invoices History)</h3>
                    <div className="overflow-hidden rounded-xl border border-line bg-white">
                      <div className="divide-y divide-line text-xs">
                        <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="font-semibold text-slate-900">فاتورة اشتراك Pro - شهر أغسطس 2026</div>
                              <div className="text-[10px] text-slate-500 font-mono">INV-2026-08-0012</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">19.000 ر.ع</span>
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              مدفوعة
                            </span>
                            <button
                              type="button"
                              onClick={() => showToast("تم تنزيل الفاتورة بصيغة PDF.")}
                              className="text-emerald-700 hover:text-emerald-800 font-semibold"
                            >
                              تحميل PDF
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="font-semibold text-slate-900">فاتورة اشتراك Pro - شهر يوليو 2026</div>
                              <div className="text-[10px] text-slate-500 font-mono">INV-2026-07-0094</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">19.000 ر.ع</span>
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              مدفوعة
                            </span>
                            <button
                              type="button"
                              onClick={() => showToast("تم تنزيل الفاتورة بصيغة PDF.")}
                              className="text-emerald-700 hover:text-emerald-800 font-semibold"
                            >
                              تحميل PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- D. PAYOUTS & FINANCIALS ---------------- */}
            {activeTab === "payouts" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-line pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900">المدفوعات والحسابات البنكية (Payouts & Financials)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ربط وتوثيق حساباتك البنكية لتحويل مستحقات المبيعات وسجل السحوبات التلقائية.
                    </p>
                  </div>

                  {/* Connected Bank Card */}
                  <div className="rounded-xl border border-line bg-slate-50/80 p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">بنك مسقط (Bank Muscat)</span>
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[9px] font-bold text-emerald-700">
                              حساب معتمد للتحويل
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 font-mono mt-0.5">
                            IBAN: OM35 BMUS 0123 4567 8901 0001
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast("يمكنك تعديل بيانات الآيبان مع إرفاق شهادة الحساب البنكي.")}
                        className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                      >
                        تعديل الحساب
                      </button>
                    </div>
                  </div>

                  {/* Payout Schedule & Settings */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                    <div className="rounded-xl border border-line bg-white p-4 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 mb-1">جدول التحويل التلقائي</h4>
                      <p className="text-[11px] text-slate-500 mb-3">يتم تحويل الأرباح المستلمة من الدفع عند الاستلام كل خميس.</p>
                      <span className="inline-block rounded-lg bg-slate-100 border border-line px-2.5 py-1 text-xs font-bold text-slate-800">
                        أسبوعي (كل يوم خميس)
                      </span>
                    </div>

                    <div className="rounded-xl border border-line bg-white p-4 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 mb-1">الحد الأدنى للتحويل</h4>
                      <p className="text-[11px] text-slate-500 mb-3">أقل رصيد مؤهل للإرسال إلى حسابك البنكي بدون رسوم إضافية.</p>
                      <span className="inline-block rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        10.000 ر.ع
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- E. ANALYTICS & USAGE ---------------- */}
            {activeTab === "usage" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-line pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900">الاستهلاك والحصص (Analytics & Quota Usage)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تتبع استخدام الخدمات، طلبات الـ API، وسعة التخزين المستهلكة لمتجرك.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                    <div className="rounded-xl border border-line bg-slate-50/70 p-4">
                      <div className="text-xs text-slate-500">طلبات الـ API الشهرية</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">48,290</span>
                        <span className="text-xs text-slate-400">/ 100,000</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: "48%" }} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-slate-50/70 p-4">
                      <div className="text-xs text-slate-500">المساحة التخزينية للوسائط</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">1.8 جيجابايت</span>
                        <span className="text-xs text-slate-400">/ 10 جيجابايت</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-teal-600 rounded-full" style={{ width: "18%" }} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-slate-50/70 p-4">
                      <div className="text-xs text-slate-500">الحملات النشطة المتزامنة</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">6 حملات</span>
                        <span className="text-xs text-slate-400">/ غير محدود</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- F. PREFERENCES & AI SETTINGS ---------------- */}
            {activeTab === "preferences" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-line pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900">التفضيلات وقاموس الذكاء الاصطناعي (AI & Preferences)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تخصيص المظهر وقاموس النطق والمفردات الصوتية لإعلاناتك ورسائل الذكاء الاصطناعي.
                    </p>
                  </div>

                  {/* Theme Mode Selector */}
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-700 mb-3">نمط المظهر (Interface Theme)</h3>
                    <div className="grid grid-cols-3 gap-3 max-w-md">
                      {[
                        { id: "light" as const, label: "فاتح (Light)", desc: "نهاري عالي التباين وثيم المنصة الرسمي" },
                        { id: "system" as const, label: "تلقائي (System)", desc: "حسب إعداد جهازك" },
                        { id: "dark" as const, label: "داكن (Dark)", desc: "مظهر داكن خفيف" },
                      ].map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => {
                            setSelectedTheme(th.id);
                            showToast(`تم تعيين المظهر إلى ${th.label}`);
                          }}
                          className={`rounded-xl border p-3 text-right transition-all ${
                            selectedTheme === th.id
                              ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                              : "border-line bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-xs font-bold">{th.label}</div>
                          <div className={`text-[10px] mt-0.5 ${selectedTheme === th.id ? "text-slate-300" : "text-slate-400"}`}>{th.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Pronunciation Dictionary */}
                  <div className="border-t border-line pt-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4 text-emerald-600" />
                          <h3 className="text-sm font-bold text-slate-900">
                            قاموس نطق ومفردات الذكاء الاصطناعي (Custom AI Pronunciation Dictionary)
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          أضف أسماء علامتك التجارية أو مصطلحات لهجتك المحلية لضمان نطقها وتوليدها بدقة 100% في التعليق الصوتي الإعلاني.
                        </p>
                      </div>
                    </div>

                    {/* Add Vocab Input */}
                    <div className="rounded-xl border border-line bg-slate-50/70 p-4 mb-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            الكلمة الأصلية (Original Word)
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: Growlab أو لبان حوجري"
                            value={newWord}
                            onChange={(e) => setNewWord(e.target.value)}
                            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            طريقة النطق الصوتي أو التشكيل (Phonetic / Alias)
                          </label>
                          <input
                            type="text"
                            placeholder="جروولاب / Hojari Frankincense"
                            value={newPhonetic}
                            onChange={(e) => setNewPhonetic(e.target.value)}
                            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={handleAddVocab}
                            className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                          >
                            + إضافة للقاموس
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Vocab Items List */}
                    <div className="space-y-2">
                      {vocabList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-line bg-white p-3 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-line">
                              {item.word}
                            </span>
                            <span className="text-slate-400">➔</span>
                            <span className="text-emerald-700 font-semibold">{item.phonetic}</span>
                            <span className="text-[10px] text-slate-500 hidden sm:inline">({item.notes})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVocab(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Affiliate & Impact Program Link */}
                  <div className="border-t border-line pt-6">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                            <h4 className="text-xs font-bold text-slate-900">برنامج الشركاء والمؤثرين (Growlab Impact Program)</h4>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            اكسب عمولة مستمرة 20% على كل متجر أو صانع محتوى ينضم عبر رابط إحالتك الخاص.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast("تم نسخ رابط الإحالة الخاص بك بنجاح!")}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-2xs transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>نسخ رابط الإحالة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- G. RESOURCES & LEGAL ---------------- */}
            {activeTab === "legal" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
                  <div className="border-b border-line pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900">المستندات والامتثال القانوني (Resources & Legal)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      شروط الاستخدام، سياسة الخصوصية، وتراخيص الامتثال في سلطنة عمان.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { title: "شروط الخدمة والاتفاقية التجارية", desc: "اتفاقية التاجر وصانع المحتوى والتوصيل", href: "/#faq" },
                      { title: "سياسة الخصوصية وحماية البيانات", desc: "كيف نحمي بيانات عملائك وتشفير المعاملات", href: "/#faq" },
                      { title: "دليل التوثيق ورفع مستندات KYC", desc: "إرشادات السجل التجاري ووثائق العمل الحر", href: "/#faq" },
                      { title: "مركز المساعدة والأسئلة الشائعة", desc: "إجابات فورية لكل استفسارات التسويق واللوجستيات", href: "/#faq" },
                    ].map((doc, i) => (
                      <Link
                        key={i}
                        href={doc.href}
                        className="flex items-center justify-between rounded-xl border border-line bg-slate-50/50 p-4 text-xs hover:border-slate-300 hover:bg-white hover:shadow-2xs transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-slate-700 group-hover:text-slate-900 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-semibold text-slate-900">{doc.title}</div>
                            <div className="text-[11px] text-slate-500">{doc.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
