import { NextRequest, NextResponse } from "next/server";
import { lookupReceiptByConfirmationCode } from "@/lib/services/receipts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { confirmationNumber?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await lookupReceiptByConfirmationCode(body.confirmationNumber ?? "");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ receipt: result.receipt });
}
