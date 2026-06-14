import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const student = await db.student.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } }, class: { select: { name: true } } },
  });
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });

  if (session.role === "PARENT") {
    if (student.parentId) {
      const parent = await db.parent.findUnique({ where: { userId: session.userId } });
      if (!parent || parent.id !== student.parentId) {
        return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
      }
    }
  }

  const progress = await db.studentProgress.findMany({
    where: { studentId: id },
    include: { classSubject: { include: { subject: { select: { name: true, code: true } } } } },
    orderBy: { lastActivity: "desc" },
  });

  const sessions = await db.quizSession.findMany({
    where: { studentId: id },
    orderBy: { startedAt: "desc" },
    take: 50,
    include: { classSubject: { include: { subject: { select: { name: true } } } } },
  });

  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0 ? Math.round(sessions.reduce((s, q) => s + (q.score ?? 0), 0) / totalSessions) : 0;
  const passedSessions = sessions.filter((s) => (s.score ?? 0) >= 65).length;

  const subjectProgress = progress.map((p) => ({
    id: p.id,
    classSubject: p.classSubject
      ? {
          subject: { name: p.classSubject.subject?.name, code: p.classSubject.subject?.code },
        }
      : null,
    completionPercent: p.completionPercent,
    totalScore: p.totalScore,
    adaptiveLevel: p.adaptiveLevel,
    lastActivity: p.lastActivity?.toISOString(),
  }));

  const allQuizSessions = sessions.map((s) => ({
    id: s.id,
    classSubject: s.classSubject
      ? {
          subject: { name: s.classSubject.subject?.name },
        }
      : null,
    score: s.score,
    correctCount: s.correctCount,
    wrongCount: s.wrongCount,
    resultLevel: s.resultLevel,
    startedAt: s.startedAt?.toISOString(),
  }));

  return NextResponse.json({
    success: true,
    student: { name: student.user?.name, email: student.user?.email, className: student.class?.name, nis: student.nis, totalPoints: 0 },
    subjectProgress,
    allQuizSessions,
    videoStats: { completedCount: 0, totalWatched: 0 },
  });
}
