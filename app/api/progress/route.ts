// app/api/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const classId   = searchParams.get("classId");

    // TEACHER: get progress murid kelas sendiri
    if (session.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: { userId: session.userId },
        include: { homeroomClass: { include: { students: { include: { user: { select: { name: true } }, progress: { include: { classSubject: { include: { subject: { select: { name: true } } } } } } } } } } },
      });
      if (!teacher) return NextResponse.json([]);

      const students = teacher.homeroomClass.flatMap((c) => c.students);
      const result = students.map((s) => ({
        studentId:   s.id,
        name:        s.user.name,
        totalPoints: s.totalPoints,
        streak:      s.currentStreak,
        progress:    s.progress.map((p) => ({
          subject:           p.classSubject.subject.name,
          completionPercent: p.completionPercent,
          totalScore:        p.totalScore,
          adaptiveLevel:     p.adaptiveLevel,
          lastActivity:      p.lastActivity,
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
              user:     { select: { name: true } },
              progress: {
                include: {
                  classSubject: {
                    include: {
                      subject: { select: { name: true, code: true } },
                    },
                  },
                },
              },
              quizSessions: { orderBy: { startedAt: "desc" }, take: 10 },
            },
          },
        },
      });
      if (!parent || parent.students.length === 0) return NextResponse.json([]);

      const student = parent.students[0];
      return NextResponse.json({
        child: {
          id:              student.id,
          name:            student.user.name,
          nis:             student.nis,
          birthdate:       student.birthdate,
          totalPoints:     student.totalPoints ?? 0,
          currentStreak:   student.currentStreak ?? 0,
          livesRemaining:  student.livesRemaining ?? 3,
        },
        progress: student.progress.map((p) => ({
          classSubjectId:    p.classSubjectId,
          subjectName:       p.classSubject.subject.name,
          subjectCode:       p.classSubject.subject.code,
          totalScore:        p.totalScore ?? 0,
          completionPercent: p.completionPercent ?? 0,
          adaptiveLevel:     p.adaptiveLevel,
          lastActivity:      p.lastActivity,
        })),
      });
    }

    // PRINCIPAL: overview sekolah
if (session.role === "PRINCIPAL") {
  const [totalStudents, totalTeachers, avgData, allProgress] = await Promise.all([
    db.student.count(),
    db.teacher.count(),
    db.studentProgress.aggregate({
      _avg: { totalScore: true }
    }),
    db.studentProgress.findMany({
      select: {
        totalScore: true,
        student: {
          select: {
            class: { select: { id: true, name: true } }
          }
        }
      }
    }),
  ]);

  // Group by class, calculate average
  const classMap: Record<string, { total: number; count: number }> = {};
  for (const p of allProgress) {
    const cls = p.student.class;
    const key = cls ? cls.name : "Tanpa Kelas";
    if (!classMap[key]) classMap[key] = { total: 0, count: 0 };
    classMap[key].total += (p.totalScore ?? 0);
    classMap[key].count += 1;
  }
  const classAverages = Object.entries(classMap).map(([name, data]) => ({
    className: name,
    avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
  }));

  return NextResponse.json({ 
    totalStudents, 
    totalTeachers, 
    schoolAvgScore: Math.round(avgData._avg.totalScore || 0),
    classAverages,
  });
}

    // STUDENT: progress sendiri
    const student = await db.student.findUnique({
      where:   { userId: session.userId },
      include: {
        progress: { include: { classSubject: { include: { subject: { select: { name: true } } } } } },
      },
    });
    if (!student) return NextResponse.json([]);

    return NextResponse.json(student.progress.map((p) => ({
      subject:           p.classSubject.subject.name,
      completionPercent: p.completionPercent,
      totalScore:        p.totalScore,
      adaptiveLevel:     p.adaptiveLevel,
      lastActivity:      p.lastActivity,
    })));

  } catch (error) {
    console.error("[PROGRESS_GET]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}