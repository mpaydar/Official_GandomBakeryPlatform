"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BarcodeScannerPanel from "@/components/admin/BarcodeScannerPanel";
import type { CategoryRow, InventoryProductRow } from "@/lib/services/inventory";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";

const labelClass = "block text-xs font-medium uppercase tracking-wide text-zinc-500";

type AddMode = "manual" | "scanner";

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function stockBadge(product: InventoryProductRow) {
  if (!product.trackInventory) {
    return (
      <span className="rounded bg-sky-500/15 px-2 py-0.5 text-xs text-sky-400">
        unlimited
      </span>
    );
  }
  if (!product.inStock) {
    return (
      <span className="rounded bg-rose-500/15 px-2 py-0.5 text-xs text-rose-400">
        out of stock
      </span>
    );
  }
  if (product.stockQty <= 5) {
    return (
      <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
        low ({product.stockQty})
      </span>
    );
  }
  return (
    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
      {product.stockQty} in stock
    </span>
  );
}

const emptyForm = {
  nameEn: "",
  nameFa: "",
  categoryId: "",
  categoryName: "",
  barcode: "",
  price: "",
  cost: "0",
  unit: "",
  stockQty: "0",
  trackInventory: true,
  isActive: true,
  isOnSale: false,
  isBakeryItem: false,
};

export default function InventoryClient() {
  const [products, setProducts] = useState<InventoryProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [addMode, setAddMode] = useState<AddMode>("scanner");
  const [scanQty, setScanQty] = useState(1);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inventory", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load inventory");
        return;
      }
      setProducts((data.products ?? []) as InventoryProductRow[]);
      setCategories((data.categories ?? []) as CategoryRow[]);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameFa.includes(search.trim()) ||
        p.categoryName.toLowerCase().includes(q) ||
        (p.barcode?.includes(q) ?? false)
    );
  }, [products, search]);

  useEffect(() => {
    if (!highlightId) return;
    const timer = window.setTimeout(() => setHighlightId(null), 2500);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  const handleProductReceived = useCallback((product: InventoryProductRow) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx === -1) return [...prev, product];
      const next = [...prev];
      next[idx] = product;
      return next;
    });
    setHighlightId(product.id);
    setSaved(`Received stock: ${product.nameEn} (${product.stockQty} on hand)`);
    setError(null);
  }, []);

  function handleRegisterUnknown(payload: {
    barcode: string;
    nameEn: string;
    unit: string;
  }) {
    setAddMode("manual");
    setForm((f) => ({
      ...f,
      barcode: payload.barcode,
      nameEn: payload.nameEn,
      nameFa: payload.nameEn,
      unit: payload.unit || f.unit,
      stockQty: String(scanQty),
    }));
    setSaved("Complete the product details and save");
    setError(null);
  }

  const stats = useMemo(() => {
    const tracked = products.filter((p) => p.trackInventory);
    return {
      total: products.length,
      outOfStock: tracked.filter((p) => !p.inStock).length,
      lowStock: tracked.filter((p) => p.inStock && p.stockQty <= 5).length,
    };
  }, [products]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy("create");
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: form.nameEn,
          nameFa: form.nameFa,
          categoryId: useNewCategory ? undefined : form.categoryId,
          categoryName: useNewCategory ? form.categoryName : undefined,
          price: Number(form.price),
          cost: Number(form.cost),
          unit: form.unit,
          barcode: form.barcode.trim() || null,
          stockQty: Number(form.stockQty),
          trackInventory: form.trackInventory,
          isActive: form.isActive,
          isOnSale: form.isOnSale,
          isBakeryItem: form.isBakeryItem,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not add product");
        return;
      }
      setSaved("Product added to inventory");
      setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
      setUseNewCategory(false);
      setAddMode("scanner");
      await load();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function patchProduct(
    id: string,
    body: Record<string, unknown>,
    successMessage: string
  ) {
    setBusy(id);
    setError(null);
    setSaved(null);
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not update product");
        return;
      }
      setSaved(successMessage);
      setEditingId(null);
      await load();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function handleStockDelta(id: string, delta: number) {
    await patchProduct(id, { stockDelta: delta }, "Stock updated");
  }

  async function handleSetStock(id: string) {
    const qty = Math.trunc(Number(editStock));
    if (!Number.isFinite(qty) || qty < 0) {
      setError("Enter a valid stock quantity");
      return;
    }
    await patchProduct(id, { stockQty: qty }, "Stock quantity saved");
  }

  async function toggleActive(product: InventoryProductRow) {
    await patchProduct(
      product.id,
      { isActive: !product.isActive },
      product.isActive ? "Product hidden from shop" : "Product visible on shop"
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Inventory hub
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            Add products manually or scan barcodes to receive stock. Unknown scans can
            be registered with one click. Out-of-stock items lock on the website
            automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-600">
            {stats.total} products
          </span>
          <span className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
            {stats.outOfStock} out of stock
          </span>
          <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
            {stats.lowStock} low stock
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saved}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or barcode…"
              className="min-w-[200px] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 font-medium text-zinc-500">Product</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Barcode</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Category</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Price</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Stock</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Shop</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      Loading inventory…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      No products yet. Scan a barcode or add manually.
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 ${
                        highlightId === product.id ? "bg-amber-50/80 ring-1 ring-inset ring-amber-300" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">{product.nameEn}</p>
                        <p className="text-right text-xs text-zinc-400" dir="rtl">
                          {product.nameFa}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">{product.unit}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                        {product.barcode ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{product.categoryName}</td>
                      <td className="px-4 py-3 tabular-nums text-zinc-800">
                        {money(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {stockBadge(product)}
                          {product.trackInventory && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={busy === product.id}
                                onClick={() => void handleStockDelta(product.id, -1)}
                                className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-100 disabled:opacity-50"
                              >
                                −
                              </button>
                              <span className="min-w-[2rem] text-center tabular-nums text-zinc-800">
                                {product.stockQty}
                              </span>
                              <button
                                type="button"
                                disabled={busy === product.id}
                                onClick={() => void handleStockDelta(product.id, 1)}
                                className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-100 disabled:opacity-50"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                disabled={busy === product.id}
                                onClick={() => {
                                  setEditingId(product.id);
                                  setEditStock(String(product.stockQty));
                                }}
                                className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-100 disabled:opacity-50"
                              >
                                Set
                              </button>
                            </div>
                          )}
                          {editingId === product.id && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value)}
                                className="w-20 rounded border border-zinc-300 px-2 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => void handleSetStock(product.id)}
                                className="rounded bg-amber-500 px-2 py-1 text-xs font-medium text-white"
                              >
                                Save
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {product.isActive ? (
                          <span className="text-xs text-emerald-600">Visible</span>
                        ) : (
                          <span className="text-xs text-zinc-400">Hidden</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={busy === product.id}
                          onClick={() => void toggleActive(product)}
                          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                        >
                          {product.isActive ? "Hide" : "Show"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
            <button
              type="button"
              onClick={() => setAddMode("scanner")}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                addMode === "scanner"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Scanner
            </button>
            <button
              type="button"
              onClick={() => setAddMode("manual")}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                addMode === "manual"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Manual
            </button>
          </div>

          {addMode === "scanner" ? (
            <div className="mt-4">
              <BarcodeScannerPanel
                scanQty={scanQty}
                onScanQtyChange={setScanQty}
                onProductReceived={handleProductReceived}
                onRegisterUnknown={handleRegisterUnknown}
                disabled={!!busy}
              />
            </div>
          ) : (
            <>
              <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">
                Add product manually
              </h2>
              <form onSubmit={handleCreate} className="mt-4 space-y-3">
                <div>
                  <label className={labelClass}>Barcode</label>
                  <input
                    value={form.barcode}
                    onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                    placeholder="EAN / UPC"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>English name</label>
                  <input
                    required
                    value={form.nameEn}
                    onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                    className={inputClass}
                  />
                </div>
            <div>
              <label className={labelClass}>Persian name</label>
              <input
                required
                dir="rtl"
                value={form.nameFa}
                onChange={(e) => setForm((f) => ({ ...f, nameFa: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <label className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                <input
                  type="checkbox"
                  checked={useNewCategory}
                  onChange={(e) => setUseNewCategory(e.target.checked)}
                />
                Create new category
              </label>
              {useNewCategory ? (
                <input
                  required
                  value={form.categoryName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoryName: e.target.value }))
                  }
                  placeholder="e.g. Dairy"
                  className={inputClass}
                />
              ) : (
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Price</label>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Unit</label>
                <input
                  required
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  placeholder="500 g"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Starting stock</label>
              <input
                type="number"
                min={0}
                value={form.stockQty}
                onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={form.trackInventory}
                onChange={(e) =>
                  setForm((f) => ({ ...f, trackInventory: e.target.checked }))
                }
              />
              Track inventory (lock when out of stock)
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={form.isOnSale}
                onChange={(e) => setForm((f) => ({ ...f, isOnSale: e.target.checked }))}
              />
              On sale
            </label>
            <button
              type="submit"
              disabled={busy === "create"}
              className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {busy === "create" ? "Saving…" : "Add to inventory"}
            </button>
          </form>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
