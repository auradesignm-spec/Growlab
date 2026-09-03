import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateFileHash,
  uploadLawPdf,
  deleteLawPdfFromStorage,
} from "@/lib/storage/supabaseStorage";
import {
  DocumentCategory,
  DOCUMENT_CATEGORIES,
  getCategoryMeta,
} from "@/lib/compliance/knowledgeBase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/upload-law
 * Fetches all knowledge base documents grouped or ordered by category and version.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const whereClause: {
      documentCategory?: string;
      isActive?: boolean;
    } = {};

    if (category) {
      whereClause.documentCategory = category;
    }
    if (activeOnly) {
      whereClause.isActive = true;
    }

    const files = await prisma.knowledgeBaseFile.findMany({
      where: whereClause,
      orderBy: [
        { documentCategory: "asc" },
        { versionNumber: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Decorate with category metadata
    const decoratedFiles = files.map((file) => {
      const meta = getCategoryMeta(file.documentCategory);
      return {
        ...file,
        categoryMeta: meta,
      };
    });

    return NextResponse.json({
      success: true,
      data: decoratedFiles,
      totalCount: decoratedFiles.length,
      activeCount: decoratedFiles.filter((f) => f.isActive).length,
      archivedCount: decoratedFiles.filter((f) => !f.isActive).length,
    });
  } catch (error) {
    console.error("[GET /api/admin/upload-law] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل استرجاع مستندات اللوائح والقوانين",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/upload-law
 * Smart versioning upload endpoint for Omani regulatory documents.
 * 
 * Flow:
 * 1. Validates file and document_category.
 * 2. Step A: Calculates SHA-256 hash. If exact hash exists, aborts with:
 *    "الملف مطابق للنسخة الحالية، لا توجد تعديلات"
 * 3. Step B: Checks for existing document_category files:
 *    - If exists: increments version_number, marks old files is_active = false, new file is_active = true.
 *    - If not: version_number = 1, is_active = true.
 * 4. Step C: Uploads PDF to storage (Supabase or local fallback) and records to database.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawCategory = formData.get("document_category") as string | null;

    // 1. Validation
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "يرجى تحديد ملف PDF لتحميله في قاعدة المعرفة التنظيمية.",
        },
        { status: 400 }
      );
    }

    if (!rawCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "يرجى اختيار تصنيف المستند القانوني (document_category).",
        },
        { status: 400 }
      );
    }

    const documentCategory = rawCategory.trim().toUpperCase();

    // Verify file format
    const fileName = file.name || "law_document.pdf";
    const mimeType = file.type || "application/pdf";
    const isPdf =
      fileName.toLowerCase().endsWith(".pdf") ||
      mimeType === "application/pdf";

    if (!isPdf) {
      return NextResponse.json(
        {
          success: false,
          error: "نوع الملف غير مدعوم. يُشترط رفع ملفات المستندات بصيغة PDF فقط.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "الملف فارغ، يرجى التأكد من رفع ملف صالح.",
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // STEP A: Hash Check (SHA-256 Content Integrity)
    // =========================================================================
    const contentHash = calculateFileHash(buffer);

    // Check if identical hash already exists in database
    const identicalFile = await prisma.knowledgeBaseFile.findFirst({
      where: {
        contentHash,
      },
    });

    if (identicalFile) {
      return NextResponse.json(
        {
          success: false,
          error: "الملف مطابق للنسخة الحالية، لا توجد تعديلات",
          message: "الملف مطابق للنسخة الحالية، لا توجد تعديلات",
          code: "IDENTICAL_FILE_HASH",
          existingFile: {
            id: identicalFile.id,
            fileName: identicalFile.fileName,
            versionNumber: identicalFile.versionNumber,
            documentCategory: identicalFile.documentCategory,
            isActive: identicalFile.isActive,
            createdAt: identicalFile.createdAt,
          },
        },
        { status: 409 }
      );
    }

    // =========================================================================
    // STEP B: Versioning Logic
    // =========================================================================
    // Check if files with the SAME document_category already exist
    const categoryFiles = await prisma.knowledgeBaseFile.findMany({
      where: {
        documentCategory,
      },
      orderBy: {
        versionNumber: "desc",
      },
    });

    let newVersionNumber = 1;
    let oldActiveFileId: string | null = null;
    let oldActiveStoragePath: string | null = null;

    if (categoryFiles.length > 0) {
      // Find current highest version number
      const highestVersion = categoryFiles[0].versionNumber || 1;
      newVersionNumber = highestVersion + 1;

      // Identify currently active file
      const currentActive = categoryFiles.find((f) => f.isActive);
      if (currentActive) {
        oldActiveFileId = currentActive.id;
        oldActiveStoragePath = currentActive.storagePath;
      }

      // Archive previous active files for this category (set is_active = false)
      await prisma.knowledgeBaseFile.updateMany({
        where: {
          documentCategory,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // =========================================================================
    // STEP C: Storage Sync (Supabase Storage with resilient fallback)
    // =========================================================================
    const storageResult = await uploadLawPdf({
      buffer,
      fileName,
      category: documentCategory,
      versionNumber: newVersionNumber,
      mimeType,
    });

    // Record new file metadata in database (is_active = true)
    const categoryMeta = getCategoryMeta(documentCategory);

    const newRecord = await prisma.knowledgeBaseFile.create({
      data: {
        fileName,
        fileSize: buffer.length,
        fileType: mimeType,
        fileUrl: storageResult.fileUrl,
        storagePath: storageResult.storagePath,
        contentHash,
        documentCategory,
        versionNumber: newVersionNumber,
        isActive: true,
        summary: `${categoryMeta.nameAr} - ${categoryMeta.decreeNumber} (الإصدار ${newVersionNumber})`,
      },
    });

    // Optional: If old file storage cleanup is desired, metadata remains safely archived
    // but physical duplicate files can be pruned if explicitly flagged.

    return NextResponse.json({
      success: true,
      message: `تم رفع وتحديث المستند بنجاح كنسخة نشطة (الإصدار ${newVersionNumber})، وتم أرشفة النسخ السابقة تلقائياً.`,
      data: {
        id: newRecord.id,
        fileName: newRecord.fileName,
        documentCategory: newRecord.documentCategory,
        versionNumber: newRecord.versionNumber,
        isActive: newRecord.isActive,
        contentHash: newRecord.contentHash,
        fileUrl: newRecord.fileUrl,
        storageType: storageResult.storageType,
        createdAt: newRecord.createdAt,
        archivedPreviousId: oldActiveFileId,
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/upload-law] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء معالجة وحفظ مستند اللائحة الجديد.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
