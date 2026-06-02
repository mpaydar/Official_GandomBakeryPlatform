import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-api";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bakery-orders", label: "Bakery orders" },
  { href: "/admin/catalog", label: "Catalog" },
];

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const denied = await requireAdmin();
  if (denied) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/90">
        <div className="border-b border-zinc-800 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Admin
          </p>
          <p className="mt-0.5 text-sm font-semibold text-amber-400">Gandom</p>
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
      <main className="min-w-0 flex-1 overflow-auto p-6 md:p-10">{children}</main>
    </div>
  );
}
