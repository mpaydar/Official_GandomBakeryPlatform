import { isAdminRegistrationEnabled } from "@/lib/admin-registration-passcode";
import AdminForgotPasswordForm from "./AdminForgotPasswordForm";

export default function AdminForgotPasswordPage() {
  const resetEnabled = isAdminRegistrationEnabled();
  return <AdminForgotPasswordForm resetEnabled={resetEnabled} />;
}
