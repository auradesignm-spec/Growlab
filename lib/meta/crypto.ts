import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function keyBytes(): Buffer {
  const raw = process.env.META_TOKEN_ENCRYPTION_KEY?.trim();
  if (!raw || raw.length < 16) {
    throw new Error("META_TOKEN_ENCRYPTION_KEY is missing or too short (min 16 chars).");
  }
  return crypto.createHash("sha256").update(raw).digest();
}

/** Encrypt a WhatsApp access token for DB storage. Returns base64(iv|tag|ciphertext). */
export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSecret(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  if (buf.length < IV_LEN + 16) throw new Error("Invalid encrypted payload");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + 16);
  const data = buf.subarray(IV_LEN + 16);
  const decipher = crypto.createDecipheriv(ALGO, keyBytes(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
