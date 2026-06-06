import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import {
  adjustProductStock,
  updateInventoryProduct,
} from "@/lib/services/inventory";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.stockDelta != null) {
      const adjust = await adjustProductStock(id, body.stockDelta);
      if (!adjust.ok) {
        return NextResponse.json({ error: adjust.error }, { status: 400 });
      }
      return NextResponse.json({ product: adjust.product });
    }

    const result = await updateInventoryProduct(id, {
      nameEn: body.nameEn != null ? String(body.nameEn) : undefined,
      nameFa: body.nameFa != null ? String(body.nameFa) : undefined,
      categoryId: body.categoryId != null ? String(body.categoryId) : undefined,
      price: body.price,
      cost: body.cost,
      unit: body.unit != null ? String(body.unit) : undefined,
      barcode: body.barcode != null ? String(body.barcode) : body.barcode === null ? null : undefined,
      isBakeryItem:
        body.isBakeryItem !== undefined ? !!body.isBakeryItem : undefined,
      isActive: body.isActive !== undefined ? !!body.isActive : undefined,
      isOnSale: body.isOnSale !== undefined ? !!body.isOnSale : undefined,
      stockQty: body.stockQty,
      trackInventory:
        body.trackInventory !== undefined ? !!body.trackInventory : undefined,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ product: result.product });
  } catch {
    return NextResponse.json({ error: "Could not update product" }, { status: 500 });
  }
}
