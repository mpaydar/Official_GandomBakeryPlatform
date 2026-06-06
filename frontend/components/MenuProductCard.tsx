"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import type { StoreProduct } from "@/lib/store-products";

export default function MenuProductCard({ product: p }: { product: StoreProduct }) {
  const { addItem, cart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const displayPrice = p.salePrice ?? p.price;
  const hasDiscount = p.salePrice !== undefined && p.salePrice < p.price;
  const isOnSale = hasDiscount || !!p.onSale;
  const locked = !p.inStock;

  const inCart = cart.find((i) => i.itemType === p.id)?.quantity ?? 0;
  const maxQty =
    p.trackInventory && p.stockQty != null
      ? Math.max(0, p.stockQty - inCart)
      : null;

  function handleAdd() {
    if (locked) return;
    const addQty = maxQty != null ? Math.min(qty, maxQty) : qty;
    if (addQty < 1) return;
    addItem({
      itemType: p.id,
      name: p.nameEn,
      quantity: addQty,
      unitPrice: displayPrice,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
        locked ? "border-stone-200 opacity-75" : "border-stone-200"
      }`}
    >
      <div className="relative flex aspect-square items-center justify-center bg-[#f7f4ef]">
        <span className={`text-5xl sm:text-6xl ${locked ? "grayscale" : ""}`}>
          {p.emoji}
        </span>
        {locked && (
          <span className="absolute inset-0 flex items-center justify-center bg-stone-900/40">
            <span className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              Out of stock
            </span>
          </span>
        )}
        {isOnSale && !locked && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Sale
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-stone-600 shadow-sm">
          {p.categoryName}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-right text-[11px] text-stone-400" dir="rtl">
          {p.nameFa}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-stone-900">
          {p.nameEn}
        </h3>
        <p className="mt-0.5 text-xs text-stone-400">{p.unit}</p>
        {p.trackInventory && p.stockQty != null && !locked && p.stockQty <= 5 && (
          <p className="mt-1 text-xs font-medium text-amber-700">
            Only {p.stockQty} left
          </p>
        )}

        <div className="mt-2">
          {hasDiscount ? (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-lg font-bold text-[var(--landing-accent)]">
                ${displayPrice.toFixed(2)}
              </span>
              <span className="text-sm text-stone-400 line-through">
                ${p.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-stone-900">
              ${displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        {!locked && (
          <div className="mt-3 flex items-center rounded-lg border border-stone-200">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-lg text-stone-600 transition hover:bg-stone-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="flex-1 text-center text-sm font-semibold text-stone-800">
              {qty}
            </span>
            <button
              type="button"
              onClick={() =>
                setQty((q) =>
                  maxQty != null ? Math.min(maxQty + inCart, q + 1) : q + 1
                )
              }
              disabled={maxQty != null && qty >= maxQty + inCart}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-lg text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={locked || (maxQty != null && maxQty < 1)}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
            locked
              ? "bg-stone-300 text-stone-600"
              : added
                ? "bg-green-600 text-white"
                : "bg-[var(--landing-accent)] text-white hover:bg-[var(--landing-accent-hover)]"
          }`}
        >
          {locked ? (
            "Unavailable"
          ) : added ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
                aria-hidden
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
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
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
    </article>
  );
}
