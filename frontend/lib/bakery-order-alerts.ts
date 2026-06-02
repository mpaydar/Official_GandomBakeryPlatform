export type BakeryOrderRow = {
  id: string;
  itemType: string;
  itemName: string | null;
  quantity: number;
  lineTotal: number | null;
  paymentMethod: string;
  confirmationNumber: string | null;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;
};

export type BakeryOrderAlert = {
  id: string;
  confirmationNumber: string | null;
  customerLabel: string;
  paymentLabel: string;
  items: { name: string; quantity: number; lineTotal: number | null }[];
  orderTotal: number;
  createdAt: string;
};

export function customerDisplayName(
  customer: BakeryOrderRow["customer"]
): string {
  if (!customer) return "Unknown customer";
  const name = `${customer.firstName} ${customer.lastName}`.trim();
  return customer.phone ? `${name} · ${customer.phone}` : name;
}

export function paymentDisplayLabel(method: string): string {
  if (method === "CASH") return "Pay at store";
  if (method === "CARD") return "Card";
  return method;
}

/** Group new line items into one alert per checkout (confirmation number or single order). */
export function buildBakeryOrderAlerts(
  orders: BakeryOrderRow[]
): BakeryOrderAlert[] {
  const groups = new Map<string, BakeryOrderRow[]>();
  for (const order of orders) {
    const key = order.confirmationNumber ?? order.id;
    const list = groups.get(key) ?? [];
    list.push(order);
    groups.set(key, list);
  }

  return Array.from(groups.entries()).map(([key, rows]) => {
    const first = rows[0];
    const orderTotal = rows.reduce((sum, row) => sum + (row.lineTotal ?? 0), 0);
    return {
      id: key,
      confirmationNumber: first.confirmationNumber,
      customerLabel: customerDisplayName(first.customer),
      paymentLabel: paymentDisplayLabel(first.paymentMethod),
      items: rows.map((row) => ({
        name: row.itemName ?? row.itemType,
        quantity: row.quantity,
        lineTotal: row.lineTotal,
      })),
      orderTotal,
      createdAt: first.createdAt,
    };
  });
}
