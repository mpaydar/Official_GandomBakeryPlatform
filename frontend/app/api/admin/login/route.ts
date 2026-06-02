import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin-auth";
import { loginAdmin } from "@/lib/services/admin-users";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim();
  const password = body.password;
  if (!username || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  try {
    const result = await loginAdmin(username, password);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }
}
