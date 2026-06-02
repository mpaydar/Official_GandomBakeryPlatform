"use client";

export default function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-left text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800"
    >
      Sign out
    </button>
  );
}
