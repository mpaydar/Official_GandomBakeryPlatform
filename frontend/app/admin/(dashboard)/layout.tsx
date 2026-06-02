import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-api";
import AdminDashboardShell from "./AdminDashboardShell";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const denied = await requireAdmin();
  if (denied) {
    redirect("/admin/login");
  }

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
