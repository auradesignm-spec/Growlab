"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  User,
  Settings,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Building,
  Volume2,
  Sparkles,
} from "lucide-react";
import { track } from "@/lib/analytics";

interface UserProfileData {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  locale?: string;
  merchantProfile?: {
    id: string;
    businessName: string;
    plan: string;
    verificationStatus: string;
    city?: string;
  } | null;
  creatorProfile?: {
    id: string;
    username: string;
    verificationStatus: string;
    avatarUrl?: string;
  } | null;
}

interface HeaderUserMenuProps {
  initialUser?: UserProfileData | null;
  compact?: boolean;
  onNavigate?: () => void;
}

export default function HeaderUserMenu({ initialUser, compact = false, onNavigate }: HeaderUserMenuProps) {
  const [user, setUser] = useState<UserProfileData | null>(initialUser || null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const clerk = useClerk();

  // Fetch session if not provided
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      return;
    }
    let isMounted = true;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.authenticated && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    onNavigate?.();
    track("User Sign Out", { source: "header_menu" });

    if (clerk && clerk.signOut) {
      try {
        await clerk.signOut({ redirectUrl: "/" });
        return;
      } catch (e) {
        console.error("Clerk signout error:", e);
      }
    }

    // Dev / fallback sign-out
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (_) {}
    window.location.href = "/";
  };

  if (!user) return null;

  const displayName =
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.merchantProfile?.businessName ||
    user.creatorProfile?.username ||
    user.email?.split("@")[0] ||
    "مستخدم Growlab";

  const userInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl = user.creatorProfile?.avatarUrl;
  const isVerified =
    user.merchantProfile?.verificationStatus === "verified" ||
    user.creatorProfile?.verificationStatus === "verified";
  const userRole =
    user.role === "merchant"
      ? "تاجر / متجر"
      : user.role === "creator"
      ? "صانع محتوى / مسوق"
      : "عضو المنصة";

  if (compact) {
    return (
      <div className="flex flex-col w-full gap-2 pt-2 border-t border-line/60">
        <div className="flex items-center gap-3 px-2 py-2 rounded-2xl bg-night/5 dark:bg-slate-900/60">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span>{userInitial}</span>
            )}
            {isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white text-[9px] font-black">
                ✓
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-frost truncate">{displayName}</span>
            <span className="text-[11px] text-frost-dim truncate">{user.email || userRole}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-frost dark:bg-slate-800 shadow-xs"
          >
            <LayoutDashboard className="h-4 w-4 text-indigo-500" />
            <span>لوحة التحكم</span>
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-frost dark:bg-slate-800 shadow-xs"
          >
            <Settings className="h-4 w-4 text-slate-500" />
            <span>الإعدادات</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-xs font-bold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 mt-1 active:scale-98 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      {/* Trigger Button: User Avatar + Name + Dropdown Icon */}
      <button
        type="button"
        id="header-user-menu-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2.5 rounded-full border border-white/20 bg-white/70 py-1 pe-3 ps-1 text-frost shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-indigo-400/50 hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-slate-800 active:scale-95 ${
          isOpen ? "ring-2 ring-indigo-500/30 border-indigo-500/50 bg-white dark:bg-slate-800" : ""
        }`}
      >
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 text-white font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs">{userInitial}</span>
          )}
          {isVerified && (
            <span
              title="حساب موثق"
              className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white ring-1.5 ring-white text-[8px] font-black"
            >
              ✓
            </span>
          )}
        </div>

        <span className="max-w-[110px] truncate text-[13px] font-semibold text-frost">
          {displayName}
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 text-frost-dim transition-transform duration-200 ${
            isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
          }`}
        />
      </button>

      {/* Sleek High-End Dropdown Menu */}
      {isOpen && (
        <div
          id="header-user-menu-dropdown"
          className="absolute left-0 mt-2 w-64 origin-top-left rounded-2xl border border-line bg-white/95 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 dark:bg-slate-900/95 dark:border-white/10 z-50 animate-in fade-in zoom-in-95 duration-150"
          dir="rtl"
        >
          {/* User Info Header Block */}
          <div className="flex items-center gap-3 border-b border-line/70 px-3 py-2.5 pb-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-sm">{userInitial}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-frost truncate">{displayName}</span>
                {isVerified && (
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    موثق ✓
                  </span>
                )}
              </div>
              <span className="text-[11px] text-frost-dim truncate">{user.email || userRole}</span>
              {user.merchantProfile?.plan && (
                <span className="mt-0.5 w-fit rounded-full bg-indigo-500/15 px-2 py-0.2 text-[9px] font-extrabold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  {user.merchantProfile.plan} PLAN
                </span>
              )}
            </div>
          </div>

          {/* Navigation Items Group */}
          <div className="py-1.5 space-y-0.5 text-xs font-medium text-frost">
            <Link
              href="/dashboard"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-frost hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>لوحة التحكم (Dashboard)</span>
              </div>
              <span className="text-[10px] text-frost-dim font-mono">⌘D</span>
            </Link>

            <Link
              href="/dashboard/settings/profile"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-frost hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <User className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
              <span>الملف الشخصي (Profile)</span>
            </Link>

            <Link
              href="/dashboard/settings/workspace"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-frost hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Building className="h-4 w-4 text-cyan-500 group-hover:scale-110 transition-transform" />
              <span>بيانات المتجر وفريق العمل</span>
            </Link>

            <Link
              href="/dashboard/settings/subscription"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-frost hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>الاشتراك والفوترة (Billing)</span>
              </div>
              <span className="rounded-full bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                PRO
              </span>
            </Link>

            <Link
              href="/dashboard/settings/usage"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-frost hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <BarChart3 className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span>الاستهلاك والتحليلات (Usage)</span>
            </Link>

            <Link
              href="/dashboard/settings/preferences"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-frost hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Sparkles className="h-4 w-4 text-violet-500 group-hover:scale-110 transition-transform" />
              <span>المظهر وقاموس الذكاء الاصطناعي</span>
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-frost hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Settings className="h-4 w-4 text-slate-500 group-hover:scale-110 transition-transform" />
              <span>مركز الإعدادات الشامل</span>
            </Link>
          </div>

          {/* Sign Out Section */}
          <div className="border-t border-line/70 pt-1.5 mt-1">
            <button
              type="button"
              id="header-user-signout-btn"
              onClick={handleSignOut}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="h-4 w-4 text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                <span>تسجيل الخروج (Sign Out)</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
