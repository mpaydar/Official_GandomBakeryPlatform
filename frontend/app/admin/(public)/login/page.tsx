"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupAllowed, setSetupAllowed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/registration")
      .then((res) => res.json())
      .then((data: { allowed?: boolean }) => setSetupAllowed(Boolean(data.allowed)))
      .catch(() => setSetupAllowed(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Sign-in failed");
        setLoading(false);
        return;
      }
      router.push("/admin");
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
          Gandom admin
        </h1>
        <p className="mt-1 text-center text-sm text-zinc-500">
          Sign in with your admin username and password
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
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
                autoComplete="current-password"
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
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {setupAllowed && (
            <p className="text-center text-sm text-zinc-500">
              First time?{" "}
              <Link
                href="/admin/setup"
                className="font-medium text-amber-400 hover:text-amber-300"
              >
                Create master admin
              </Link>
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link href="/" className="text-amber-500/80 hover:text-amber-400">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
