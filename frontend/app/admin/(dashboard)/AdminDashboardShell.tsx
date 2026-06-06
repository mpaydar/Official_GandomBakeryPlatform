"use client";

import Link from "next/link";
import {
  AdminNewOrderRibbon,
  AdminNotificationBell,
  AdminOrderNotificationsProvider,
} from "@/components/admin/AdminOrderNotifications";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bakery-orders", label: "Bakery orders" },
  { href: "/admin/receipts", label: "Receipts" },
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/shifts", label: "Shifts" },
];

export default function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminOrderNotificationsProvider>
      <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
        <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/90">
          <div className="border-b border-zinc-800 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Admin
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-amber-400">
                  Gandom
                </p>
              </div>
              <AdminNotificationBell />
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-zinc-800 p-3">
            <AdminLogoutButton />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col overflow-auto">
          <AdminNewOrderRibbon />
          <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
        </div>
      </div>
    </AdminOrderNotificationsProvider>
  );
}
