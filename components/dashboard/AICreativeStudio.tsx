"use client";

import { useState, useRef } from "react";
import { CompanyAccount, Product } from "./types";
import {
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Download,
  Upload,
  Layers,
  RefreshCw,
  Eye,
  Check,
  Zap,
  Tag,
  Palette,
  Sliders,
  ExternalLink,
} from "lucide-react";

interface AICreativeStudioProps {
  company: CompanyAccount;
  products: Product[];
  onAddProductImage?: (productId: string, imageUrl: string) => void;
}

export default function AICreativeStudio({
  company,
  products,
  onAddProductImage,
}: AICreativeStudioProps) {
  const [activeMode, setActiveMode] = useState<"generate" | "edit">("generate");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "9:16" | "16:9" | "4:3">("1:1");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);

  // Uploaded image for editing
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>("image/jpeg");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Results state
  const [generatedImages, setGeneratedImages] = useState<
    Array<{ id: string; url: string; prompt: string; ratio: string; time: string }>
  >([
    {
      id: "demo_1",
      url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
      prompt: "عطر فاخر على قاعدة رخامية سوداء مع إضاءة ستوديو ذهبية وإكسسوارات راقية",
      ratio: "1:1",
      time: "منذ قليل",
    },
    {
      id: "demo_2",
      url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
      prompt: "بوستر إعلاني احترافي لمستحضرات العناية مع خلفية طبيعية هادئة",
      ratio: "9:16",
      time: "منذ ساعة",
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Preset styles & templates
  const stylePresets = [
    { title: "ستوديو تجاري فاخر", promptAdd: "Luxury commercial studio photography, dark marble podium, golden hour backlight, hyper-detailed texture, 8k commercial look" },
    { title: "طبيعي وهادئ (Organic)", promptAdd: "Clean minimalist aesthetic, warm natural sunlight, soft shadows, linen and beige textures, organic mood" },
    { title: "عرض ترويجي وخصم ميتا", promptAdd: "Vibrant high-converting social media ad visual with bold aesthetic, modern typography space, dynamic clean lighting" },
    { title: "لايف ستايل خليجي راقي", promptAdd: "Upscale modern Gulf Arabian lifestyle setting, elegant living space, subtle arabesque luxury touches" },
  ];

  const quickProductPrompts = products.map((p) => ({
    name: p.name,
    prompt: `Professional high-end commercial ad photograph of ${p.name}, sleek presentation, premium lighting, perfect for Instagram feed ad banner.`,
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onloadend = () => {
      setSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (presetPrompt?: string) => {
    const finalPrompt = presetPrompt || prompt;
    if (!finalPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/gemini/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio: aspectRatio,
          action: activeMode,
          sourceImageBase64: activeMode === "edit" ? sourceImage : undefined,
          sourceMimeType: sourceMimeType,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        const newImg = {
          id: `img_${Date.now()}`,
          url: data.imageUrl,
          prompt: finalPrompt,
          ratio: aspectRatio,
          time: "الآن",
        };
        setGeneratedImages((prev) => [newImg, ...prev]);
        setSelectedPreviewImage(data.imageUrl);
      } else {
        throw new Error(data.error || "فشل توليد الصورة");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      setErrorMsg(err?.message || "حدث خطأ أثناء الاتصال بنموذج توليد الصور.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 font-mono text-xs font-bold text-gold-soft mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gemini 3.1 Flash Image — Nano Banana Studio</span>
          </div>
          <h2 className="font-display text-2xl font-black text-ink">
            استوديو ومصمم الإعلانات والصور الإبداعية (AI Creative Studio)
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            صمم بوسترات منتجاتك، صور إعلانات إنستغرام وتيك توك، وعدّل خلفيات المنتجات بنقرة زر واحدة.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl border border-line bg-paper p-1 font-mono text-xs font-bold text-ink">
          <button
            onClick={() => setActiveMode("generate")}
            className={`rounded-lg px-4 py-2 transition-all ${
              activeMode === "generate" ? "bg-ink text-gold shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            إنشاء صور جديدة
          </button>
          <button
            onClick={() => setActiveMode("edit")}
            className={`rounded-lg px-4 py-2 transition-all ${
              activeMode === "edit" ? "bg-ink text-gold shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            تعديل صورة منتج
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Generator Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-5">
            {/* Quick Product Pick */}
            {products.length > 0 && activeMode === "generate" && (
              <div>
                <label className="block font-mono text-xs font-semibold text-ink mb-1.5">
                  اختر منتجاً من متجرك لتوليد صورة له:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setPrompt(
                          `Professional luxury commercial advertising photo of ${p.name}, sleek podium display, dramatic warm studio lighting, 8k quality for Instagram ads.`
                        );
                      }}
                      className="rounded-lg border border-line bg-paper px-2.5 py-1 text-[11px] text-ink hover:border-gold hover:text-gold transition-colors"
                    >
                      🏷️ {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If Edit Mode: Upload Image */}
            {activeMode === "edit" && (
              <div>
                <label className="block font-mono text-xs font-semibold text-ink mb-2">
                  ارفع صورة المنتج المراد تعديله:
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-line p-6 text-center hover:border-gold hover:bg-gold/[0.02] transition-colors"
                >
                  {sourceImage ? (
                    <div className="space-y-2">
                      <img
                        src={sourceImage}
                        alt="Uploaded"
                        className="mx-auto h-32 rounded-lg object-contain shadow-xs"
                      />
                      <span className="block font-mono text-xs text-teal font-bold">
                        ✓ تم رفع الصورة — انقر لتغييرها
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-muted" />
                      <span className="block font-bold text-xs text-ink">
                        انقر لرفع صورة المنتج أو اسحبها هنا
                      </span>
                      <span className="text-[11px] text-muted block">PNG, JPG, WEBP حتى 10MB</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label className="block font-mono text-xs font-semibold text-ink mb-1.5">
                {activeMode === "generate" ? "وصف المشهد والإعلان المطلوب:" : "تعليمات التعديل المطلوبة:"}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={
                  activeMode === "generate"
                    ? "مثال: عطر فاخر مع قطرات ندى هادئة على قاعدة خشبية طبيعية بإضاءة شمس دافئة..."
                    : "مثال: أضف بادج خصم 20% باللون الذهبي في الزاوية، وغيّر الخلفية لرخام أسود فاخر..."
                }
                className="w-full rounded-xl border border-line bg-paper p-3 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block font-mono text-xs font-semibold text-ink mb-2">
                أبعاد الصورة (Aspect Ratio):
              </label>
              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                {[
                  { ratio: "1:1", label: "مربع (Feed)" },
                  { ratio: "9:16", label: "ستوري وريلز" },
                  { ratio: "16:9", label: "بنر عريض" },
                  { ratio: "4:3", label: "كتالوج" },
                ].map((item) => (
                  <button
                    key={item.ratio}
                    type="button"
                    onClick={() => setAspectRatio(item.ratio as any)}
                    className={`rounded-xl border p-2.5 transition-all ${
                      aspectRatio === item.ratio
                        ? "border-gold bg-gold/15 font-bold text-gold ring-1 ring-gold"
                        : "border-line bg-paper text-muted hover:text-ink"
                    }`}
                  >
                    <div className="font-bold">{item.ratio}</div>
                    <div className="text-[10px] opacity-80">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Presets */}
            {activeMode === "generate" && (
              <div>
                <label className="block font-mono text-xs font-semibold text-ink mb-1.5">
                  قوالب وأساليب إخراج جاهزة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {stylePresets.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt((prev) => (prev ? `${prev}, ${sp.promptAdd}` : sp.promptAdd))}
                      className="rounded-xl border border-line bg-paper p-2.5 text-right text-xs hover:border-gold transition-colors"
                    >
                      <div className="font-bold text-ink text-[11px] mb-0.5">{sp.title}</div>
                      <span className="text-[10px] text-muted block line-clamp-1">إضافة الأسلوب</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message if any */}
            {errorMsg && (
              <div className="rounded-xl bg-danger/10 border border-danger/30 p-3 text-xs text-danger">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={!prompt.trim() || isGenerating || (activeMode === "edit" && !sourceImage)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink py-3.5 font-bold text-xs sm:text-sm text-gold shadow-md hover:bg-ink-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-gold" />
                  <span>جاري إنشاء الصورة الفائقة بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>
                    {activeMode === "generate" ? "إنشاء وتصميم الصورة الآن" : "تطبيق التعديلات الذكية"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Generated Gallery & Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gold" />
                <h3 className="font-display text-base font-bold text-ink">معرض الإبداعات والتصاميم</h3>
              </div>
              <span className="font-mono text-xs text-muted font-bold">
                {generatedImages.length} تصاميم جاهزة
              </span>
            </div>

            {/* Main Preview Image */}
            {selectedPreviewImage && (
              <div className="rounded-2xl border border-gold/40 bg-paper p-3 space-y-3 animate-fadeIn">
                <div className="relative overflow-hidden rounded-xl bg-ink max-h-[380px] flex items-center justify-center">
                  <img
                    src={selectedPreviewImage}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted font-mono">معاينة بجودة فائقة</span>
                  <a
                    href={selectedPreviewImage}
                    download="growlab_ad_creative.png"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3 py-1.5 font-mono text-xs font-bold text-gold hover:bg-ink-2 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>تحميل الصورة عالية الدقة</span>
                  </a>
                </div>
              </div>
            )}

            {/* Generated Items Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {generatedImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedPreviewImage(img.url)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-line bg-paper transition-all hover:border-gold hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden bg-ink/5">
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] text-ink line-clamp-1 font-body">{img.prompt}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-muted">
                      <span>{img.ratio}</span>
                      <span>{img.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
