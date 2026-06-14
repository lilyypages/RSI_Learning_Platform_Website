import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const classData = await db.class.findUnique({
    where: { id },
    include: {
      homeroomTeacher: { include: { user: { select: { name: true } } } },
      classSubjects: {
        include: {
          subject: { select: { name: true, code: true } },
          teacher: { include: { user: { select: { name: true } } } },
          _count: { select: { materials: true } },
        },
      },
      _count: { select: { students: true } },
    },
  });

  if (!classData) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      id: classData.id,
      name: classData.name,
      gradeLevel: classData.gradeLevel,
      academicYear: classData.academicYear,
      homeroomTeacher: classData.homeroomTeacher?.user?.name || null,
      totalStudents: classData._count.students,
      subjects: classData.classSubjects.map((cs) => ({
        id: cs.id,
        subject: cs.subject.name,
        code: cs.subject.code,
        teacher: cs.teacher?.user?.name || "Belum ada",
        totalMaterials: cs._count.materials,
        semester: cs.semester,
      })),
    },
  });
}
