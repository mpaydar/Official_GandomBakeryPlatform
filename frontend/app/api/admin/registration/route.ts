import { NextRequest, NextResponse } from "next/server";
import { isAdminRegistrationEnabled } from "@/lib/admin-registration-passcode";
import {
  canRegisterMasterAdmin,
  registerAdmin,
  registerMasterAdmin,
} from "@/lib/services/admin-users";

export async function GET() {
  try {
    const masterSetupAllowed = await canRegisterMasterAdmin();
    return NextResponse.json({
      allowed: masterSetupAllowed,
      masterSetupAllowed,
      registrationEnabled: isAdminRegistrationEnabled(),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not check admin setup status" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: {
    first_name?: string;
    last_name?: string;
    user_name?: string;
    username?: string;
    hashpass?: string;
    password?: string;
    passcode?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = body.first_name?.trim();
  const lastName = body.last_name?.trim();
  const username = (body.user_name ?? body.username)?.trim();
  const password = body.hashpass ?? body.password;
  const passcode = body.passcode;

  if (!firstName || !lastName || !username || !password || !passcode?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const masterSetupAllowed = await canRegisterMasterAdmin();
  const result = masterSetupAllowed
    ? await registerMasterAdmin({
        firstName,
        lastName,
        username,
        password,
        passcode,
      })
    : await registerAdmin({
        firstName,
        lastName,
        username,
        password,
        passcode,
      });

  if (!result.ok) {
    const status =
      result.error === "Invalid registration passcode" ||
      result.error === "Registration passcode is required"
        ? 403
        : result.error === "Master admin already exists. Sign in instead."
          ? 403
          : 409;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    message: masterSetupAllowed
      ? "Master admin created successfully"
      : "Admin account created successfully",
  });
}
