"use client";

import { useState } from "react";
import {
  CompanyAccount,
  Product,
  Order,
  Campaign,
} from "./types";
import {
  initialCompany,
  sampleDemoCompanies,
  initialProducts,
  initialOrders,
  initialCampaigns,
} from "./mockData";
import ProductManager from "./ProductManager";
import AgentStudio from "./AgentStudio";
import CampaignManager from "./CampaignManager";
import OrdersManager from "./OrdersManager";
import RevenueAnalytics from "./RevenueAnalytics";
import {
  LayoutDashboard,
  Package,
  Bot,
  Video,
  ShoppingBag,
  BarChart3,
  Building2,
  Plus,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Percent,
} from "lucide-react";

interface DashboardViewProps {
  onBackToLanding: () => void;
}

export default function DashboardView({ onBackToLanding }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "agent" | "campaigns" | "orders" | "revenue"
  >("overview");

  // Companies state
  const [companies, setCompanies] = useState<CompanyAccount[]>(sampleDemoCompanies);
  const [currentCompanyId, setCurrentCompanyId] = useState<string>(sampleDemoCompanies[0].id);

  // Core Data state
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  // New Company Registration Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyCategory, setNewCompanyCategory] = useState("عطور ومستحضرات");
  const [newCompanyOwner, setNewCompanyOwner] = useState("");
  const [newCompanyPhone, setNewCompanyPhone] = useState("+968 ");
  const [newAgentName, setNewAgentName] = useState("مساعد المبيعات الذكي");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "partner">("partner");

  // AI Studio prefill state
  const [prefillQuery, setPrefillQuery] = useState<string>("");

  const currentCompany = companies.find((c) => c.id === currentCompanyId) || companies[0];

  // Handlers for Products
  const handleAddProduct = (prod: Product) => {
    setProducts((prev) => [prod, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleTestProductInAi = (prodName: string) => {
    setPrefillQuery(`كم سعر ${prodName} وما هي مميزاته وهل التوصيل متاح؟`);
    setActiveTab("agent");
  };

  // Handlers for Campaigns
  const handleAddCampaign = (camp: Campaign) => {
    setCampaigns((prev) => [camp, ...prev]);
  };

  const handleToggleCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c
      )
    );
  };

  // Handlers for Orders
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Handlers for Company
  const handleUpdateCompany = (updated: CompanyAccount) => {
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleRegisterCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const newComp: CompanyAccount = {
      id: `comp_${Date.now()}`,
      name: newCompanyName,
      category: newCompanyCategory,
      ownerName: newCompanyOwner || "المؤسس",
      email: "owner@brand.om",
      phone: newCompanyPhone || "+968 9000 0000",
      currency: "OMR / $",
      plan: selectedPlan,
      commissionRate: selectedPlan === "partner" ? 5 : 0,
      agentName: newAgentName || `وكيل مبيعات ${newCompanyName}`,
      agentDialect: "omani",
      agentAutoDiscountMax: 10,
      whatsappConnected: true,
      whatsappNumber: newCompanyPhone || "+968 9000 0000",
    };

    setCompanies((prev) => [...prev, newComp]);
    setCurrentCompanyId(newComp.id);
    setIsRegisterOpen(false);
    setActiveTab("products");
  };

  // Quick Stats
  const totalSalesAmount = orders.reduce((acc, o) => (o.status !== "cancelled" ? acc + o.totalAmount : acc), 0);
  const activeOrdersCount = orders.filter((o) => o.status === "confirmed_by_ai" || o.status === "shipped").length;
  const activeCampaignsCount = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-ink flex flex-col font-body antialiased selection:bg-gold/30 selection:text-ink">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand & Company Switcher */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-xs font-mono font-bold text-muted hover:text-ink transition-colors"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
              <span>الرئيسية</span>
            </button>

            <div className="h-5 w-[1px] bg-line hidden sm:block" />

            {/* Company Selector Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={currentCompanyId}
                  onChange={(e) => setCurrentCompanyId(e.target.value)}
                  className="rounded-xl border border-line bg-paper px-3 py-2 pr-8 text-xs sm:text-sm font-bold text-ink focus:border-gold focus:outline-none appearance-none cursor-pointer"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏬 {c.name} ({c.plan === "partner" ? "خطة الشريك 5%" : "خطة البداية"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="hidden sm:flex items-center gap-1 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold text-[#AD7A2A] hover:bg-gold hover:text-[#241A08] transition-all"
                title="تسجيل متجر أو شركة جديدة"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة شركة جديدة</span>
              </button>
            </div>
          </div>

          {/* Right Header Status */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 font-mono text-[11px] font-bold text-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
              <span>الوكيل يعمل 24/7 على واتساب</span>
            </div>

            <div className="flex items-center gap-2 border-r border-line pr-3 mr-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-gold font-mono font-bold text-xs">
                {currentCompany.name.slice(0, 1)}
              </div>
              <div className="hidden sm:block text-right">
                <span className="block font-bold text-xs text-ink line-clamp-1">{currentCompany.ownerName}</span>
                <span className="block text-[10px] text-muted font-mono">{currentCompany.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="border-t border-line/60 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-1.5 sm:px-6 scrollbar-none">
            {[
              { id: "overview", label: "نظرة عامة والتحكم", icon: LayoutDashboard },
              { id: "products", label: "كتالوج المنتجات وتدريب الذكاء", icon: Package, count: products.length },
              { id: "agent", label: "استوديو وكيل المبيعات", icon: Bot },
              { id: "campaigns", label: "إعلانات ميتا وUGC", icon: Video, count: activeCampaignsCount },
              { id: "orders", label: "الطلبات وإغلاقات الذكاء", icon: ShoppingBag, count: activeOrdersCount },
              { id: "revenue", label: "الأرباح والعمولات والشراكة", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-ink text-onDark shadow-xs"
                      : "text-muted hover:bg-paper hover:text-ink"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-gold" : "text-muted"}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        isActive ? "bg-gold text-ink" : "bg-paper-alt text-muted"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 md:p-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Welcome Banner */}
            <div className="rounded-3xl border border-gold/40 bg-gradient-to-l from-ink via-ink-2 to-ink p-6 sm:p-8 text-onDark shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gold/90 px-2 py-0.5 font-mono text-[10px] font-bold text-[#241A08]">
                      بوابة الشريك الذكي
                    </span>
                    <span className="font-mono text-xs text-gold-soft">
                      {currentCompany.name}
                    </span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-onDark">
                    أهلاً بك، {currentCompany.ownerName}! مبيعاتك تعمل آلياً على مدار الساعة 🚀
                  </h1>
                  <p className="text-xs sm:text-sm text-onDarkSoft leading-relaxed">
                    منصة Growlab تدير إعلانات ميتا الممولة، وتستقبل العملاء عبر وكيل الذكاء الاصطناعي على واتساب وتغلق الصفقات وتثبت العناوين نيابة عنك.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab("agent")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs sm:text-sm font-bold text-[#241A08] shadow-md hover:bg-gold-soft transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>اختبر وكيل المبيعات الآن</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="inline-flex items-center gap-2 rounded-xl border border-onDark/20 bg-onDark/10 px-5 py-3 text-xs sm:text-sm font-bold text-onDark hover:bg-onDark/20 transition-all"
                  >
                    <Package className="h-4 w-4" />
                    <span>إضافة منتجات للكتالوج</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                <span className="block font-mono text-xs text-muted mb-1">إجمالي المبيعات المغلقة</span>
                <span className="font-mono text-3xl font-black text-ink">${totalSalesAmount.toLocaleString()}</span>
                <span className="block font-mono text-[11px] text-teal mt-1">عبر وكيل الذكاء الاصطناعي</span>
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                <span className="block font-mono text-xs text-muted mb-1">الطلبات المؤكدة هذا الشهر</span>
                <span className="font-mono text-3xl font-black text-ink">{orders.length} طلب</span>
                <span className="block font-mono text-[11px] text-muted mt-1">معدل تحويل قياسي</span>
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                <span className="block font-mono text-xs text-muted mb-1">الحملات الإعلانية النشطة</span>
                <span className="font-mono text-3xl font-black text-gold">{activeCampaignsCount} حملات</span>
                <span className="block font-mono text-[11px] text-muted mt-1">Meta Ads & Reels</span>
              </div>

              <div className="rounded-2xl border border-teal/40 bg-teal/5 p-5 shadow-xs">
                <span className="block font-mono text-xs text-teal mb-1">حالة اتصال الوكيل (WhatsApp)</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-3 w-3 rounded-full bg-teal animate-pulse" />
                  <span className="font-display text-lg font-bold text-teal">متصل ومستعد</span>
                </div>
                <span className="block font-mono text-[11px] text-muted mt-1" dir="ltr">
                  {currentCompany.whatsappNumber}
                </span>
              </div>
            </div>

            {/* Recent Orders & Quick Launch Columns */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Recent Orders */}
              <div className="lg:col-span-8 rounded-2xl border border-line bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                    <ShoppingBag className="h-5 w-5 text-gold" />
                    <span>آخر الطلبات المؤكدة تلقائياً بواسطة الذكاء الاصطناعي</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-teal hover:underline font-mono"
                  >
                    عرض الكل ({orders.length}) ←
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-line/60 bg-paper/50 p-4 transition-all hover:bg-paper"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-xs text-ink">{o.id}</span>
                          <span className="rounded bg-teal/15 px-2 py-0.5 font-mono text-[10px] font-bold text-teal">
                            مؤكد بالذكاء
                          </span>
                          <span className="text-[11px] text-muted font-mono">{o.createdAt}</span>
                        </div>
                        <h4 className="font-display text-sm font-bold text-ink">{o.customerName} — {o.city}</h4>
                        <p className="text-xs text-muted mt-0.5 line-clamp-1">
                          {o.productName} (الكمية: {o.quantity})
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-line/60 sm:border-t-0 pt-2 sm:pt-0 font-mono">
                        <span className="text-base font-black text-ink">${o.totalAmount}</span>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted hover:text-ink"
                        >
                          التفاصيل
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: AI Assistant & Quick Actions */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-2xl border border-gold/40 bg-ink p-6 text-onDark shadow-xl space-y-4">
                  <div className="flex items-center gap-2 font-display text-base font-bold text-gold-soft">
                    <Bot className="h-5 w-5 text-gold" />
                    <span>وكيل متجرك: {currentCompany.agentName}</span>
                  </div>

                  <p className="text-xs text-onDarkSoft leading-relaxed">
                    تم تدريب الوكيل على كافة منتجاتك وأسعارك وسياسات التوصيل. يمكنك تخصيص لهجته أو تعديل نسبة الخصم في أي وقت.
                  </p>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-onDark/10 pb-1.5">
                      <span className="text-onDarkSoft">اللهجة:</span>
                      <span className="text-gold font-bold">لهجة عمانية ودية</span>
                    </div>
                    <div className="flex justify-between border-b border-onDark/10 pb-1.5">
                      <span className="text-onDarkSoft">أقصى خصم تفاوضي:</span>
                      <span className="text-teal font-bold">{currentCompany.agentAutoDiscountMax}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-onDarkSoft">الربط:</span>
                      <span className="text-teal font-bold">WhatsApp Cloud Gateway</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("agent")}
                    className="w-full rounded-xl bg-gold py-2.5 text-center text-xs font-bold text-[#241A08] shadow-md hover:bg-gold-soft transition-all"
                  >
                    فتح استوديو التخصيص والمحاكاة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === "products" && (
          <ProductManager
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onTestProductInAi={handleTestProductInAi}
          />
        )}

        {/* TAB 3: AGENT STUDIO */}
        {activeTab === "agent" && (
          <AgentStudio
            company={currentCompany}
            products={products}
            onUpdateCompany={handleUpdateCompany}
            prefillQuery={prefillQuery}
          />
        )}

        {/* TAB 4: META ADS & UGC CAMPAIGNS */}
        {activeTab === "campaigns" && (
          <CampaignManager
            campaigns={campaigns}
            products={products}
            onAddCampaign={handleAddCampaign}
            onToggleCampaignStatus={handleToggleCampaign}
          />
        )}

        {/* TAB 5: ORDERS */}
        {activeTab === "orders" && (
          <OrdersManager
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            commissionRate={currentCompany.commissionRate}
          />
        )}

        {/* TAB 6: REVENUE & BILLING */}
        {activeTab === "revenue" && (
          <RevenueAnalytics
            company={currentCompany}
            orders={orders}
            campaigns={campaigns}
          />
        )}
      </main>

      {/* Register New Company Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">
                    تسجيل متجر أو شركة جديدة في Growlab
                  </h3>
                  <p className="text-xs text-muted">
                    انضم لنموذج الشراكة والذكاء الاصطناعي لبدء بيع منتجاتك تلقائياً
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRegisterOpen(false)}
                className="rounded-lg border border-line p-1.5 text-muted hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterCompany} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  اسم المتجر / الشركة *
                </label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="مثال: لبان الدار الملكي، متجر الأناقة..."
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    اسم المؤسس / المسؤول
                  </label>
                  <input
                    type="text"
                    value={newCompanyOwner}
                    onChange={(e) => setNewCompanyOwner(e.target.value)}
                    placeholder="مثال: فيصل العامري"
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    فئة النشاط التجاري
                  </label>
                  <input
                    type="text"
                    value={newCompanyCategory}
                    onChange={(e) => setNewCompanyCategory(e.target.value)}
                    placeholder="عطور، أزياء، إلكترونيات..."
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  رقم الواتساب التجاري (لربط الوكيل) *
                </label>
                <input
                  type="text"
                  required
                  value={newCompanyPhone}
                  onChange={(e) => setNewCompanyPhone(e.target.value)}
                  placeholder="+968 9..."
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink font-mono focus:border-gold focus:outline-none"
                />
              </div>

              {/* Plan Choice: Starter vs Partner Plan */}
              <div>
                <label className="mb-1.5 block font-mono text-xs font-semibold text-ink">
                  اختر نموذج الشراكة والربح:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPlan("partner")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      selectedPlan === "partner"
                        ? "border-gold bg-gold/10 shadow-xs"
                        : "border-line bg-paper"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display font-bold text-ink">خطة الشريك الذكي</span>
                      <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-[#241A08]">
                        الأكثر طلباً
                      </span>
                    </div>
                    <span className="block font-mono text-xs text-teal font-bold">$49/شهر + 5% عمولة</span>
                    <p className="text-[11px] text-muted mt-1 leading-snug">
                      إنتاج فيديوهات UGC + إدارة إعلانات ميتا + وكيل ذكي 24/7.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedPlan("starter")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      selectedPlan === "starter"
                        ? "border-gold bg-gold/10 shadow-xs"
                        : "border-line bg-paper"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display font-bold text-ink">خطة الوكيل فقط</span>
                    </div>
                    <span className="block font-mono text-xs text-ink font-bold">$99/شهر (0% عمولة)</span>
                    <p className="text-[11px] text-muted mt-1 leading-snug">
                      وكيل الذكاء الاصطناعي على واتساب بدون إدارة حملات ميتا.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="rounded-xl border border-line px-5 py-2.5 text-xs font-semibold text-muted hover:bg-paper"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-2.5 text-xs font-bold text-[#241A08] shadow-md hover:bg-gold-soft"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تأكيد التسجيل والدخول للداشبورد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
