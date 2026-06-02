import Link from "next/link";
import { isAdminRegistrationEnabled } from "@/lib/admin-registration-passcode";
import { canRegisterMasterAdmin } from "@/lib/services/admin-users";
import AdminSetupForm from "./AdminSetupForm";

export default async function AdminSetupPage() {
  let masterSetupAllowed = false;
  try {
    masterSetupAllowed = await canRegisterMasterAdmin();
  } catch {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
        <p className="max-w-md text-sm text-red-400">
          Could not reach the database. Check DATABASE_URL and JWT_SECRET_KEY on
          Vercel, then redeploy.
        </p>
        <Link href="/admin/login" className="mt-4 text-sm text-amber-400">
          ← Back to login
        </Link>
      </div>
    );
  }

  if (!isAdminRegistrationEnabled()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
        <p className="max-w-md text-sm text-zinc-300">
          Admin registration is not enabled on this server. The site owner must
          set <code className="text-amber-400">ADMIN_REGISTRATION_PASSCODE</code>{" "}
          in the deployment environment, then share that passcode with people who
          should get access.
        </p>
        <Link href="/admin/login" className="mt-4 text-sm text-amber-400">
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <AdminSetupForm mode={masterSetupAllowed ? "master" : "additional"} />
  );
}
