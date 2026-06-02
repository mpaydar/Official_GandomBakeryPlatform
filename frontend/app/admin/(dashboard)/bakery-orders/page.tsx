import { Suspense } from "react";
import BakeryOrdersClient from "./BakeryOrdersClient";

export default function AdminBakeryOrdersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Bakery orders
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Review and update order status
      </p>
      <div className="mt-8">
        <Suspense
          fallback={<p className="text-sm text-zinc-500">Loading…</p>}
        >
          <BakeryOrdersClient />
        </Suspense>
      </div>
    </div>
  );
}
