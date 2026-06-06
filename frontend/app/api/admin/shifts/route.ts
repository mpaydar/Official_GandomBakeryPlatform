import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { assignShift, listShifts } from "@/lib/services/employees";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const from = req.nextUrl.searchParams.get("from") ?? undefined;
  const to = req.nextUrl.searchParams.get("to") ?? undefined;

  try {
    const result = await listShifts({ from, to });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not load shifts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: {
    employeeId?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.employeeId?.trim()) {
    return NextResponse.json({ error: "Employee is required" }, { status: 400 });
  }

  try {
    const result = await assignShift({
      employeeId: body.employeeId.trim(),
      startTime: body.startTime,
      endTime: body.endTime,
      notes: body.notes,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ shift: result.shift }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not assign shift" }, { status: 500 });
  }
}
