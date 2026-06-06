import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { receiveStockByBarcode } from "@/lib/services/inventory";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { barcode?: string; quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.barcode?.trim()) {
    return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
  }

  try {
    const result = await receiveStockByBarcode(body.barcode, body.quantity ?? 1);
    if (!result.ok) {
      const status = result.error === "Product not found" ? 404 : 400;
      return NextResponse.json(
        { error: result.error, barcode: "barcode" in result ? result.barcode : undefined },
        { status }
      );
    }
    return NextResponse.json({
      product: result.product,
      received: result.received,
      barcode: result.barcode,
    });
  } catch {
    return NextResponse.json({ error: "Could not receive stock" }, { status: 500 });
  }
}
