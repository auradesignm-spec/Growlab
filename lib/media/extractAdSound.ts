export type AdSoundPayload = {
  mime: "audio/wav";
  dataBase64: string;
};

const MAX_SEC = 20;
const TARGET_RATE = 16000;

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    bin += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(bin);
}

function audioBufferToWav(buffer: AudioBuffer): AdSoundPayload {
  const srcRate = buffer.sampleRate;
  const maxSrc = Math.min(buffer.length, Math.floor(MAX_SEC * srcRate));
  const ratio = srcRate / TARGET_RATE;
  const outLen = Math.max(1, Math.floor(maxSrc / ratio));
  const left = buffer.getChannelData(0);
  const pcm = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const s = left[Math.min(maxSrc - 1, Math.floor(i * ratio))] ?? 0;
    const c = Math.max(-1, Math.min(1, s));
    pcm[i] = c < 0 ? c * 0x8000 : c * 0x7fff;
  }

  const pcmBytes = new Uint8Array(pcm.buffer);
  const bytes = pcmBytes.byteLength;
  const wav = new Uint8Array(44 + bytes);
  const view = new DataView(wav.buffer);
  const ascii = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };
  ascii(0, "RIFF");
  view.setUint32(4, 36 + bytes, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_RATE, true);
  view.setUint32(28, TARGET_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, bytes, true);
  wav.set(pcmBytes, 44);
  return { mime: "audio/wav", dataBase64: toBase64(wav) };
}

/** First ~20s of video/audio as 16 kHz mono WAV — engine noise, music, speech, SFX. */
export async function extractAdSound(file: File): Promise<AdSoundPayload | null> {
  if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) return null;
  try {
    const ctx = new AudioContext();
    const decoded = await ctx.decodeAudioData(await file.arrayBuffer());
    await ctx.close();
    return audioBufferToWav(decoded);
  } catch {
    return null;
  }
}
