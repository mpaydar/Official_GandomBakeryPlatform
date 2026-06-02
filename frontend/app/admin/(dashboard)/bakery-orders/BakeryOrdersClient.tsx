"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  buildBakeryOrderAlerts,
  customerDisplayName,
  paymentDisplayLabel,
  type BakeryOrderAlert,
  type BakeryOrderRow,
} from "@/lib/bakery-order-alerts";

type OrderRow = BakeryOrderRow & {
  unitPrice: number | null;
  weightKg: string | null;
  status: string;
  channel: string;
  pickupAt: string | null;
  notes: string | null;
};

const POLL_MS = 5000;
const HIGHLIGHT_MS = 12_000;

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "FULFILLED",
  "EXPIRED",
] as const;

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  ...STATUSES.map((s) => ({ value: s, label: s })),
];

export default function BakeryOrdersClient() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") ?? ""
  );

  useEffect(() => {
    setStatusFilter(searchParams.get("status") ?? "");
  }, [searchParams]);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<BakeryOrderAlert[]>([]);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());

  const ordersSnapshotRef = useRef<OrderRow[]>([]);
  const hasHydratedRef = useRef(false);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (statusFilter) q.set("status", statusFilter);
    return q.toString();
  }, [statusFilter]);

  const pushNewOrders = useCallback((incoming: OrderRow[]) => {
    if (incoming.length === 0) return;

    const built = buildBakeryOrderAlerts(incoming);
    setAlerts((prev) => {
      const seen = new Set(prev.map((a) => a.id));
      const fresh = built.filter((a) => !seen.has(a.id));
      return [...fresh, ...prev].slice(0, 8);
    });

    setHighlightIds((prev) => {
      const next = new Set(prev);
      for (const order of incoming) next.add(order.id);
      return next;
    });

    window.setTimeout(() => {
      setHighlightIds((prev) => {
        const next = new Set(prev);
        for (const order of incoming) next.delete(order.id);
        return next;
      });
    }, HIGHLIGHT_MS);
  }, []);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/bakery-orders${query ? `?${query}` : ""}`,
          { credentials: "include", cache: "no-store" }
        );
        if (!res.ok) {
          setError("Could not load orders");
          if (!silent) setOrders([]);
          return;
        }
        const data = (await res.json()) as { orders: OrderRow[] };
        const next = data.orders;

        if (hasHydratedRef.current) {
          const prev = ordersSnapshotRef.current;
          const incoming = next.filter(
            (order) => !prev.some((row) => row.id === order.id)
          );
          pushNewOrders(incoming);
        } else {
          hasHydratedRef.current = true;
        }

        ordersSnapshotRef.current = next;
        setOrders(next);
      } catch {
        setError("Network error");
        if (!silent) setOrders([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [query, pushNewOrders]
  );

  useEffect(() => {
    hasHydratedRef.current = false;
    ordersSnapshotRef.current = [];
    void load();
  }, [load]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") {
        void load({ silent: true });
      }
    };
    const id = window.setInterval(tick, POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  async function patchStatus(
    id: string,
    status: string,
    rejectionReason?: string
  ) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bakery-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, rejectionReason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Update failed");
        return;
      }
      await load({ silent: true });
    } catch {
      setError("Network error");
    } finally {
      setBusyId(null);
    }
  }

  function dismissAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
        >
          {FILTERS.map((f) => (
            <option key={f.value || "all"} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Refresh
        </button>
        <span className="text-xs text-zinc-600">
          Auto-updates every {POLL_MS / 1000}s
        </span>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2" role="region" aria-label="New orders">
          {alerts.map((alert) => (
            <NewOrderAlert
              key={alert.id}
              alert={alert}
              onDismiss={() => dismissAlert(alert.id)}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-zinc-500">No orders in this view.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-3 py-3 font-medium text-zinc-400">When</th>
                <th className="px-3 py-3 font-medium text-zinc-400">Customer</th>
                <th className="px-3 py-3 font-medium text-zinc-400">Item</th>
                <th className="px-3 py-3 font-medium text-zinc-400">Qty</th>
                <th className="px-3 py-3 font-medium text-zinc-400">Total</th>
                <th className="px-3 py-3 font-medium text-zinc-400">Payment</th>
                <th className="px-3 py-3 font-medium text-zinc-400">Conf. #</th>
                <th className="px-3 py-3 font-medium text-zinc-400">Status</th>
                <th className="px-3 py-3 font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className={`border-b border-zinc-800/80 last:border-0 hover:bg-zinc-900/40 ${
                    highlightIds.has(o.id)
                      ? "bg-amber-500/10 ring-1 ring-inset ring-amber-500/40"
                      : ""
                  }`}
                >
                  <td className="whitespace-nowrap px-3 py-3 text-zinc-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-3 text-zinc-300">
                    {customerDisplayName(o.customer)}
                  </td>
                  <td className="px-3 py-3 text-zinc-200">
                    <span className="block font-medium">
                      {o.itemName ?? o.itemType}
                    </span>
                    {o.itemName && (
                      <span className="text-xs capitalize text-zinc-500">
                        {o.itemType}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-zinc-300">
                    {o.quantity}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-zinc-300">
                    {o.lineTotal != null ? `$${o.lineTotal.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-3 py-3 text-zinc-400">
                    {paymentDisplayLabel(o.paymentMethod)}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-amber-200/90">
                    {o.confirmationNumber ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-amber-200/90">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {o.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            disabled={busyId === o.id}
                            onClick={() => void patchStatus(o.id, "CONFIRMED")}
                            className="rounded-md bg-emerald-600/90 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <RejectButton
                            disabled={busyId === o.id}
                            onReject={(reason) =>
                              void patchStatus(o.id, "REJECTED", reason)
                            }
                          />
                        </>
                      )}
                      {(o.status === "PENDING" || o.status === "CONFIRMED") && (
                        <button
                          type="button"
                          disabled={busyId === o.id}
                          onClick={() => void patchStatus(o.id, "FULFILLED")}
                          className="rounded-md bg-amber-500/90 px-2 py-1 text-xs font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                        >
                          Fulfilled
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NewOrderAlert({
  alert,
  onDismiss,
}: {
  alert: BakeryOrderAlert;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 shadow-lg shadow-amber-950/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-100">New order</p>
          <p className="mt-0.5 text-sm text-zinc-300">{alert.customerLabel}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {alert.paymentLabel}
            {alert.confirmationNumber && (
              <>
                {" · "}
                <span className="font-mono text-amber-200/90">
                  {alert.confirmationNumber}
                </span>
              </>
            )}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-200">
            {alert.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="tabular-nums text-zinc-400">
                  {item.lineTotal != null ? `$${item.lineTotal.toFixed(2)}` : "—"}
                </span>
              </li>
            ))}
          </ul>
          {alert.orderTotal > 0 && (
            <p className="mt-2 text-right text-sm font-semibold text-amber-200">
              Total ${alert.orderTotal.toFixed(2)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function RejectButton({
  disabled,
  onReject,
}: {
  disabled: boolean;
  onReject: (reason: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="rounded-md bg-rose-600/90 px-2 py-1 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-50"
      >
        Reject
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="w-36 rounded border border-zinc-600 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onReject(reason);
          setOpen(false);
          setReason("");
        }}
        className="rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white"
      >
        OK
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setReason("");
        }}
        className="rounded-md border border-zinc-600 px-2 py-1 text-xs text-zinc-300"
      >
        Cancel
      </button>
    </span>
  );
}
