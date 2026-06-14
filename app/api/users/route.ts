import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const where: any = {};
  if (role && ["STUDENT", "TEACHER", "PARENT", "PRINCIPAL"].includes(role)) {
    where.role = role;
  }

  const users = await db.user.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    select: { id: true, name: true, email: true, role: true, isActive: true, imageUrl: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: users });
}
