import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    const guard = requireRole(session, "PRINCIPAL");
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;

    // 1. Ambil data dasar siswa & kelas
    const student = await db.student.findUnique({
      where: { id },
      select: {
        id: true,
        totalPoints: true,
        user: { select: { name: true } },
        class: { select: { name: true } }
      }
    });

    if (!student) {
      return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // 2. Ambil seluruh data progress mata pelajaran secara detail
    const subjectProgress = await db.studentProgress.findMany({
      where: { studentId: id },
      select: {
        id: true,
        completionPercent: true,
        totalScore: true,
        adaptiveLevel: true,
        lastActivity: true,
        classSubject: {
          select: {
            subject: {
              select: { id: true, name: true, code: true }
            }
          }
        }
      },
      orderBy: { lastActivity: "desc" }
    });

    // 3. Ambil seluruh riwayat pengerjaan kuis siswa (tanpa batasan take: 5)
    const allQuizSessions = await db.quizSession.findMany({
      where: { studentId: id },
      select: {
        id: true,
        score: true,
        correctCount: true,
        wrongCount: true,
        resultLevel: true,
        startedAt: true,
        finishedAt: true,
        classSubject: {
          select: {
            subject: { select: { name: true } }
          }
        }
      },
      orderBy: { startedAt: "desc" }
    });

    // 4. Ambil statistik tontonan video materi
    const videoWatches = await db.videoWatch.findMany({
      where: { studentId: id },
      select: {
        id: true,
        isCompleted: true,
        watchedSeconds: true,
        watchedAt: true,
        // Menyesuaikan jika model videoWatch kamu terikat ke materi/subject
      },
      orderBy: { watchedAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      student,
      subjectProgress,
      allQuizSessions,
      videoStats: {
        totalWatched: videoWatches.length,
        completedCount: videoWatches.filter(v => v.isCompleted).length
      }
    });

  } catch (error) {
    console.error("[STUDENT_PROGRESS_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}