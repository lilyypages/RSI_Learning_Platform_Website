import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const student = await db.student.findUnique({ where: { id }, select: { userId: true } });
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });

  await db.student.delete({ where: { id } });
  await db.user.delete({ where: { id: student.userId } });

  return NextResponse.json({ success: true, message: "Siswa berhasil dihapus" });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const body = await req.json();

  const student = await db.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });

  if (body.name) await db.user.update({ where: { id: student.userId }, data: { name: body.name } });

  return NextResponse.json({ success: true, message: "Siswa berhasil diperbarui" });
}
