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
