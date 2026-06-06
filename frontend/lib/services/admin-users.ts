import { verifyAdminRegistrationPasscode } from "@/lib/admin-registration-passcode";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createAdminAccessToken } from "@/lib/jwt";

function compactLoginId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

function legacyUsernameFromName(firstName: string, lastName: string): string {
  return `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

/** Resolve admin by username, case-insensitive match, or first+last legacy login. */
async function findActiveAdminByLoginIdentifier(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  const compact = compactLoginId(identifier);

  const exact = await prisma.adminUser.findFirst({
    where: { username: normalized, isActive: true },
  });
  if (exact) return exact;

  const insensitive = await prisma.adminUser.findFirst({
    where: {
      username: { equals: normalized, mode: "insensitive" },
      isActive: true,
    },
  });
  if (insensitive) return insensitive;

  const activeAdmins = await prisma.adminUser.findMany({
    where: { isActive: true },
  });

  return (
    activeAdmins.find((admin) => {
      const legacy = legacyUsernameFromName(admin.firstName, admin.lastName);
      return (
        admin.username.toLowerCase() === compact ||
        legacy === compact ||
        legacy === normalized
      );
    }) ?? null
  );
}

async function adminLookupError(identifier: string) {
  const activeCount = await prisma.adminUser.count({ where: { isActive: true } });
  if (activeCount === 0) {
    return "No admin accounts exist on this server yet. Create one at /admin/setup first.";
  }

  const hint = compactLoginId(identifier);
  return `No active account found for "${hint}". Check spelling, or try first+last with no space (e.g. johnsmith).`;
}

export async function hasMasterAdmin(): Promise<boolean> {
  const count = await prisma.adminUser.count();
  return count > 0;
}

export async function canRegisterMasterAdmin(): Promise<boolean> {
  return !(await hasMasterAdmin());
}

/** Create an admin account when the registration passcode is valid. */
export async function registerAdmin(input: {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  passcode: string;
}) {
  const passcodeCheck = verifyAdminRegistrationPasscode(input.passcode);
  if (!passcodeCheck.ok) {
    return { ok: false as const, error: passcodeCheck.error };
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

/** First admin only — requires passcode; fails if any admin already exists. */
export async function registerMasterAdmin(
  input: Parameters<typeof registerAdmin>[0]
) {
  if (await hasMasterAdmin()) {
    return {
      ok: false as const,
      error: "Master admin already exists. Sign in instead.",
    };
  }
  return registerAdmin(input);
}

export async function loginAdmin(username: string, password: string) {
  const admin = await findActiveAdminByLoginIdentifier(username);
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

/** Reset password when the admin reset passcode is valid. */
export async function resetAdminPassword(input: {
  username: string;
  password: string;
  passcode: string;
}) {
  const passcodeCheck = verifyAdminRegistrationPasscode(input.passcode);
  if (!passcodeCheck.ok) {
    return { ok: false as const, error: passcodeCheck.error };
  }

  if (input.password.length < 8) {
    return {
      ok: false as const,
      error: "Password must be at least 8 characters",
    };
  }

  const admin = await findActiveAdminByLoginIdentifier(input.username);
  if (!admin) {
    return {
      ok: false as const,
      error: await adminLookupError(input.username),
    };
  }

  const passwordHash = await hashPassword(input.password);
  const normalizedUsername = admin.username.trim().toLowerCase();
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash,
      ...(admin.username !== normalizedUsername
        ? { username: normalizedUsername }
        : {}),
    },
  });

  return { ok: true as const };
}
