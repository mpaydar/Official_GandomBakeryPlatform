"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import type { StoreProduct } from "@/lib/store-products";

const BADGE_STYLES = [
  "bg-amber-500 text-amber-950",
  "bg-orange-500 text-orange-950",
  "bg-emerald-500 text-emerald-950",
  "bg-rose-500 text-rose-950",
];

const RING_STYLES = [
  "hover:ring-amber-400/60",
  "hover:ring-orange-400/60",
  "hover:ring-emerald-400/60",
  "hover:ring-rose-400/60",
];

function styleIndex(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return hash % BADGE_STYLES.length;
}

export default function ModernProductCard({ product: p }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const displayPrice = p.salePrice ?? p.price;
  const hasDiscount = p.salePrice !== undefined && p.salePrice < p.price;
  const isOnSale = hasDiscount || !!p.onSale;
  const idx = styleIndex(p.id);

  function handleAdd() {
    addItem({
      itemType: p.id,
      name: p.nameEn,
      quantity: qty,
      unitPrice: displayPrice,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl ring-2 ring-transparent transition-all duration-300 ${RING_STYLES[idx]}`}
    >
      <div className="relative flex h-40 w-full shrink-0 items-center justify-center sm:h-44">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-amber-950/30" />
        <span className="relative z-10 text-6xl drop-shadow-lg">{p.emoji}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        {isOnSale && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Sale
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span
            className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-bold ${BADGE_STYLES[idx]}`}
          >
            {p.categoryName}
          </span>
          <span className="text-right text-sm font-bold text-amber-300">
            {hasDiscount ? (
              <>
                <span className="text-amber-300">${displayPrice.toFixed(2)}</span>
                <span className="ml-1 text-xs text-slate-500 line-through">
                  ${p.price.toFixed(2)}
                </span>
              </>
            ) : (
              <>${displayPrice.toFixed(2)}</>
            )}
            <span className="block text-[10px] font-normal text-slate-500">
              per {p.unit}
            </span>
          </span>
        </div>

        <p className="text-right text-[11px] text-slate-500" dir="rtl">
          {p.nameFa}
        </p>
        <h3 className="text-lg font-bold leading-snug text-white">{p.nameEn}</h3>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 text-xl font-bold text-amber-300 transition hover:border-amber-400 hover:text-amber-200 active:scale-95"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="flex-1 text-center text-2xl font-bold text-amber-100">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 text-xl font-bold text-amber-300 transition hover:border-amber-400 hover:text-amber-200 active:scale-95"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-md transition-all duration-200 active:scale-95 ${
            added
              ? "bg-green-500 text-white"
              : "bg-amber-500 text-slate-900 hover:bg-amber-400"
          }`}
        >
          {added ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
