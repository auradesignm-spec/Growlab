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
  Upload,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Key,
  Mic,
  Languages,
  Sparkles,
  DollarSign,
  Layers,
  ArrowUpRight,
  FileText,
  Copy,
  RefreshCw,
  Plus,
  HelpCircle,
} from "lucide-react";
import { updateProfileInfo, updateWorkspaceSettings, type SettingsInitialData } from "../settings-actions";
import { formatMoney } from "@/lib/format";

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
  const [selectedTheme, setSelectedTheme] = useState<"dark" | "light" | "system">("dark");

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
      try {
        const res = await updateProfileInfo({
          firstName,
          lastName,
          phone,
          email,
          bio,
        });
        showToast(res.message, "success");
      } catch (err: any) {
        showToast(err.message || "حدث خطأ أثناء حفظ الملف الشخصي.", "error");
      }
    });
  };

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await updateWorkspaceSettings({
          businessName,
          city,
          instagramUrl,
          tiktokUrl,
          customDomain,
        });
        showToast(res.message, "success");
      } catch (err: any) {
        showToast(err.message || "حدث خطأ أثناء حفظ مساحة العمل.", "error");
      }
    });
  };

  const handleAddVocab = () => {
    if (!newWord.trim()) return;
    setVocabList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        word: newWord.trim(),
        phonetic: newPhonetic.trim() || newWord.trim(),
        notes: "تمت إضافتها يدوياً للذكاء الاصطناعي",
      },
    ]);
    setNewWord("");
    setNewPhonetic("");
    showToast("تمت إضافة الكلمة إلى قاموس الذكاء الاصطناعي بنجاح!");
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
            toastMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-200 ring-1 ring-emerald-500/20"
              : "border-rose-500/30 bg-rose-950/80 text-rose-200 ring-1 ring-rose-500/20"
          }`}
          dir="rtl"
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Hub Navigation Bar */}
      <div className="border-b border-white/[0.08] bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              title="العودة للوحة التحكم"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  مركز الحساب والإعدادات
                </h1>
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                  Account Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                إدارة ملفك الشخصي، تفاصيل المتجر، اشتراك باقة Pro، ومفردات الذكاء الاصطناعي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <span>لوحة التحكم</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
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
            <div className="sticky top-20 space-y-1.5 rounded-2xl border border-white/[0.08] bg-[#0b0f19] p-2.5 shadow-xl">
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
                        ? "border border-indigo-500/30 bg-gradient-to-r from-indigo-600/20 to-indigo-600/5 text-white font-semibold shadow-xs"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-white/[0.05] text-slate-400 group-hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs leading-none">{t.label}</div>
                        <div className="mt-1 text-[10px] text-slate-400 font-normal">{t.labelEn}</div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 ring-2 ring-indigo-400/30" />
                    )}
                  </button>
                );
              })}

              {/* Bottom Quick Card: Plan Indicator */}
              <div className="mt-4 border-t border-white/[0.08] pt-3 px-2">
                <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-transparent p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">الباقة النشطة:</span>
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300">
                      {data.merchant?.plan?.toUpperCase() || "FREE"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    تمتع بميزات التوسع والحملات الممولة بدون حواجز.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTabChange("subscription")}
                    className="mt-2.5 w-full rounded-lg border border-indigo-500/30 bg-indigo-600/30 py-1.5 text-center text-[11px] font-bold text-indigo-200 hover:bg-indigo-600/50 transition-colors"
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
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f19] p-6 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-4 mb-6">
                    <h2 className="text-lg font-bold text-white">الملف الشخصي والبيانات الأساسية</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تحكم في معلوماتك الشخصية وصورتك التعريفية الظاهرة في منصة Growlab.
                    </p>
                  </div>

                  {/* Avatar Upload / Preview Section */}
                  <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-2xl font-bold text-white shadow-lg ring-2 ring-white/10">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span>{data.user.name?.charAt(0)?.toUpperCase() || "G"}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">صورة الحساب الرمزية (Avatar)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        يدعم تنسيقات JPG و PNG و WebP بحجم أقصاه 5 ميجابايت.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <label
                          htmlFor="avatar-file-input"
                          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-600/30 transition-colors"
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
                                const url = URL.createObjectURL(file);
                                setAvatarUrl(url);
                                showToast("تم تحديث صورة الحساب محلياً.");
                              }
                            }}
                          />
                        </label>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarUrl(null);
                              showToast("تمت إزالة الصورة.");
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف الصورة</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Edit Form */}
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          الاسم الأول (First Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          اسم العائلة (Last Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          البريد الإلكتروني (Email Address)
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          رقم الهاتف / الواتساب (Phone / WhatsApp)
                        </label>
                        <input
                          type="tel"
                          placeholder="+968 9XXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        نبذة تعريفية / الوصف المهني (Bio / Professional Title)
                      </label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="نبذة مختصرة عن خبرتك أو نشاطك التجاري تظهر للشركاء..."
                        className="w-full rounded-xl border border-white/10 bg-[#07090e] p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
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
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f19] p-6 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-4 mb-6">
                    <h2 className="text-lg font-bold text-white">إعدادات مساحة العمل والمتجر</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تخصيص الهوية التجارية للمتجر، النطاق المخصص، وروابط حسابات التواصل.
                    </p>
                  </div>

                  <form onSubmit={handleSaveWorkspace} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          اسم المتجر / النشاط التجاري (Store Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          المدينة / المنطقة الرئيسية (City)
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="مسقط، صلالة، صحار..."
                          className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <label className="block text-xs font-semibold text-white mb-1">
                        النطاق المخصص (Custom Domain)
                      </label>
                      <p className="text-[11px] text-slate-400 mb-2.5">
                        اربط متجرك بنطاق خاص (مثل: store.yourbrand.com) لتعزيز ثقة المشترين.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-3 flex items-center text-xs text-slate-500">
                            https://
                          </span>
                          <input
                            type="text"
                            placeholder="store.brand.com"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#07090e] py-2.5 pe-3.5 ps-16 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast("تم إرسال طلب ربط النطاق وتجهيز سجلات CNAME.")}
                          className="rounded-xl border border-indigo-500/40 bg-indigo-600/30 px-3.5 py-2.5 text-xs font-bold text-indigo-200 hover:bg-indigo-600/50"
                        >
                          تحقق من DNS
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          رابط إنستغرام (Instagram Profile URL)
                        </label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/yourstore"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          رابط تيك توك (TikTok Profile URL)
                        </label>
                        <input
                          type="url"
                          placeholder="https://tiktok.com/@yourstore"
                          value={tiktokUrl}
                          onChange={(e) => setTiktokUrl(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Team Members Section */}
                    <div className="border-t border-white/[0.08] pt-4 mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-xs font-bold text-white">فريق العمل والأذونات (Team Members)</h4>
                          <p className="text-[11px] text-slate-400">إدارة حسابات المسوقين والمشرفين على المتجر</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast("سيتم إرسال دعوة بالبريد الإلكتروني للعضو الجديد.")}
                          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
                        >
                          <Plus className="h-3 w-3" />
                          <span>إضافة عضو</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                              {data.user.name?.charAt(0) || "M"}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{data.user.name} (أنت)</div>
                              <div className="text-[10px] text-slate-400">{data.user.email}</div>
                            </div>
                          </div>
                          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                            مالك الحساب (Owner)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
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
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f19] p-6 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-4 mb-6">
                    <h2 className="text-lg font-bold text-white">الاشتراك والفوترة (Subscription & Billing)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تفاصيل الباقة الحالية، الفواتير السابقة، وتحديث طرق الدفع.
                    </p>
                  </div>

                  {/* Current Active Plan Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-[#0b0f19] to-purple-950/30 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                            {data.merchant?.plan === "pro" ? "PRO TIER" : "GROWTH STARTER"}
                          </span>
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            نشط
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mt-1.5">
                          {data.merchant?.plan === "pro" ? "باقة المحترفين (Growlab Pro)" : "الباقة الأساسية (Free Starter)"}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-md">
                          تشمل إطلاق حملات إعلانية متعددة القنوات، وإدارة شبكة المسوقين، وتحليلات الذكاء الاصطناعي الفورية.
                        </p>
                      </div>

                      <div className="text-right sm:text-left shrink-0">
                        <div className="text-2xl font-black text-white">
                          19.000 <span className="text-xs font-normal text-slate-400">ر.ع / شهرياً</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast("أنت مسجل بالفعل على أعلى باقة، أو سيتم فتح بوابة الدفع الآمنة.")}
                          className="mt-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110"
                        >
                          تعديل أو تجديد الاشتراك
                        </button>
                      </div>
                    </div>

                    {/* Features grid */}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-white/[0.08] pt-4">
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span>إعلانات ميتا وتيك توك غير محدودة</span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span>تتبع دقيق لطلبات COD بنسبة 100%</span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span>دعم فني خاص على مدار الساعة</span>
                      </div>
                    </div>
                  </div>

                  {/* Billing Invoices History */}
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-white mb-3">سجل الفواتير والمدفوعات (Invoices History)</h3>
                    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
                      <div className="divide-y divide-white/[0.06] text-xs">
                        <div className="flex items-center justify-between p-3.5">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="font-semibold text-white">فاتورة اشتراك Pro - شهر أغسطس 2026</div>
                              <div className="text-[10px] text-slate-400 font-mono">INV-2026-08-0012</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">19.000 ر.ع</span>
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              مدفوعة
                            </span>
                            <button
                              type="button"
                              onClick={() => showToast("تم تنزيل الفاتورة بصيغة PDF.")}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              تحميل PDF
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3.5">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="font-semibold text-white">فاتورة اشتراك Pro - شهر يوليو 2026</div>
                              <div className="text-[10px] text-slate-400 font-mono">INV-2026-07-0094</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">19.000 ر.ع</span>
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              مدفوعة
                            </span>
                            <button
                              type="button"
                              onClick={() => showToast("تم تنزيل الفاتورة بصيغة PDF.")}
                              className="text-indigo-400 hover:text-indigo-300"
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
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f19] p-6 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-4 mb-6">
                    <h2 className="text-lg font-bold text-white">المدفوعات والحسابات البنكية (Payouts & Financials)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ربط وتوثيق حساباتك البنكية لتحويل مستحقات المبيعات وسجل السحوبات التلقائية.
                    </p>
                  </div>

                  {/* Connected Bank Card */}
                  <div className="rounded-xl border border-white/[0.08] bg-gradient-to-r from-slate-900 to-slate-950 p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">بنك مسقط (Bank Muscat)</span>
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[9px] font-bold text-emerald-300">
                              حساب معتمد للتحويل
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            IBAN: OM35 BMUS 0123 4567 8901 0001
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast("يمكنك تعديل بيانات الآيبان مع إرفاق شهادة الحساب البنكي.")}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                      >
                        تعديل الحساب
                      </button>
                    </div>
                  </div>

                  {/* Payout Schedule & Settings */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <h4 className="text-xs font-bold text-white mb-1">جدول التحويل التلقائي</h4>
                      <p className="text-[11px] text-slate-400 mb-3">يتم تحويل الأرباح المستلمة من الدفع عند الاستلام كل خميس.</p>
                      <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300">
                        أسبوعي (كل يوم خميس)
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <h4 className="text-xs font-bold text-white mb-1">الحد الأدنى للتحويل</h4>
                      <p className="text-[11px] text-slate-400 mb-3">أقل رصيد مؤهل للإرسال إلى حسابك البنكي بدون رسوم إضافية.</p>
                      <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
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
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f19] p-6 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-4 mb-6">
                    <h2 className="text-lg font-bold text-white">الاستهلاك والحصص (Analytics & Quota Usage)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تتبع استخدام الخدمات، طلبات الـ API، وسعة التخزين المستهلكة لمتجرك.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="text-xs text-slate-400">طلبات الـ API الشهرية</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">48,290</span>
                        <span className="text-xs text-slate-500">/ 100,000</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: "48%" }} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="text-xs text-slate-400">المساحة التخزينية للوسائط</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">1.8 جيجابايت</span>
                        <span className="text-xs text-slate-500">/ 10 جيجابايت</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: "18%" }} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="text-xs text-slate-400">الحملات النشطة المتزامنة</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">6 حملات</span>
                        <span className="text-xs text-slate-500">/ غير محدود</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- F. PREFERENCES & AI SETTINGS ---------------- */}
            {activeTab === "preferences" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f19] p-6 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-4 mb-6">
                    <h2 className="text-lg font-bold text-white">التفضيلات وقاموس الذكاء الاصطناعي (AI & Preferences)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تخصيص المظهر وقاموس النطق والمفردات الصوتية (على غرار ElevenLabs) لإعلاناتك ورسائل الذكاء الاصطناعي.
                    </p>
                  </div>

                  {/* Theme Mode Selector */}
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-300 mb-3">نمط المظهر (Interface Theme)</h3>
                    <div className="grid grid-cols-3 gap-3 max-w-md">
                      {[
                        { id: "dark" as const, label: "داكن (Dark)", desc: "مظهر النخبة الليلي" },
                        { id: "light" as const, label: "فاتح (Light)", desc: "نهاري عالي التباين" },
                        { id: "system" as const, label: "تلقائي (System)", desc: "حسب إعداد جهازك" },
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
                              ? "border-indigo-500 bg-indigo-600/15 text-white"
                              : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="text-xs font-bold">{th.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{th.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Pronunciation Dictionary (ElevenLabs style) */}
                  <div className="border-t border-white/[0.08] pt-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4 text-violet-400" />
                          <h3 className="text-sm font-bold text-white">
                            قاموس نطق ومفردات الذكاء الاصطناعي (Custom AI Pronunciation Dictionary)
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          أضف أسماء علامتك التجارية أو مصطلحات لهجتك المحلية لضمان نطقها وتوليدها بدقة 100% في التعليق الصوتي الإعلاني.
                        </p>
                      </div>
                    </div>

                    {/* Add Vocab Input */}
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 mb-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            الكلمة الأصلية (Original Word)
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: Growlab أو لبان حوجري"
                            value={newWord}
                            onChange={(e) => setNewWord(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            طريقة النطق الصوتي أو التشكيل (Phonetic / Alias)
                          </label>
                          <input
                            type="text"
                            placeholder="جروولاب / Hojari Frankincense"
                            value={newPhonetic}
                            onChange={(e) => setNewPhonetic(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#07090e] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={handleAddVocab}
                            className="w-full rounded-xl bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-500 transition-colors shadow-md"
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
                          className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white font-mono bg-white/5 px-2 py-0.5 rounded-md">
                              {item.word}
                            </span>
                            <span className="text-slate-500">➔</span>
                            <span className="text-violet-300 font-medium">{item.phonetic}</span>
                            <span className="text-[10px] text-slate-500 hidden sm:inline">({item.notes})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVocab(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Affiliate & Impact Program Link */}
                  <div className="border-t border-white/[0.08] pt-6">
                    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 to-slate-900 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                            <h4 className="text-xs font-bold text-white">برنامج الشركاء والمؤثرين (Growlab Impact Program)</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            اكسب عمولة مستمرة 20% على كل متجر أو صانع محتوى ينضم عبر رابط إحالتك الخاص.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast("تم نسخ رابط الإحالة الخاص بك بنجاح!")}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/30 px-3.5 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-600/50"
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
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f19] p-6 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-4 mb-6">
                    <h2 className="text-lg font-bold text-white">المستندات والامتثال القانوني (Resources & Legal)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
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
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs hover:border-white/20 hover:bg-white/[0.04] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-semibold text-white">{doc.title}</div>
                            <div className="text-[11px] text-slate-400">{doc.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition-transform rotate-180" />
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
