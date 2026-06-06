import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { lookupProductByBarcode } from "@/lib/services/inventory";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const code = req.nextUrl.searchParams.get("code") ?? "";
  if (!code.trim()) {
    return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
  }

  try {
    const result = await lookupProductByBarcode(code);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.result);
  } catch {
    return NextResponse.json({ error: "Could not look up barcode" }, { status: 500 });
  }
}
