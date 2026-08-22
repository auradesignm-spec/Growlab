import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import type { KycDocumentKind } from "@/lib/domain/enums";

const KYC_ROOT = path.join(process.cwd(), "storage", "kyc");
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export class KycStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KycStorageError";
  }
}

function extFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function saveKycFile(input: {
  userId: string;
  kind: KycDocumentKind;
  bytes: Buffer;
  mimeType: string;
  originalName: string;
}): Promise<{ storagePath: string; sizeBytes: number; mimeType: string }> {
  if (!ALLOWED_MIME.has(input.mimeType)) {
    throw new KycStorageError("Only JPEG, PNG, or WebP images are accepted.");
  }
  if (input.bytes.length === 0 || input.bytes.length > MAX_BYTES) {
    throw new KycStorageError("Each photo must be under 8 MB.");
  }

  const dir = path.join(KYC_ROOT, input.userId);
  await mkdir(dir, { recursive: true });
  const filename = `${input.kind}-${Date.now()}-${randomBytes(4).toString("hex")}.${extFor(input.mimeType)}`;
  const storagePath = path.join(input.userId, filename);
  await writeFile(path.join(KYC_ROOT, storagePath), input.bytes);
  return { storagePath, sizeBytes: input.bytes.length, mimeType: input.mimeType };
}

export async function readKycFile(storagePath: string): Promise<Buffer> {
  const resolved = path.resolve(KYC_ROOT, storagePath);
  if (!resolved.startsWith(path.resolve(KYC_ROOT))) {
    throw new KycStorageError("Invalid document path.");
  }
  return readFile(resolved);
}

export async function removeKycFile(storagePath: string): Promise<void> {
  const resolved = path.resolve(KYC_ROOT, storagePath);
  if (!resolved.startsWith(path.resolve(KYC_ROOT))) return;
  try {
    await unlink(resolved);
  } catch {
    // Missing file is fine — the DB row is the source of truth for "no document".
  }
}

export async function fileFromForm(file: File | null): Promise<{ bytes: Buffer; mimeType: string; originalName: string } | null> {
  if (!file || file.size === 0) return null;
  const bytes = Buffer.from(await file.arrayBuffer());
  return { bytes, mimeType: file.type || "image/jpeg", originalName: file.name || "capture.jpg" };
}
