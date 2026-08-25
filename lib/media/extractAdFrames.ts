export type AdFramePayload = {
  mime: "image/jpeg";
  dataBase64: string;
};

const MAX_EDGE = 720;
const JPEG_QUALITY = 0.72;
const MAX_FRAMES = 3;

function canvasToJpeg(canvas: HTMLCanvasElement): AdFramePayload {
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const dataBase64 = dataUrl.split(",")[1] ?? "";
  return { mime: "image/jpeg", dataBase64 };
}

function drawToCanvas(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

async function frameFromImageFile(file: File): Promise<AdFramePayload> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read image."));
      el.src = url;
    });
    return canvasToJpeg(drawToCanvas(img, img.naturalWidth, img.naturalHeight));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener(
      "error",
      () => reject(new Error("Could not read video.")),
      { once: true },
    );
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.05));
  });
}

async function framesFromVideoFile(file: File): Promise<AdFramePayload[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Could not read video."));
    });
    const duration = Number.isFinite(video.duration) ? video.duration : 1;
    const times = [0, Math.min(1, duration * 0.35), Math.min(3, duration * 0.6)]
      .map((t) => Math.min(t, Math.max(0, duration - 0.08)))
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, MAX_FRAMES);

    const out: AdFramePayload[] = [];
    for (const time of times) {
      await seek(video, time);
      out.push(canvasToJpeg(drawToCanvas(video, video.videoWidth || 720, video.videoHeight || 1280)));
    }
    return out;
  } finally {
    video.src = "";
    URL.revokeObjectURL(url);
  }
}

/** Compress an image, or pull up to 3 JPEG frames from a short video. */
export async function extractAdFrames(file: File): Promise<AdFramePayload[]> {
  if (file.type.startsWith("image/")) return [await frameFromImageFile(file)];
  if (file.type.startsWith("video/")) return framesFromVideoFile(file);
  throw new Error("Use a photo or a video.");
}
