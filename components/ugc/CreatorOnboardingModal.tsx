"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft,
  User,
  Instagram,
  ShoppingBag,
  Globe,
  Lock,
} from "lucide-react";
import { useUgc } from "@/lib/UgcContext";
import { CountryCode, Gender, LanguageCode } from "@/lib/ugc-types";

interface CreatorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorOnboardingModal: React.FC<CreatorOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { registerCreator, products } = useUgc();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Basic info
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<Gender>("unisex");
  const [country, setCountry] = useState<CountryCode>("OM");
  const [language, setLanguage] = useState<LanguageCode>("ar");

  // Step 2: Social
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [followersCount, setFollowersCount] = useState("15K");
  const [bio, setBio] = useState("");

  // Step 3: Payment verification (to prevent fake duplicate accounts & unlock 0% first campaign)
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [bankName, setBankName] = useState("بنك مسقط (Bank Muscat)");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  // Step 4: Initial products selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    products[0]?.id || "prod_smart_mic",
    products[1]?.id || "prod_oud_sultan",
  ]);

  if (!isOpen) return null;

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    const cleanUsername = username.trim().replace(/^@/, "") || `creator_${Math.floor(1000 + Math.random() * 9000)}`;

    const newCreator = registerCreator({
      displayName: displayName.trim() || "صانع محتوى متميز",
      username: cleanUsername,
      gender,
      country,
      language,
      bio: bio.trim() || "أهلاً بكم في متجري المصغر المعتمد في Growlab!",
      socialLinks: {
        instagram: instagram ? `@${instagram.replace(/^@/, "")}` : "@creator",
        tiktok: tiktok ? `@${tiktok.replace(/^@/, "")}` : "@creator",
        followersCount,
      },
      paymentVerified: true,
      paymentMethod: {
        type: "card",
        identifier: "•••• 4242",
        bankName,
      },
      selectedProductIds,
    });

    import("canvas-confetti").then((confetti) => {
      confetti.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#AD7A2A", "#10B981", "#34D399"],
      });
    });

    onClose();
    if (typeof window !== "undefined") {
      window.location.href = `/creator/${newCreator.username}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-growlab-bgCard border border-growlab-border p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-growlab-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-growlab-gold/20 text-growlab-gold flex items-center justify-center font-bold">
              {step}/4
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">
                انضم كصانع محتوى معتمد في Growlab
              </h3>
              <p className="text-[11px] text-muted">
                أنشئ متجرك المصغر وابدأ كسب عمولات أداء حقيقية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-white text-lg font-mono p-1"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-growlab-bgDark h-1.5 rounded-full my-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-growlab-gold to-growlab-emerald h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs text-muted mb-1">اسم الشهرة أو الاسم الكامل *</label>
              <input
                type="text"
                required
                placeholder="مثال: سالم بن خالد المعمري"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border focus:border-growlab-gold text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
                اسم المستخدم للرابط (Username) *
              </label>
              <div className="flex items-center rounded-xl bg-growlab-bgDark border border-growlab-border overflow-hidden px-3">
                <span className="text-muted text-xs font-mono">growlab.com/creator/</span>
                <input
                  type="text"
                  required
                  placeholder="salem_reviews"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="flex-1 py-2.5 px-1 bg-transparent text-growlab-gold font-mono text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">الدولة *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as CountryCode)}
                  className="w-full px-3 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none"
                >
                  <option value="OM">🇴🇲 سلطنة عُمان</option>
                  <option value="SA">🇸🇦 المملكة العربية السعودية</option>
                  <option value="AE">🇦🇪 دولة الإمارات</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">الجمهور المستهدف (الجنس) *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none"
                >
                  <option value="unisex">🌿 عام (للجنسين)</option>
                  <option value="male">👔 رجالي</option>
                  <option value="female">👗 نسائي</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs hover:brightness-110 flex items-center gap-1.5"
              >
                <span>المتابعة إلى حسابات التواصل</span>
                <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Social media */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs text-muted mb-1">حساب إنستغرام</label>
              <input
                type="text"
                placeholder="@username"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border focus:border-growlab-gold text-white text-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">حساب تيك توك</label>
              <input
                type="text"
                placeholder="@username"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border focus:border-growlab-gold text-white text-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">حجم المتابعين التقريبي</label>
              <select
                value={followersCount}
                onChange={(e) => setFollowersCount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none font-mono"
              >
                <option value="5K - 10K">5K - 10K متابع (Micro Creator)</option>
                <option value="10K - 50K">10K - 50K متابع (Mid Creator)</option>
                <option value="50K - 200K">50K - 200K متابع (Power Creator)</option>
                <option value="200K+">200K+ متابع (Macro Creator)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">نبذة قصيرة لزوار متجرك (Bio)</label>
              <textarea
                rows={2}
                placeholder="مرحباً! هنا أشارككم أفضل المنتجات التي جربتها واعتمدتها شخصياً..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-muted text-xs"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs hover:brightness-110 flex items-center gap-1.5"
              >
                <span>المتابعة إلى التحقق وتفعيل الحساب</span>
                <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Mandatory Payment & ID verification */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-growlab-ledger border border-growlab-gold/40 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-growlab-gold">
                <ShieldCheck className="h-4 w-4" />
                <span>التحقق الأمني ووسيلة استلام العمولات (ميزة الحماية):</span>
              </div>
              <p className="text-onDarkSoft leading-relaxed text-[11px]">
                وفقاً لسياسة المنصة، يلزم التحقق من وسيلة الدفع لتفعيل ميزة <strong>&quot;أول حملة مجانية (0% رسوم منصة)&quot;</strong> ومنع إنشاء حسابات وهمية مكررة. لن يتم خصم أي مبالغ.
              </p>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">البنك أو الحساب المعتمد للاستلام *</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">ربط بطاقة التحقق أو حساب Stripe Connect *</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-growlab-bgDark border border-growlab-emerald/40 text-xs">
                <CreditCard className="h-4 w-4 text-growlab-emerald shrink-0" />
                <span className="font-mono text-white flex-1">{cardNumber}</span>
                <span className="text-[10px] font-bold text-growlab-emerald bg-growlab-emerald/20 px-2 py-0.5 rounded">
                  ✓ تم التحقق الآمن
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-muted text-xs"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-growlab-gold text-growlab-bgDark font-bold text-xs hover:brightness-110 flex items-center gap-1.5"
              >
                <span>اختيار منتجات المتجر المبدئية</span>
                <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Curate Initial Storefront Products */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div>
              <h4 className="text-xs font-bold text-white mb-1">
                اختر المنتجات التي ترغب في عرضها في متجرك المصغر:
              </h4>
              <p className="text-[11px] text-muted">
                تم تحديد {selectedProductIds.length} منتجات. يمكنك تعديل واختيار المزيد لاحقاً من الكتالوج المركزي.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {products.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-growlab-bgSurface border-growlab-gold text-white"
                        : "bg-growlab-bgDark border-growlab-border text-muted hover:border-growlab-border/80"
                    }`}
                  >
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-growlab-emerald font-mono font-bold">
                        عمولة: {Math.round(p.commissionRate * 100)}% (${Number((p.priceUSD * p.commissionRate).toFixed(2))})
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border text-[10px] ${
                        isSelected
                          ? "bg-growlab-gold border-growlab-gold text-growlab-bgDark font-bold"
                          : "border-growlab-border text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl bg-growlab-bgDark border border-growlab-border text-muted text-xs"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-growlab-gold to-growlab-goldLight text-growlab-bgDark font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                <span>إطلاق المتجر المصغر فوراً!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
