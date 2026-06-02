import { compare, hash } from "bcryptjs";

const BCRYPT_PREFIX = "$2";

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  stored: string
): Promise<boolean> {
  if (stored.startsWith(BCRYPT_PREFIX)) {
    return compare(plain, stored);
  }
  return stored === plain;
}
