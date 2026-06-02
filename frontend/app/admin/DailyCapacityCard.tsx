"use client";

import { useCallback, useEffect, useState } from "react";

type CapacityResponse = {
  businessDate?: string;
  maxLoaves?: number;
  usedLoaves?: number;
  error?: string;
};

export default function DailyCapacityCard() {
  const [maxLoaves, setMaxLoaves] = useState(0);
  const [usedLoaves, setUsedLoaves] = useState<number | null>(null);
  const [businessDate, setBusinessDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/bakery-capacity", {
        credentials: "include",
      });
      const data = (await res.json().catch(() => null)) as CapacityResponse | null;
      if (!data) {
        setError(
          res.ok ? "Unexpected response from server" : "Could not load capacity"
        );
        return;
      }
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Could not load"
        );
        return;
      }
      setMaxLoaves(Number(data.maxLoaves ?? 0));
      setUsedLoaves(
        typeof data.usedLoaves === "number" ? data.usedLoaves : null
      );
      setBusinessDate(
        typeof data.businessDate === "string" ? data.businessDate : null
      );
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function adjust(delta: number) {
    setMaxLoaves((n) => Math.max(0, n + delta));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/bakery-capacity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ maxLoaves }),
      });
      const data = (await res.json().catch(() => ({}))) as CapacityResponse;
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      setSaved(true);
      if (typeof data.maxLoaves === "number") setMaxLoaves(data.maxLoaves);
      if (typeof data.usedLoaves === "number") setUsedLoaves(data.usedLoaves);
      if (typeof data.businessDate === "string")
        setBusinessDate(data.businessDate);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const remaining =
    usedLoaves !== null ? Math.max(0, maxLoaves - usedLoaves) : null;

  return (
    <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/90">
              Bakery schedule
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Today&apos;s bake capacity
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Set how many loaves you plan to bake for{" "}
              <span className="font-medium text-slate-800">
                {businessDate ?? "today"}
              </span>
              . New orders can use this limit once your checkout is wired to
              it.
            </p>
          </div>

          {!loading && (
            <dl className="flex flex-wrap gap-3 sm:gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 sm:min-w-[140px]">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Capacity
                </dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                  {maxLoaves}
                </dd>
              </div>
              {usedLoaves !== null && (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 sm:min-w-[140px]">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Reserved
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                      {usedLoaves}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 sm:min-w-[140px]">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Remaining
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                      {remaining}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          )}
        </div>

        <div className="flex shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 lg:w-[min(100%,320px)]">
          <p className="mb-4 text-sm font-medium text-slate-700">
            Adjust limit
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => adjust(-1)}
              disabled={loading || saving || maxLoaves <= 0}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Decrease by one"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              value={maxLoaves}
              onChange={(e) => {
                const v = Math.max(0, Number(e.target.value) || 0);
                setMaxLoaves(v);
                setSaved(false);
              }}
              className="h-12 min-w-[5.5rem] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-center text-2xl font-semibold tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 sm:max-w-[7rem]"
              aria-label="Max loaves"
            />
            <button
              type="button"
              onClick={() => adjust(1)}
              disabled={loading || saving}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Increase by one"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={loading || saving}
            className="mt-5 w-full rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save capacity"}
          </button>
        </div>
      </div>

      <div className="mt-8 min-h-[3rem] border-t border-slate-100 pt-8">
        {loading && (
          <p className="text-sm text-slate-500">Loading capacity…</p>
        )}
        {!loading && error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {!loading && saved && !error && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Capacity saved.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-6 sm:min-h-[5.5rem]" />
    </section>
  );
}
