import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    const role = searchParams.get("role");

    // TEACHER: get progress murid kelas sendiri
    if (session.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: { userId: session.userId },
        include: {
          homeroomClass: {
            include: {
              students: {
                include: {
                  user: { select: { name: true } },
                  progress: { include: { classSubject: { include: { subject: { select: { name: true } } } } } },
                },
              },
            },
          },
        },
      });
      if (!teacher) return NextResponse.json([]);

      const students = teacher.homeroomClass.flatMap((c) => c.students);
      const result = students.map((s) => ({
        studentId: s.id,
        name: s.user.name,
        totalPoints: s.totalPoints,
        streak: s.currentStreak,
        progress: s.progress.map((p) => ({
          subject: p.classSubject.subject.name,
          completionPercent: p.completionPercent,
          totalScore: p.totalScore,
          adaptiveLevel: p.adaptiveLevel,
          lastActivity: p.lastActivity,
        })),
        avgScore: s.progress.length > 0
          ? Math.round(s.progress.reduce((sum, p) => sum + (p.totalScore ?? 0), 0) / s.progress.length)
          : 0,
      }));
      return NextResponse.json(result);
    }

    // PARENT: get progress anak
    if (session.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: { userId: session.userId },
        include: {
          students: {
            include: {
              user: { select: { name: true } },
              progress: { include: { classSubject: { include: { subject: { select: { name: true } } } } } },
              quizSessions: { orderBy: { startedAt: "desc" }, take: 10 },
            },
          },
        },
      });
      if (!parent || parent.students.length === 0) return NextResponse.json([]);

      const student = parent.students[0];
      return NextResponse.json({
        child: {
          name: student.user.name,
          nis: student.nis,
          birthdate: student.birthdate,
          totalPoints: student.totalPoints ?? 0,
          currentStreak: student.currentStreak ?? 0,
          livesRemaining: student.livesRemaining ?? 3,
        },
        progress: student.progress.map((p) => ({
          subjectName: p.classSubject.subject.name,
          subjectCode: p.classSubject.subject.name,
          totalScore: p.totalScore ?? 0,
          completionPercent: p.completionPercent ?? 0,
          adaptiveLevel: p.adaptiveLevel,
          lastActivity: p.lastActivity,
        })),
      });
    }

    // PRINCIPAL: overview sekolah (dengan ?role=PRINCIPAL)
    if (role === "PRINCIPAL" && session.role === "PRINCIPAL") {
      const [totalStudents, totalTeachers, progressData] = await Promise.all([
        db.student.count(),
        db.teacher.count(),
        db.studentProgress.findMany({
          include: {
            student: { include: { user: { select: { name: true } }, class: { select: { name: true } } } },
            classSubject: { include: { subject: { select: { name: true } } } },
          },
        }),
      ]);

      const schoolAvgScore = progressData.length > 0
        ? Math.round(progressData.reduce((sum, p) => sum + (p.totalScore ?? 0), 0) / progressData.length)
        : 0;

      return NextResponse.json({
        success: true,
        totalStudents,
        totalTeachers,
        schoolAvgScore,
        data: progressData.map((p) => ({
          id: p.id,
          studentName: p.student?.user?.name,
          className: p.student?.class?.name,
          subjectName: p.classSubject?.subject?.name,
          completionPercent: p.completionPercent,
          totalScore: p.totalScore,
          adaptiveLevel: p.adaptiveLevel,
          lastActivity: p.lastActivity,
        })),
      });
    }

    // STUDENT: progress sendiri
    const student = await db.student.findUnique({
      where: { userId: session.userId },
      include: {
        progress: { include: { classSubject: { include: { subject: { select: { name: true } } } } } },
      },
    });
    if (!student) return NextResponse.json([]);

    return NextResponse.json(student.progress.map((p) => ({
      subject: p.classSubject.subject.name,
      completionPercent: p.completionPercent,
      totalScore: p.totalScore,
      adaptiveLevel: p.adaptiveLevel,
      lastActivity: p.lastActivity,
    })));

  } catch (error) {
    console.error("[PROGRESS_GET]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
