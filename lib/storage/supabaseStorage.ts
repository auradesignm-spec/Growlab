/**
 * @file supabaseStorage.ts
 * @description Storage service for regulatory PDF files supporting both Supabase Storage
 * and local fallback storage for environments without active Supabase credentials.
 */

import { createHash } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const KNOWLEDGE_BASE_BUCKET = "knowledge-base-laws";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false },
      });
      return supabaseClient;
    } catch (err) {
      console.warn("[Supabase Storage] Initialization failed:", err);
      return null;
    }
  }

  return null;
}

/**
 * Calculates cryptographic SHA-256 hash of a file buffer.
 * Used to detect whether a newly uploaded PDF has actual content changes.
 */
export function calculateFileHash(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export interface UploadStorageResult {
  fileUrl: string;
  storagePath: string;
  storageType: "supabase" | "local";
}

/**
 * Uploads a regulatory document PDF to Supabase Storage bucket.
 * Falls back cleanly to local filesystem storage if Supabase credentials are not configured.
 */
export async function uploadLawPdf(params: {
  buffer: Buffer;
  fileName: string;
  category: string;
  versionNumber: number;
  mimeType?: string;
}): Promise<UploadStorageResult> {
  const { buffer, fileName, category, versionNumber } = params;
  const mimeType = params.mimeType || "application/pdf";
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._\-]/g, "_");
  const storagePath = `${category}/v${versionNumber}_${Date.now()}_${sanitizedFileName}`;

  const client = getSupabaseClient();

  // 1. Try Supabase Storage if configured
  if (client) {
    try {
      // Ensure bucket exists or attempt upload directly
      const { data, error } = await client.storage
        .from(KNOWLEDGE_BASE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        // Retrieve public URL
        const { data: urlData } = client.storage
          .from(KNOWLEDGE_BASE_BUCKET)
          .getPublicUrl(storagePath);

        return {
          fileUrl: urlData.publicUrl,
          storagePath,
          storageType: "supabase",
        };
      }
      console.warn("[Supabase Storage] Upload error, falling back to local:", error?.message);
    } catch (err) {
      console.warn("[Supabase Storage] Exception during upload:", err);
    }
  }

  // 2. Resilient Local Storage Fallback
  const publicDir = path.join(process.cwd(), "public", "uploads", "laws", category);
  await mkdir(publicDir, { recursive: true });

  const diskFileName = `v${versionNumber}_${Date.now()}_${sanitizedFileName}`;
  const diskPath = path.join(publicDir, diskFileName);
  await writeFile(diskPath, buffer);

  const localUrl = `/uploads/laws/${category}/${diskFileName}`;

  return {
    fileUrl: localUrl,
    storagePath: diskPath,
    storageType: "local",
  };
}

/**
 * Optional: Delete previous physical file from storage bucket to save space.
 */
export async function deleteLawPdfFromStorage(storagePath: string): Promise<boolean> {
  if (!storagePath) return false;

  const client = getSupabaseClient();
  if (client && !storagePath.startsWith("/")) {
    try {
      const { error } = await client.storage
        .from(KNOWLEDGE_BASE_BUCKET)
        .remove([storagePath]);
      return !error;
    } catch (err) {
      console.warn("[Supabase Storage] Failed to delete file:", err);
    }
  }

  // If local file
  try {
    if (storagePath.includes("uploads/laws")) {
      await unlink(storagePath).catch(() => {});
      return true;
    }
  } catch {
    // Ignore cleanup error
  }

  return false;
}
