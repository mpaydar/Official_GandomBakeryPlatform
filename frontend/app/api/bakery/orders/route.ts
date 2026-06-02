import { NextRequest, NextResponse } from "next/server";
import { createBakeryOrder, createBakeryOrdersBatch } from "@/lib/services/bakery-orders";

export async function POST(req: NextRequest) {
  let body: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    quantity?: number | string;
    itemType?: string;
    pickupAt?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const { firstName, lastName, phone, quantity, itemType, pickupAt, notes } = body;

  if (Array.isArray((body as { items?: unknown[] }).items)) {
    const items = (body as { items: Array<{ quantity?: number | string; itemType?: string }> }).items;
    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const result = await createBakeryOrdersBatch({
      firstName,
      lastName,
      phone,
      items: items.map((item) => ({
        quantity: Number(item.quantity),
        itemType: item.itemType ?? "sangak",
      })),
      pickupAt: pickupAt ?? null,
      notes: notes || null,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ orderIds: result.orderIds }, { status: 201 });
  }

  if (!firstName || !lastName || !phone || quantity === undefined) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const result = await createBakeryOrder({
    firstName,
    lastName,
    phone,
    quantity: Number(quantity),
    itemType: itemType ?? "sangak",
    pickupAt: pickupAt ?? null,
    notes: notes || null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ orderId: result.orderId }, { status: 201 });
}
