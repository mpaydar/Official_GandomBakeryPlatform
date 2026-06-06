import type { PaymentMethod, ReceiptPaymentStatus } from "../../generated/prisma/client";

export type ReceiptLineItem = {
  itemType: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type ReceiptView = {
  id: string;
  confirmationNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  paymentStatus: ReceiptPaymentStatus;
  paymentLabel: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  lineItems: ReceiptLineItem[];
  orderIds: string[];
  paidAt: string | null;
  createdAt: string;
};

export function normalizeConfirmationCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function receiptPaymentLabel(
  method: PaymentMethod,
  status: ReceiptPaymentStatus
): string {
  if (status === "PAID") return "Paid";
  if (status === "AUTHORIZED") return "Authorized — capture on confirm";
  if (method === "CASH") return "Pay at pickup";
  return "Payment pending";
}

export function formatReceiptMoney(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function formatReceiptDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
