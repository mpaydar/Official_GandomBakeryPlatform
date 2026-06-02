import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { updateBakeryOrderStatus } from "@/lib/services/bakery-orders";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  let body: { status?: string; rejectionReason?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const result = await updateBakeryOrderStatus(
    id,
    body.status,
    body.rejectionReason ?? null
  );
  if (!result.ok) {
    const status = result.error === "Order not found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ order: result.order });
}
