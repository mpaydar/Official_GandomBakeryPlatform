"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminReceiptView from "./[code]/AdminReceiptView";
import { normalizeConfirmationCode, type ReceiptView } from "@/lib/receipt-format";

const inputClass =
  "mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-sm tracking-wider text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";

export default function AdminReceiptLookupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";

  const [code, setCode] = useState(initialCode);
  const [receipt, setReceipt] = useState<ReceiptView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const normalizedPreview = useMemo(
    () => (code.trim() ? normalizeConfirmationCode(code) : ""),
    [code]
  );

  async function lookupReceipt(targetCode: string, updateUrl = false) {
    setLoading(true);
    setError(null);
    setReceipt(null);

    try {
      const res = await fetch("/api/admin/receipts/lookup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationNumber: targetCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Receipt not found");
        return;
      }
      const found = data.receipt as ReceiptView;
      setReceipt(found);
      if (updateUrl && found.confirmationNumber) {
        router.replace(
          `/admin/receipts?code=${encodeURIComponent(found.confirmationNumber)}`,
          { scroll: false }
        );
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await lookupReceipt(code, true);
  }

  useEffect(() => {
    if (!initialCode.trim()) return;
    void lookupReceipt(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Receipt lookup
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Enter a customer confirmation number to retrieve and print their order receipt.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <label
          htmlFor="confirmationNumber"
          className="block text-xs font-semibold uppercase tracking-wide text-zinc-500"
        >
          Confirmation number
        </label>
        <input
          id="confirmationNumber"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="GB-482910"
          required
          className={inputClass}
        />
        {normalizedPreview && normalizedPreview !== code.trim().toUpperCase() && (
          <p className="mt-1 text-xs text-zinc-400">Looking up: {normalizedPreview}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? "Finding receipt…" : "Retrieve receipt"}
        </button>
        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </form>

      {receipt && (
        <div className="mt-8 border-t border-zinc-200 pt-8">
          <AdminReceiptView receipt={receipt} embedded />
        </div>
      )}
    </div>
  );
}
