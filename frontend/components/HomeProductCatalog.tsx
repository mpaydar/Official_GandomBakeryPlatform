"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MenuProductCard from "@/components/MenuProductCard";
import type { StoreProduct } from "@/lib/store-products";

const CATEGORIES = [
  { id: "dairy", label: "Dairy" },
  { id: "bread", label: "Bread" },
  { id: "rice", label: "Rice & Grains" },
  { id: "spices", label: "Spices" },
  { id: "canned", label: "Canned" },
  { id: "pickles", label: "Pickles" },
  { id: "sweets", label: "Sweets" },
  { id: "drinks", label: "Beverages" },
  { id: "frozen", label: "Frozen" },
];

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-stone-900">{title}</h3>
        {count !== undefined && (
          <p className="mt-0.5 text-xs text-stone-500">{count} items</p>
        )}
      </div>
      <div className="hidden flex-1 border-b border-stone-200 sm:block" />
    </div>
  );
}

function ProductGrid({ products }: { products: StoreProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <MenuProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

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

  const deals = useMemo(
    () => products.filter((p) => p.salePrice !== undefined && p.salePrice < p.price),
    [products]
  );

  const showGrouped = !search.trim();

  const categorySections = useMemo(() => {
    if (!showGrouped) return [];
    return CATEGORIES.map((cat) => ({
      ...cat,
      products: filtered.filter((p) => p.category === cat.id),
    })).filter((s) => s.products.length > 0);
  }, [showGrouped, filtered]);

  return (
    <section className="border-t border-stone-200 bg-[var(--shop-bg)] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
                Grocery &amp; pantry
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Shop our products
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                {products.length} items — add to cart and checkout when ready
              </p>
            </div>

            <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
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
                className="w-full rounded-lg border border-stone-300 bg-[var(--shop-bg)] py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[var(--landing-accent)] focus:ring-2 focus:ring-[var(--landing-accent)]/15"
              />
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-8">
            {showGrouped ? (
              <div className="space-y-10">
                {deals.length > 0 && (
                  <div>
                    <SectionHeader title="Deals & savings" count={deals.length} />
                    <ProductGrid products={deals} />
                  </div>
                )}
                {categorySections.map((section) => (
                  <div key={section.id}>
                    <SectionHeader
                      title={section.label}
                      count={section.products.length}
                    />
                    <ProductGrid products={section.products} />
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid products={filtered} />
            )}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center">
            <p className="text-lg font-semibold text-stone-800">
              No products match your search
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 rounded-lg bg-[var(--landing-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--landing-accent-hover)]"
            >
              Clear search
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--landing-accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--landing-accent-hover)]"
          >
            Browse all products
          </Link>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-[var(--landing-accent)]"
          >
            View cart &amp; checkout →
          </Link>
        </div>
      </div>
    </section>
  );
}
