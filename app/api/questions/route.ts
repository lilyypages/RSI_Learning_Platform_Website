import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const materialId = searchParams.get("materialId");

  if (!materialId) return NextResponse.json({ error: "materialId diperlukan" }, { status: 400 });

  const questions = await db.question.findMany({
    where: { materialId },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ success: true, data: questions });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id parameter diperlukan" }, { status: 400 });

  await db.question.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Soal berhasil dihapus" });
}
