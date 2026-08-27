import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import { randomBytes } from "crypto";
import type { KycDocumentKind } from "@/lib/domain/enums";

function getKycRoot(): string {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "storage", "kyc");
  }
  return path.join(process.cwd(), "storage", "kyc");
}

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export class KycStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KycStorageError";
  }
}

function extFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "application/pdf") return "pdf";
  return "jpg";
}

export async function saveKycFile(input: {
  userId: string;
  kind: KycDocumentKind;
  bytes: Buffer;
  mimeType: string;
  originalName: string;
}): Promise<{ storagePath: string; sizeBytes: number; mimeType: string }> {
  const normMime = input.mimeType.toLowerCase();
  if (!ALLOWED_MIME.has(normMime)) {
    throw new KycStorageError("Only JPEG, PNG, WebP images or PDF documents are accepted.");
  }
  if (input.bytes.length === 0 || input.bytes.length > MAX_BYTES) {
    throw new KycStorageError("Each document/photo must be under 12 MB.");
  }

  const kycRoot = getKycRoot();
  const dir = path.join(kycRoot, input.userId);
  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // fallback if dir creation has issue
    const tmpDir = path.join(os.tmpdir(), "storage", "kyc", input.userId);
    await mkdir(tmpDir, { recursive: true });
  }

  const filename = `${input.kind}-${Date.now()}-${randomBytes(4).toString("hex")}.${extFor(normMime)}`;
  const storagePath = path.join(input.userId, filename);
  try {
    await writeFile(path.join(kycRoot, storagePath), input.bytes);
  } catch {
    const tmpRoot = path.join(os.tmpdir(), "storage", "kyc");
    await mkdir(path.join(tmpRoot, input.userId), { recursive: true });
    await writeFile(path.join(tmpRoot, storagePath), input.bytes);
  }

  return { storagePath, sizeBytes: input.bytes.length, mimeType: normMime };
}

export async function readKycFile(storagePath: string): Promise<Buffer> {
  const primaryRoot = getKycRoot();
  const resolved = path.resolve(primaryRoot, storagePath);
  try {
    return await readFile(resolved);
  } catch {
    const tmpResolved = path.resolve(path.join(os.tmpdir(), "storage", "kyc"), storagePath);
    return readFile(tmpResolved);
  }
}

export async function removeKycFile(storagePath: string): Promise<void> {
  const primaryRoot = getKycRoot();
  const resolved = path.resolve(primaryRoot, storagePath);
  try {
    await unlink(resolved);
  } catch {
    // ignore
  }
}

export async function fileFromForm(
  fileOrBase64: File | string | null
): Promise<{ bytes: Buffer; mimeType: string; originalName: string } | null> {
  if (!fileOrBase64) return null;

  if (typeof fileOrBase64 === "string") {
    if (!fileOrBase64.trim()) return null;
    const match = fileOrBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      return { bytes: buffer, mimeType, originalName: `capture_${Date.now()}.${extFor(mimeType)}` };
    }
    return null;
  }

  if (fileOrBase64.size === 0) return null;
  const bytes = Buffer.from(await fileOrBase64.arrayBuffer());
  return {
    bytes,
    mimeType: fileOrBase64.type || "image/jpeg",
    originalName: fileOrBase64.name || "capture.jpg",
  };
}
