"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function Header() {
  const { totalItems } = useCart();

  return (
    <div className="flex flex-1 flex-row items-center gap-3 rounded-xl bg-white/95 px-3 py-2.5 shadow-sm sm:gap-4 sm:px-5 sm:py-3 dark:bg-zinc-900/95">
      <ul className="flex min-w-0 flex-1 flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-7 md:gap-x-9">
        <li className="text-base font-bold tracking-tight text-zinc-800 hover:text-blue-600 sm:text-lg dark:text-zinc-100 dark:hover:text-blue-400">
          <Link className="block py-0.5" href="/">Home</Link>
        </li>
        <li className="text-base font-bold tracking-tight text-zinc-800 hover:text-blue-600 sm:text-lg dark:text-zinc-100 dark:hover:text-blue-400">
          <Link className="block py-0.5" href="/products">Products</Link>
        </li>
        <li className="text-base font-bold tracking-tight text-amber-800 hover:text-amber-600 sm:text-lg dark:text-amber-300 dark:hover:text-amber-200">
          <Link className="block py-0.5" href="/bakery">Bakery</Link>
        </li>
        <li className="text-base font-bold tracking-tight text-zinc-800 hover:text-blue-600 sm:text-lg dark:text-zinc-100 dark:hover:text-blue-400">
          <Link className="block py-0.5" href="/contact">Contact</Link>
        </li>
        <li className="text-base font-bold tracking-tight text-zinc-800 hover:text-blue-600 sm:text-lg dark:text-zinc-100 dark:hover:text-blue-400">
          <Link className="block py-0.5" href="/login">Login</Link>
        </li>
        <li className="text-base font-bold tracking-tight text-zinc-800 hover:text-blue-600 sm:text-lg dark:text-zinc-100 dark:hover:text-blue-400">
          <Link className="block py-0.5" href="/about">About</Link>
        </li>
      </ul>

      {/* Cart icon with live badge */}
      <Link
        href="/checkout"
        className="relative flex shrink-0 items-center justify-center rounded-lg p-1.5 text-zinc-900 transition hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
        title="Cart"
      >
        <CartIcon className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11" />
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-900">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </Link>
    </div>
  );
}
