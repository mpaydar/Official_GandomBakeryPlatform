import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
        <p className="text-lg font-bold text-amber-100">Gandom Bakery &amp; Market</p>
        <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
          <Link href="/bakery" className="transition hover:text-amber-300">
            Bakery
          </Link>
          <Link href="/products" className="transition hover:text-amber-300">
            Products
          </Link>
          <Link href="/contact" className="transition hover:text-amber-300">
            Contact
          </Link>
          <Link href="/admin/login" className="transition hover:text-amber-300">
            Admin
          </Link>
        </nav>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Gandom. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
