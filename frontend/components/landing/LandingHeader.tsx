"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

const LOGO =
  "https://scontent-lga3-3.cdninstagram.com/v/t51.2885-19/375395119_685724333076746_661067902813524629_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby43MTQuYzIifQ&_nc_ht=scontent-lga3-3.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2gGeJfJbKxw-gl6TXXPc0hIUMKnB-yQvaUS-LomBCTSWjDWG42X9PjBgZ_9xxIL6LRc&_nc_ohc=UQ22aCKdRlkQ7kNvwHY0AMB&_nc_gid=TuleJWpStn57Fm7tNXUZ4g&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Afxo_87JtCH3IFGF3j5ghUT31v6TWd3MJ-xiSX236uYcow&oe=69CF2CE9&_nc_sid=8b3546";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/bakery", label: "Bakery" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export default function LandingHeader() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-stone-200">
            <Image
              src={LOGO}
              alt="Gandom Bakery"
              width={44}
              height={44}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="hidden font-serif text-lg tracking-tight text-stone-900 sm:block">
            Gandom
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium uppercase tracking-[0.12em] text-stone-600 transition hover:text-[var(--landing-accent)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/bakery"
            className="hidden rounded-sm bg-[var(--landing-accent)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--landing-accent-hover)] sm:inline-block"
          >
            Order bread
          </Link>
          <Link
            href="/checkout"
            className="relative flex h-10 w-10 items-center justify-center text-stone-700 transition hover:text-[var(--landing-accent)]"
            aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
          >
            <CartIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--landing-accent)] text-[9px] font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden"
        aria-label="Main mobile"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
