"use client";

import { useState } from "react";
import { UserAccount, CompanyAccount } from "./types";
import { StorageManager } from "./StorageManager";
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  Check,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Shield,
  KeyRound,
  ArrowRight,
  LogIn,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount, company?: CompanyAccount) => void;
  existingAccounts: CompanyAccount[];
  isMandatory?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  existingAccounts,
  isMandatory = false,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+968 9");
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("أزياء وعبايات");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "login") {
      if (!identifier.trim() || !password.trim()) {
        setError("يرجى إدخال اسم المستخدم / البريد وكلمة المرور");
        return;
      }

      const result = StorageManager.authenticate(identifier, password);
      if (!result.user) {
        setError(result.error || "بيانات الدخول غير صحيحة");
        return;
      }

      const user = result.user;
      StorageManager.setUserSession(user);

      // Find company if merchant
      let matchedCompany: CompanyAccount | undefined;
      if (user.role === "merchant" && user.companyId) {
        matchedCompany = existingAccounts.find((c) => c.id === user.companyId) || existingAccounts[0];
      } else if (existingAccounts.length > 0) {
        matchedCompany = existingAccounts[0];
      }

      onLoginSuccess(user, matchedCompany);
      onClose();
    } else {
      // Register new store & client
      if (!identifier.trim() || !fullName.trim() || !companyName.trim() || !password.trim()) {
        setError("يرجى ملء جميع الحقول المطلوبة لطلب تسجيل المتجر");
        return;
      }

      const newCompanyId = `c_${Date.now()}`;
      const newCompany: CompanyAccount = {
        id: newCompanyId,
        name: companyName,
        category: category,
        ownerName: fullName,
        email: identifier.includes("@") ? identifier : `${identifier}@store.om`,
        phone: phone || "+968 9123 4567",
        currency: "OMR",
        plan: "partner",
        commissionRate: 5,
        agentName: "سالم — مستشار المبيعات",
        agentDialect: "omani",
        agentAutoDiscountMax: 10,
        whatsappConnected: true,
        whatsappNumber: phone || "+968 9123 4567",
      };

      // Add to company accounts
      const allAccounts = StorageManager.getAccounts();
      StorageManager.saveAccounts([newCompany, ...allAccounts]);

      const newUser: UserAccount = {
        id: `usr_${Date.now()}`,
        email: identifier.includes("@") ? identifier : `${identifier}@store.om`,
        username: identifier.includes("@") ? identifier.split("@")[0] : identifier,
        password: password,
        fullName: fullName,
        phone: phone || "+968 9123 4567",
        role: "merchant",
        companyId: newCompanyId,
        companyName: companyName,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      StorageManager.addUser(newUser);
      StorageManager.setUserSession(newUser);

      onLoginSuccess(newUser, newCompany);
      onClose();
    }
  };

  const handleQuickLogin = (usernameVal: string, passVal: string) => {
    setIdentifier(usernameVal);
    setPassword(passVal);
    setError(null);

    const result = StorageManager.authenticate(usernameVal, passVal);
    if (result.user) {
      const user = result.user;
      StorageManager.setUserSession(user);

      let matchedCompany: CompanyAccount | undefined;
      if (user.role === "merchant" && user.companyId) {
        matchedCompany = existingAccounts.find((c) => c.id === user.companyId) || existingAccounts[0];
      } else if (existingAccounts.length > 0) {
        matchedCompany = existingAccounts[0];
      }

      onLoginSuccess(user, matchedCompany);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-ink px-6 py-5 text-onDark">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-[#241A08] font-bold text-lg shadow-sm">
              G
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-onDark">
                {mode === "login"
                  ? "تسجيل الدخول لمنصة Growlab SaaS"
                  : "تسجيل حساب متجر جديد"}
              </h3>
              <p className="text-[11px] text-onDarkSoft">
                نظام الصلاحيات المتقدم: حسابات المدراء وأصحاب المتاجر
              </p>
            </div>
          </div>
          {!isMandatory && (
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-onDarkSoft hover:bg-onDark/10 hover:text-onDark transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick Demo Access Bar */}
        <div className="bg-paper border-b border-line p-4">
          <div className="text-[11px] font-bold text-ink mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span>تجربة سريعة للحسابات والصلاحيات (بنقرة واحدة):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin", "admin123")}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-gold/40 bg-gold/10 hover:bg-gold/20 text-right transition-all group cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold text-[#241A08] font-bold text-xs">
                👑
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-[11px] text-ink group-hover:text-gold transition-colors truncate">
                  المدير العام (Admin)
                </div>
                <div className="text-[9px] text-muted truncate">تحكم كامل بكل المتاجر</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("rawabi", "rawabi123")}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-teal/40 bg-teal/10 hover:bg-teal/20 text-right transition-all group cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal text-white font-bold text-xs">
                🏪
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-[11px] text-ink group-hover:text-teal transition-colors truncate">
                  عميل: روابي اللبان
                </div>
                <div className="text-[9px] text-muted truncate">صلاحية متجر اللبان فقط</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("taj", "taj123")}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-purple-500/30 bg-purple-50 hover:bg-purple-100 text-right transition-all group cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs">
                👑
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-[11px] text-ink group-hover:text-purple-700 transition-colors truncate">
                  عميل: تاج العود الملكي
                </div>
                <div className="text-[9px] text-muted truncate">صلاحية متجر العود فقط</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("majan", "majan123")}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-500/30 bg-blue-50 hover:bg-blue-100 text-right transition-all group cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                ⚡
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-[11px] text-ink group-hover:text-blue-700 transition-colors truncate">
                  عميل: مجان ستور
                </div>
                <div className="text-[9px] text-muted truncate">صلاحية متجر الإلكترونيات</div>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-xs text-red-700 font-semibold">
              {error}
            </div>
          )}

          {mode === "register" && (
            <>
              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  اسم المتجر أو الشركة التجارية *:
                </label>
                <div className="relative">
                  <Building className="absolute right-3 top-3 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="مثال: متجر صلالة للمنتجات الطبيعية"
                    className="w-full rounded-xl border border-line pr-10 pl-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    اسم المالك أو المسؤول *:
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: يوسف البلوشي"
                      className="w-full rounded-xl border border-line pr-10 pl-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    نشاط المتجر:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="عطور وبخور">عطور وبخور</option>
                    <option value="أزياء وعبايات">أزياء وعبايات</option>
                    <option value="إلكترونيات وإكسسوارات">إلكترونيات وإكسسوارات</option>
                    <option value="صحة وجمال">صحة وجمال</option>
                    <option value="أغذية ومنتجات محلية">أغذية ومنتجات محلية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  رقم الواتساب التجاري:
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+968 9123 4567"
                    className="w-full rounded-xl border border-line pr-10 pl-3.5 py-2.5 font-mono text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block font-mono text-xs font-semibold text-ink">
              اسم المستخدم أو البريد الإلكتروني *:
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 h-4 w-4 text-muted" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin أو اسم المستخدم / البريد"
                className="w-full rounded-xl border border-line pr-10 pl-3.5 py-2.5 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs font-semibold text-ink">
              كلمة المرور *:
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line pr-10 pl-3.5 py-2.5 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gold py-3 text-center text-xs sm:text-sm font-bold text-[#241A08] shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>
              {mode === "login" ? "تسجيل الدخول للمنصة" : "إنشاء حساب المتجر والبدء"}
            </span>
          </button>

          {/* Switch Mode */}
          <div className="text-center pt-2">
            {mode === "login" ? (
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-xs text-muted hover:text-gold transition-colors cursor-pointer"
              >
                هل ترغب في تسجيل متجر جديد كشريك؟{" "}
                <span className="font-bold underline text-ink">تسجيل متجر جديد</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-xs text-muted hover:text-gold transition-colors cursor-pointer"
              >
                لديك حساب بالفعل من قِبل الإدارة؟{" "}
                <span className="font-bold underline text-ink">تسجيل الدخول</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
