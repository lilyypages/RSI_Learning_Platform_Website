import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const teacher = await db.teacher.findUnique({
    where: { userId: session!.userId },
    include: {
      user: { select: { name: true, email: true } },
      homeroomClass: { select: { id: true, name: true, students: { include: { user: { select: { name: true } } } } } },
      classSubjects: {
        include: {
          subject: { select: { name: true, code: true } },
          class: { select: { id: true, name: true } },
          studentProgress: {
            include: { student: { include: { user: { select: { name: true } } } } },
          },
        },
      },
    },
  });

  if (!teacher) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

  const homeroomClassIds = new Set(teacher.homeroomClass.map((c: { id: string }) => c.id));
  const processedClassIds = new Set<string>()



  const classes = (teacher.classSubjects as Array<any>).reduce((acc: any[], cs: any) => {
    let entry = acc.find((e: any) => e.classId === cs.class.id);
    if (!entry) {
      const classStudents = teacher.homeroomClass.find((c: any) => c.id === cs.class.id)?.students ?? [];
      entry = {
        className: cs.class.name,
        classId: cs.class.id,
        isHomeroom: homeroomClassIds.has(cs.class.id),
        totalStudents: classStudents.length,
        subjects: [],
      };
      acc.push(entry);
    }
    const students = cs.studentProgress.map((sp: any) => ({
      name: sp.student.user.name,
      completionPercent: sp.completionPercent,
      totalScore: sp.totalScore,
      adaptiveLevel: sp.adaptiveLevel,
    }));
    const vals = cs.studentProgress.map((sp: any) => sp.completionPercent ?? 0);
    const avg = vals.length > 0 ? Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length) : 0;
    entry.subjects.push({
      subjectName: cs.subject.name,
      code: cs.subject.code,
      avgCompletion: avg,
      studentsBehind: cs.studentProgress.filter((sp: any) => (sp.completionPercent ?? 0) < 70).length,
      students,
    });
    entry.totalStudents = Math.max(entry.totalStudents, students.length);
    return acc;
  }, []);

  // totals across all classes (unique students behind)
  const allProgress = teacher.classSubjects.flatMap((cs: any) => cs.studentProgress);
  const behindStudentIds = new Set(
    allProgress.filter((sp: any) => (sp.completionPercent ?? 0) < 70).map((sp: any) => sp.studentId)
  );
  const allVals = allProgress.map((sp: any) => sp.completionPercent ?? 0);

  return NextResponse.json({
    success: true,
    data: {
      teacher: {
        name: teacher.user.name,
        email: teacher.user.email,
        homeroom: teacher.homeroomClass.length ? teacher.homeroomClass.map((c: any) => c.name).join(", ") : null,
      },
      classes,
      stats: {
        totalStudents: new Set(allProgress.map((sp: any) => sp.studentId)).size,
        avgCompletion: allVals.length > 0 ? Math.round(allVals.reduce((a: number, b: number) => a + b, 0) / allVals.length) : 0,
        studentsBehind: behindStudentIds.size,
      },
    },
  });
}
