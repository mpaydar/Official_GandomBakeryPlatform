import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { listBakeryOrders } from "@/lib/services/bakery-orders";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const orders = await listBakeryOrders(status);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json(
      { error: "Could not load orders" },
      { status: 500 }
    );
  }
}
