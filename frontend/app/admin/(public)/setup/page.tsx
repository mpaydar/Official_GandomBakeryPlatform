import { redirect } from "next/navigation";
import { canRegisterMasterAdmin } from "@/lib/services/admin-users";
import AdminSetupForm from "./AdminSetupForm";

export default async function AdminSetupPage() {
  const allowed = await canRegisterMasterAdmin();
  if (!allowed) {
    redirect("/admin/login");
  }
  return <AdminSetupForm />;
}
