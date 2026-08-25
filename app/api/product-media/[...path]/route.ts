import { NextResponse } from "next/server";
import { readProductMediaFile, mediaKindFromMime } from "@/lib/product-media/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function mimeFromExt(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic" || ext === "heif") return "image/heic";
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  if (ext === "mp4") return "video/mp4";
  return "image/jpeg";
}

export async function GET(_request: Request, { params }: { params: { path: string[] } }) {
  const parts = params.path ?? [];
  if (parts.length < 2 || parts.some((p) => p.includes("..") || p.includes("/") || p.includes("\\"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const storagePath = parts.join("/");
  const mime = mimeFromExt(parts[parts.length - 1] ?? "");
  if (!mediaKindFromMime(mime) && !mime.startsWith("image/") && !mime.startsWith("video/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const bytes = await readProductMediaFile(storagePath);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Missing file", { status: 404 });
  }
}
