import { Suspense } from "react";
import ReceiptLookupClient from "./ReceiptLookupClient";

export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] text-stone-600">
          Loading…
        </div>
      }
    >
      <ReceiptLookupClient />
    </Suspense>
  );
}
