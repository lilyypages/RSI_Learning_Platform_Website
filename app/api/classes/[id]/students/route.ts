import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const classData = await db.class.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!classData) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });

  const students = await db.student.findMany({
    where: { classId: id },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      parent: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json({
    success: true,
    data: {
      className: classData.name,
      total: students.length,
      students: students.map((s) => ({
        id: s.id,
        nis: s.nis,
        name: s.user?.name,
        email: s.user?.email,
        isActive: s.user?.isActive,
        parentName: s.parent?.user?.name || null,
        parentEmail: s.parent?.user?.email || null,
      })),
    },
  });
}
