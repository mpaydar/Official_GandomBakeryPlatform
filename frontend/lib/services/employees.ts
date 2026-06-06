import { prisma } from "@/lib/prisma";

export type EmployeeRow = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  shiftCount: number;
};

export type ShiftRow = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  startTime: string;
  endTime: string | null;
  notes: string | null;
  createdAt: string;
};

function parseDate(value: unknown, field: string): Date | { error: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { error: `${field} is required` };
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { error: `${field} is invalid` };
  }
  return date;
}

export async function listEmployees(): Promise<EmployeeRow[]> {
  const rows = await prisma.employee.findMany({
    where: { isActive: true },
    include: { _count: { select: { shifts: true } } },
    orderBy: [{ name: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    phone: row.phone,
    isActive: row.isActive,
    shiftCount: row._count.shifts,
  }));
}

export async function createEmployee(input: {
  name: string;
  role: string;
  phone?: string;
}) {
  const name = input.name.trim();
  const role = input.role.trim();
  const phone = input.phone?.trim() || null;

  if (name.length < 2) {
    return { ok: false as const, error: "Name must be at least 2 characters" };
  }
  if (role.length < 2) {
    return { ok: false as const, error: "Role must be at least 2 characters" };
  }

  const employee = await prisma.employee.create({
    data: { name, role, phone },
  });

  return {
    ok: true as const,
    employee: {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      phone: employee.phone,
      isActive: employee.isActive,
      shiftCount: 0,
    } satisfies EmployeeRow,
  };
}

export async function listShifts(options?: { from?: string; to?: string }) {
  const from = options?.from
    ? new Date(options.from)
    : (() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return start;
      })();
  const to = options?.to
    ? new Date(options.to)
    : new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return { ok: false as const, error: "Invalid date range" };
  }

  const rows = await prisma.shift.findMany({
    where: {
      startTime: { gte: from, lte: to },
      employee: { isActive: true },
    },
    include: { employee: true },
    orderBy: [{ startTime: "asc" }],
  });

  return {
    ok: true as const,
    shifts: rows.map(
      (row): ShiftRow => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeName: row.employee.name,
        employeeRole: row.employee.role,
        startTime: row.startTime.toISOString(),
        endTime: row.endTime?.toISOString() ?? null,
        notes: row.notes,
        createdAt: row.createdAt.toISOString(),
      })
    ),
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export async function assignShift(input: {
  employeeId: string;
  startTime: unknown;
  endTime?: unknown;
  notes?: string;
}) {
  const employee = await prisma.employee.findFirst({
    where: { id: input.employeeId, isActive: true },
  });
  if (!employee) {
    return { ok: false as const, error: "Employee not found" };
  }

  const startParsed = parseDate(input.startTime, "Start time");
  if (!(startParsed instanceof Date)) {
    return { ok: false as const, error: startParsed.error };
  }
  const startTime = startParsed;

  let endTime: Date | null = null;
  if (input.endTime != null && String(input.endTime).trim() !== "") {
    const endParsed = parseDate(input.endTime, "End time");
    if (!(endParsed instanceof Date)) {
      return { ok: false as const, error: endParsed.error };
    }
    if (endParsed <= startTime) {
      return { ok: false as const, error: "End time must be after start time" };
    }
    endTime = endParsed;
  }

  const notes = input.notes?.trim() || null;

  const shift = await prisma.shift.create({
    data: {
      employeeId: employee.id,
      startTime,
      endTime,
      notes,
    },
    include: { employee: true },
  });

  return {
    ok: true as const,
    shift: {
      id: shift.id,
      employeeId: shift.employeeId,
      employeeName: shift.employee.name,
      employeeRole: shift.employee.role,
      startTime: shift.startTime.toISOString(),
      endTime: shift.endTime?.toISOString() ?? null,
      notes: shift.notes,
      createdAt: shift.createdAt.toISOString(),
    } satisfies ShiftRow,
  };
}

export async function deleteShift(id: string) {
  const existing = await prisma.shift.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false as const, error: "Shift not found" };
  }

  await prisma.shift.delete({ where: { id } });
  return { ok: true as const };
}
