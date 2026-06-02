import { isAdminRegistrationEnabled } from "@/lib/admin-registration-passcode";
import { canRegisterMasterAdmin } from "@/lib/services/admin-users";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  let masterSetupAllowed = false;
  let registrationEnabled = false;
  try {
    masterSetupAllowed = await canRegisterMasterAdmin();
    registrationEnabled = isAdminRegistrationEnabled();
  } catch {
    // If DB is unreachable, still show setup link; setup page will surface the error
    masterSetupAllowed = true;
  }
  return (
    <AdminLoginForm
      masterSetupAllowed={masterSetupAllowed}
      registrationEnabled={registrationEnabled}
    />
  );
}
