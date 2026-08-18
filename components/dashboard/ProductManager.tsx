"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "./types";
import {
  Plus,
  Package,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  Search,
  DollarSign,
  Layers,
  ArrowUpRight,
  HelpCircle,
  X,
  UploadCloud,
  Check,
  TrendingUp,
  Video,
} from "lucide-react";
import AIAdScriptModal from "./AIAdScriptModal";

interface ProductManagerProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onTestProductInAi: (productName: string) => void;
}

export default function ProductManager({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onTestProductInAi,
}: ProductManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForAdScript, setSelectedProductForAdScript] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category: "عطور ومستحضرات",
    price: 30,
    cost: 10,
    stock: 50,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80",
    description: "",
    sellingPoints: ["منتج أصلي عالي الجودة", "توصيل سريع خلال 48 ساعة", "ضمان استبدال واسترجاع"],
    aiTrainingNotes: "أكد للعميل أنه منتج أصلي ومضمون، وإذا سأل عن الشحن فهو متاح لكافة الولايات.",
    warranty: "ضمان 14 يوماً ذهبي",
    deliveryTime: "24-48 ساعة",
    isActive: true,
  });

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "عطور ومستحضرات",
      price: 30,
      cost: 10,
      stock: 50,
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80",
      description: "",
      sellingPoints: ["منتج أصلي عالي الجودة", "توصيل سريع خلال 48 ساعة", "ضمان استبدال واسترجاع"],
      aiTrainingNotes: "أكد للعميل أنه منتج أصلي ومضمون، وإذا سأل عن الشحن فهو متاح لكافة الولايات.",
      warranty: "ضمان 14 يوماً ذهبي",
      deliveryTime: "24-48 ساعة",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...(formData as Product),
      });
    } else {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        name: formData.name || "منتج جديد",
        category: formData.category || "عام",
        price: Number(formData.price) || 20,
        cost: Number(formData.cost) || 8,
        stock: Number(formData.stock) || 10,
        image: formData.image || "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80",
        description: formData.description || "وصف المنتج المضاف",
        sellingPoints: formData.sellingPoints && formData.sellingPoints.length > 0 ? formData.sellingPoints : ["جودة مضمونة"],
        aiTrainingNotes: formData.aiTrainingNotes || "تأكيد الجودة والتوصيل السريع",
        warranty: formData.warranty || "ضمان 14 يوماً",
        deliveryTime: formData.deliveryTime || "48 ساعة",
        salesCount: 0,
        isActive: true,
      };
      onAddProduct(newProd);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black text-ink">كتالوج المنتجات وتدريب الذكاء الاصطناعي</h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            ارفع منتجاتك، وحدد أسعارك، ودرّب الوكيل الذكي على نقاط القوة ليغلق الصفقات بالنيابة عنك.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs sm:text-sm font-bold text-[#241A08] shadow-md transition-all hover:bg-gold-soft hover:shadow-lg active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة منتج جديد للكتالوج</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم المنتج أو تفاصيل التدريب..."
            className="w-full rounded-xl border border-line bg-paper/50 py-2.5 pr-10 pl-4 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-gold focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-ink text-onDark shadow-xs"
                  : "bg-paper text-muted hover:bg-paper-alt hover:text-ink"
              }`}
            >
              {cat === "all" ? "جميع الفئات" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((p) => {
          const profit = p.price - p.cost;
          const profitMargin = Math.round((profit / p.price) * 100);

          return (
            <div
              key={p.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white shadow-xs transition-all hover:border-gold/60 hover:shadow-md"
            >
              {/* Product Top Header Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-paper">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />

                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-mono font-bold text-onDark backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                  <span>الوكيل مدرب 100%</span>
                </div>

                <div className="absolute bottom-3 right-3 left-3 text-onDark">
                  <span className="inline-block rounded-md bg-gold/90 px-2 py-0.5 text-[10px] font-bold text-[#241A08] mb-1">
                    {p.category}
                  </span>
                  <h3 className="font-display text-base font-bold line-clamp-1 text-onDark">
                    {p.name}
                  </h3>
                </div>
              </div>

              {/* Product Body */}
              <div className="flex-1 p-5 space-y-4">
                {/* Financial Overview */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-paper/60 p-3 text-center border border-line/60">
                  <div>
                    <span className="block font-mono text-[10px] text-muted">سعر البيع</span>
                    <span className="font-mono text-sm font-bold text-ink">${p.price}</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-muted">التكلفة</span>
                    <span className="font-mono text-sm font-semibold text-muted">${p.cost}</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-teal">هامش الربح</span>
                    <span className="font-mono text-sm font-bold text-teal">+{profitMargin}%</span>
                  </div>
                </div>

                {/* Sales & Inventory */}
                <div className="flex items-center justify-between text-xs text-muted border-b border-line/60 pb-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-teal" />
                    <span>مبيعات الوكيل: </span>
                    <b className="font-mono text-ink">{p.salesCount} طلب</b>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-muted" />
                    <span>المخزون: </span>
                    <b className="font-mono text-ink">{p.stock} حبة</b>
                  </div>
                </div>

                {/* AI Training Guidelines Snippet */}
                <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#AD7A2A] mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>تعليمات الوكيل الذكي:</span>
                  </div>
                  <p className="text-muted line-clamp-2 text-[11px] leading-relaxed">
                    {p.aiTrainingNotes}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-line/70 bg-paper/30 p-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onTestProductInAi(p.name)}
                    className="flex items-center gap-1 rounded-lg bg-teal/10 px-2.5 py-2 text-xs font-bold text-teal transition-all hover:bg-teal hover:text-white"
                    title="اختبار رد الوكيل على هذا المنتج"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>اختبر الوكيل</span>
                  </button>

                  <button
                    onClick={() => setSelectedProductForAdScript(p)}
                    className="flex items-center gap-1 rounded-lg bg-gold/15 px-2.5 py-2 text-xs font-bold text-[#AD7A2A] transition-all hover:bg-gold hover:text-[#241A08]"
                    title="توليد سيناريو فيديو إعلاني UGC بالذكاء"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>سكريبت إعلان UGC</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-ink hover:text-ink"
                    title="تعديل المنتج"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(p.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-danger transition-colors hover:border-danger hover:bg-danger/10"
                    title="حذف المنتج"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI UGC Video Script Modal */}
      <AIAdScriptModal
        isOpen={!!selectedProductForAdScript}
        onClose={() => setSelectedProductForAdScript(null)}
        product={selectedProductForAdScript}
      />

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">
                    {editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد وتدريب الوكيل"}
                  </h3>
                  <p className="text-xs text-muted">
                    سيتم تدريب وكيل الذكاء الاصطناعي فوراً على هذه البيانات
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    اسم المنتج *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: عطر ميسان الملكي"
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    فئة المنتج
                  </label>
                  <input
                    type="text"
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="مثال: عطور، إلكترونيات، أزياء"
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    سعر البيع للعميل ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink font-mono focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    تكلفة المنتج عليك ($)
                  </label>
                  <input
                    type="number"
                    value={formData.cost || ""}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink font-mono focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                    الكمية المتاحة (المخزون)
                  </label>
                  <input
                    type="number"
                    value={formData.stock || ""}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink font-mono focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  رابط صورة المنتج (أو صورة تجريبية)
                </label>
                <input
                  type="text"
                  value={formData.image || ""}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs font-semibold text-ink">
                  وصف المنتج ومكوناته الرئيسية
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="مزيج ساحر من دهن العود الكمبودي..."
                  className="w-full rounded-xl border border-line px-3.5 py-2 text-ink focus:border-gold focus:outline-none"
                />
              </div>

              {/* AI Prompt Guidelines - Core Value */}
              <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#AD7A2A]">
                  <Sparkles className="h-4 w-4" />
                  <span>توجيهات تدريب وكيل الذكاء الاصطناعي (AI Prompt & Rules)</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  اكتب هنا أي معلومات تريد من الوكيل استخدامها عند إقناع العملاء (مثل: الثبات، الضمان، أكواد الخصم الخاصة بهذا المنتج).
                </p>
                <textarea
                  rows={3}
                  value={formData.aiTrainingNotes || ""}
                  onChange={(e) => setFormData({ ...formData, aiTrainingNotes: e.target.value })}
                  placeholder="مثال: إذا سأل العميل عن التوصيل أكد له أنه خلال 48 ساعة، وإذا تردد اعرض له خصم 10% بكود MAYSAN10..."
                  className="w-full rounded-xl border border-gold/30 bg-white px-3.5 py-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                />
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
                  <Check className="h-4 w-4" />
                  <span>{editingProduct ? "حفظ التعديلات وتحديث الذكاء" : "إضافة وحفظ وتدريب الوكيل"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
