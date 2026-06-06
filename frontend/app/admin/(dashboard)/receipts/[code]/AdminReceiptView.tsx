"use client";

import Link from "next/link";
import { useState } from "react";
import ReceiptDocument from "@/components/receipt/ReceiptDocument";
import type { ReceiptView } from "@/lib/receipt-format";

export default function AdminReceiptView({ receipt }: { receipt: ReceiptView }) {
  const [copyType, setCopyType] = useState<"customer" | "store">("store");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Store receipt</h1>
          <p className="mt-1 font-mono text-sm text-zinc-500">{receipt.confirmationNumber}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setCopyType("store");
              setTimeout(() => window.print(), 0);
            }}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Print store copy
          </button>
          <button
            type="button"
            onClick={() => {
              setCopyType("customer");
              setTimeout(() => window.print(), 0);
            }}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Print customer copy
          </button>
        </div>
      </div>

      <ReceiptDocument receipt={receipt} copyType={copyType} />

      <p className="mt-6 text-center text-sm text-zinc-500 print:hidden">
        <Link href="/admin/bakery-orders" className="font-medium text-amber-600 hover:underline">
          ← Back to bakery orders
        </Link>
      </p>

      <style jsx global>{`
        @media print {
          aside,
          nav,
          header,
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
