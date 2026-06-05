import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const teacher = await db.teacher.findUnique({
    where: { userId: session!.userId },
    select: { id: true },
  });
  if (!teacher) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

  const classSubjects = await db.classSubject.findMany({
    where: { teacherId: teacher.id },
    include: {
      subject: { select: { name: true, code: true } },
      class: { select: { name: true } },
      _count: { select: { materials: true, studentProgress: true } },
    },
    orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
  });

  const data = classSubjects.map((cs) => ({
    id: cs.id,
    subjectName: cs.subject.name,
    subjectCode: cs.subject.code,
    className: cs.class.name,
    totalMaterials: cs._count.materials,
    totalStudents: cs._count.studentProgress,
  }));

  return NextResponse.json({ success: true, data });
}
