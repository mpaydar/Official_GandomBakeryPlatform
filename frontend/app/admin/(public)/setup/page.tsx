import Link from "next/link";
import { canRegisterMasterAdmin } from "@/lib/services/admin-users";
import AdminSetupForm from "./AdminSetupForm";

export default async function AdminSetupPage() {
  let allowed = false;
  try {
    allowed = await canRegisterMasterAdmin();
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

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
        <p className="max-w-md text-sm text-zinc-300">
          Master admin already exists. Sign in at{" "}
          <Link href="/admin/login" className="text-amber-400 underline">
            /admin/login
          </Link>
          .
        </p>
        <p className="mt-3 max-w-md text-xs text-zinc-500">
          If you forgot the username, try the old format: first name + last name,
          lowercase, no space (e.g. johnsmith).
        </p>
      </div>
    );
  }

  return <AdminSetupForm />;
}
