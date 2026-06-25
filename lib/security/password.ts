import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const SALT_BYTES = 16;
const KEY_LENGTH = 64;
const STORED_SEPARATOR = ":";

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = await scrypt(plain, salt, KEY_LENGTH);
  return `${salt}${STORED_SEPARATOR}${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  const [salt, keyHex] = stored.split(STORED_SEPARATOR);
  if (!salt || !keyHex) {
    return false;
  }
  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = await scrypt(plain, salt, KEY_LENGTH);
  if (storedKey.length !== derivedKey.length) {
    return false;
  }
  return timingSafeEqual(storedKey, derivedKey);
}
