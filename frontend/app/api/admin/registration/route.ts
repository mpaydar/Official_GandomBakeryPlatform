import { NextRequest, NextResponse } from "next/server";
import {
  canRegisterMasterAdmin,
  registerMasterAdmin,
} from "@/lib/services/admin-users";

export async function GET() {
  try {
    const allowed = await canRegisterMasterAdmin();
    return NextResponse.json({ allowed });
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

  if (!firstName || !lastName || !username || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await registerMasterAdmin({
    firstName,
    lastName,
    username,
    password,
  });
  if (!result.ok) {
    const status =
      result.error === "Master admin already exists. Sign in instead." ? 403 : 409;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ message: "Master admin created successfully" });
}
