"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-amber-500/0 transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/30";

type Props = {
  resetEnabled: boolean;
};

export default function AdminForgotPasswordForm({ resetEnabled }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const passcode = (form.elements.namedItem("passcode") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, passcode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Reset failed");
        setLoading(false);
        return;
      }
      setSuccess("Password updated. Redirecting to sign in…");
      setTimeout(() => router.push("/admin/login"), 1500);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
        <h1 className="text-center text-xl font-semibold tracking-tight text-zinc-100">
          Reset admin password
        </h1>
        <p className="mt-1 text-center text-sm text-zinc-500">
          Enter your username, the admin passcode, and a new password
        </p>

        {!resetEnabled ? (
          <p className="mt-8 text-center text-sm leading-relaxed text-zinc-500">
            Password reset is not configured on this server. Ask the master admin
            to set{" "}
            <code className="text-zinc-400">ADMIN_REGISTRATION_PASSCODE</code>.
          </p>
        ) : (
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
                  placeholder="e.g. mohammadbayat"
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  Usernames are stored lowercase. If unsure, try first+last with no
                  space.
                </p>
              </div>
              <div>
                <label
                  htmlFor="passcode"
                  className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
                >
                  Admin passcode
                </label>
                <input
                  id="passcode"
                  name="passcode"
                  type="password"
                  autoComplete="off"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
                >
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="confirm"
                  className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
                >
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-emerald-400" role="status">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="flex w-full items-center justify-center rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-60"
            >
              {loading ? "Updating…" : "Reset password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link
            href="/admin/login"
            className="font-medium text-amber-400 hover:text-amber-300"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
