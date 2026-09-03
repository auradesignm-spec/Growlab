"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  RefreshCw,
  Archive,
  Download,
  Eye,
  Hash,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import {
  DOCUMENT_CATEGORIES,
  DocumentCategory,
  DocumentCategoryMeta,
  getCategoryMeta,
} from "@/lib/compliance/knowledgeBase";

interface KnowledgeFileRecord {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  storagePath: string;
  contentHash: string;
  documentCategory: string;
  versionNumber: number;
  isActive: boolean;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  categoryMeta?: DocumentCategoryMeta;
}

export default function AdminKnowledgeBasePage() {
  const [files, setFiles] = useState<KnowledgeFileRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("VAT_LAW");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "archived">("all");
  const [notification, setNotification] = useState<{
    type: "success" | "warning" | "error";
    message: string;
    details?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing knowledge base files on mount
  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/upload-law");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setFiles(json.data);
      }
    } catch (err) {
      console.error("Failed to load knowledge base files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
        setNotification(null);
      } else {
        setNotification({
          type: "error",
          message: "نوع الملف غير مدعوم",
          details: "يُرجى رفع ملف بصيغة PDF فقط.",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
        setNotification(null);
      } else {
        setNotification({
          type: "error",
          message: "نوع الملف غير مدعوم",
          details: "يُرجى رفع ملف بصيغة PDF فقط.",
        });
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setNotification({
        type: "warning",
        message: "لم يتم اختيار ملف",
        details: "يرجى تحديد ملف PDF لتحميله في قاعدة المعرفة.",
      });
      return;
    }

    if (!selectedCategory) {
      setNotification({
        type: "warning",
        message: "يرجى اختيار تصنيف المستند",
        details: "حدد نوع القانون أو اللائحة المنظمة لهذا المستند.",
      });
      return;
    }

    try {
      setUploading(true);
      setNotification(null);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("document_category", selectedCategory);

      const response = await fetch("/api/admin/upload-law", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.status === 409 || result.code === "IDENTICAL_FILE_HASH") {
        // Step A Hash Match Result
        setNotification({
          type: "warning",
          message: "الملف مطابق للنسخة الحالية، لا توجد تعديلات",
          details: "بصمة التشفير (SHA-256) مطابقة تماماً للمستند المحفوظ مسبقاً. لم يتم إنشاء إصدار جديد لأن المحتوى لم يتغير.",
        });
      } else if (result.success) {
        // Step B & C Successful Versioning Result
        setNotification({
          type: "success",
          message: result.message || "تم تحديث المستند وإنشاء إصدار نشط جديد بنجاح",
          details: `تم ترقية النسخة تلقائياً إلى الإصدار ${result.data?.versionNumber} وأرشفة النسخ السابقة لضمان عدم تعارض البيانات في الوكيل الذكي.`,
        });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await loadFiles();
      } else {
        setNotification({
          type: "error",
          message: result.error || "فشل رفع المستند",
          details: result.details || "حدث خطأ غير متوقع أثناء معالجة الملف.",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setNotification({
        type: "error",
        message: "خطأ في الاتصال بالخادم",
        details: "يرجى التحقق من اتصال الشبكة وإعادة المحاولة.",
      });
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter((file) => {
    if (filterTab === "active") return file.isActive;
    if (filterTab === "archived") return !file.isActive;
    return true;
  });

  const activeCount = files.filter((f) => f.isActive).length;
  const archivedCount = files.filter((f) => !f.isActive).length;

  const currentCategoryMeta = getCategoryMeta(selectedCategory);

  return (
    <div className="min-h-screen bg-[#070B14] text-white" dir="rtl">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B101E]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition flex items-center gap-1.5 text-xs"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للوحة التحكم</span>
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-bold text-sm sm:text-base text-white">
                إدارة قاعدة المعرفة التشريعية (Document Versioning Engine)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadFiles}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/80 flex items-center gap-1.5 transition"
              title="تحديث القائمة"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              DevSecOps Certified
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0D1426] to-[#0A0F1E] border border-emerald-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Shield className="w-4 h-4" />
                <span>نظام إدارة الإصدارات والرقابة التشريعية للمراسيم السلطانية</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                ترقية وتحديث المستندات القانونية النشطة
              </h2>
              <p className="text-sm text-white/60 mt-1.5 max-w-3xl leading-relaxed">
                عند صدور تعديل تشريعي أو تحديث حكومي للمراسيم واللوائح، يتم حساب بصمة التشفير (SHA-256) للملف الجديد. في حال تغير المحتوى، يتم تلقائياً تفعيل الإصدار الأحدث وتعيين النسخ السابقة كنسخ مؤرشفة وغير نشطة، لضمان استرجاع الذكاء الاصطناعي (Gemini) للإصدارات النافذة فقط.
              </p>
            </div>

            {/* Metrics cards */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[90px]">
                <div className="text-xs text-white/50">الإجمالي</div>
                <div className="text-xl font-bold text-white mt-0.5">{files.length}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center min-w-[90px]">
                <div className="text-xs text-emerald-400 font-medium">نشط للذكاء</div>
                <div className="text-xl font-bold text-emerald-300 mt-0.5">{activeCount}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[90px]">
                <div className="text-xs text-amber-400 font-medium">مؤرشف</div>
                <div className="text-xl font-bold text-amber-300 mt-0.5">{archivedCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Alert */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : notification.type === "warning"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                : "bg-rose-500/10 border-rose-500/30 text-rose-200"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {notification.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {notification.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {notification.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            </div>
            <div className="flex-1 text-sm">
              <div className="font-bold">{notification.message}</div>
              {notification.details && (
                <p className="text-xs mt-1 opacity-80 leading-relaxed">{notification.details}</p>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-60 hover:opacity-100 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload Form Section */}
        <section className="p-6 rounded-2xl bg-[#0E1528] border border-white/10 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                رفع وثيقة تشريعية جديدة (Smart Versioning Upload)
              </h3>
              <p className="text-xs text-white/50">
                اختر تصنيف القانون، وحدد ملف PDF ليتم تدقيقه واحتساب بصمة التشفير SHA-256
              </p>
            </div>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dropdown Menu for Document Category */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">
                  تصنيف المستند القانوني (Document Category) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <select
                    id="document-category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#090D18] border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500 transition appearance-none cursor-pointer"
                  >
                    {Object.values(DOCUMENT_CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#090D18] text-white">
                        {cat.nameAr} ({cat.decreeNumber})
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs">
                    ▼
                  </div>
                </div>

                {/* Selected Category Info Card */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1 mt-2">
                  <div className="flex items-center justify-between text-white/90 font-medium">
                    <span>{currentCategoryMeta.nameAr}</span>
                    <span className="text-emerald-400 text-[11px] font-mono">{currentCategoryMeta.id}</span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    {currentCategoryMeta.descriptionAr}
                  </p>
                </div>
              </div>

              {/* File Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">
                  ملف اللائحة / المرسوم (PDF فقط) <span className="text-emerald-400">*</span>
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-32 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    dragActive
                      ? "border-emerald-500 bg-emerald-500/10"
                      : selectedFile
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-white/15 hover:border-white/30 bg-[#090D18]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id="law-pdf-file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white truncate max-w-xs">
                          {selectedFile.name}
                        </div>
                        <div className="text-xs text-white/50">
                          {(selectedFile.size / 1024).toFixed(1)} KB • انقر للتغيير
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-7 h-7 text-white/40 mb-1.5" />
                      <p className="text-xs text-white/80 font-medium">
                        اسحب ملف الـ PDF هنا أو <span className="text-emerald-400 underline">تصفح الجهاز</span>
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">
                        الحد الأقصى للحجم: 20 ميغابايت • بصمة SHA-256 تُحسب آلياً
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  النظام يقوم بأرشفة النسخة السابقة تلقائياً حال ثبوت وجود تغييرات برمجية في محتوى الملف.
                </span>
              </div>

              <button
                type="submit"
                id="submit-upload-law-btn"
                disabled={uploading || !selectedFile}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ التحقق من البصمة والرفع...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>رفع وتطبيق الإصدار الذكي</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Documents Table Section */}
        <section className="p-6 rounded-2xl bg-[#0E1528] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>سجل الوثائق التشريعية والإصدارات التاريخية</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                تتبع الوثائق السارية (Active) والوثائق المؤرشفة (Archived) حسب التصنيف
              </p>
            </div>

            {/* Tabs Filter */}
            <div className="flex items-center p-1 rounded-xl bg-[#090D18] border border-white/10 text-xs">
              <button
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTab === "all"
                    ? "bg-white/15 text-white font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                جميع المستندات ({files.length})
              </button>
              <button
                onClick={() => setFilterTab("active")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTab === "active"
                    ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                النشطة فقط ({activeCount})
              </button>
              <button
                onClick={() => setFilterTab("archived")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTab === "archived"
                    ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                الأرشيف ({archivedCount})
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-white/50 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
              <p className="text-xs">جارٍ قراءة قاعدة المعرفة وحالة الإصدارات...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center rounded-xl bg-white/5 border border-dashed border-white/10 space-y-3">
              <Archive className="w-8 h-8 mx-auto text-white/30" />
              <p className="text-sm text-white/70 font-medium">لا توجد مستندات تطابق الفلتر الحالي</p>
              <p className="text-xs text-white/40 max-w-sm mx-auto">
                قم برفع أول وثيقة تشريعية (مثل قانون ضريبة القيمة المضافة أو قانون العمل) لتفعيل قاعدة المعرفة الذكية.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#090D18] text-white/60 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 font-semibold">المستند والتشريع</th>
                    <th className="py-3 px-4 font-semibold">التصنيف</th>
                    <th className="py-3 px-4 font-semibold text-center">الإصدار (Version)</th>
                    <th className="py-3 px-4 font-semibold text-center">حالة الوثيقة</th>
                    <th className="py-3 px-4 font-semibold">بصمة التشفير (SHA-256)</th>
                    <th className="py-3 px-4 font-semibold">تاريخ الرفع</th>
                    <th className="py-3 px-4 font-semibold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredFiles.map((doc) => {
                    const meta = doc.categoryMeta || getCategoryMeta(doc.documentCategory);
                    return (
                      <tr
                        key={doc.id}
                        className={`transition ${
                          doc.isActive
                            ? "bg-emerald-500/[0.02] hover:bg-emerald-500/[0.06]"
                            : "bg-white/[0.01] hover:bg-white/[0.03] opacity-75"
                        }`}
                      >
                        {/* Title & Decree */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                doc.isActive
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-white/10 text-white/40"
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                <span>{doc.fileName}</span>
                                {doc.isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                )}
                              </div>
                              <div className="text-[11px] text-white/50">{meta.decreeNumber}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="text-white/80 font-medium">{meta.nameAr}</span>
                        </td>

                        {/* Version Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border ${
                              doc.isActive
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                                : "bg-white/10 text-white/60 border-white/15"
                            }`}
                          >
                            الإصدار {doc.versionNumber}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {doc.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <Check className="w-3 h-3" />
                              <span>نشط ومعتمد للـ AI</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300/80 border border-amber-500/20">
                              <Archive className="w-3 h-3" />
                              <span>مؤرشف (ملغى تشريعياً)</span>
                            </span>
                          )}
                        </td>

                        {/* SHA-256 Hash */}
                        <td className="py-3.5 px-4 font-mono text-[10px] text-white/60">
                          <div className="flex items-center gap-1" title={doc.contentHash}>
                            <Hash className="w-3 h-3 text-white/30 shrink-0" />
                            <span>{doc.contentHash.slice(0, 10)}...{doc.contentHash.slice(-6)}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-white/50 text-[11px]">
                          {new Date(doc.createdAt).toLocaleDateString("ar-OM", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {doc.fileUrl && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                                title="تحميل أو معاينة المستند"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Security & Architecture Note */}
        <section className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              نظام الاسترجاع المولد بالذكاء الاصطناعي (RAG Engine) يستثني تلقائياً أي وثيقة تحمل حالة (is_active = false).
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition flex items-center gap-1"
          >
            <span>اختبار في لوحة التحكم</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </section>
      </main>
    </div>
  );
}
