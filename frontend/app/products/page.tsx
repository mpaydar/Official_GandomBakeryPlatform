import { getStoreProducts } from "@/lib/store-products";
import ProductsPageClient from "./ProductsPageClient";

export default async function ProductsPage() {
  const products = await getStoreProducts();
  return <ProductsPageClient products={products} />;
}
