import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { deleteShift } from "@/lib/services/employees";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;

  try {
    const result = await deleteShift(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete shift" }, { status: 500 });
  }
}
