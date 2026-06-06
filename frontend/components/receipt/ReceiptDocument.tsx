"use client";

import {
  formatReceiptDate,
  formatReceiptMoney,
  type ReceiptView,
} from "@/lib/receipt-format";

type CopyType = "customer" | "store";

export default function ReceiptDocument({
  receipt,
  copyType = "customer",
}: {
  receipt: ReceiptView;
  copyType?: CopyType;
}) {
  const copyLabel = copyType === "store" ? "Store copy" : "Customer copy";

  return (
    <article
      id="receipt-document"
      className="mx-auto w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
    >
      <div className="border-b border-stone-200 pb-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
          {copyLabel}
        </p>
        <h1 className="mt-2 font-serif text-2xl text-stone-900">Gandom Bakery &amp; Market</h1>
        <p className="mt-1 text-xs text-stone-500">Paterson, New Jersey</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-400">Confirmation</p>
          <p className="mt-0.5 font-mono text-base font-bold text-stone-900">
            {receipt.confirmationNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-stone-400">Date</p>
          <p className="mt-0.5 text-stone-700">{formatReceiptDate(receipt.createdAt)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-sm">
        <p className="font-medium text-stone-900">
          {receipt.customerFirstName} {receipt.customerLastName}
        </p>
        <p className="text-stone-600">{receipt.customerPhone}</p>
      </div>

      <table className="mt-5 w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
            <th className="pb-2 pr-2">Item</th>
            <th className="pb-2 text-center">Qty</th>
            <th className="pb-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {receipt.lineItems.map((item) => (
            <tr key={`${item.itemType}-${item.name}`} className="border-b border-stone-100">
              <td className="py-2.5 pr-2">
                <p className="font-medium text-stone-900">{item.name}</p>
                {item.unitPrice > 0 && (
                  <p className="text-xs text-stone-500">
                    {formatReceiptMoney(item.unitPrice, receipt.currency)} each
                  </p>
                )}
              </td>
              <td className="py-2.5 text-center tabular-nums text-stone-700">
                {item.quantity}
              </td>
              <td className="py-2.5 text-right tabular-nums font-medium text-stone-900">
                {formatReceiptMoney(item.lineTotal, receipt.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 space-y-1 border-t border-stone-200 pt-4 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span>{formatReceiptMoney(receipt.subtotal, receipt.currency)}</span>
        </div>
        {receipt.tax > 0 && (
          <div className="flex justify-between text-stone-600">
            <span>Tax</span>
            <span>{formatReceiptMoney(receipt.tax, receipt.currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-stone-900">
          <span>Total</span>
          <span>{formatReceiptMoney(receipt.total, receipt.currency)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-stone-200 px-4 py-3 text-sm">
        <p className="text-xs uppercase tracking-wide text-stone-400">Payment</p>
        <p className="mt-1 font-semibold text-stone-900">{receipt.paymentLabel}</p>
        {receipt.paidAt && (
          <p className="mt-0.5 text-xs text-stone-500">
            Paid {formatReceiptDate(receipt.paidAt)}
          </p>
        )}
      </div>

      {copyType === "store" && (
        <p className="mt-4 text-center text-[11px] text-stone-400">
          Internal record · Order refs: {receipt.orderIds.map((id) => id.slice(0, 8)).join(", ")}
        </p>
      )}

      <p className="mt-6 text-center text-xs text-stone-400">
        Thank you for shopping at Gandom
      </p>
    </article>
  );
}