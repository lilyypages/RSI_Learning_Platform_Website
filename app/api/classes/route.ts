import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const classes = await db.class.findMany({ orderBy: { name: "asc" } });
  
  // 🌟 REVISI: Ubah 'data' menjadi 'classes' agar konsisten dengan endpoint lainnya
  return NextResponse.json({ success: true, classes });
}