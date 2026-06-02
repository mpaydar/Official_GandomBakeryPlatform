import { listCatalogProducts } from "@/lib/services/catalog";

function money(d: { toString(): string }) {
  return `$${Number(d.toString()).toFixed(2)}`;
}

export default async function AdminCatalogPage() {
  const products = await listCatalogProducts();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Catalog
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {products.length} products from the database
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="px-4 py-3 font-medium text-zinc-400">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-400">FA</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Category</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Price</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Unit</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Flags</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-zinc-800/80 last:border-0 hover:bg-zinc-900/40"
              >
                <td className="px-4 py-3 font-medium text-zinc-200">
                  {p.nameEn}
                </td>
                <td className="px-4 py-3 text-right text-zinc-400" dir="rtl">
                  {p.nameFa}
                </td>
                <td className="px-4 py-3 text-zinc-400">{p.category.name}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-200">
                  {money(p.price)}
                </td>
                <td className="px-4 py-3 text-zinc-500">{p.unit}</td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-1">
                    {p.isActive ? (
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-400">
                        active
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-600/30 px-1.5 py-0.5 text-xs text-zinc-500">
                        off
                      </span>
                    )}
                    {p.isBakeryItem && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-400">
                        bakery
                      </span>
                    )}
                    {p.isOnSale && (
                      <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-xs text-rose-400">
                        sale
                      </span>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
