"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import MenuProductCard from "@/components/MenuProductCard";
import type { StoreProduct } from "@/lib/store-products";

const CATEGORIES = [
  { id: "all", label: "All products" },
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

type Tab = "shop" | "sale";

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-stone-900">{title}</h2>
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

export default function ProductsPageClient({
  products,
}: {
  products: StoreProduct[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("shop");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc">(
    "default"
  );

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (activeTab === "sale") {
          return p.salePrice !== undefined && p.salePrice < p.price;
        }
        return activeCategory === "all" || p.category === activeCategory;
      })
      .filter(
        (p) =>
          !search.trim() ||
          p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
          p.nameFa.includes(search) ||
          p.categoryName.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const pa = a.salePrice ?? a.price;
        const pb = b.salePrice ?? b.price;
        if (sort === "price-asc") return pa - pb;
        if (sort === "price-desc") return pb - pa;
        return 0;
      });
  }, [products, activeCategory, activeTab, search, sort]);

  const deals = useMemo(
    () => products.filter((p) => p.salePrice !== undefined && p.salePrice < p.price),
    [products]
  );

  const showGrouped =
    activeTab === "shop" &&
    activeCategory === "all" &&
    !search.trim() &&
    sort === "default";

  const categorySections = useMemo(() => {
    if (!showGrouped) return [];
    return CATEGORIES.filter((c) => c.id !== "all")
      .map((cat) => ({
        ...cat,
        products: filtered.filter((p) => p.category === cat.id),
      }))
      .filter((s) => s.products.length > 0);
  }, [showGrouped, filtered]);

  return (
    <div className="landing-theme min-h-screen bg-[var(--shop-bg)] font-sans text-stone-900">
      <LandingHeader />

      <nav
        className="border-b border-stone-200 bg-white"
        aria-label="Shop sections"
      >
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 sm:px-6 lg:gap-8">
          {(
            [
              { id: "shop" as const, label: "All products" },
              { id: "sale" as const, label: "On sale" },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "sale") setActiveCategory("all");
                }}
                className={`shrink-0 border-b-2 py-4 text-sm font-semibold transition ${
                  active
                    ? "border-[var(--landing-accent)] text-[var(--landing-accent)]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          <Link
            href="/bakery"
            className="shrink-0 border-b-2 border-transparent py-4 text-sm font-semibold text-stone-500 transition hover:text-stone-800"
          >
            Fresh bread
          </Link>
        </div>
      </nav>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:gap-12 lg:py-10">
        {activeTab === "shop" && (
          <aside className="hidden w-48 shrink-0 lg:block">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">
              Shop by category
            </p>
            <nav className="flex flex-col gap-0.5">
              {deals.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("sale")}
                  className="rounded-lg px-3 py-2 text-left text-sm text-stone-600 transition hover:bg-white hover:text-[var(--landing-accent)]"
                >
                  On sale
                </button>
              )}
              {CATEGORIES.map((c) => {
                const active = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                      active
                        ? "bg-white font-semibold text-[var(--landing-accent)] shadow-sm ring-1 ring-stone-200"
                        : "text-stone-600 hover:bg-white hover:text-stone-900"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-semibold text-stone-900">Fresh from the oven</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">
                Order sangak, barbari, and more for pickup.
              </p>
              <Link
                href="/bakery"
                className="mt-3 inline-block text-xs font-semibold text-[var(--landing-accent)] hover:underline"
              >
                Order bread →
              </Link>
            </div>
          </aside>
        )}

        <main className="min-w-0 flex-1">
          <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                  {activeTab === "sale" ? "On sale" : "Shop groceries"}
                </h1>
                <p className="mt-1 text-sm text-stone-500">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                  {activeCategory !== "all" && activeTab === "shop" && (
                    <>
                      {" "}
                      in{" "}
                      <span className="font-medium text-stone-700">
                        {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="rounded-lg border border-stone-300 bg-[var(--shop-bg)] px-4 py-2.5 text-sm text-stone-700 outline-none focus:border-[var(--landing-accent)] focus:ring-2 focus:ring-[var(--landing-accent)]/15"
                  aria-label="Sort products"
                >
                  <option value="default">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {activeTab === "shop" && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:hidden">
              {CATEGORIES.map((c) => {
                const active = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-[var(--landing-accent)] text-white"
                        : "border border-stone-200 bg-white text-stone-600"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          )}

          {filtered.length > 0 ? (
            showGrouped ? (
              <div className="space-y-10">
                {deals.length > 0 && (
                  <section>
                    <SectionHeader title="Deals & savings" count={deals.length} />
                    <ProductGrid products={deals} />
                  </section>
                )}
                {categorySections.map((section) => (
                  <section key={section.id}>
                    <SectionHeader
                      title={section.label}
                      count={section.products.length}
                    />
                    <ProductGrid products={section.products} />
                  </section>
                ))}
              </div>
            ) : (
              <ProductGrid products={filtered} />
            )
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center">
              <p className="text-lg font-semibold text-stone-800">
                No products found
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Try another category or search term
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                  setActiveTab("shop");
                }}
                className="mt-5 rounded-lg bg-[var(--landing-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--landing-accent-hover)]"
              >
                Clear filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
