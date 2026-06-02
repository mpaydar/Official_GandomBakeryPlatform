import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import {
  getBakeryCapacity,
  setBakeryCapacity,
} from "@/lib/services/bakery-capacity";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const capacity = await getBakeryCapacity();
    return NextResponse.json(capacity);
  } catch {
    return NextResponse.json(
      { error: "Could not load capacity" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { maxLoaves?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const maxLoaves = Number(body.maxLoaves);
  if (!Number.isFinite(maxLoaves) || maxLoaves < 0 || maxLoaves > 100_000) {
    return NextResponse.json({ error: "Invalid maxLoaves" }, { status: 400 });
  }

  try {
    const capacity = await setBakeryCapacity(Math.trunc(maxLoaves));
    return NextResponse.json(capacity);
  } catch {
    return NextResponse.json(
      { error: "Could not save capacity" },
      { status: 500 }
    );
  }
}
