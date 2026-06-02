import { createHash, timingSafeEqual } from "crypto";
import { unstable_noStore as noStore } from "next/cache";

/** Normalize copy/paste and .env formatting differences. */
export function normalizePasscode(raw: string): string {
  let value = raw.replace(/^\uFEFF/, "").trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.normalize("NFC");
}

/** Read at request time — not inlined at build with a stale value. */
function readEnvPasscode(): string | null {
  noStore();
  const raw = process.env["ADMIN_REGISTRATION_PASSCODE"];
  if (raw == null || raw === "") return null;
  const normalized = normalizePasscode(raw);
  return normalized.length > 0 ? normalized : null;
}

function hashPasscode(passcode: string): Buffer {
  return createHash("sha256").update(passcode, "utf8").digest();
}

function passcodesMatch(submitted: string, expected: string): boolean {
  const a = hashPasscode(normalizePasscode(submitted));
  const b = hashPasscode(normalizePasscode(expected));
  return timingSafeEqual(a, b);
}

/** True when the server has a registration passcode configured. */
export function isAdminRegistrationEnabled(): boolean {
  return readEnvPasscode() !== null;
}

export function verifyAdminRegistrationPasscode(
  submitted: string | undefined | null
): { ok: true } | { ok: false; error: string } {
  noStore();
  const expected = readEnvPasscode();
  if (!expected) {
    return {
      ok: false,
      error:
        "Admin registration is not enabled. Set ADMIN_REGISTRATION_PASSCODE on the server.",
    };
  }

  const passcode = submitted ?? "";
  if (!normalizePasscode(passcode)) {
    return { ok: false, error: "Registration passcode is required" };
  }

  if (!passcodesMatch(passcode, expected)) {
    return { ok: false, error: "Invalid registration passcode" };
  }

  return { ok: true };
}
