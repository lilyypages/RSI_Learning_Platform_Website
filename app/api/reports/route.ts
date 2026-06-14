import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where: any = {};

  if (session.role === "TEACHER") {
    const teacher = await db.teacher.findUnique({ where: { userId: session.userId }, include: { homeroomClass: { select: { id: true } } } });
    if (teacher?.homeroomClass.length) {
      const classIds = teacher.homeroomClass.map((c) => c.id);
      const students = await db.student.findMany({ where: { classId: { in: classIds } }, select: { id: true } });
      where.studentId = { in: students.map((s) => s.id) };
    }
  } else if (session.role === "PARENT") {
    const parent = await db.parent.findUnique({ where: { userId: session.userId }, include: { students: { select: { id: true } } } });
    if (parent) where.studentId = { in: parent.students.map((s) => s.id) };
  }

  const reports = await db.weeklyReport.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      student: { include: { user: { select: { name: true } }, class: { select: { name: true } } } },
      classSubject: { include: { subject: { select: { name: true } } } },
    },
    orderBy: { weekStart: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    data: reports.map((r) => ({
      id: r.id,
      studentName: r.student?.user?.name,
      className: r.student?.class?.name,
      subjectName: r.classSubject?.subject?.name,
      weekStart: r.weekStart?.toISOString(),
      avgScore: r.avgScore,
      completionRate: r.completionRate,
      recommendation: r.recommendation,
      kkmAchieved: r.kkm_achieved,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { classSubjectId, catatanKelas } = await req.json();
  if (!classSubjectId) return NextResponse.json({ error: "classSubjectId wajib diisi" }, { status: 400 });

  const teacher = await db.teacher.findUnique({ where: { userId: session!.userId } });
  if (!teacher) return NextResponse.json({ error: "Data guru tidak ditemukan" }, { status: 404 });

  const classSubject = await db.classSubject.findUnique({ where: { id: classSubjectId } });
  if (!classSubject) return NextResponse.json({ error: "Mapel tidak ditemukan" }, { status: 404 });

  const students = await db.student.findMany({ where: { classId: classSubject.classId } });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const reports = [];
  for (const student of students) {
    const sessions = await db.quizSession.findMany({
      where: {
        studentId: student.id,
        classSubjectId,
        startedAt: { gte: weekStart },
      },
    });

    const avgScore = sessions.length > 0 ? Math.round(sessions.reduce((s, q) => s + (q.score ?? 0), 0) / sessions.length) : 0;
    const completionRate = sessions.length > 0 ? Math.min(sessions.length * 20, 100) : 0;
    const kkmAchieved = avgScore >= 65;

    const report = await db.weeklyReport.create({
      data: {
        studentId: student.id,
        classSubjectId,
        teacherId: teacher.id,
        weekStart,
        avgScore,
        completionRate,
        recommendation: catatanKelas || null,
        kkm_achieved: kkmAchieved,
      },
    });
    reports.push(report);
  }

  return NextResponse.json({ success: true, message: `Laporan dibuat untuk ${reports.length} siswa`, data: { count: reports.length } }, { status: 201 });
}
