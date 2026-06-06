import { prisma } from "@/lib/prisma";

export type StoreProduct = {
  id: string;
  nameEn: string;
  nameFa: string;
  category: string;
  categoryName: string;
  price: number;
  salePrice?: number;
  unit: string;
  emoji: string;
  isBakeryItem: boolean;
  onSale?: boolean;
  stockQty: number | null;
  trackInventory: boolean;
  inStock: boolean;
};

const CATEGORY_EMOJI: Record<string, string> = {
  dairy: "🧀",
  bread: "🍞",
  rice: "🌾",
  spices: "🌿",
  canned: "🥫",
  pickles: "🥒",
  sweets: "🍬",
  drinks: "☕",
  frozen: "❄️",
};

function emojiForCategory(categoryName: string): string {
  const key = categoryName.toLowerCase();
  for (const [slug, emoji] of Object.entries(CATEGORY_EMOJI)) {
    if (key.includes(slug)) return emoji;
  }
  return "🛒";
}

function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Demo catalog used when the database has no active products yet. */
export const FALLBACK_PRODUCTS: StoreProduct[] = [
  { id: "p1", nameEn: "Feta Cheese", nameFa: "پنیر فتا", category: "dairy", categoryName: "Dairy", price: 6.99, salePrice: 4.99, unit: "500 g", emoji: "🧀", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p2", nameEn: "Kashk", nameFa: "کشک", category: "dairy", categoryName: "Dairy", price: 3.49, unit: "400 g", emoji: "🥛", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p3", nameEn: "Labneh", nameFa: "لبنه", category: "dairy", categoryName: "Dairy", price: 4.29, unit: "500 g", emoji: "🍶", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p4", nameEn: "Doogh", nameFa: "دوغ", category: "drinks", categoryName: "Beverages", price: 2.49, salePrice: 1.79, unit: "1 L", emoji: "🥤", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p5", nameEn: "Barbari Bread", nameFa: "نان بربری", category: "bread", categoryName: "Bread", price: 3.99, unit: "each", emoji: "🍞", isBakeryItem: true, stockQty: null, trackInventory: false, inStock: true },
  { id: "p6", nameEn: "Lavash", nameFa: "نان لواش", category: "bread", categoryName: "Bread", price: 2.99, unit: "pack", emoji: "🫓", isBakeryItem: true, stockQty: null, trackInventory: false, inStock: true },
  { id: "p7", nameEn: "Basmati Rice", nameFa: "برنج باسماتی", category: "rice", categoryName: "Rice & Grains", price: 14.99, salePrice: 11.99, unit: "5 kg", emoji: "🌾", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p8", nameEn: "Persian Rice", nameFa: "برنج ایرانی", category: "rice", categoryName: "Rice & Grains", price: 18.99, unit: "5 kg", emoji: "🍚", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p9", nameEn: "Green Lentils", nameFa: "عدس سبز", category: "rice", categoryName: "Rice & Grains", price: 3.29, unit: "1 kg", emoji: "🫘", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p10", nameEn: "Saffron", nameFa: "زعفران", category: "spices", categoryName: "Herbs & Spices", price: 12.99, salePrice: 9.99, unit: "1 g", emoji: "🌸", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p11", nameEn: "Sumac", nameFa: "سماق", category: "spices", categoryName: "Herbs & Spices", price: 3.99, unit: "200 g", emoji: "🌿", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p12", nameEn: "Turmeric", nameFa: "زردچوبه", category: "spices", categoryName: "Herbs & Spices", price: 2.99, unit: "200 g", emoji: "🟡", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p13", nameEn: "Dried Barberry", nameFa: "زرشک", category: "spices", categoryName: "Herbs & Spices", price: 5.49, unit: "200 g", emoji: "🍒", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p14", nameEn: "Dried Fenugreek", nameFa: "شنبلیله", category: "spices", categoryName: "Herbs & Spices", price: 2.49, unit: "100 g", emoji: "🌱", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p15", nameEn: "Ghormeh Sabzi Mix", nameFa: "قورمه سبزی", category: "canned", categoryName: "Canned Goods", price: 4.99, salePrice: 3.49, unit: "400 g", emoji: "🥫", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p16", nameEn: "Fesenjan Sauce", nameFa: "فسنجان", category: "canned", categoryName: "Canned Goods", price: 5.99, unit: "400 g", emoji: "🍯", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p17", nameEn: "Tomato Paste", nameFa: "رب گوجه", category: "canned", categoryName: "Canned Goods", price: 2.49, unit: "400 g", emoji: "🍅", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p18", nameEn: "Persian Pickles", nameFa: "ترشی مخلوط", category: "pickles", categoryName: "Pickles", price: 4.49, unit: "700 g", emoji: "🥒", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p19", nameEn: "Torshi Liteh", nameFa: "ترشی لیته", category: "pickles", categoryName: "Pickles", price: 5.99, salePrice: 4.49, unit: "700 g", emoji: "🫙", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p20", nameEn: "Halva", nameFa: "حلوا", category: "sweets", categoryName: "Sweets", price: 6.99, unit: "500 g", emoji: "🍯", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p21", nameEn: "Gaz Nougat", nameFa: "گز اصفهانی", category: "sweets", categoryName: "Sweets", price: 8.99, salePrice: 6.99, unit: "400 g", emoji: "🍬", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p22", nameEn: "Persian Cookies", nameFa: "شیرینی", category: "sweets", categoryName: "Sweets", price: 5.49, unit: "300 g", emoji: "🍪", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p23", nameEn: "Persian Black Tea", nameFa: "چای ایرانی", category: "drinks", categoryName: "Beverages", price: 7.99, unit: "500 g", emoji: "🍵", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p24", nameEn: "Rose Water", nameFa: "گلاب", category: "drinks", categoryName: "Beverages", price: 3.99, unit: "300 ml", emoji: "🌹", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p25", nameEn: "Frozen Herb Mix", nameFa: "سبزی پلو", category: "frozen", categoryName: "Frozen", price: 4.49, salePrice: 3.29, unit: "400 g", emoji: "🧊", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
  { id: "p26", nameEn: "Frozen Kutlet", nameFa: "کتلت", category: "frozen", categoryName: "Frozen", price: 7.99, unit: "500 g", emoji: "🥩", isBakeryItem: false, stockQty: null, trackInventory: false, inStock: true },
];

function fromDbRow(
  row: Awaited<ReturnType<typeof prisma.product.findMany>>[number] & {
    category: { name: string };
  }
): StoreProduct {
  const price = Number(row.price);
  const categoryName = row.category.name;
  const inStock = !row.trackInventory || row.stockQty > 0;
  return {
    id: row.id,
    nameEn: row.nameEn,
    nameFa: row.nameFa,
    category: categorySlug(categoryName),
    categoryName,
    price,
    salePrice: undefined,
    unit: row.unit,
    emoji: emojiForCategory(categoryName),
    isBakeryItem: row.isBakeryItem,
    onSale: row.isOnSale,
    stockQty: row.trackInventory ? row.stockQty : null,
    trackInventory: row.trackInventory,
    inStock: row.isActive && inStock,
  };
}

/** Active store products (supermarket items). Bakery bread is ordered via /bakery. */
export async function getStoreProducts(): Promise<StoreProduct[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true, isBakeryItem: false },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { nameEn: "asc" }],
    });
    if (rows.length > 0) {
      return rows.map(fromDbRow);
    }
  } catch {
    /* database unavailable — use fallback below */
  }
  return FALLBACK_PRODUCTS.filter((p) => !p.isBakeryItem);
}

/** All active products including bakery items — used for stock-aware checkout validation. */
export async function getActiveProductStockMap(): Promise<
  Map<
    string,
    { nameEn: string; stockQty: number | null; trackInventory: boolean; inStock: boolean }
  >
> {
  const map = new Map<
    string,
    { nameEn: string; stockQty: number | null; trackInventory: boolean; inStock: boolean }
  >();
  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nameEn: true,
        stockQty: true,
        trackInventory: true,
      },
    });
    for (const row of rows) {
      map.set(row.id, {
        nameEn: row.nameEn,
        stockQty: row.trackInventory ? row.stockQty : null,
        trackInventory: row.trackInventory,
        inStock: !row.trackInventory || row.stockQty > 0,
      });
    }
  } catch {
    /* ignore */
  }
  return map;
}
