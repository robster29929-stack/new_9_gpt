/** Node-only crypto module. Never import into client components. */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function validateKey(key: Uint8Array): void {
  if (key.byteLength !== 32) throw new Error("กุญแจเข้ารหัสต้องมีขนาด 256 บิต");
}

/** Key is injected by a server key-provider; never stored in DB settings or source. */
export function encryptIdentifier(plaintext: string, key: Uint8Array): string {
  validateKey(key);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptIdentifier(envelope: string, key: Uint8Array): string {
  validateKey(key);
  const [version, iv, tag, body, extra] = envelope.split(".");
  if (version !== "v1" || !iv || !tag || !body || extra !== undefined)
    throw new Error("ข้อมูลเข้ารหัสไม่ถูกต้อง");
  const ivBytes = Buffer.from(iv, "base64url"),
    tagBytes = Buffer.from(tag, "base64url");
  if (ivBytes.length !== 12 || tagBytes.length !== 16)
    throw new Error("ข้อมูลเข้ารหัสไม่ถูกต้อง");
  const decipher = createDecipheriv("aes-256-gcm", key, ivBytes);
  decipher.setAuthTag(tagBytes);
  return Buffer.concat([
    decipher.update(Buffer.from(body, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** Formatting only; this does not validate or authorize access to an identifier. */
export function maskIdentifier(value: string): string {
  const suffix = value.slice(-4);
  return value.length > 4
    ? "*".repeat(value.length - 4) + suffix
    : "*".repeat(value.length);
}

/** Read permission is distinct from reveal permission. Never pass flags from a form. */
export function presentIdentifier(
  envelope: string,
  key: Uint8Array,
  serverPermission: { readonly canRead: boolean; readonly canReveal: boolean },
): string {
  if (!serverPermission.canRead) throw new Error("ไม่มีสิทธิ์อ่านข้อมูลนี้");
  const value = decryptIdentifier(envelope, key);
  return serverPermission.canReveal ? value : maskIdentifier(value);
}
