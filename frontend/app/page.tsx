import Link from "next/link";
import HomeProductCatalog from "@/components/HomeProductCatalog";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import StoreAbout from "@/components/landing/StoreAbout";
import StoreHero from "@/components/landing/StoreHero";
import StoreSidebar from "@/components/landing/StoreSidebar";
import { getStoreProducts } from "@/lib/store-products";

export default async function Home() {
  const products = await getStoreProducts();

  return (
    <div className="landing-theme min-h-screen bg-[#faf8f5] font-sans text-stone-900">
      <LandingHeader />

      <nav
        className="mx-auto max-w-6xl px-4 pt-6 text-[13px] text-stone-500 sm:px-6"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-[var(--landing-accent)]">
              Home
            </Link>
          </li>
          <li aria-hidden className="text-stone-300">
            /
          </li>
          <li className="font-medium text-stone-800">Gandom Bakery &amp; Market</li>
        </ol>
      </nav>

      <StoreHero />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <header className="max-w-3xl border-b border-stone-200 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
            Paterson, New Jersey
          </p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
            Gandom Bakery &amp; Market
          </h1>
          <p className="mt-3 text-lg text-stone-600">
            Traditional Persian bread, coffee &amp; groceries
          </p>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-16">
          <StoreSidebar />
          <StoreAbout />
        </div>
      </div>

      <HomeProductCatalog products={products} />
      <LandingFooter />
    </div>
  );
}
