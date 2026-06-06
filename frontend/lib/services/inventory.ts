import { Prisma } from "../../generated/prisma/client";
import { normalizeBarcode } from "@/lib/barcode";
import { prisma } from "@/lib/prisma";

export type InventoryProductRow = {
  id: string;
  nameEn: string;
  nameFa: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cost: number;
  unit: string;
  barcode: string | null;
  isBakeryItem: boolean;
  isActive: boolean;
  isOnSale: boolean;
  stockQty: number;
  trackInventory: boolean;
  inStock: boolean;
  updatedAt: string;
};

export type CategoryRow = {
  id: string;
  name: string;
};

function serializeProduct(
  row: Prisma.ProductGetPayload<{ include: { category: true } }>
): InventoryProductRow {
  const stockQty = row.stockQty;
  const inStock = !row.trackInventory || stockQty > 0;
  return {
    id: row.id,
    nameEn: row.nameEn,
    nameFa: row.nameFa,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    price: Number(row.price),
    cost: Number(row.cost),
    unit: row.unit,
    barcode: row.barcode,
    isBakeryItem: row.isBakeryItem,
    isActive: row.isActive,
    isOnSale: row.isOnSale,
    stockQty,
    trackInventory: row.trackInventory,
    inStock,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listInventoryProducts() {
  const rows = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { nameEn: "asc" }],
  });
  return rows.map(serializeProduct);
}

export type BarcodeSuggestion = {
  nameEn: string;
  brand: string | null;
  quantity: string | null;
  source: "openfoodfacts";
};

export type BarcodeLookupResult =
  | { found: true; product: InventoryProductRow }
  | { found: false; barcode: string; suggestion: BarcodeSuggestion | null };

export async function lookupProductByBarcode(
  rawBarcode: string
): Promise<{ ok: true; result: BarcodeLookupResult } | { ok: false; error: string }> {
  const barcode = normalizeBarcode(rawBarcode);
  if (!barcode) {
    return { ok: false, error: "Invalid barcode" };
  }

  const product = await prisma.product.findUnique({
    where: { barcode },
    include: { category: true },
  });

  if (product) {
    return { ok: true, result: { found: true, product: serializeProduct(product) } };
  }

  const suggestion = await fetchBarcodeSuggestion(barcode);
  return { ok: true, result: { found: false, barcode, suggestion } };
}

async function fetchBarcodeSuggestion(
  barcode: string
): Promise<BarcodeSuggestion | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,brands,quantity`,
      { signal: controller.signal, next: { revalidate: 86400 } }
    );
    clearTimeout(timer);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      status?: number;
      product?: {
        product_name?: string;
        brands?: string;
        quantity?: string;
      };
    };
    if (data.status !== 1 || !data.product?.product_name) return null;

    return {
      nameEn: data.product.product_name.trim(),
      brand: data.product.brands?.split(",")[0]?.trim() || null,
      quantity: data.product.quantity?.trim() || null,
      source: "openfoodfacts",
    };
  } catch {
    return null;
  }
}

export async function receiveStockByBarcode(
  rawBarcode: string,
  quantity: unknown = 1
) {
  const barcode = normalizeBarcode(rawBarcode);
  if (!barcode) {
    return { ok: false as const, error: "Invalid barcode" };
  }

  const qty = Math.trunc(Number(quantity));
  if (!Number.isFinite(qty) || qty < 1) {
    return { ok: false as const, error: "Invalid quantity" };
  }

  const product = await prisma.product.findUnique({
    where: { barcode },
    include: { category: true },
  });
  if (!product) {
    return { ok: false as const, error: "Product not found", barcode };
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { stockQty: { increment: qty } },
    include: { category: true },
  });

  return {
    ok: true as const,
    product: serializeProduct(updated),
    received: qty,
    barcode,
  };
}

export async function listCategories() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return rows.map((row) => ({ id: row.id, name: row.name }));
}

export async function createCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Category name is required" };
  }

  const existing = await prisma.category.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) {
    return { ok: true as const, category: { id: existing.id, name: existing.name } };
  }

  const category = await prisma.category.create({ data: { name: trimmed } });
  return { ok: true as const, category: { id: category.id, name: category.name } };
}

function parseMoney(value: unknown, field: string) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return { ok: false as const, error: `Invalid ${field}` };
  }
  return { ok: true as const, value: num };
}

export async function createInventoryProduct(input: {
  nameEn: string;
  nameFa: string;
  categoryId?: string;
  categoryName?: string;
  price: unknown;
  cost?: unknown;
  unit: string;
  barcode?: string | null;
  isBakeryItem?: boolean;
  isActive?: boolean;
  isOnSale?: boolean;
  stockQty?: unknown;
  trackInventory?: boolean;
}) {
  const nameEn = input.nameEn.trim();
  const nameFa = input.nameFa.trim();
  const unit = input.unit.trim();
  if (!nameEn || !nameFa || !unit) {
    return { ok: false as const, error: "Name (EN/FA) and unit are required" };
  }

  const priceResult = parseMoney(input.price, "price");
  if (!priceResult.ok) return priceResult;
  const costResult = parseMoney(input.cost ?? 0, "cost");
  if (!costResult.ok) return costResult;

  let categoryId = input.categoryId?.trim();
  if (!categoryId && input.categoryName?.trim()) {
    const cat = await createCategory(input.categoryName);
    if (!cat.ok) return cat;
    categoryId = cat.category.id;
  }
  if (!categoryId) {
    return { ok: false as const, error: "Category is required" };
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return { ok: false as const, error: "Category not found" };
  }

  const stockQtyRaw =
    input.stockQty != null ? Math.trunc(Number(input.stockQty)) : 0;
  const stockQty = Number.isFinite(stockQtyRaw) ? Math.max(0, stockQtyRaw) : 0;

  const barcode = input.barcode?.trim()
    ? normalizeBarcode(input.barcode.trim())
    : null;
  if (input.barcode?.trim() && !barcode) {
    return { ok: false as const, error: "Invalid barcode format" };
  }
  if (barcode) {
    const taken = await prisma.product.findUnique({ where: { barcode } });
    if (taken) {
      return { ok: false as const, error: "Barcode already assigned to another product" };
    }
  }

  const product = await prisma.product.create({
    data: {
      nameEn,
      nameFa,
      categoryId,
      price: priceResult.value,
      cost: costResult.value,
      unit,
      barcode,
      isBakeryItem: !!input.isBakeryItem,
      isActive: input.isActive !== false,
      isOnSale: !!input.isOnSale,
      stockQty,
      trackInventory: input.trackInventory !== false,
    },
    include: { category: true },
  });

  return { ok: true as const, product: serializeProduct(product) };
}

export async function updateInventoryProduct(
  id: string,
  input: {
    nameEn?: string;
    nameFa?: string;
    categoryId?: string;
    price?: unknown;
    cost?: unknown;
    unit?: string;
    barcode?: string | null;
    isBakeryItem?: boolean;
    isActive?: boolean;
    isOnSale?: boolean;
    stockQty?: unknown;
    trackInventory?: boolean;
  }
) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false as const, error: "Product not found" };
  }

  const data: Prisma.ProductUpdateInput = {};

  if (input.nameEn !== undefined) {
    const nameEn = input.nameEn.trim();
    if (!nameEn) return { ok: false as const, error: "English name is required" };
    data.nameEn = nameEn;
  }
  if (input.nameFa !== undefined) {
    const nameFa = input.nameFa.trim();
    if (!nameFa) return { ok: false as const, error: "Persian name is required" };
    data.nameFa = nameFa;
  }
  if (input.unit !== undefined) {
    const unit = input.unit.trim();
    if (!unit) return { ok: false as const, error: "Unit is required" };
    data.unit = unit;
  }
  if (input.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) return { ok: false as const, error: "Category not found" };
    data.category = { connect: { id: input.categoryId } };
  }
  if (input.price !== undefined) {
    const priceResult = parseMoney(input.price, "price");
    if (!priceResult.ok) return priceResult;
    data.price = priceResult.value;
  }
  if (input.cost !== undefined) {
    const costResult = parseMoney(input.cost, "cost");
    if (!costResult.ok) return costResult;
    data.cost = costResult.value;
  }
  if (input.barcode !== undefined) {
    const barcode = input.barcode?.trim()
      ? normalizeBarcode(input.barcode.trim())
      : null;
    if (input.barcode?.trim() && !barcode) {
      return { ok: false as const, error: "Invalid barcode format" };
    }
    if (barcode && barcode !== existing.barcode) {
      const taken = await prisma.product.findUnique({ where: { barcode } });
      if (taken && taken.id !== id) {
        return { ok: false as const, error: "Barcode already assigned to another product" };
      }
    }
    data.barcode = barcode;
  }
  if (input.isBakeryItem !== undefined) data.isBakeryItem = input.isBakeryItem;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.isOnSale !== undefined) data.isOnSale = input.isOnSale;
  if (input.trackInventory !== undefined) data.trackInventory = input.trackInventory;
  if (input.stockQty !== undefined) {
    const stockQty = Math.trunc(Number(input.stockQty));
    if (!Number.isFinite(stockQty) || stockQty < 0) {
      return { ok: false as const, error: "Invalid stock quantity" };
    }
    data.stockQty = stockQty;
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });

  return { ok: true as const, product: serializeProduct(product) };
}

export async function adjustProductStock(id: string, delta: unknown) {
  const change = Math.trunc(Number(delta));
  if (!Number.isFinite(change) || change === 0) {
    return { ok: false as const, error: "Invalid stock adjustment" };
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return { ok: false as const, error: "Product not found" };
  }

  const nextQty = product.stockQty + change;
  if (nextQty < 0) {
    return {
      ok: false as const,
      error: `Cannot reduce below zero (current: ${product.stockQty})`,
    };
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { stockQty: nextQty },
    include: { category: true },
  });

  return { ok: true as const, product: serializeProduct(updated) };
}

type CartStockItem = {
  itemType: string;
  itemName?: string | null;
  quantity: number;
};

/** Validate cart lines and decrement stock atomically inside an existing transaction. */
export async function reserveInventoryForOrder(
  tx: Prisma.TransactionClient,
  items: CartStockItem[]
) {
  const grouped = new Map<string, { quantity: number; itemName: string | null }>();
  for (const item of items) {
    const key = item.itemType.trim().toLowerCase();
    if (!key) continue;
    const prev = grouped.get(key);
    if (prev) {
      prev.quantity += item.quantity;
    } else {
      grouped.set(key, {
        quantity: item.quantity,
        itemName: item.itemName?.trim() || null,
      });
    }
  }

  if (grouped.size === 0) return { ok: true as const };

  const productIds = [...grouped.keys()];
  const products = await tx.product.findMany({
    where: { id: { in: productIds }, trackInventory: true },
    select: {
      id: true,
      nameEn: true,
      stockQty: true,
      trackInventory: true,
      isActive: true,
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));

  for (const [productId, line] of grouped) {
    const product = byId.get(productId);
    if (!product) continue;

    if (!product.isActive) {
      return {
        ok: false as const,
        error: `${line.itemName || product.nameEn} is no longer available`,
      };
    }

    if (product.stockQty < line.quantity) {
      const label = line.itemName || product.nameEn;
      if (product.stockQty <= 0) {
        return {
          ok: false as const,
          error: `${label} is out of stock`,
        };
      }
      return {
        ok: false as const,
        error: `Only ${product.stockQty} of ${label} available`,
      };
    }
  }

  for (const [productId, line] of grouped) {
    const product = byId.get(productId);
    if (!product) continue;

    await tx.product.update({
      where: { id: productId },
      data: { stockQty: { decrement: line.quantity } },
    });
  }

  return { ok: true as const };
}

/** Restore stock when an order is cancelled or rejected (inventory-tracked products only). */
export async function releaseInventoryForOrder(
  tx: Prisma.TransactionClient,
  items: CartStockItem[]
) {
  const grouped = new Map<string, number>();
  for (const item of items) {
    const key = item.itemType.trim().toLowerCase();
    if (!key) continue;
    grouped.set(key, (grouped.get(key) ?? 0) + item.quantity);
  }

  for (const [productId, quantity] of grouped) {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { trackInventory: true },
    });
    if (!product?.trackInventory) continue;

    await tx.product.update({
      where: { id: productId },
      data: { stockQty: { increment: quantity } },
    });
  }
}
