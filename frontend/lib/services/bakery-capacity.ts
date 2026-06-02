import { prisma } from "@/lib/prisma";
import {
  formatBusinessDate,
  todayBusinessDate,
} from "@/lib/bakery-date";

async function usedLoavesForDate(businessDate: Date): Promise<number> {
  const day = formatBusinessDate(businessDate);
  const rows = await prisma.$queryRaw<[{ used: number | bigint }]>`
    SELECT COALESCE(SUM(quantity), 0)::int AS used
    FROM "BakeryOrder"
    WHERE status IN ('PENDING', 'CONFIRMED')
      AND (timezone('America/New_York', "createdAt"))::date = ${day}::date
  `;
  return Number(rows[0]?.used ?? 0);
}

export async function getBakeryCapacity() {
  const businessDate = todayBusinessDate();
  const row = await prisma.bakeryDailyCapacity.findUnique({
    where: { businessDate },
  });
  const usedLoaves = await usedLoavesForDate(businessDate);
  return {
    businessDate: formatBusinessDate(businessDate),
    maxLoaves: row?.maxLoaves ?? 0,
    usedLoaves,
  };
}

export async function setBakeryCapacity(maxLoaves: number) {
  const businessDate = todayBusinessDate();
  const row = await prisma.bakeryDailyCapacity.upsert({
    where: { businessDate },
    create: { businessDate, maxLoaves },
    update: { maxLoaves },
  });
  const usedLoaves = await usedLoavesForDate(businessDate);
  return {
    businessDate: formatBusinessDate(businessDate),
    maxLoaves: row.maxLoaves,
    usedLoaves,
  };
}
