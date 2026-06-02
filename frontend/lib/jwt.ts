import { SignJWT, jwtVerify } from "jose";

export type AdminTokenPayload = {
  user: string;
  role: string;
};

function secretKey() {
  const secret = process.env.JWT_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not configured");
  }
  return new TextEncoder().encode(secret);
}

function expireSeconds() {
  const minutes = Number(process.env.JWT_EXPIRE_MINUTES ?? "10080");
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : 7 * 24 * 60 * 60;
}

export async function createAdminAccessToken(username: string): Promise<string> {
  const algorithm = process.env.JWT_ALGORITHM?.trim() || "HS256";
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ user: username, role: "admin" })
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt(now)
    .setExpirationTime(now + expireSeconds())
    .sign(secretKey());
}

export async function verifyAdminAccessToken(
  token: string | undefined | null
): Promise<AdminTokenPayload | null> {
  if (!token) return null;
  try {
    const algorithm = process.env.JWT_ALGORITHM?.trim() || "HS256";
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: [algorithm],
    });
    if (payload.role !== "admin" || typeof payload.user !== "string") {
      return null;
    }
    return { user: payload.user, role: payload.role };
  } catch {
    return null;
  }
}
