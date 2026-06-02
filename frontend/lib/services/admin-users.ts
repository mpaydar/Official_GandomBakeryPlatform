import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createAdminAccessToken } from "@/lib/jwt";

export async function hasMasterAdmin(): Promise<boolean> {
  const count = await prisma.adminUser.count();
  return count > 0;
}

export async function canRegisterMasterAdmin(): Promise<boolean> {
  return !(await hasMasterAdmin());
}

/** One-time master admin setup only — fails if any admin already exists. */
export async function registerMasterAdmin(input: {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}) {
  if (await hasMasterAdmin()) {
    return {
      ok: false as const,
      error: "Master admin already exists. Sign in instead.",
    };
  }

  const username = input.username.trim().toLowerCase();
  if (username.length < 3) {
    return { ok: false as const, error: "Username must be at least 3 characters" };
  }
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return {
      ok: false as const,
      error: "Username may only use letters, numbers, dots, hyphens, and underscores",
    };
  }

  const existing = await prisma.adminUser.findUnique({
    where: { username },
  });
  if (existing) {
    return { ok: false as const, error: "Username already taken" };
  }

  const passwordHash = await hashPassword(input.password);
  await prisma.adminUser.create({
    data: {
      username,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      passwordHash,
    },
  });
  return { ok: true as const };
}

export async function loginAdmin(username: string, password: string) {
  const normalized = username.trim().toLowerCase();
  const admin = await prisma.adminUser.findFirst({
    where: { username: normalized, isActive: true },
  });
  if (!admin) {
    return { ok: false as const, error: "Invalid credentials" };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return { ok: false as const, error: "Invalid credentials" };
  }

  const accessToken = await createAdminAccessToken(admin.username);
  return { ok: true as const, accessToken };
}
