import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { createEmployee, listEmployees } from "@/lib/services/employees";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const employees = await listEmployees();
    return NextResponse.json({ employees });
  } catch {
    return NextResponse.json(
      { error: "Could not load employees" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { name?: string; role?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await createEmployee({
      name: body.name ?? "",
      role: body.role ?? "",
      phone: body.phone,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ employee: result.employee }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create employee" },
      { status: 500 }
    );
  }
}
