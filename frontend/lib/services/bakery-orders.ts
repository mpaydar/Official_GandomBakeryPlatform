import {
  BakeryOrderStatus,
  OrderChannel,
  PaymentMethod,
  Prisma,
} from "../../generated/prisma/client";
import { generateConfirmationNumber } from "@/lib/confirmation-number";
import { prisma } from "@/lib/prisma";
import { createCheckoutReceipt, markReceiptPaidAtPickup } from "@/lib/services/receipts";
import {
  releaseInventoryForOrder,
  reserveInventoryForOrder,
} from "@/lib/services/inventory";

function serializeOrder(
  order: Prisma.BakeryOrderGetPayload<{ include: { customer: true } }>
) {
  const unitPrice =
    order.unitPrice != null ? Number(order.unitPrice) : null;
  return {
    id: order.id,
    itemType: order.itemType,
    itemName: order.itemName,
    quantity: order.quantity,
    unitPrice,
    lineTotal:
      unitPrice != null ? unitPrice * order.quantity : null,
    weightKg: order.weightKg?.toString() ?? null,
    status: order.status,
    channel: order.channel,
    paymentMethod: order.paymentMethod,
    confirmationNumber: order.confirmationNumber,
    pickupAt: order.pickupAt?.toISOString() ?? null,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    customer: order.customer
      ? {
          id: order.customer.id,
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          phone: order.customer.phone,
        }
      : null,
  };
}

export type CheckoutPaymentChoice = "pay_at_store" | "card";

export function parseCheckoutPaymentMethod(
  value: string | undefined | null
): PaymentMethod | null {
  if (value === "pay_at_store") return PaymentMethod.CASH;
  if (value === "card") return PaymentMethod.CARD;
  return null;
}

async function allocateConfirmationNumber(
  tx: Prisma.TransactionClient
): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const confirmationNumber = generateConfirmationNumber();
    const existing = await tx.bakeryOrder.findFirst({
      where: { confirmationNumber },
      select: { id: true },
    });
    if (!existing) return confirmationNumber;
  }
  return `GB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function listBakeryOrders(status?: string | null) {
  const where: Prisma.BakeryOrderWhereInput = {};
  if (status) {
    const normalized = status.toUpperCase() as BakeryOrderStatus;
    if (Object.values(BakeryOrderStatus).includes(normalized)) {
      where.status = normalized;
    }
  }

  const orders = await prisma.bakeryOrder.findMany({
    where,
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(serializeOrder);
}

export async function createBakeryOrder(input: {
  firstName: string;
  lastName: string;
  phone: string;
  quantity: number;
  itemType: string;
  itemName?: string;
  unitPrice?: number;
  paymentMethod: PaymentMethod;
  pickupAt: string | null;
  notes: string | null;
}) {
  const qty = Math.trunc(input.quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    return { ok: false as const, error: "Invalid quantity" };
  }

  const phone = input.phone.trim();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!phone || !firstName || !lastName) {
    return { ok: false as const, error: "Missing customer fields" };
  }

  const unitPrice =
    input.unitPrice != null && Number.isFinite(input.unitPrice)
      ? input.unitPrice
      : null;

  try {
    const order = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({ where: { phone } });
      if (!customer) {
        customer = await tx.customer.create({
          data: { firstName, lastName, phone },
        });
      } else {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: { firstName, lastName },
        });
      }

      const confirmationNumber = await allocateConfirmationNumber(tx);

      const stockCheck = await reserveInventoryForOrder(tx, [
        {
          itemType: input.itemType.trim().toLowerCase(),
          itemName: input.itemName?.trim() || null,
          quantity: qty,
        },
      ]);
      if (!stockCheck.ok) {
        throw new Error(stockCheck.error);
      }

      const receipt = await createCheckoutReceipt({
        tx,
        confirmationNumber,
        firstName,
        lastName,
        phone,
        paymentMethod: input.paymentMethod,
        items: [
          {
            itemType: input.itemType.trim().toLowerCase(),
            itemName: input.itemName?.trim() || null,
            quantity: qty,
            unitPrice,
          },
        ],
      });

      return tx.bakeryOrder.create({
        data: {
          customerId: customer.id,
          checkoutReceiptId: receipt.id,
          itemType: input.itemType.trim().toLowerCase(),
          itemName: input.itemName?.trim() || null,
          quantity: qty,
          unitPrice,
          paymentMethod: input.paymentMethod,
          confirmationNumber,
          channel: OrderChannel.ONLINE,
          pickupAt: input.pickupAt ? new Date(input.pickupAt) : null,
          notes: input.notes,
        },
        include: { customer: true },
      });
    });

    return {
      ok: true as const,
      orderId: order.id,
      confirmationNumber: order.confirmationNumber,
      paymentMethod: order.paymentMethod,
      receiptId: order.checkoutReceiptId,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create order";
    return { ok: false as const, error: message };
  }
}

export async function createBakeryOrdersBatch(input: {
  firstName: string;
  lastName: string;
  phone: string;
  items: Array<{
    quantity: number;
    itemType: string;
    itemName?: string;
    unitPrice?: number;
  }>;
  paymentMethod: PaymentMethod;
  pickupAt: string | null;
  notes: string | null;
}) {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false as const, error: "Cart is empty" };
  }

  const normalizedItems = input.items
    .map((item) => ({
      itemType: (item.itemType || "").trim().toLowerCase(),
      itemName: item.itemName?.trim() || null,
      quantity: Math.trunc(item.quantity),
      unitPrice:
        item.unitPrice != null && Number.isFinite(item.unitPrice)
          ? item.unitPrice
          : null,
    }))
    .filter((item) => item.itemType.length > 0);

  if (normalizedItems.length === 0) {
    return { ok: false as const, error: "No valid items to order" };
  }

  if (normalizedItems.some((item) => !Number.isFinite(item.quantity) || item.quantity < 1)) {
    return { ok: false as const, error: "Invalid quantity" };
  }

  const phone = input.phone.trim();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!phone || !firstName || !lastName) {
    return { ok: false as const, error: "Missing customer fields" };
  }

  try {
    const createdOrders = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({ where: { phone } });
      if (!customer) {
        customer = await tx.customer.create({
          data: { firstName, lastName, phone },
        });
      } else {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: { firstName, lastName },
        });
      }

      const confirmationNumber = await allocateConfirmationNumber(tx);

      const stockCheck = await reserveInventoryForOrder(tx, normalizedItems);
      if (!stockCheck.ok) {
        throw new Error(stockCheck.error);
      }

      const receipt = await createCheckoutReceipt({
        tx,
        confirmationNumber,
        firstName,
        lastName,
        phone,
        paymentMethod: input.paymentMethod,
        items: normalizedItems.map((item) => ({
          itemType: item.itemType,
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      const orders = await Promise.all(
        normalizedItems.map((item) =>
          tx.bakeryOrder.create({
            data: {
              customerId: customer.id,
              checkoutReceiptId: receipt.id,
              itemType: item.itemType,
              itemName: item.itemName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              paymentMethod: input.paymentMethod,
              confirmationNumber,
              channel: OrderChannel.ONLINE,
              pickupAt: input.pickupAt ? new Date(input.pickupAt) : null,
              notes: input.notes,
            },
          })
        )
      );

      return { orders, confirmationNumber, receiptId: receipt.id };
    });

    return {
      ok: true as const,
      orderIds: createdOrders.orders.map((order) => order.id),
      confirmationNumber: createdOrders.confirmationNumber,
      paymentMethod: input.paymentMethod,
      receiptId: createdOrders.receiptId,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create order";
    return { ok: false as const, error: message };
  }
}

export async function updateBakeryOrderStatus(
  id: string,
  status: string,
  rejectionReason: string | null
) {
  const normalized = status.toUpperCase() as BakeryOrderStatus;
  if (!Object.values(BakeryOrderStatus).includes(normalized)) {
    return { ok: false as const, error: "Invalid status" };
  }

  const existing = await prisma.bakeryOrder.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false as const, error: "Order not found" };
  }

  const now = new Date();
  const data: Prisma.BakeryOrderUpdateInput = { status: normalized };
  if (normalized === BakeryOrderStatus.CONFIRMED) {
    data.confirmedAt = now;
  }
  if (normalized === BakeryOrderStatus.REJECTED) {
    data.rejectedAt = now;
    data.rejectionReason = rejectionReason;
  }

  const order = await prisma.$transaction(async (tx) => {
    if (
      (normalized === BakeryOrderStatus.REJECTED ||
        normalized === BakeryOrderStatus.EXPIRED) &&
      existing.status !== BakeryOrderStatus.REJECTED &&
      existing.status !== BakeryOrderStatus.EXPIRED &&
      existing.status !== BakeryOrderStatus.FULFILLED
    ) {
      await releaseInventoryForOrder(tx, [
        {
          itemType: existing.itemType,
          itemName: existing.itemName,
          quantity: existing.quantity,
        },
      ]);
    }

    return tx.bakeryOrder.update({
      where: { id },
      data,
      include: { customer: true },
    });
  });

  if (
    normalized === BakeryOrderStatus.FULFILLED &&
    existing.paymentMethod === PaymentMethod.CASH &&
    existing.checkoutReceiptId
  ) {
    await markReceiptPaidAtPickup(existing.checkoutReceiptId);
  }

  return { ok: true as const, order: serializeOrder(order) };
}

export async function getDashboardBakeryCounts() {
  const [pendingBakery, confirmedBakery] = await Promise.all([
    prisma.bakeryOrder.count({ where: { status: BakeryOrderStatus.PENDING } }),
    prisma.bakeryOrder.count({ where: { status: BakeryOrderStatus.CONFIRMED } }),
  ]);
  return { pendingBakery, confirmedBakery };
}
