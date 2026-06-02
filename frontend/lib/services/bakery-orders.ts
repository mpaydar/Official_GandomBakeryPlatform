import { BakeryOrderStatus, OrderChannel, Prisma } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

function serializeOrder(
  order: Prisma.BakeryOrderGetPayload<{ include: { customer: true } }>
) {
  return {
    id: order.id,
    itemType: order.itemType,
    quantity: order.quantity,
    weightKg: order.weightKg?.toString() ?? null,
    status: order.status,
    channel: order.channel,
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
  pickupAt: string | null;
  notes: string | null;
}) {
  const qty = Math.trunc(input.quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    return { ok: false as const, error: "Invalid quantity" };
  }

  let customer = await prisma.customer.findFirst({
    where: { phone: input.phone },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });
  }

  const order = await prisma.bakeryOrder.create({
    data: {
      customerId: customer.id,
      itemType: input.itemType,
      quantity: qty,
      channel: OrderChannel.ONLINE,
      pickupAt: input.pickupAt ? new Date(input.pickupAt) : null,
      notes: input.notes,
    },
    include: { customer: true },
  });

  return { ok: true as const, orderId: order.id };
}

export async function createBakeryOrdersBatch(input: {
  firstName: string;
  lastName: string;
  phone: string;
  items: Array<{
    quantity: number;
    itemType: string;
  }>;
  pickupAt: string | null;
  notes: string | null;
}) {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false as const, error: "Cart is empty" };
  }

  const normalizedItems = input.items
    .map((item) => ({
      itemType: (item.itemType || "").trim().toLowerCase(),
      quantity: Math.trunc(item.quantity),
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

    const orders = await Promise.all(
      normalizedItems.map((item) =>
        tx.bakeryOrder.create({
          data: {
            customerId: customer.id,
            itemType: item.itemType,
            quantity: item.quantity,
            channel: OrderChannel.ONLINE,
            pickupAt: input.pickupAt ? new Date(input.pickupAt) : null,
            notes: input.notes,
          },
        })
      )
    );

    return orders;
  });

  return {
    ok: true as const,
    orderIds: createdOrders.map((order) => order.id),
  };
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

  const order = await prisma.bakeryOrder.update({
    where: { id },
    data,
    include: { customer: true },
  });

  return { ok: true as const, order: serializeOrder(order) };
}

export async function getDashboardBakeryCounts() {
  const [pendingBakery, confirmedBakery] = await Promise.all([
    prisma.bakeryOrder.count({ where: { status: BakeryOrderStatus.PENDING } }),
    prisma.bakeryOrder.count({ where: { status: BakeryOrderStatus.CONFIRMED } }),
  ]);
  return { pendingBakery, confirmedBakery };
}
