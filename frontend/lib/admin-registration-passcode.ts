import { timingSafeEqual } from "crypto";

function getExpectedPasscode(): string | null {
  const value = process.env.ADMIN_REGISTRATION_PASSCODE?.trim();
  return value && value.length > 0 ? value : null;
}

/** True when the server has a registration passcode configured. */
export function isAdminRegistrationEnabled(): boolean {
  return getExpectedPasscode() !== null;
}

export function verifyAdminRegistrationPasscode(
  submitted: string | undefined | null
): { ok: true } | { ok: false; error: string } {
  const expected = getExpectedPasscode();
  if (!expected) {
    return {
      ok: false,
      error:
        "Admin registration is not enabled. Set ADMIN_REGISTRATION_PASSCODE on the server.",
    };
  }

  const passcode = submitted?.trim() ?? "";
  if (!passcode) {
    return { ok: false, error: "Registration passcode is required" };
  }

  const submittedBuf = Buffer.from(passcode);
  const expectedBuf = Buffer.from(expected);
  if (
    submittedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(submittedBuf, expectedBuf)
  ) {
    return { ok: false, error: "Invalid registration passcode" };
  }

  return { ok: true };
}
