import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import {
  createInventoryProduct,
  listCategories,
  listInventoryProducts,
} from "@/lib/services/inventory";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [products, categories] = await Promise.all([
      listInventoryProducts(),
      listCategories(),
    ]);
    return NextResponse.json({ products, categories });
  } catch {
    return NextResponse.json({ error: "Could not load inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await createInventoryProduct({
      nameEn: String(body.nameEn ?? ""),
      nameFa: String(body.nameFa ?? ""),
      categoryId: body.categoryId ? String(body.categoryId) : undefined,
      categoryName: body.categoryName ? String(body.categoryName) : undefined,
      price: body.price,
      cost: body.cost,
      unit: String(body.unit ?? ""),
      barcode: body.barcode != null ? String(body.barcode) : null,
      isBakeryItem: !!body.isBakeryItem,
      isActive: body.isActive !== false,
      isOnSale: !!body.isOnSale,
      stockQty: body.stockQty,
      trackInventory: body.trackInventory !== false,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ product: result.product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create product" }, { status: 500 });
  }
}
