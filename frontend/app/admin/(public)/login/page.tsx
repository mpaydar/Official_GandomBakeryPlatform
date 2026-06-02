import { canRegisterMasterAdmin } from "@/lib/services/admin-users";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  let setupAllowed = false;
  try {
    setupAllowed = await canRegisterMasterAdmin();
  } catch {
    // If DB is unreachable, still show setup link; setup page will surface the error
    setupAllowed = true;
  }
  return <AdminLoginForm setupAllowed={setupAllowed} />;
}
