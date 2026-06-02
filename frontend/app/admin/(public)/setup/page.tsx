"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminSetupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const first_name = (form.elements.namedItem("first_name") as HTMLInputElement)
      .value;
    const last_name = (form.elements.namedItem("last_name") as HTMLInputElement)
      .value;
    const admin_user_name= `${first_name}${last_name}`
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement)
      .value;

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: first_name,
          last_name: last_name,
          user_name: admin_user_name,
          hashpass: password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not create admin account"
        );
        setLoading(false);
        return;
      }
      router.push("/admin/login");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
        <h1 className="text-center text-xl font-semibold tracking-tight text-zinc-100">
          Create admin account
        </h1>
        <p className="mt-1 text-center text-sm text-zinc-500">
          This will create the first admin user.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="first_name"
                className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
              >
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="firstName"
                required
                className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-amber-500/0 transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <div>
              <label
                  htmlFor="last_name"
                  className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="lastName"
                  required
                  className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-amber-500/0 transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30"
                />
            </div>




            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-amber-500/0 transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-amber-500/0 transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create admin"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link
            href="/admin/login"
            className="text-amber-500/80 hover:text-amber-400"
          >
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

