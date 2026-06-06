import { NextRequest, NextResponse } from "next/server";
import { isAdminRegistrationEnabled } from "@/lib/admin-registration-passcode";
import { resetAdminPassword } from "@/lib/services/admin-users";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    resetEnabled: isAdminRegistrationEnabled(),
  });
}

export async function POST(req: NextRequest) {
  if (!isAdminRegistrationEnabled()) {
    return NextResponse.json(
      {
        error:
          "Password reset is not enabled. Set ADMIN_REGISTRATION_PASSCODE on the server.",
      },
      { status: 503 }
    );
  }

  let body: { username?: string; password?: string; passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim();
  const password = body.password;
  const passcode = body.passcode;

  if (!username || !password || !passcode?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await resetAdminPassword({ username, password, passcode });

  if (!result.ok) {
    const status =
      result.error === "Invalid registration passcode" ||
      result.error === "Registration passcode is required"
        ? 403
        : result.error.startsWith("No active account found") ||
            result.error.startsWith("No admin accounts exist")
          ? 404
          : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ message: "Password updated successfully" });
}
