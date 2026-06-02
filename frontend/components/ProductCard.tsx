"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import type { StoreProduct } from "@/lib/store-products";

export default function ProductCard({
  product: p,
  variant = "default",
}: {
  product: StoreProduct;
  variant?: "default" | "boutique";
}) {
  const boutique = variant === "boutique";
  const { addItem } = useCart();
  const [qty, setQty] = useState(0);

  const displayPrice = p.salePrice ?? p.price;
  const hasDiscount = p.salePrice !== undefined && p.salePrice < p.price;
  const isOnSale = hasDiscount || !!p.onSale;

  function handleAdd() {
    addItem({
      itemType: p.id,
      name: p.nameEn,
      quantity: 1,
      unitPrice: displayPrice,
    });
    setQty((q) => q + 1);
  }

  function handleInc() {
    addItem({
      itemType: p.id,
      name: p.nameEn,
      quantity: 1,
      unitPrice: displayPrice,
    });
    setQty((q) => q + 1);
  }

  function handleDec() {
    if (qty === 1) {
      setQty(0);
      return;
    }
    setQty((q) => q - 1);
  }

  return (
    <div
      className={
        boutique
          ? "group flex flex-col border border-stone-200 bg-white transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
          : "group flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"
      }
    >
      <div
        className={
          boutique
            ? "relative flex h-36 items-center justify-center bg-[#f7f4ef]"
            : "relative flex h-40 items-center justify-center rounded-t-lg bg-gray-50 dark:bg-zinc-800"
        }
      >
        {isOnSale && (
          <div
            className={
              boutique
                ? "absolute left-3 top-3 bg-[var(--landing-accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                : "absolute left-2 top-2 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow"
            }
          >
            Sale
          </div>
        )}
        <span className={boutique ? "text-4xl opacity-90" : "text-5xl opacity-80"}>
          {p.emoji}
        </span>
      </div>

      <div className={boutique ? "flex flex-1 flex-col px-4 py-4" : "flex flex-1 flex-col px-3 py-3"}>
        <p
          className={
            boutique
              ? "text-right text-[11px] text-stone-400"
              : "text-right text-[11px] text-gray-400"
          }
          dir="rtl"
        >
          {p.nameFa}
        </p>
        <h3
          className={
            boutique
              ? "mt-1 font-serif text-base leading-snug text-stone-900 group-hover:text-[var(--landing-accent)]"
              : "mt-0.5 text-sm font-semibold leading-snug text-gray-800 group-hover:text-green-700 dark:text-zinc-100 dark:group-hover:text-green-400"
          }
        >
          {p.nameEn}
        </h3>
        <p className={boutique ? "mt-0.5 text-xs text-stone-400" : "mt-0.5 text-xs text-gray-400"}>
          {p.unit}
        </p>

        <div className="mt-2">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2">
              <span
                className={
                  boutique
                    ? "text-lg font-medium text-[var(--landing-accent)]"
                    : "text-xl font-bold text-red-600"
                }
              >
                ${displayPrice.toFixed(2)}
              </span>
              <span className="text-sm text-stone-400 line-through">
                ${p.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span
              className={
                boutique
                  ? "text-lg font-medium text-stone-900"
                  : "text-xl font-bold text-gray-900 dark:text-zinc-50"
              }
            >
              ${displayPrice.toFixed(2)}
            </span>
          )}
          {!boutique && <p className="text-[11px] text-gray-400">per {p.unit}</p>}
        </div>

        <div className="mt-3">
          {qty === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className={
                boutique
                  ? "flex w-full items-center justify-center py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--landing-accent)] transition hover:bg-[var(--landing-accent)] hover:text-white"
                  : "flex w-full items-center justify-center gap-1.5 rounded-md border border-green-600 bg-white py-2 text-sm font-semibold text-green-700 transition hover:bg-green-600 hover:text-white active:scale-95 dark:bg-zinc-900 dark:hover:bg-green-600 dark:hover:text-white"
              }
            >
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add to cart
            </button>
          ) : (
            <div
              className={
                boutique
                  ? "flex items-center justify-between border border-stone-200"
                  : "flex items-center justify-between overflow-hidden rounded-md border border-green-600"
              }
            >
              <button
                type="button"
                onClick={handleDec}
                className={
                  boutique
                    ? "flex h-9 w-10 items-center justify-center text-lg text-stone-600 hover:bg-stone-50"
                    : "flex h-9 w-10 items-center justify-center text-lg font-bold text-green-700 transition hover:bg-green-50 dark:text-green-400 dark:hover:bg-zinc-800"
                }
              >
                −
              </button>
              <span
                className={
                  boutique
                    ? "flex-1 text-center text-sm font-medium text-stone-800"
                    : "flex-1 text-center text-sm font-bold text-green-700 dark:text-green-400"
                }
              >
                {qty}
              </span>
              <button
                type="button"
                onClick={handleInc}
                className={
                  boutique
                    ? "flex h-9 w-10 items-center justify-center text-lg text-stone-600 hover:bg-stone-50"
                    : "flex h-9 w-10 items-center justify-center text-lg font-bold text-green-700 transition hover:bg-green-50 dark:text-green-400 dark:hover:bg-zinc-800"
                }
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
