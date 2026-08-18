"use client";

import { useState } from "react";
import { UserAccount, CompanyAccount } from "./types";
import { StorageManager } from "./StorageManager";
import {
  Users,
  UserPlus,
  Shield,
  Building2,
  Lock,
  Mail,
  Phone,
  Copy,
  Check,
  Trash2,
  Edit2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
} from "lucide-react";

interface UserManagementProps {
  currentUser: UserAccount;
  companies: CompanyAccount[];
  onOpenNewCompanyModal: () => void;
}

export default function UserManagement({
  currentUser,
  companies,
  onOpenNewCompanyModal,
}: UserManagementProps) {
  const [users, setUsers] = useState<UserAccount[]>(StorageManager.getUsers());
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  // New User Form State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("pass" + Math.floor(1000 + Math.random() * 9000));
  const [phone, setPhone] = useState("+968 9");
  const [role, setRole] = useState<"admin" | "merchant">("merchant");
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || "c1");
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || (!username.trim() && !email.trim()) || !password.trim()) {
      setFormError("يرجى ملء جميع الحقول المطلوبة لإنشاء حساب العميل");
      return;
    }

    const assignedCompany = companies.find((c) => c.id === selectedCompanyId);

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      fullName: fullName.trim(),
      username: username.trim() || email.split("@")[0],
      email: email.trim() || `${username.trim()}@client.growlab.om`,
      password: password.trim(),
      phone: phone.trim(),
      role: role,
      companyId: role === "admin" ? "all" : selectedCompanyId,
      companyName: role === "admin" ? "إدارة المنصة العامة" : assignedCompany?.name || "متجر عميل",
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const updated = StorageManager.addUser(newUser);
    setUsers(updated);

    // Reset & Close
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("pass" + Math.floor(1000 + Math.random() * 9000));
    setPhone("+968 9");
    setIsAddModalOpen(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === "usr_admin" || userId === currentUser.id) {
      alert("لا يمكن حذف حساب المدير الرئيسي النشط");
      return;
    }
    if (confirm(`هل أنت متأكد من حذف حساب العميل: "${userName}"؟ لن يتمكن من تسجيل الدخول بعد الآن.`)) {
      const updated = StorageManager.deleteUser(userId);
      setUsers(updated);
    }
  };

  const handleToggleActive = (user: UserAccount) => {
    if (user.id === "usr_admin" || user.id === currentUser.id) {
      alert("لا يمكن تعطيل حساب المدير الرئيسي النشط");
      return;
    }
    const updated = StorageManager.updateUser({
      ...user,
      isActive: user.isActive === false ? true : false,
    });
    setUsers(updated);
  };

  const handleCopyCredentials = (user: UserAccount) => {
    const assignedComp = companies.find((c) => c.id === user.companyId);
    const loginText = `مرحباً ${user.fullName} 👋
إليك بيانات حسابك في منصة Growlab لإدارة متجرك ووكيل الذكاء الاصطناعي:

🏪 المتجر: ${assignedComp?.name || user.companyName || "متجرك"}
👤 اسم المستخدم: ${user.username || user.email}
📧 البريد: ${user.email}
🔑 كلمة المرور: ${user.password || "تم تعيينها"}
🔗 رابط الدخول: ${typeof window !== "undefined" ? window.location.origin : "https://growlab.om"}

يمكنك تسجيل الدخول فوراً لمتابعة الطلبات وتعديل وكيل المبيعات.`;

    navigator.clipboard.writeText(loginText);
    setCopiedUserId(user.id);
    setTimeout(() => setCopiedUserId(null), 2500);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.companyName && u.companyName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
              إدارة مستخدمي المنصة وصلاحيات المتاجر
            </h2>
            <span className="rounded-full bg-gold/20 px-3 py-0.5 text-xs font-bold text-gold">
              {users.length} حساب
            </span>
          </div>
          <p className="text-xs text-muted sm:text-sm mt-1">
            صلاحية حصرية للمدير العام لإنشاء حسابات الشركاء وتوزيع كلمات المرور وتحديد المتاجر المصرح بها لكل عميل.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs sm:text-sm font-bold text-onDark shadow-md hover:bg-ink/90 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-gold" />
            <span>إضافة حساب عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Role explanation banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-gold shrink-0 mt-0.5" />
          <div className="text-xs text-ink leading-relaxed">
            <span className="font-bold text-ink block mb-0.5">
              👑 صلاحيات المدير العام (Super Admin):
            </span>
            التحكم الكامل بكافة المتاجر، إضافة علامات تجارية جديدة، إدارة الحملات والأرباح العامة، وإنشاء حسابات للعملاء.
          </div>
        </div>

        <div className="rounded-2xl border border-teal/30 bg-teal/5 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-teal shrink-0 mt-0.5" />
          <div className="text-xs text-ink leading-relaxed">
            <span className="font-bold text-ink block mb-0.5">
              🏬 صلاحيات العملاء وأصحاب المتاجر (Merchant Clients):
            </span>
            تسجيل الدخول باليوزر والباسوورد المعطى لهم، والوصول فقط لبيانات متجرهم الخاص (المنتجات، الواتساب، والطلبات) بدون رؤية المتاجر الأخرى.
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-2.5">
        <Search className="h-4 w-4 text-muted shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث باسم العميل، البريد، اسم المستخدم، أو اسم المتجر..."
          className="w-full bg-transparent text-xs sm:text-sm text-ink placeholder-muted focus:outline-none"
        />
      </div>

      {/* Users Table / Grid */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-line bg-paper text-muted font-bold">
              <tr>
                <th className="py-3.5 px-4">المستخدم</th>
                <th className="py-3.5 px-4">اسم المستخدم / البريد</th>
                <th className="py-3.5 px-4">كلمة المرور</th>
                <th className="py-3.5 px-4">المتجر المصرح به</th>
                <th className="py-3.5 px-4">نوع الصلاحية</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات الحساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredUsers.map((user) => {
                const assignedCompany = companies.find((c) => c.id === user.companyId);
                return (
                  <tr key={user.id} className="hover:bg-paper/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold ${
                            user.role === "admin"
                              ? "bg-gold/20 text-gold"
                              : "bg-teal/20 text-teal"
                          }`}
                        >
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-ink text-xs sm:text-sm">
                            {user.fullName}
                          </div>
                          <div className="text-[10px] text-muted flex items-center gap-1 font-mono">
                            <Phone className="h-2.5 w-2.5" />
                            <span>{user.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs text-ink font-semibold">
                        {user.username || user.email.split("@")[0]}
                      </div>
                      <div className="text-[11px] text-muted">{user.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs bg-paper px-2.5 py-1 rounded-lg border border-line w-fit">
                        <KeyRound className="h-3 w-3 text-muted" />
                        <span className="font-semibold text-ink">
                          {user.password || "••••••••"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-gold font-bold text-xs">
                          <Shield className="h-3.5 w-3.5" />
                          <span>جميع المتاجر (شامل)</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-ink font-semibold">
                          <Building2 className="h-3.5 w-3.5 text-teal" />
                          <span>{assignedCompany?.name || user.companyName || "متجر مخصص"}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          user.role === "admin"
                            ? "bg-gold/20 text-gold"
                            : "bg-teal/15 text-teal"
                        }`}
                      >
                        {user.role === "admin" ? "مدير المنصة Super Admin" : "صاحب متجر Merchant"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition-all ${
                          user.isActive !== false
                            ? "bg-teal/15 text-teal hover:bg-teal/25"
                            : "bg-red-500/15 text-red-600 hover:bg-red-500/25"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.isActive !== false ? "bg-teal" : "bg-red-500"
                          }`}
                        />
                        <span>{user.isActive !== false ? "نشط ومفعل" : "معطل"}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleCopyCredentials(user)}
                          title="نسخ بيانات الدخول لإرسالها للعميل"
                          className="flex items-center gap-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[11px] font-bold text-ink hover:border-gold hover:text-gold transition-colors cursor-pointer"
                        >
                          {copiedUserId === user.id ? (
                            <>
                              <Check className="h-3 w-3 text-teal" />
                              <span className="text-teal">تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>نسخ للعميل</span>
                            </>
                          )}
                        </button>

                        {user.id !== "usr_admin" && user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            title="حذف هذا الحساب"
                            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Client User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-ink px-6 py-5 text-onDark">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-[#241A08] font-bold">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-onDark">
                    إنشاء حساب عميل / متجر جديد
                  </h3>
                  <p className="text-[11px] text-onDarkSoft">
                    حدد اسم المستخدم وكلمة المرور والمتجر المصرح بالدخول إليه
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1.5 text-onDarkSoft hover:bg-onDark/10 hover:text-onDark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                  اسم صاحب المتجر / العميل *:
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: يحيى المعمري"
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    اسم المستخدم (Username) *:
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yahya_store"
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    كلمة المرور (Password) *:
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    البريد الإلكتروني:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@brand.om"
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    رقم هاتف الواتساب:
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+968 9123 4567"
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                    نوع الحساب والصلاحية:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "admin" | "merchant")}
                    className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="merchant">عميل متجر (محدد بمتجره فقط)</option>
                    <option value="admin">مدير إضافي (صلاحيات شاملة)</option>
                  </select>
                </div>

                {role === "merchant" && (
                  <div>
                    <label className="font-mono text-xs font-semibold text-ink mb-1 block">
                      المتجر المرتبط بهذا الحساب:
                    </label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-line bg-paper p-3 text-[11px] text-muted flex items-center justify-between">
                <span>هل المتجر المطلوب غير موجود في القائمة؟</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    onOpenNewCompanyModal();
                  }}
                  className="font-bold text-gold hover:underline"
                >
                  + إضافة متجر جديد أولاً
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-xs font-bold text-ink hover:bg-paper cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gold px-6 py-2.5 text-xs font-bold text-[#241A08] shadow-md hover:brightness-110 cursor-pointer"
                >
                  تأكيد وحفظ حساب العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
