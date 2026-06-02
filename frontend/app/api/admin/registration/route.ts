import { NextRequest, NextResponse } from "next/server";
import { registerAdmin } from "@/lib/services/admin-users";

export async function POST(req: NextRequest) {
  let body: {
    first_name?: string;
    last_name?: string;
    user_name?: string;
    hashpass?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = body.first_name?.trim();
  const lastName = body.last_name?.trim();
  const username = body.user_name?.trim();
  const password = body.hashpass;

  if (!firstName || !lastName || !username || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await registerAdmin({
    firstName,
    lastName,
    username,
    password,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ message: "Admin registered successfully" });
}
