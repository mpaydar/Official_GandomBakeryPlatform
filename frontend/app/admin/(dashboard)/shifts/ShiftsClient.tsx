"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EmployeeRow, ShiftRow } from "@/lib/services/employees";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";

const labelClass = "block text-xs font-medium uppercase tracking-wide text-zinc-500";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultShiftTimes() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(9);
  const end = new Date(start);
  end.setHours(17);
  return { start: toDatetimeLocalValue(start), end: toDatetimeLocalValue(end) };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(startIso: string, endIso: string | null) {
  if (!endIso) return "Open ended";
  const hours = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours.toFixed(1)} h`;
}

export default function ShiftsClient() {
  const defaults = useMemo(() => defaultShiftTimes(), []);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [startTime, setStartTime] = useState(defaults.start);
  const [endTime, setEndTime] = useState(defaults.end);
  const [notes, setNotes] = useState("");

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, shiftRes] = await Promise.all([
        fetch("/api/admin/employees", { credentials: "include" }),
        fetch("/api/admin/shifts", { credentials: "include" }),
      ]);
      const empData = await empRes.json().catch(() => ({}));
      const shiftData = await shiftRes.json().catch(() => ({}));

      if (!empRes.ok) {
        setError(
          typeof empData.error === "string" ? empData.error : "Could not load employees"
        );
        return;
      }
      if (!shiftRes.ok) {
        setError(
          typeof shiftData.error === "string" ? shiftData.error : "Could not load shifts"
        );
        return;
      }

      const list = (empData.employees ?? []) as EmployeeRow[];
      setEmployees(list);
      setShifts((shiftData.shifts ?? []) as ShiftRow[]);
      setEmployeeId((current) => current || list[0]?.id || "");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAssignShift(e: React.FormEvent) {
    e.preventDefault();
    setBusy("assign");
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/admin/shifts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, startTime, endTime, notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not assign shift");
        return;
      }
      setSaved("Shift assigned");
      setNotes("");
      await load();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    setBusy("employee");
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, role: newRole, phone: newPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not add employee");
        return;
      }
      setSaved("Employee added");
      setNewName("");
      setNewRole("");
      setNewPhone("");
      await load();
      if (data.employee?.id) setEmployeeId(data.employee.id);
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function handleDeleteShift(id: string) {
    if (!window.confirm("Remove this shift?")) return;
    setBusy(id);
    setError(null);
    setSaved(null);
    try {
      const res = await fetch(`/api/admin/shifts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not delete shift");
        return;
      }
      setSaved("Shift removed");
      await load();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Employee shifts
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Add staff and assign upcoming shifts for the next two weeks.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {saved}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Assign shift</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Pick an employee, set start and end times, then save.
          </p>

          {loading ? (
            <p className="mt-6 text-sm text-zinc-500">Loading…</p>
          ) : employees.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-600">
              Add an employee first using the form on the right.
            </p>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={handleAssignShift}>
              <div>
                <label htmlFor="employeeId" className={labelClass}>
                  Employee
                </label>
                <select
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  className={inputClass}
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startTime" className={labelClass}>
                    Start
                  </label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className={labelClass}>
                    End
                  </label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="notes" className={labelClass}>
                  Notes (optional)
                </label>
                <input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Opening shift, cover for pickup rush…"
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={busy === "assign"}
                className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-60"
              >
                {busy === "assign" ? "Saving…" : "Assign shift"}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Add employee</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Create staff records before assigning shifts.
          </p>
          <form className="mt-5 space-y-4" onSubmit={handleAddEmployee}>
            <div>
              <label htmlFor="newName" className={labelClass}>
                Name
              </label>
              <input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="newRole" className={labelClass}>
                Role
              </label>
              <input
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Cashier, Baker, Manager…"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="newPhone" className={labelClass}>
                Phone (optional)
              </label>
              <input
                id="newPhone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                type="tel"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={busy === "employee"}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
            >
              {busy === "employee" ? "Adding…" : "Add employee"}
            </button>
          </form>

          {employees.length > 0 && (
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <p className={labelClass}>Active staff ({employees.length})</p>
              <ul className="mt-2 space-y-2">
                {employees.map((emp) => (
                  <li
                    key={emp.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{emp.name}</p>
                      <p className="text-xs text-zinc-500">{emp.role}</p>
                    </div>
                    <span className="text-xs tabular-nums text-zinc-400">
                      {emp.shiftCount} shift{emp.shiftCount !== 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">Upcoming shifts</h2>
          <p className="mt-1 text-xs text-zinc-500">Next 14 days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="px-5 py-3 font-medium text-zinc-500">Employee</th>
                <th className="px-5 py-3 font-medium text-zinc-500">Start</th>
                <th className="px-5 py-3 font-medium text-zinc-500">End</th>
                <th className="px-5 py-3 font-medium text-zinc-500">Duration</th>
                <th className="px-5 py-3 font-medium text-zinc-500">Notes</th>
                <th className="px-5 py-3 font-medium text-zinc-500" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-zinc-500">
                    Loading shifts…
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-zinc-500">
                    No shifts scheduled yet.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-900">{shift.employeeName}</p>
                      <p className="text-xs text-zinc-500">{shift.employeeRole}</p>
                    </td>
                    <td className="px-5 py-3 text-zinc-700">
                      {formatDateTime(shift.startTime)}
                    </td>
                    <td className="px-5 py-3 text-zinc-700">
                      {shift.endTime ? formatDateTime(shift.endTime) : "—"}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-zinc-600">
                      {formatDuration(shift.startTime, shift.endTime)}
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-3 text-zinc-500">
                      {shift.notes || "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void handleDeleteShift(shift.id)}
                        disabled={busy === shift.id}
                        className="text-xs font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
