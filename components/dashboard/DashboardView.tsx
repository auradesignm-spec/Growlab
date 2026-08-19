"use client";

import { useState, useEffect } from "react";
import {
  CompanyAccount,
  Product,
  Order,
  Campaign,
  UserAccount,
} from "./types";
import {
  initialCompany,
  sampleDemoCompanies,
  initialProducts,
  initialOrders,
  initialCampaigns,
} from "./mockData";
import { StorageManager } from "./StorageManager";
import ProductManager from "./ProductManager";
import AgentStudio from "./AgentStudio";
import CampaignManager from "./CampaignManager";
import OrdersManager from "./OrdersManager";
import RevenueAnalytics from "./RevenueAnalytics";
import AICopilotChat from "./AICopilotChat";
import HighThinkingAdvisor from "./HighThinkingAdvisor";
import AICreativeStudio from "./AICreativeStudio";
import AuthModal from "./AuthModal";
import WhatsAppConnectModal from "./WhatsAppConnectModal";
import UserManagement from "./UserManagement";
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
  User,
  LogOut,
  Smartphone,
  Download,
  RotateCcw,
  BrainCircuit,
  Image as ImageIcon,
  MessageSquare,
  Wand2,
  Users,
  Shield,
  Lock,
} from "lucide-react";

interface DashboardViewProps {
  onBackToLanding: () => void;
}

export default function DashboardView({ onBackToLanding }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "copilot" | "thinking" | "creative" | "agent" | "products" | "campaigns" | "orders" | "revenue" | "users"
  >("overview");

  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Core Data state with persistent storage
  const [companies, setCompanies] = useState<CompanyAccount[]>(sampleDemoCompanies);
  const [currentCompanyId, setCurrentCompanyId] = useState<string>(sampleDemoCompanies[0].id);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  // New Company Registration Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyCategory, setNewCompanyCategory] = useState("عطور ومستحضرات");
  const [newCompanyOwner, setNewCompanyOwner] = useState("");
  const [newCompanyPhone, setNewCompanyPhone] = useState("+968 9");
  const [newAgentName, setNewAgentName] = useState("سالم — مستشار المبيعات");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "partner">("partner");

  // AI Studio prefill state
  const [prefillQuery, setPrefillQuery] = useState<string>("");

  // Load from local storage on mount
  useEffect(() => {
    const savedUser = StorageManager.getUserSession();
    if (savedUser) {
      setCurrentUser(savedUser);
    } else {
      // Force auth modal to open if no session
      setIsAuthModalOpen(true);
    }

    const savedAccounts = StorageManager.getAccounts();
    if (savedAccounts && savedAccounts.length > 0) {
      setCompanies(savedAccounts);
      if (savedUser?.role === "merchant" && savedUser.companyId) {
        setCurrentCompanyId(savedUser.companyId);
      } else if (savedUser?.companyId && savedAccounts.some((c) => c.id === savedUser.companyId)) {
        setCurrentCompanyId(savedUser.companyId);
      } else {
        setCurrentCompanyId(savedAccounts[0].id);
      }
    }

    const savedProducts = StorageManager.getProducts();
    if (savedProducts && savedProducts.length > 0) setProducts(savedProducts);

    const savedOrders = StorageManager.getOrders();
    if (savedOrders && savedOrders.length > 0) setOrders(savedOrders);

    const savedCampaigns = StorageManager.getCampaigns();
    if (savedCampaigns && savedCampaigns.length > 0) setCampaigns(savedCampaigns);
  }, []);

  const currentCompany = companies.find((c) => c.id === currentCompanyId) || companies[0];

  // Sync state changes to storage
  const handleSaveAccounts = (updated: CompanyAccount[]) => {
    setCompanies(updated);
    StorageManager.saveAccounts(updated);
  };

  const handleSaveProducts = (updated: Product[]) => {
    setProducts(updated);
    StorageManager.saveProducts(updated);
  };

  const handleSaveOrders = (updated: Order[]) => {
    setOrders(updated);
    StorageManager.saveOrders(updated);
  };

  const handleSaveCampaigns = (updated: Campaign[]) => {
    setCampaigns(updated);
    StorageManager.saveCampaigns(updated);
  };

  // Handlers for Products
  const handleAddProduct = (prod: Product) => {
    const next = [prod, ...products];
    handleSaveProducts(next);
  };

  const handleUpdateProduct = (updated: Product) => {
    const next = products.map((p) => (p.id === updated.id ? updated : p));
    handleSaveProducts(next);
  };

  const handleDeleteProduct = (id: string) => {
    const next = products.filter((p) => p.id !== id);
    handleSaveProducts(next);
  };

  const handleTestProductInAi = (prodName: string) => {
    setPrefillQuery(`كم سعر ${prodName} وما هي مميزاته وهل التوصيل متاح؟`);
    setActiveTab("agent");
  };

  // Handlers for Campaigns
  const handleAddCampaign = (camp: Campaign) => {
    const next = [camp, ...campaigns];
    handleSaveCampaigns(next);
  };

  const handleToggleCampaign = (id: string) => {
    const next = campaigns.map((c) =>
      c.id === id ? { ...c, status: (c.status === "active" ? "paused" : "active") as Campaign["status"] } : c
    );
    handleSaveCampaigns(next);
  };

  // Handlers for Orders
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    const next = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    handleSaveOrders(next);
  };

  const handleOrderCreatedByAi = (newOrder: Order) => {
    const next = [newOrder, ...orders];
    handleSaveOrders(next);
  };

  // Handlers for Company
  const handleUpdateCompany = (updated: CompanyAccount) => {
    const next = companies.map((c) => (c.id === updated.id ? updated : c));
    handleSaveAccounts(next);
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

    const nextAccounts = [...companies, newComp];
    handleSaveAccounts(nextAccounts);
    setCurrentCompanyId(newComp.id);
    setIsRegisterOpen(false);
    setActiveTab("products");
  };

  const handleLoginSuccess = (user: UserAccount, company?: CompanyAccount) => {
    setCurrentUser(user);
    StorageManager.setUserSession(user);

    if (user.role === "merchant" && user.companyId) {
      setCurrentCompanyId(user.companyId);
    } else if (company) {
      if (!companies.some((c) => c.id === company.id)) {
        const next = [...companies, company];
        handleSaveAccounts(next);
      }
      setCurrentCompanyId(company.id);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    StorageManager.setUserSession(null);
    setIsAuthModalOpen(true);
  };

  const handleResetData = () => {
    if (confirm("هل تريد إعادة ضبط بيانات العرض التوضيحي للوضع الافتراضي؟")) {
      StorageManager.resetToDefault();
      setCompanies(sampleDemoCompanies);
      setCurrentCompanyId(sampleDemoCompanies[0].id);
      setProducts(initialProducts);
      setOrders(initialOrders);
      setCampaigns(initialCampaigns);
    }
  };

  const isAdmin = currentUser?.role === "admin";
  const isMerchant = currentUser?.role === "merchant";

  // If no user is logged in, show the Dedicated SaaS Login Screen (Auth Gate)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-ink flex flex-col justify-center items-center p-4 font-body antialiased selection:bg-gold/30 selection:text-ink">
        <div className="w-full max-w-lg mb-4 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-xs font-mono font-bold text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            <span>العودة للموقع التعريفي</span>
          </button>
          <span className="text-[11px] font-mono text-muted">بوابة الدخول الموحدة (SaaS Portal)</span>
        </div>

        <AuthModal
          isOpen={true}
          onClose={onBackToLanding}
          onLoginSuccess={handleLoginSuccess}
          existingAccounts={companies}
          isMandatory={true}
        />
      </div>
    );
  }

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

            {/* Company Selector: Full switcher for Admin, Locked view for Merchant */}
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <>
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
                    className="hidden sm:flex items-center gap-1 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold text-[#AD7A2A] hover:bg-gold hover:text-[#241A08] transition-all cursor-pointer"
                    title="تسجيل متجر أو شركة جديدة"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>إضافة شركة جديدة</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/5 px-3 py-2 text-xs font-bold text-ink">
                  <Lock className="h-3.5 w-3.5 text-teal" />
                  <span>متجرك المصرح: <span className="text-teal font-extrabold">{currentCompany.name}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Status & User Account */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="hidden lg:flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 font-mono text-[11px] font-bold text-teal hover:bg-teal/20 transition-colors cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
              <span>رقم المستلم المعتمد: ({currentCompany.recipientPhone || currentCompany.whatsappNumber || "96897844742"})</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2.5 border-r border-line pr-3 mr-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-mono font-bold text-xs ${
                    isAdmin
                      ? "bg-gold text-[#241A08] ring-2 ring-gold/40"
                      : "bg-teal text-white"
                  }`}
                >
                  {isAdmin ? "👑" : currentUser.fullName.slice(0, 1)}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="block font-bold text-xs text-ink line-clamp-1">
                      {currentUser.fullName}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold font-mono ${
                        isAdmin
                          ? "bg-gold/20 text-gold"
                          : "bg-teal/15 text-teal"
                      }`}
                    >
                      {isAdmin ? "المدير العام" : "صاحب متجر"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] text-danger hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <LogOut className="h-2.5 w-2.5" />
                    <span>تبديل الحساب / خروج</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-1.5 text-xs font-bold text-onDark shadow-xs hover:bg-ink-2 transition-all cursor-pointer"
              >
                <User className="h-3.5 w-3.5 text-gold" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="border-t border-line/60 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-1.5 sm:px-6 scrollbar-none">
            {[
              { id: "overview", label: "نظرة عامة والتحكم", icon: LayoutDashboard },
              { id: "copilot", label: "المساعد الذكي (AI Copilot)", icon: MessageSquare, badge: "صوت + نصوص" },
              { id: "thinking", label: "التفكير الاستراتيجي (High Thinking)", icon: BrainCircuit, badge: "Gemini 3.1 Pro" },
              { id: "creative", label: "استوديو الصور (Image Studio)", icon: ImageIcon, badge: "Flash Image" },
              { id: "agent", label: "استوديو وكيل واتساب (AI Agent)", icon: Bot },
              { id: "products", label: "كتالوج المنتجات", icon: Package, count: products.length },
              { id: "campaigns", label: "إعلانات ميتا وUGC", icon: Video, count: activeCampaignsCount },
              { id: "orders", label: "الطلبات وإغلاقات الذكاء", icon: ShoppingBag, count: activeOrdersCount },
              { id: "revenue", label: "الأرباح والعمولات والشراكة", icon: BarChart3 },
              ...(isAdmin
                ? [{ id: "users", label: "إدارة المستخدمين والصلاحيات", icon: Users, badge: "أدمن فقط" }]
                : []),
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
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
                  {tab.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono ${
                        isActive ? "bg-gold/20 text-gold-soft font-bold" : "bg-gold/10 text-[#AD7A2A]"
                      }`}
                    >
                      {tab.badge}
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
                      بوابة الشريك الذكي الحقيقية
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
                    <span>اختبر وكيل المبيعات الحقيقي</span>
                  </button>
                  <button
                    onClick={() => setIsWhatsAppModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-teal/40 bg-teal/20 px-5 py-3 text-xs sm:text-sm font-bold text-teal hover:bg-teal/30 transition-all"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>ربط واتساب و Webhook</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">إجمالي المبيعات المحققة</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-display text-2xl font-black text-ink">
                    ${totalSalesAmount.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono font-bold text-teal block mt-1">
                    +18.4% نمو هذا الشهر
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">طلبات مؤكدة بالذكاء</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/15 text-teal">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-display text-2xl font-black text-ink">
                    {orders.length} طلب
                  </span>
                  <span className="text-xs text-muted block mt-1">
                    {orders.filter((o) => o.status === "confirmed_by_ai").length} طلب في انتظار الشحن
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">حملات ميتا النشطة</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600">
                    <Video className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-display text-2xl font-black text-ink">
                    {activeCampaignsCount} حملة
                  </span>
                  <span className="text-xs text-muted block mt-1">
                    متوسط العائد الإعلاني ROAS: 4.8x
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">حالة وكيل واتساب</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#25D366]">
                    <Bot className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-display text-lg font-black text-ink">
                    {currentCompany.agentName}
                  </span>
                  <span className="text-xs font-mono font-bold text-teal block mt-1">
                    🟢 متصل ونشط 24/7
                  </span>
                </div>
              </div>
            </div>

            {/* AI Power Suite Feature Bar */}
            <div className="rounded-3xl border border-gold/40 bg-gradient-to-r from-gold/10 via-paper to-gold/5 p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line/60 pb-5 mb-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-xs font-mono font-bold text-gold mb-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Gemini 3 Suite — أحدث محركات الذكاء الاصطناعي العالمية</span>
                  </div>
                  <h3 className="font-display text-xl font-black text-ink">
                    منظومة الذكاء الاصطناعي المتكاملة لمتجرك
                  </h3>
                </div>
                <span className="text-xs text-muted font-mono">
                  جميع الميزات متصلة بالخادم الحقيقي وتعمل على بيانات متجرك
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div
                  onClick={() => setActiveTab("copilot")}
                  className="group cursor-pointer rounded-2xl border border-line bg-white p-5 transition-all hover:border-gold hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold mb-3 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h4 className="font-display text-sm font-bold text-ink mb-1">
                    المساعد الذكي (AI Copilot)
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    محادثة ذكية، تسجيل صوتي فوري، واستماع بالنطق الطبيعي لنصوص إعلاناتك.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-gold group-hover:underline">
                    فتح المساعد ↗
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab("thinking")}
                  className="group cursor-pointer rounded-2xl border border-line bg-white p-5 transition-all hover:border-gold hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 mb-3 group-hover:scale-110 transition-transform">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <h4 className="font-display text-sm font-bold text-ink mb-1">
                    التفكير العميق (High Thinking)
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    تحليل استراتيجي متقدم عبر Gemini 3.1 Pro بمستوى تفكير عميق لحل التحديات.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-purple-700 group-hover:underline">
                    بدء الاستشارة ↗
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab("creative")}
                  className="group cursor-pointer rounded-2xl border border-line bg-white p-5 transition-all hover:border-gold hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/15 text-teal mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <h4 className="font-display text-sm font-bold text-ink mb-1">
                    استوديو الصور (Image Studio)
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    توليد وتعديل صور إعلانات احترافية لمنتجاتك عبر Gemini 3.1 Flash Image.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-teal group-hover:underline">
                    تصميم صور ↗
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab("agent")}
                  className="group cursor-pointer rounded-2xl border border-line bg-white p-5 transition-all hover:border-gold hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-gold mb-3 group-hover:scale-110 transition-transform">
                    <Bot className="h-5 w-5" />
                  </div>
                  <h4 className="font-display text-sm font-bold text-ink mb-1">
                    وكيل المبيعات على واتساب
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    وكيل ذكي مخصص ومربوط بكتالوج منتجاتك، يتفاوض ويغلق الطلبات تلقائياً.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-ink group-hover:underline">
                    إدارة الوكيل ↗
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Preview */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 rounded-2xl border border-line bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-gold" />
                    <h3 className="font-display text-base font-bold text-ink">
                      آخر الطلبات الملتقطة من واتساب
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-mono font-bold text-teal hover:underline"
                  >
                    عرض كل الطلبات ({orders.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 4).map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-xl bg-paper p-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">{o.customerName}</span>
                          <span className="font-mono text-muted text-[11px]">{o.city}</span>
                        </div>
                        <p className="text-muted text-[11px]">{o.productName} ({o.quantity} حبة)</p>
                      </div>

                      <div className="text-left space-y-1">
                        <span className="font-mono font-bold text-ink block">${o.totalAmount}</span>
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono font-bold ${
                            o.status === "delivered"
                              ? "bg-teal/15 text-teal"
                              : o.status === "shipped"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gold/20 text-[#AD7A2A]"
                          }`}
                        >
                          {o.status === "confirmed_by_ai"
                            ? "مؤكد بالذكاء"
                            : o.status === "shipped"
                            ? "تم الشحن"
                            : o.status === "delivered"
                            ? "تم التسليم"
                            : o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Guide Box */}
              <div className="lg:col-span-5 rounded-2xl border border-line bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <ShieldCheck className="h-5 w-5 text-teal" />
                  <h3 className="font-display text-base font-bold text-ink">
                    كيف يحقق متجرك الأرباح معنا؟
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-muted leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 font-mono text-[11px] font-bold text-[#AD7A2A]">
                      1
                    </span>
                    <p>
                      <b className="text-ink">رفع الكتالوج:</b> أضف منتجاتك وأسعارها وملاحظات البيع في تبويب المنتجات.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 font-mono text-[11px] font-bold text-[#AD7A2A]">
                      2
                    </span>
                    <p>
                      <b className="text-ink">توليد الإعلانات والـ UGC:</b> استخدم أداة الذكاء الاصطناعي لإنشاء سكريبتات إعلانية وتصويرها.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 font-mono text-[11px] font-bold text-[#AD7A2A]">
                      3
                    </span>
                    <p>
                      <b className="text-ink">إغلاق المبيعات 24/7:</b> الوكيل الذكي يستقبل استفسارات المشترين ويؤكد العناوين والطلبات تلقائياً.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-line">
                  <button
                    onClick={handleResetData}
                    className="text-[11px] text-muted hover:text-danger flex items-center gap-1 font-mono"
                    title="استعادة البيانات الافتراضية"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>إعادة ضبط البيانات</span>
                  </button>
                  <span className="font-mono text-[11px] text-muted">
                    شراكة نمو 5% عمولة
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COPILOT (GEMINI CHAT & AUDIO TRANSCRIPTION) */}
        {activeTab === "copilot" && (
          <AICopilotChat
            company={currentCompany}
            products={products}
            onApplyAdCopy={(copy) => {
              setActiveTab("campaigns");
            }}
          />
        )}

        {/* TAB: HIGH THINKING ADVISOR (GEMINI 3.1 PRO) */}
        {activeTab === "thinking" && (
          <HighThinkingAdvisor
            company={currentCompany}
            products={products}
            orders={orders}
            campaigns={campaigns}
          />
        )}

        {/* TAB: AI CREATIVE STUDIO (IMAGE GENERATION & EDITING) */}
        {activeTab === "creative" && (
          <AICreativeStudio
            company={currentCompany}
            products={products}
          />
        )}

        {/* TAB: PRODUCTS */}
        {activeTab === "products" && (
          <ProductManager
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onTestProductInAi={handleTestProductInAi}
          />
        )}

        {/* TAB: AGENT STUDIO (GEMINI POWERED) */}
        {activeTab === "agent" && (
          <AgentStudio
            company={currentCompany}
            products={products}
            onUpdateCompany={handleUpdateCompany}
            onOrderCreated={handleOrderCreatedByAi}
            prefillQuery={prefillQuery}
          />
        )}

        {/* TAB: CAMPAIGNS */}
        {activeTab === "campaigns" && (
          <CampaignManager
            campaigns={campaigns}
            products={products}
            onAddCampaign={handleAddCampaign}
            onToggleCampaignStatus={handleToggleCampaign}
          />
        )}

        {/* TAB: ORDERS */}
        {activeTab === "orders" && (
          <OrdersManager
            orders={orders}
            commissionRate={currentCompany.commissionRate}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {/* TAB: REVENUE */}
        {activeTab === "revenue" && (
          <RevenueAnalytics
            orders={orders}
            campaigns={campaigns}
            company={currentCompany}
          />
        )}

        {/* TAB: USER MANAGEMENT (ADMIN ONLY) */}
        {activeTab === "users" && isAdmin && (
          <UserManagement
            currentUser={currentUser!}
            companies={companies}
            onOpenNewCompanyModal={() => setIsRegisterOpen(true)}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen || !currentUser}
        onClose={() => {
          if (currentUser) setIsAuthModalOpen(false);
        }}
        onLoginSuccess={handleLoginSuccess}
        existingAccounts={companies}
        isMandatory={!currentUser}
      />

      {/* WhatsApp Connect Modal */}
      <WhatsAppConnectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        company={currentCompany}
        onUpdateCompany={handleUpdateCompany}
      />

      {/* Register New Company Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-2xl">
            <div className="border-b border-line pb-4 mb-6">
              <h3 className="font-display text-xl font-bold text-ink">
                تسجيل شركة أو متجر جديد في Growlab
              </h3>
              <p className="text-xs text-muted mt-1">
                سيتم تخصيص وكيل ذكاء اصطناعي وربطه برقم واتساب خاص بهذا المتجر فوراً.
              </p>
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
