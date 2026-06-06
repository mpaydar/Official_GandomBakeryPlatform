"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LandingHeader from "@/components/landing/LandingHeader";
import ReceiptDocument from "@/components/receipt/ReceiptDocument";
import { normalizeConfirmationCode, type ReceiptView } from "@/lib/receipt-format";

export default function ReceiptLookupClient() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";

  const [code, setCode] = useState(initialCode);
  const [receipt, setReceipt] = useState<ReceiptView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyType, setCopyType] = useState<"customer" | "store">("customer");

  const normalizedPreview = useMemo(
    () => (code.trim() ? normalizeConfirmationCode(code) : ""),
    [code]
  );

  async function lookupReceipt(targetCode: string) {
    setLoading(true);
    setError(null);
    setReceipt(null);

    try {
      const res = await fetch("/api/receipts/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationNumber: targetCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Receipt not found");
        return;
      }
      setReceipt(data.receipt as ReceiptView);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    await lookupReceipt(code);
  }

  useEffect(() => {
    if (!initialCode.trim()) return;
    void lookupReceipt(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  return (
    <div className="landing-theme min-h-screen bg-[var(--shop-bg)] font-sans text-stone-900">
      <LandingHeader />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Order receipt</h1>
          <p className="mt-2 text-sm text-stone-600">
            Enter your confirmation number to view or print your receipt online or at the store.
          </p>
        </div>

        <form
          onSubmit={handleLookup}
          className="mx-auto mb-8 max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <label htmlFor="confirmationNumber" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Confirmation number
          </label>
          <input
            id="confirmationNumber"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="GB-482910"
            required
            className="mt-2 w-full rounded-lg border border-stone-300 bg-[var(--shop-bg)] px-4 py-2.5 font-mono text-sm tracking-wider outline-none focus:border-[var(--landing-accent)] focus:ring-2 focus:ring-[var(--landing-accent)]/15"
          />
          {normalizedPreview && normalizedPreview !== code.trim().toUpperCase() && (
            <p className="mt-1 text-xs text-stone-400">Looking up: {normalizedPreview}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-[var(--landing-accent)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--landing-accent-hover)] disabled:opacity-60"
          >
            {loading ? "Finding receipt…" : "View receipt"}
          </button>
          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </form>

        {receipt && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-3 print:hidden">
              <button
                type="button"
                onClick={() => {
                  setCopyType("customer");
                  setTimeout(() => window.print(), 0);
                }}
                className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
              >
                Print customer copy
              </button>
              <button
                type="button"
                onClick={() => {
                  setCopyType("store");
                  setTimeout(() => window.print(), 0);
                }}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
              >
                Print store copy
              </button>
            </div>

            <ReceiptDocument receipt={receipt} copyType={copyType} />
          </div>
        )}

        <p className="mt-10 text-center text-sm text-stone-500 print:hidden">
          <Link href="/" className="font-medium text-[var(--landing-accent)] hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>

      <style jsx global>{`
        @media print {
          header,
          form,
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
