"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  Radar,
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

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function HeaderUserMenu(props: HeaderUserMenuProps) {
  if (CLERK_ENABLED) {
    return <HeaderUserMenuWithClerk {...props} />;
  }
  return <HeaderUserMenuContent {...props} />;
}

function HeaderUserMenuWithClerk(props: HeaderUserMenuProps) {
  const clerk = useClerk();
  return (
    <HeaderUserMenuContent
      {...props}
      onClerkSignOut={() => clerk?.signOut?.({ redirectUrl: "/" })}
    />
  );
}

function HeaderUserMenuContent({
  initialUser,
  compact = false,
  onNavigate,
  onClerkSignOut,
}: HeaderUserMenuProps & { onClerkSignOut?: () => Promise<unknown> }) {
  const [user, setUser] = useState<UserProfileData | null>(initialUser || null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFueling, setIsFueling] = useState(false);
  const [isClimax, setIsClimax] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [dollarPopups, setDollarPopups] = useState<
    Array<{ id: number; text: string; x: number; rot: number }>
  >([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fuelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const climaxIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Helper to spawn a floating particle
  const spawnDollarParticle = useCallback((customText?: string) => {
    const symbols = ["+ر.ع", "100%", "+ر.ع 50", "امتثال", "+ر.ع 250", "+100%", "+ر.ع 500"];
    const text = customText || symbols[Math.floor(Math.random() * symbols.length)];
    const newPopup = {
      id: Date.now() + Math.random(),
      text,
      x: (Math.random() - 0.5) * 55,
      rot: (Math.random() - 0.5) * 35,
    };
    setDollarPopups((prev) => [...prev.slice(-12), newPopup]);

    setTimeout(() => {
      setDollarPopups((prev) => prev.filter((p) => p.id !== newPopup.id));
    }, 1000);
  }, []);

  // Listen for Money Swarm Fuel Pulses and Climax Sequence
  useEffect(() => {
    const handleFuelPulse = () => {
      setIsFueling(true);
      spawnDollarParticle();

      // Debounced cooldown for single pulses
      if (fuelTimeoutRef.current) clearTimeout(fuelTimeoutRef.current);
      fuelTimeoutRef.current = setTimeout(() => {
        setIsFueling(false);
      }, 1600);
    };

    const handleFuelClimax = (e: Event) => {
      const customEvent = e as CustomEvent<{ durationMs?: number }>;
      const duration = customEvent.detail?.durationMs || 1850;

      setIsFueling(true);
      setIsClimax(true);
      setShowShockwave(true);

      // Rapidly spawn fountain of dollar particles during climax
      let count = 0;
      if (climaxIntervalRef.current) clearInterval(climaxIntervalRef.current);
      climaxIntervalRef.current = setInterval(() => {
        spawnDollarParticle();
        count++;
        if (count > 10) {
          if (climaxIntervalRef.current) clearInterval(climaxIntervalRef.current);
        }
      }, 120);

      // Finish climax sequence
      setTimeout(() => {
        setIsClimax(false);
        setIsFueling(false);
        setShowShockwave(false);
        if (climaxIntervalRef.current) clearInterval(climaxIntervalRef.current);
      }, duration);
    };

    window.addEventListener("money-fuel-pulse", handleFuelPulse);
    window.addEventListener("money-fuel-climax", handleFuelClimax);
    return () => {
      window.removeEventListener("money-fuel-pulse", handleFuelPulse);
      window.removeEventListener("money-fuel-climax", handleFuelClimax);
      if (fuelTimeoutRef.current) clearTimeout(fuelTimeoutRef.current);
      if (climaxIntervalRef.current) clearInterval(climaxIntervalRef.current);
    };
  }, [spawnDollarParticle]);

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

    if (onClerkSignOut) {
      try {
        await onClerkSignOut();
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
    "مستخدم مساعد ريادة";

  const userInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl = user.creatorProfile?.avatarUrl;
  const isVerified =
    user.merchantProfile?.verificationStatus === "verified" ||
    user.creatorProfile?.verificationStatus === "verified";
  const userRole =
    user.role === "merchant"
      ? "صاحب منشأة / رائد أعمال"
      : user.role === "creator"
      ? "مدير الموارد البشرية والتعمين"
      : "مستشار مالي ومحاسبي";

  if (compact) {
    return (
      <div className="flex flex-col w-full gap-2 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-bold shadow-sm border border-slate-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span>{userInitial}</span>
            )}
            {isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white ring-2 ring-white text-[9px] font-black">
                ✓
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-slate-900 truncate">{displayName}</span>
            <span className="text-[11px] text-slate-500 truncate">{user.email || userRole}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-xs hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-700" />
            <span>لوحة التحكم</span>
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-xs hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            <Settings className="h-4 w-4 text-slate-700" />
            <span>الإعدادات</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 mt-1 active:scale-98 transition-all hover:bg-rose-100"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-600" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      {/* Trigger Button: User Avatar + Name + Dropdown Icon */}
      <div className="relative inline-block">
        {/* Luminous Emerald Shockwave on 100% Full Tank */}
        {showShockwave && (
          <span
            className="gl-fuel-shockwave-ring pointer-events-none absolute inset-0 rounded-full z-40 border border-emerald-400"
            aria-hidden="true"
          />
        )}

        {/* Floating Fuel Status HUD Badge */}
        {isClimax && (
          <div
            className="gl-fuel-status-badge pointer-events-none absolute -top-8 left-1/2 z-50 whitespace-nowrap"
            aria-hidden="true"
          >
            <div className="flex items-center gap-1 rounded-full bg-slate-950/95 border border-emerald-400 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 shadow-[0_4px_16px_rgba(16,185,129,0.5)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>مؤشر الامتثال 100% | حماية مفعلة</span>
            </div>
          </div>
        )}

        {/* Floating Mini Dollars when absorbing fuel */}
        {dollarPopups.map((popup) => (
          <div
            key={popup.id}
            className="gl-fuel-dollar pointer-events-none absolute -top-3 left-1/2 z-50 flex items-center justify-center font-black text-emerald-600 drop-shadow-[0_2px_4px_rgba(5,150,105,0.4)] text-[12px]"
            style={{
              ["--pop-x" as string]: `${popup.x}px`,
              ["--pop-rot" as string]: `${popup.rot}deg`,
            }}
          >
            <span className="rounded-full bg-emerald-100/95 border border-emerald-400 px-1.5 py-0.5 text-[10px] text-emerald-800 font-extrabold shadow-sm">
              {popup.text}
            </span>
          </div>
        ))}

        <button
          type="button"
          id="header-user-menu-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`relative flex items-center gap-2 rounded-full py-1 pe-3 ps-1 text-slate-900 backdrop-blur-xl transition-all duration-200 cursor-pointer active:scale-95 ${
            isClimax
              ? "gl-tank-climax border-2 border-emerald-300 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 text-white shadow-[0_0_45px_rgba(16,185,129,1),0_0_20px_rgba(52,211,153,1)] ring-4 ring-emerald-400/60"
              : isFueling
              ? "gl-tank-active border-2 border-emerald-400 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 text-white shadow-[0_0_35px_rgba(16,185,129,0.9),0_0_15px_rgba(52,211,153,0.95)] ring-4 ring-emerald-400/40"
              : isOpen
              ? "ring-2 ring-black/10 border border-black/40 bg-white shadow-md"
              : "border border-black/10 bg-white/95 shadow-sm hover:border-black/30 hover:bg-white"
          }`}
        >
          {/* Green Fuel Fill Gauge Glow Pulse */}
          {isFueling && (
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse pointer-events-none" />
          )}

          <div
            className={`relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold transition-all duration-200 ${
              isFueling
                ? "bg-slate-950 text-emerald-300 ring-2 ring-white"
                : "bg-slate-900 text-white border border-black/10"
            }`}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs">{userInitial}</span>
            )}
            {isVerified && (
              <span
                title="حساب موثق"
                className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-1.5 ring-white text-[8px] font-black ${
                  isFueling ? "bg-emerald-400 text-slate-950" : "bg-slate-900 text-white"
                }`}
              >
                ✓
              </span>
            )}
          </div>

          <span
            className={`max-w-[120px] truncate text-[13px] font-bold transition-colors ${
              isFueling ? "text-white drop-shadow-sm" : "text-slate-900"
            }`}
          >
            {displayName}
          </span>

          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isFueling
                ? "text-white"
                : isOpen
                ? "rotate-180 text-slate-900"
                : "text-slate-500"
            }`}
          />
        </button>
      </div>

      {/* Sleek High-End Dropdown Menu */}
      {isOpen && (
        <div
          id="header-user-menu-dropdown"
          className="absolute left-0 mt-2 w-64 origin-top-left rounded-2xl border border-slate-200/90 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.14)] ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150"
          dir="rtl"
        >
          {/* User Info Header Block */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 pb-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-bold shadow-sm border border-slate-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-sm">{userInitial}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 truncate">{displayName}</span>
                {isVerified && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-900">
                    موثق ✓
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 truncate">{user.email || userRole}</span>
              {user.merchantProfile?.plan && (
                <span className="mt-1 w-fit rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white">
                  باقة {user.merchantProfile.plan === "pro" ? "المحترفين" : user.merchantProfile.plan}
                </span>
              )}
            </div>
          </div>

          {/* Navigation Items Group */}
          <div className="py-1.5 space-y-0.5 text-xs font-medium">
            <Link
              href="/dashboard"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50 hover:text-slate-950 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4 text-slate-700 group-hover:text-slate-950 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-900">لوحة التحكم</span>
              </div>
            </Link>

            <Link
              href="/dashboard/competitor-radar"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-slate-800 hover:bg-emerald-50/70 hover:text-emerald-950 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Radar className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-900">رادار التعمين</span>
              </div>
            </Link>

            <Link
              href="/dashboard/settings/profile"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50 hover:text-slate-950 transition-colors group"
            >
              <User className="h-4 w-4 text-slate-700 group-hover:text-slate-950 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-900">الملف الشخصي</span>
            </Link>

            <Link
              href="/dashboard/settings/workspace"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50 hover:text-slate-950 transition-colors group"
            >
              <Building className="h-4 w-4 text-slate-700 group-hover:text-slate-950 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-900">بيانات المنشأة وفريق العمل</span>
            </Link>

            <Link
              href="/dashboard/settings/subscription"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50 hover:text-slate-950 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-slate-700 group-hover:text-slate-950 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-900">الاشتراك والباقات</span>
              </div>
            </Link>

            <Link
              href="/dashboard/settings/usage"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50 hover:text-slate-950 transition-colors group"
            >
              <BarChart3 className="h-4 w-4 text-slate-700 group-hover:text-slate-950 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-900">مؤشرات الامتثال</span>
            </Link>

            <Link
              href="/dashboard/settings/preferences"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50 hover:text-slate-950 transition-colors group"
            >
              <Sparkles className="h-4 w-4 text-slate-700 group-hover:text-slate-950 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-900">المظهر وقاموس الذكاء الاصطناعي</span>
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50 hover:text-slate-950 transition-colors group"
            >
              <Settings className="h-4 w-4 text-slate-700 group-hover:text-slate-950 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-900">مركز الإعدادات الشامل</span>
            </Link>
          </div>

          {/* Sign Out Section */}
          <div className="border-t border-slate-100 pt-1.5 mt-1">
            <button
              type="button"
              id="header-user-signout-btn"
              onClick={handleSignOut}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="h-4 w-4 text-slate-600 group-hover:text-rose-600 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-medium">تسجيل الخروج</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
