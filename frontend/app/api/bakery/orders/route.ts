import { NextRequest, NextResponse } from "next/server";
import {
  createBakeryOrder,
  createBakeryOrdersBatch,
  parseCheckoutPaymentMethod,
} from "@/lib/services/bakery-orders";

export async function POST(req: NextRequest) {
  let body: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    quantity?: number | string;
    itemType?: string;
    itemName?: string;
    unitPrice?: number;
    paymentMethod?: string;
    pickupAt?: string;
    notes?: string;
    items?: Array<{
      quantity?: number | string;
      itemType?: string;
      itemName?: string;
      unitPrice?: number;
    }>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const paymentMethod = parseCheckoutPaymentMethod(body.paymentMethod);
  if (!paymentMethod) {
    return NextResponse.json(
      { error: "Choose pay at store or pay with card." },
      { status: 400 }
    );
  }

  const { firstName, lastName, phone, quantity, itemType, pickupAt, notes } = body;

  if (Array.isArray(body.items)) {
    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const result = await createBakeryOrdersBatch({
      firstName,
      lastName,
      phone,
      paymentMethod,
      items: body.items.map((item) => ({
        quantity: Number(item.quantity),
        itemType: item.itemType ?? "sangak",
        itemName: item.itemName,
        unitPrice: item.unitPrice,
      })),
      pickupAt: pickupAt ?? null,
      notes: notes || null,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        orderIds: result.orderIds,
        confirmationNumber: result.confirmationNumber,
        paymentMethod: result.paymentMethod,
      },
      { status: 201 }
    );
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
    itemName: body.itemName,
    unitPrice: body.unitPrice,
    paymentMethod,
    pickupAt: pickupAt ?? null,
    notes: notes || null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    {
      orderId: result.orderId,
      confirmationNumber: result.confirmationNumber,
      paymentMethod: result.paymentMethod,
    },
    { status: 201 }
  );
}
