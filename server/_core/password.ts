import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// Parámetros scrypt. keylen=64 produce un hash de 128 chars hex.
const KEYLEN = 64;
const SALT_BYTES = 16;

/**
 * Genera un hash de la contraseña usando scrypt (nativo de Node, sin deps).
 * Formato almacenado: "scrypt:<saltHex>:<hashHex>".
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

/**
 * Verifica una contraseña contra un hash almacenado. Comparación en tiempo
 * constante para evitar timing attacks. Devuelve false si el formato es inválido.
 */
export async function verifyPassword(
  plain: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const [, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEYLEN) return false;

  const derived = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
  return timingSafeEqual(derived, expected);
}
