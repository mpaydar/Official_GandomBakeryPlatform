import Link from "next/link";
import { getDashboardBakeryCounts } from "@/lib/services/bakery-orders";
import DailyCapacityCard from "../DailyCapacityCard";

export default async function AdminHomePage() {
  const { pendingBakery, confirmedBakery } = await getDashboardBakeryCounts();

  const linked = [
    {
      label: "Bakery — pending",
      value: pendingBakery,
      href: "/admin/bakery-orders?status=PENDING",
    },
    {
      label: "Bakery — confirmed",
      value: confirmedBakery,
      href: "/admin/bakery-orders?status=CONFIRMED",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <DailyCapacityCard />

      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Overview
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Quick counts from your database
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {linked.map((c) => (
          <li key={c.label}>
            <Link
              href={c.href}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-400/50 hover:bg-slate-50"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                {c.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                {c.value}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
