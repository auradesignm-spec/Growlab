import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const MEDIA_ROOT = path.join(process.cwd(), "storage", "product-media");
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export class ProductMediaStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductMediaStorageError";
  }
}

function extFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/heic" || mime === "image/heif") return "heic";
  if (mime === "video/webm") return "webm";
  if (mime === "video/quicktime") return "mov";
  if (mime === "video/mp4") return "mp4";
  return "jpg";
}

export function mediaKindFromMime(mime: string): "image" | "video" | null {
  if (IMAGE_MIME.has(mime)) return "image";
  if (VIDEO_MIME.has(mime)) return "video";
  return null;
}

export async function saveProductMediaFile(input: {
  merchantId: string;
  bytes: Buffer;
  mimeType: string;
}): Promise<{ storagePath: string; publicUrl: string; kind: "image" | "video"; mimeType: string }> {
  const kind = mediaKindFromMime(input.mimeType);
  if (!kind) {
    throw new ProductMediaStorageError("Only JPEG, PNG, WebP images or MP4/WebM/MOV videos are accepted.");
  }
  const max = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (input.bytes.length === 0 || input.bytes.length > max) {
    throw new ProductMediaStorageError(
      kind === "image" ? "Each image must be under 8 MB." : "Each video must be under 40 MB."
    );
  }

  const dir = path.join(MEDIA_ROOT, input.merchantId);
  await mkdir(dir, { recursive: true });
  const filename = `${kind}-${Date.now()}-${randomBytes(4).toString("hex")}.${extFor(input.mimeType)}`;
  const storagePath = path.join(input.merchantId, filename);
  await writeFile(path.join(MEDIA_ROOT, storagePath), input.bytes);

  return {
    storagePath,
    publicUrl: `/api/product-media/${storagePath.replace(/\\/g, "/")}`,
    kind,
    mimeType: input.mimeType,
  };
}

export async function readProductMediaFile(storagePath: string): Promise<Buffer> {
  const resolved = path.resolve(MEDIA_ROOT, storagePath);
  if (!resolved.startsWith(path.resolve(MEDIA_ROOT))) {
    throw new ProductMediaStorageError("Invalid media path.");
  }
  return readFile(resolved);
}

export async function removeProductMediaFile(storagePath: string): Promise<void> {
  const resolved = path.resolve(MEDIA_ROOT, storagePath);
  if (!resolved.startsWith(path.resolve(MEDIA_ROOT))) return;
  try {
    await unlink(resolved);
  } catch {
    // Missing file is fine.
  }
}

export function storagePathFromPublicUrl(url: string): string | null {
  const prefix = "/api/product-media/";
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}
