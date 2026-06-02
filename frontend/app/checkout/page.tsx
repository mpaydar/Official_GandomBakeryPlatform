"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/header";
import { useCart } from "@/lib/CartContext";

type Status = "idle" | "loading" | "success" | "error";

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

const INPUT =
  "w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40";

export default function CheckoutPage() {
  const { cart, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [orderIds, setOrderIds] = useState<string[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => setMounted(true), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/bakery/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          items: cart.map((item) => ({
            quantity: item.quantity,
            itemType: item.itemType,
          })),
        }),
      });
      if (!res.ok) {
        throw new Error();
      }
      const data = (await res.json()) as { orderIds?: string[]; orderId?: string };
      const ids = Array.isArray(data.orderIds)
        ? data.orderIds
        : data.orderId
          ? [data.orderId]
          : [];
      setOrderIds(ids);
      clearCart();
      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  /* ── Success ── */
  if (status === "success") {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center px-4 py-20">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-slate-800/80 p-8 text-center shadow-2xl">
            <span className="text-6xl">✅</span>
            <h2 className="mt-4 text-2xl font-bold text-amber-100">Order Confirmed!</h2>
            <p className="mt-2 text-sm text-amber-200/60">
              We received your order and will reach out to confirm pickup.
            </p>
            {orderIds.length > 0 && (
              <p className="mt-3 text-xs text-amber-200/80">
                Tracking ID{orderIds.length > 1 ? "s" : ""}:{" "}
                {orderIds.map((id) => id.slice(0, 8)).join(", ")}
              </p>
            )}
            <Link
              href="/"
              className="mt-8 block w-full rounded-xl bg-amber-500 py-3 text-center text-sm font-bold text-slate-900 transition hover:bg-amber-400"
            >
              Back to home
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  /* ── Empty cart (after hydration) ── */
  if (mounted && cart.length === 0) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center px-4 py-20">
          <div className="w-full max-w-md rounded-2xl border border-white/5 bg-slate-800/60 p-8 text-center">
            <span className="text-5xl">🛒</span>
            <h2 className="mt-4 text-xl font-bold text-slate-200">Your cart is empty</h2>
            <p className="mt-2 text-sm text-slate-400">Add some bread first!</p>
            <Link
              href="/bakery"
              className="mt-6 block w-full rounded-xl bg-amber-500 py-3 text-center text-sm font-bold text-slate-900 transition hover:bg-amber-400"
            >
              Go to Bakery
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6 sm:py-14">

        <h1 className="mb-8 text-2xl font-bold tracking-tight text-amber-100">Your cart</h1>

        {/* ── Cart items ── */}
        <div className="mb-2 rounded-2xl border border-white/5 bg-slate-800/60 overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Item</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Price</span>
            <span />
          </div>

          {cart.map((item) => (
            <div
              key={item.itemType}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-white/5 px-5 py-4 last:border-b-0"
            >
              {/* Name + unit price */}
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-xs text-slate-400">${item.unitPrice.toFixed(2)} each</p>
              </div>

              {/* Qty stepper */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.itemType, item.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/60 text-sm font-bold text-amber-300 transition hover:border-amber-400 active:scale-95"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.itemType, item.quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/60 text-sm font-bold text-amber-300 transition hover:border-amber-400 active:scale-95"
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <span className="text-right text-sm font-bold text-amber-200">
                ${(item.quantity * item.unitPrice).toFixed(2)}
              </span>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.itemType)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                title="Remove"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between bg-slate-900/40 px-5 py-4">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total</span>
            <span className="text-xl font-bold text-amber-300">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-8 text-right">
          <Link href="/bakery" className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline">
            + Add more items
          </Link>
        </div>

        {/* ── Customer info + payment ── */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-amber-500/20 bg-slate-800/70 p-6 shadow-2xl sm:p-8">

          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Your info</p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">First name</label>
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ali" className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">Last name</label>
              <input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ahmadi" className={INPUT} />
            </div>
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Phone</label>
            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={INPUT} />
          </div>

          <hr className="mb-6 border-slate-700" />

          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Card info</p>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Card number</label>
            <input
              required
              value={cardNum}
              onChange={(e) => setCardNum(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              className={INPUT}
            />
          </div>
          <div className="mb-8 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">Expiry</label>
              <input
                required
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                inputMode="numeric"
                className={INPUT}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">CVV</label>
              <input
                required
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                inputMode="numeric"
                className={INPUT}
              />
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-900/20 px-4 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || cart.length === 0}
            className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Placing order…" : `Place order · $${totalPrice.toFixed(2)}`}
          </button>
        </form>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900">
      <div className="w-full bg-slate-900/80 px-4 py-3 backdrop-blur sm:px-6">
        <Header />
      </div>
      {children}
    </div>
  );
}
