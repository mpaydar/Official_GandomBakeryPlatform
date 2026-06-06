import Link from "next/link";
import { requireAdmin } from "@/lib/admin-api";
import { lookupReceiptByConfirmationCode } from "@/lib/services/receipts";
import AdminReceiptView from "./AdminReceiptView";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function AdminReceiptPage({ params }: PageProps) {
  const denied = await requireAdmin();
  if (denied) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-zinc-600">Sign in required.</p>
        <Link href="/admin/login" className="mt-4 inline-block text-amber-600 hover:underline">
          Admin login
        </Link>
      </div>
    );
  }

  const { code } = await params;
  const result = await lookupReceiptByConfirmationCode(decodeURIComponent(code));

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">Receipt not found</h1>
        <p className="mt-2 text-sm text-zinc-600">{result.error}</p>
        <Link
          href="/admin/receipts"
          className="mt-6 inline-block text-sm font-medium text-amber-600 hover:underline"
        >
          ← Back to receipt lookup
        </Link>
      </div>
    );
  }

  return <AdminReceiptView receipt={result.receipt} />;
}
