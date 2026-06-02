"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { StoreProduct } from "@/lib/store-products";
import ModernProductCard from "@/components/ModernProductCard";

export default function HomeProductCatalog({
  products,
}: {
  products: StoreProduct[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameFa.includes(search.trim()) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-950/25 to-slate-900 py-14 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.08)_0%,_transparent_65%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-amber-100 sm:text-4xl">
            Shop our products
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {products.length} items available — add to your cart, then checkout when
            ready
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-md">
          <svg
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-slate-600/80 bg-slate-900/70 py-3 pl-11 pr-4 text-sm text-amber-50 shadow-inner backdrop-blur outline-none transition placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ModernProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center py-16 text-center">
            <p className="text-lg font-semibold text-amber-100/80">
              No products match your search
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 text-sm font-bold text-amber-400 transition hover:text-amber-300"
            >
              Clear search
            </button>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 px-6 py-3 text-sm font-bold text-amber-300 transition hover:border-amber-400 hover:text-amber-200"
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
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            View cart &amp; checkout
          </Link>
        </div>
      </div>
    </section>
  );
}
