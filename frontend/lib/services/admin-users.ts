import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createAdminAccessToken } from "@/lib/jwt";

export async function registerAdmin(input: {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}) {
  const existing = await prisma.adminUser.findUnique({
    where: { username: input.username },
  });
  if (existing) {
    return { ok: false as const, error: "Username already taken" };
  }

  const passwordHash = await hashPassword(input.password);
  await prisma.adminUser.create({
    data: {
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash,
    },
  });
  return { ok: true as const };
}

export async function loginAdmin(username: string, password: string) {
  const admin = await prisma.adminUser.findFirst({
    where: { username, isActive: true },
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
