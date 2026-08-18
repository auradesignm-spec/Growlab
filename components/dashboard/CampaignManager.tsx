"use client";

import { useState } from "react";
import { Campaign, Product } from "./types";
import {
  TrendingUp,
  Plus,
  Play,
  Pause,
  Video,
  Target,
  BarChart3,
  DollarSign,
  Sparkles,
  Eye,
  CheckCircle2,
  X,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface CampaignManagerProps {
  campaigns: Campaign[];
  products: Product[];
  onAddCampaign: (campaign: Campaign) => void;
  onToggleCampaignStatus: (id: string) => void;
}

export default function CampaignManager({
  campaigns,
  products,
  onAddCampaign,
  onToggleCampaignStatus,
}: CampaignManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || "");
  const [dailyBudget, setDailyBudget] = useState(25);
  const [platform, setPlatform] = useState<"instagram" | "facebook" | "both">("both");
  const [creativeType, setCreativeType] = useState<"UGC Video Reel" | "Carousel Showcase" | "Story Direct Ad">("UGC Video Reel");
  const [campaignName, setCampaignName] = useState("");

  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const avgRoas = (totalRevenue / (totalSpent || 1)).toFixed(2);
  const totalOrders = campaigns.reduce((acc, c) => acc + c.orders, 0);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProduct) || products[0];
    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      name: campaignName.trim() || `حملة إعلانية مخصصة — ${prod?.name || "منتج المتجر"}`,
      platform,
      status: "active",
      dailyBudget,
      spent: 0,
      revenue: 0,
      roas: 4.5,
      clicks: 0,
      orders: 0,
      targetAudience: "الجمهور المهتم بالمنتج في سلطنة عمان والخليج",
      creativeType,
    };
    onAddCampaign(newCamp);
    setIsModalOpen(false);
    setCampaignName("");
  };

  return (
    <div className="space-y-8">
      {/* Header & Launch Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black text-ink">
            إدارة حملات إعلانات ميتا (Meta Ads & UGC)
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            ندير ميزانيتك باحترافية، نصنع فيديوهات UGC مخصصة لمنتجاتك، ونوجه العملاء المهتمين مباشرة لوكيل الذكاء الاصطناعي.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs sm:text-sm font-bold text-[#241A08] shadow-md transition-all hover:bg-gold-soft hover:shadow-lg active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>إطلاق حملة نمو جديدة</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <span className="block font-mono text-xs text-muted mb-1">إجمالي الصرف الإعلاني</span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-ink">
            ${totalSpent.toLocaleString()}
          </span>
          <span className="block font-mono text-[11px] text-muted mt-1">عبر منصات Meta</span>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <span className="block font-mono text-xs text-muted mb-1">المبيعات المحققة من الإعلانات</span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-teal">
            ${totalRevenue.toLocaleString()}
          </span>
          <span className="block font-mono text-[11px] text-teal mt-1">تحويل مباشر</span>
        </div>

        <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5 shadow-xs">
          <span className="block font-mono text-xs text-ink/80 mb-1">متوسط العائد الإعلاني (ROAS)</span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-gold">
            {avgRoas}x
          </span>
          <span className="block font-mono text-[11px] text-ink font-medium mt-1">لكل دولار صرف</span>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <span className="block font-mono text-xs text-muted mb-1">الطلبات المؤكدة عبر الوكيل</span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-ink">
            {totalOrders} طلب
          </span>
          <span className="block font-mono text-[11px] text-muted mt-1">معدل تحويل 4.2%</span>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-ink">الحملات النشطة والمستمرة</h3>

        <div className="space-y-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-xs transition-all hover:border-gold/50 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-paper-alt text-ink">
                  <Video className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                        c.status === "active"
                          ? "bg-teal/15 text-teal"
                          : "bg-muted/15 text-muted"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          c.status === "active" ? "bg-teal animate-pulse" : "bg-muted"
                        }`}
                      />
                      {c.status === "active" ? "حملة نشطة" : "متوقفة مؤقتاً"}
                    </span>
                    <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-mono text-muted">
                      {c.platform === "instagram" ? "إنستغرام ريلز" : c.platform === "facebook" ? "فيسبوك" : "إنستغرام + فيسبوك"}
                    </span>
                    <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-mono text-[#AD7A2A]">
                      {c.creativeType}
                    </span>
                  </div>

                  <h4 className="font-display text-base font-bold text-ink">{c.name}</h4>
                  <p className="text-xs text-muted mt-1 line-clamp-1">{c.targetAudience}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-4 gap-4 border-t border-line pt-3 lg:border-t-0 lg:pt-0 text-center">
                <div>
                  <span className="block font-mono text-[10px] text-muted">الميزانية اليومية</span>
                  <span className="font-mono text-xs font-bold text-ink">${c.dailyBudget}/يوم</span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] text-muted">المصروف</span>
                  <span className="font-mono text-xs font-semibold text-ink">${c.spent}</span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] text-muted">المبيعات</span>
                  <span className="font-mono text-xs font-bold text-teal">${c.revenue}</span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] text-gold">العائد (ROAS)</span>
                  <span className="font-mono text-xs font-bold text-gold">{c.roas}x</span>
                </div>
              </div>

              {/* Status Action */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onToggleCampaignStatus(c.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    c.status === "active"
                      ? "border border-line bg-paper text-muted hover:bg-paper-alt hover:text-ink"
                      : "bg-teal text-white shadow-xs hover:bg-teal-hover"
                  }`}
                >
                  {c.status === "active" ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>تشغيل الحملة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">
                    إنشاء وإطلاق حملة إعلانية جديدة
                  </h3>
                  <p className="text-xs text-muted">
                    فريق Growlab سيقوم بصناعة الفيديو وإدارة المزاد الإعلاني
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  اسم الحملة الإعلانية
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="مثال: حملة صيف 2026 — عطر ميسان الملكي"
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  المنتج المستهدف في الإعلان
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — (${p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    نوع المحتوى الإعلاني
                  </label>
                  <select
                    value={creativeType}
                    onChange={(e) => setCreativeType(e.target.value as any)}
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none bg-white"
                  >
                    <option value="UGC Video Reel">فيديو UGC ريلز احترافي</option>
                    <option value="Carousel Showcase">معرض صور تفاعلي (كاروسيل)</option>
                    <option value="Story Direct Ad">ستوري مباشر لواتساب</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    المنصة المستهدفة
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none bg-white"
                  >
                    <option value="both">إنستغرام وفيسبوك معاً (أعلى وصول)</option>
                    <option value="instagram">إنستغرام فقط</option>
                    <option value="facebook">فيسبوك فقط</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-xs font-semibold text-ink">
                    الميزانية الإعلانية اليومية المقترحة:
                  </label>
                  <span className="font-mono text-xs font-bold text-teal">${dailyBudget} / يوم</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <div className="flex justify-between font-mono text-[10px] text-muted mt-1">
                  <span>$10/يوم (تجربة واختبار)</span>
                  <span>$50/يوم (نمو مستمر)</span>
                  <span>$150+/يوم (توسع سريع)</span>
                </div>
              </div>

              <div className="rounded-xl border border-gold/40 bg-gold/10 p-3.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#AD7A2A] mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>توليد وإنتاج الفيديو الإعلاني:</span>
                </div>
                <p className="text-muted text-[11px] leading-relaxed">
                  فريق إنتاج Growlab سيتولى كتابة السيناريو وإنتاج الفيديو الإعلاني وربط حملة ميتا مباشرة بوكيل الذكاء الاصطناعي على واتساب خلال 48 ساعة.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-line px-5 py-2.5 text-xs font-semibold text-muted hover:bg-paper"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-2.5 text-xs font-bold text-[#241A08] shadow-md hover:bg-gold-soft"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>اعتماد وإطلاق الحملة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
