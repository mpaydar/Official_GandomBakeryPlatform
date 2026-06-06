"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BarcodeSuggestion, InventoryProductRow } from "@/lib/services/inventory";

export type ScanLogEntry = {
  id: string;
  barcode: string;
  at: string;
  status: "received" | "unknown" | "error";
  message: string;
  product?: InventoryProductRow;
  suggestion?: BarcodeSuggestion | null;
  receivedQty?: number;
};

type BarcodeScannerPanelProps = {
  scanQty: number;
  onScanQtyChange: (qty: number) => void;
  onProductReceived: (product: InventoryProductRow) => void;
  onRegisterUnknown: (payload: {
    barcode: string;
    nameEn: string;
    unit: string;
    suggestion: BarcodeSuggestion | null;
  }) => void;
  disabled?: boolean;
};

export default function BarcodeScannerPanel({
  scanQty,
  onScanQtyChange,
  onProductReceived,
  onRegisterUnknown,
  disabled,
}: BarcodeScannerPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [buffer, setBuffer] = useState("");
  const [scanning, setScanning] = useState(false);
  const [log, setLog] = useState<ScanLogEntry[]>([]);
  const [flash, setFlash] = useState<"ok" | "warn" | "err" | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const pushLog = useCallback((entry: Omit<ScanLogEntry, "id" | "at">) => {
    setLog((prev) => [
      {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: new Date().toISOString(),
      },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const processBarcode = useCallback(
    async (raw: string) => {
      const code = raw.trim();
      if (!code || scanning || disabled) return;

      setScanning(true);
      setFlash(null);
      try {
        const lookupRes = await fetch(
          `/api/admin/inventory/barcode?code=${encodeURIComponent(code)}`,
          { credentials: "include" }
        );
        const lookup = await lookupRes.json().catch(() => ({}));

        if (!lookupRes.ok) {
          setFlash("err");
          pushLog({
            barcode: code,
            status: "error",
            message:
              typeof lookup.error === "string" ? lookup.error : "Lookup failed",
          });
          return;
        }

        if (lookup.found && lookup.product) {
          const receiveRes = await fetch("/api/admin/inventory/scan", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barcode: code, quantity: scanQty }),
          });
          const receive = await receiveRes.json().catch(() => ({}));

          if (!receiveRes.ok) {
            setFlash("err");
            pushLog({
              barcode: code,
              status: "error",
              message:
                typeof receive.error === "string"
                  ? receive.error
                  : "Could not receive stock",
              product: lookup.product as InventoryProductRow,
            });
            return;
          }

          const product = receive.product as InventoryProductRow;
          const receivedQty = Number(receive.received) || scanQty;
          setFlash("ok");
          pushLog({
            barcode: code,
            status: "received",
            message: `${product.nameEn} +${receivedQty}`,
            product,
            receivedQty,
          });
          onProductReceived(product);
          return;
        }

        setFlash("warn");
        const suggestion = (lookup.suggestion ?? null) as BarcodeSuggestion | null;
        pushLog({
          barcode: lookup.barcode ?? code,
          status: "unknown",
          message: suggestion?.nameEn
            ? `New item: ${suggestion.nameEn}`
            : "Unknown barcode — register product",
          suggestion,
        });
      } catch {
        setFlash("err");
        pushLog({
          barcode: code,
          status: "error",
          message: "Network error",
        });
      } finally {
        setScanning(false);
        setBuffer("");
        inputRef.current?.focus();
      }
    },
    [disabled, onProductReceived, pushLog, scanQty, scanning]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void processBarcode(buffer);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-zinc-500">
        Point your USB scanner here and scan. Known products add stock to the table
        automatically. Unknown barcodes appear below so you can register them.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Scan barcode
        </label>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={buffer}
          disabled={disabled || scanning}
          onChange={(e) => setBuffer(e.target.value)}
          onBlur={() => {
            window.setTimeout(() => inputRef.current?.focus(), 0);
          }}
          placeholder={scanning ? "Processing…" : "Scan or type barcode…"}
          className={`mt-1.5 w-full rounded-lg border-2 bg-white px-3 py-3 font-mono text-base outline-none transition ${
            flash === "ok"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : flash === "warn"
                ? "border-amber-500 ring-2 ring-amber-500/20"
                : flash === "err"
                  ? "border-rose-500 ring-2 ring-rose-500/20"
                  : "border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          }`}
        />
      </form>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Quantity per scan
        </label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {[1, 5, 10, 24].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onScanQtyChange(n)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                scanQty === n
                  ? "border-amber-500 bg-amber-50 text-amber-800"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200">
        <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Scan session ({log.length})
          </p>
        </div>
        <ul className="max-h-64 divide-y divide-zinc-100 overflow-y-auto">
          {log.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-zinc-400">
              Scans will appear here
            </li>
          ) : (
            log.map((entry) => (
              <li key={entry.id} className="flex items-start gap-2 px-3 py-2.5 text-xs">
                <span
                  className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-medium uppercase ${
                    entry.status === "received"
                      ? "bg-emerald-100 text-emerald-700"
                      : entry.status === "unknown"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {entry.status === "received"
                    ? "Stock"
                    : entry.status === "unknown"
                      ? "New"
                      : "Error"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-zinc-800">{entry.barcode}</p>
                  <p className="mt-0.5 text-zinc-600">{entry.message}</p>
                </div>
                {entry.status === "unknown" && (
                  <button
                    type="button"
                    onClick={() =>
                      onRegisterUnknown({
                        barcode: entry.barcode,
                        nameEn: entry.suggestion?.nameEn ?? "",
                        unit: entry.suggestion?.quantity ?? "",
                        suggestion: entry.suggestion ?? null,
                      })
                    }
                    className="shrink-0 rounded border border-amber-300 bg-amber-50 px-2 py-1 font-medium text-amber-800 hover:bg-amber-100"
                  >
                    Register
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
