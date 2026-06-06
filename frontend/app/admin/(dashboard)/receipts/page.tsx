import { Suspense } from "react";
import AdminReceiptLookupClient from "./AdminReceiptLookupClient";

export default function AdminReceiptsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-zinc-500">Loading…</div>
      }
    >
      <AdminReceiptLookupClient />
    </Suspense>
  );
}
