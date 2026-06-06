import {
  PaymentMethod,
  Prisma,
  ReceiptPaymentStatus,
} from "../../generated/prisma/client";
import {
  normalizeConfirmationCode,
  receiptPaymentLabel,
  type ReceiptLineItem,
  type ReceiptView,
} from "@/lib/receipt-format";
import { prisma } from "@/lib/prisma";

type LineInput = {
  itemType: string;
  itemName: string | null;
  quantity: number;
  unitPrice: number | null;
};

function lineTotal(item: LineInput): number {
  if (item.unitPrice == null) return 0;
  return item.unitPrice * item.quantity;
}

function buildLineItems(items: LineInput[]): ReceiptLineItem[] {
  return items.map((item) => ({
    itemType: item.itemType,
    name: item.itemName ?? item.itemType,
    quantity: item.quantity,
    unitPrice: item.unitPrice ?? 0,
    lineTotal: lineTotal(item),
  }));
}

function receiptStatusForPayment(method: PaymentMethod): ReceiptPaymentStatus {
  if (method === PaymentMethod.CASH) return ReceiptPaymentStatus.PAY_AT_PICKUP;
  return ReceiptPaymentStatus.PAID;
}

function serializeReceipt(
  receipt: Prisma.CheckoutReceiptGetPayload<{ include: { bakeryOrders: true } }>
): ReceiptView {
  const lineItems = receipt.lineItems as ReceiptLineItem[];
  return {
    id: receipt.id,
    confirmationNumber: receipt.confirmationNumber,
    customerFirstName: receipt.customerFirstName,
    customerLastName: receipt.customerLastName,
    customerPhone: receipt.customerPhone,
    paymentMethod: receipt.paymentMethod,
    paymentStatus: receipt.paymentStatus,
    paymentLabel: receiptPaymentLabel(receipt.paymentMethod, receipt.paymentStatus),
    subtotal: Number(receipt.subtotal),
    tax: Number(receipt.tax),
    total: Number(receipt.total),
    currency: receipt.currency,
    lineItems,
    orderIds: receipt.bakeryOrders.map((order) => order.id),
    paidAt: receipt.paidAt?.toISOString() ?? null,
    createdAt: receipt.createdAt.toISOString(),
  };
}

export async function createCheckoutReceipt(input: {
  tx: Prisma.TransactionClient;
  confirmationNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  paymentMethod: PaymentMethod;
  items: LineInput[];
}) {
  const lineItems = buildLineItems(input.items);
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = 0;
  const total = subtotal + tax;
  const paymentStatus = receiptStatusForPayment(input.paymentMethod);
  const paidAt =
    paymentStatus === ReceiptPaymentStatus.PAID ? new Date() : null;

  return input.tx.checkoutReceipt.create({
    data: {
      confirmationNumber: input.confirmationNumber,
      customerFirstName: input.firstName,
      customerLastName: input.lastName,
      customerPhone: input.phone,
      paymentMethod: input.paymentMethod,
      paymentStatus,
      subtotal,
      tax,
      total,
      lineItems: lineItems as unknown as Prisma.InputJsonValue,
      paidAt,
    },
  });
}

export async function markReceiptPaidAtPickup(checkoutReceiptId: string) {
  await prisma.checkoutReceipt.updateMany({
    where: {
      id: checkoutReceiptId,
      paymentStatus: ReceiptPaymentStatus.PAY_AT_PICKUP,
    },
    data: {
      paymentStatus: ReceiptPaymentStatus.PAID,
      paidAt: new Date(),
    },
  });
}

export async function lookupReceiptByConfirmationCode(
  rawCode: string
): Promise<{ ok: true; receipt: ReceiptView } | { ok: false; error: string }> {
  const confirmationNumber = normalizeConfirmationCode(rawCode);
  if (!confirmationNumber) {
    return { ok: false, error: "Enter a confirmation number" };
  }

  const receipt = await prisma.checkoutReceipt.findUnique({
    where: { confirmationNumber },
    include: { bakeryOrders: true },
  });

  if (receipt) {
    return { ok: true, receipt: serializeReceipt(receipt) };
  }

  const legacyOrders = await prisma.bakeryOrder.findMany({
    where: { confirmationNumber },
    include: { customer: true },
    orderBy: { createdAt: "asc" },
  });

  if (legacyOrders.length === 0) {
    return { ok: false, error: "No receipt found for that confirmation number" };
  }

  const first = legacyOrders[0];
  const lineItems = buildLineItems(
    legacyOrders.map((order) => ({
      itemType: order.itemType,
      itemName: order.itemName,
      quantity: order.quantity,
      unitPrice: order.unitPrice != null ? Number(order.unitPrice) : null,
    }))
  );
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const paymentMethod = first.paymentMethod;
  const paymentStatus =
    paymentMethod === PaymentMethod.CASH
      ? ReceiptPaymentStatus.PAY_AT_PICKUP
      : ReceiptPaymentStatus.PAID;

  return {
    ok: true,
    receipt: {
      id: first.id,
      confirmationNumber,
      customerFirstName: first.customer?.firstName ?? "",
      customerLastName: first.customer?.lastName ?? "",
      customerPhone: first.customer?.phone ?? "",
      paymentMethod,
      paymentStatus,
      paymentLabel: receiptPaymentLabel(paymentMethod, paymentStatus),
      subtotal,
      tax: 0,
      total: subtotal,
      currency: "usd",
      lineItems,
      orderIds: legacyOrders.map((order) => order.id),
      paidAt: null,
      createdAt: first.createdAt.toISOString(),
    },
  };
}
