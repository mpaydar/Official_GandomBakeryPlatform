"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  buildBakeryOrderAlerts,
  type BakeryOrderAlert,
  type BakeryOrderRow,
} from "@/lib/bakery-order-alerts";
import { playNewOrderChime, unlockNewOrderSound } from "@/lib/new-order-sound";

const POLL_MS = 3000;

type OrderRow = BakeryOrderRow & {
  unitPrice: number | null;
  lineTotal: number | null;
  status: string;
};

type AdminOrderNotificationsContextValue = {
  unseenCount: number;
  pendingCount: number;
  alerts: BakeryOrderAlert[];
  ordersVersion: number;
  markAllSeen: () => void;
  dismissAlert: (id: string) => void;
};

const AdminOrderNotificationsContext =
  createContext<AdminOrderNotificationsContextValue | null>(null);

export function useAdminOrderNotifications() {
  const ctx = useContext(AdminOrderNotificationsContext);
  if (!ctx) {
    throw new Error(
      "useAdminOrderNotifications must be used within AdminOrderNotificationsProvider"
    );
  }
  return ctx;
}

export function AdminOrderNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingCount, setPendingCount] = useState(0);
  const [unseenCount, setUnseenCount] = useState(0);
  const [alerts, setAlerts] = useState<BakeryOrderAlert[]>([]);
  const [ordersVersion, setOrdersVersion] = useState(0);
  const [soundReady, setSoundReady] = useState(false);

  const knownIdsRef = useRef<Set<string>>(new Set());
  const readyRef = useRef(false);

  const handleNewOrders = useCallback((incoming: OrderRow[]) => {
    if (incoming.length === 0) return;

    const built = buildBakeryOrderAlerts(incoming);
    setAlerts((prev) => {
      const seen = new Set(prev.map((a) => a.id));
      const fresh = built.filter((a) => !seen.has(a.id));
      return [...fresh, ...prev].slice(0, 10);
    });
    setUnseenCount((n) => n + built.length);
    setOrdersVersion((v) => v + 1);
    playNewOrderChime();
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bakery-orders?status=PENDING", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;

      const data = (await res.json()) as { orders: OrderRow[] };
      const next = data.orders;
      setPendingCount(next.length);

      if (readyRef.current) {
        const incoming = next.filter((order) => !knownIdsRef.current.has(order.id));
        handleNewOrders(incoming);
      } else {
        readyRef.current = true;
      }

      knownIdsRef.current = new Set(next.map((order) => order.id));
    } catch {
      // ignore transient network errors
    }
  }, [handleNewOrders]);

  useEffect(() => {
    void poll();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void poll();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [poll]);

  useEffect(() => {
    const unlock = () => {
      unlockNewOrderSound();
      setSoundReady(true);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const markAllSeen = useCallback(() => {
    setUnseenCount(0);
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setUnseenCount((n) => Math.max(0, n - 1));
  }, []);

  return (
    <AdminOrderNotificationsContext.Provider
      value={{
        unseenCount,
        pendingCount,
        alerts,
        ordersVersion,
        markAllSeen,
        dismissAlert,
      }}
    >
      {!soundReady && (
        <p className="sr-only">
          Click anywhere once to enable new-order sounds
        </p>
      )}
      {children}
    </AdminOrderNotificationsContext.Provider>
  );
}

export function AdminNotificationBell() {
  const { unseenCount, pendingCount } = useAdminOrderNotifications();

  return (
    <Link
      href="/admin/bakery-orders?status=PENDING"
      className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 text-zinc-200 transition hover:border-red-500/50 hover:bg-zinc-800 hover:text-white"
      aria-label={
        unseenCount > 0
          ? `${unseenCount} new orders`
          : `${pendingCount} pending orders`
      }
      title={
        unseenCount > 0
          ? `${unseenCount} new order${unseenCount === 1 ? "" : "s"}`
          : "Bakery orders"
      }
    >
      <BellIcon className="h-5 w-5" />
      {unseenCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-900/50 ring-2 ring-zinc-900 animate-pulse">
          {unseenCount > 9 ? "9+" : unseenCount}
        </span>
      ) : pendingCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-zinc-900" />
      ) : null}
    </Link>
  );
}

export function AdminNewOrderRibbon() {
  const { unseenCount, alerts, markAllSeen, dismissAlert } =
    useAdminOrderNotifications();

  if (unseenCount === 0) return null;

  const latest = alerts[0];

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 border-b border-red-400/60 bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-4 py-3 text-white shadow-lg shadow-red-950/40"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
            <BellIcon className="h-5 w-5 animate-bounce" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-wide">
              {unseenCount === 1 ? "New order" : `${unseenCount} new orders`}
            </p>
            {latest && (
              <p className="mt-0.5 truncate text-sm text-red-50/95">
                {latest.customerLabel}
                {latest.confirmationNumber && (
                  <>
                    {" · "}
                    <span className="font-mono font-semibold">
                      {latest.confirmationNumber}
                    </span>
                  </>
                )}
                {latest.items.length > 0 && (
                  <>
                    {" · "}
                    {latest.items
                      .map((i) => `${i.name} ×${i.quantity}`)
                      .join(", ")}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href="/admin/bakery-orders?status=PENDING"
            onClick={markAllSeen}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow transition hover:bg-red-50"
          >
            View orders
          </Link>
          <button
            type="button"
            onClick={markAllSeen}
            className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
          >
            Dismiss all
          </button>
          {latest && alerts.length === 1 && (
            <button
              type="button"
              onClick={() => dismissAlert(latest.id)}
              className="rounded-lg px-2 py-1.5 text-xs text-red-100 hover:bg-white/10"
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}
