"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/CartContext";
import ModernProductCard from "@/components/ModernProductCard";
import type { StoreProduct } from "@/lib/store-products";

const LOGO =
  "https://scontent-lga3-3.cdninstagram.com/v/t51.2885-19/375395119_685724333076746_661067902813524629_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby43MTQuYzIifQ&_nc_ht=scontent-lga3-3.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2gGeJfJbKxw-gl6TXXPc0hIUMKnB-yQvaUS-LomBCTSWjDWG42X9PjBgZ_9xxIL6LRc&_nc_ohc=UQ22aCKdRlkQ7kNvwHY0AMB&_nc_gid=TuleJWpStn57Fm7tNXUZ4g&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Afxo_87JtCH3IFGF3j5ghUT31v6TWd3MJ-xiSX236uYcow&oe=69CF2CE9&_nc_sid=8b3546";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🛒" },
  { id: "dairy", label: "Dairy", emoji: "🧀" },
  { id: "bread", label: "Bread", emoji: "🍞" },
  { id: "rice", label: "Rice & Grains", emoji: "🌾" },
  { id: "spices", label: "Spices", emoji: "🌿" },
  { id: "canned", label: "Canned", emoji: "🥫" },
  { id: "pickles", label: "Pickles", emoji: "🥒" },
  { id: "sweets", label: "Sweets", emoji: "🍬" },
  { id: "drinks", label: "Beverages", emoji: "☕" },
  { id: "frozen", label: "Frozen", emoji: "❄️" },
];

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

export default function ProductsPageClient({
  products,
}: {
  products: StoreProduct[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc">(
    "default"
  );
  const { totalItems } = useCart();

  const filtered = useMemo(() => {
    return products
      .filter((p) => activeCategory === "all" || p.category === activeCategory)
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
  }, [products, activeCategory, search, sort]);

  const deals = useMemo(
    () => products.filter((p) => p.salePrice !== undefined && p.salePrice < p.price),
    [products]
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.07)_0%,_transparent_50%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-slate-700/80 bg-slate-900/90 backdrop-blur-md">
        <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-amber-500/30">
              <Image
                src={LOGO}
                alt="Gandom"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="hidden font-bold tracking-tight text-amber-100 sm:block">
              Gandom <span className="font-normal text-amber-200/70">Market</span>
            </span>
          </Link>

          <div className="relative min-w-0 flex-1">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
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
              className="w-full rounded-xl border border-slate-600/80 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-amber-50 outline-none placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <Link
            href="/checkout"
            className="relative flex shrink-0 items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-500/20"
          >
            <CartIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-900">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>

        <div className="relative border-t border-slate-800">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none sm:px-6">
            {CATEGORIES.map((c) => {
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.id)}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20"
                      : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-amber-100"
                  }`}
                >
                  <span>{c.emoji}</span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        {activeCategory === "all" && deals.length > 0 && (
          <section className="border-b border-slate-800/80 bg-slate-900/50 px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                This week&apos;s deals
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {deals.map((p) => (
                  <div
                    key={p.id}
                    className="flex w-36 shrink-0 flex-col rounded-xl border border-slate-700/80 bg-gradient-to-b from-slate-800 to-slate-900 p-3 shadow-lg"
                  >
                    <span className="text-3xl">{p.emoji}</span>
                    <p className="mt-2 text-xs font-semibold leading-tight text-white">
                      {p.nameEn}
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-amber-300">
                        ${p.salePrice!.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 line-through">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:gap-8">
          <aside className="hidden w-52 shrink-0 lg:block">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Departments
            </p>
            <nav className="flex flex-col gap-1">
              {CATEGORIES.map((c) => {
                const active = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-amber-500/15 font-semibold text-amber-200 ring-1 ring-amber-500/30"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    {c.label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </nav>

            <Link
              href="/bakery"
              className="mt-8 flex items-center justify-center rounded-xl border border-amber-500/30 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-amber-300 transition hover:border-amber-400 hover:bg-amber-500/10"
            >
              Order fresh bread →
            </Link>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Showing{" "}
                <span className="font-semibold text-amber-100">{filtered.length}</span>{" "}
                products
                {activeCategory !== "all" && (
                  <>
                    {" "}
                    in{" "}
                    <span className="font-semibold text-amber-100">
                      {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                    </span>
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="rounded-xl border border-slate-600/80 bg-slate-800/80 px-3 py-2 text-sm text-amber-50 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="default">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ModernProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 py-24 text-center">
                <p className="text-lg font-semibold text-amber-100/80">
                  No products found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another category or search term
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("all");
                  }}
                  className="mt-5 text-sm font-bold text-amber-400 hover:text-amber-300"
                >
                  Clear filters
                </button>
              </div>
            )}

            <div className="mt-10 text-center lg:hidden">
              <Link
                href="/bakery"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 px-5 py-2.5 text-sm font-bold text-amber-300"
              >
                Order fresh bread
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 px-4 py-8 text-center sm:px-6">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 px-6 py-3 text-sm font-bold text-amber-300 transition hover:border-amber-400 hover:text-amber-200"
          >
            <CartIcon className="h-4 w-4" />
            View cart &amp; checkout
          </Link>
        </div>
      </main>
    </div>
  );
}
