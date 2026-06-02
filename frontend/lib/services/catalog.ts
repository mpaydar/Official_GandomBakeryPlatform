import { prisma } from "@/lib/prisma";

export async function listCatalogProducts() {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { nameEn: "asc" }],
  });
}
