import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    const { id } = await params;
    const role = session?.role;

    // --- 🛡️ AUTENTIKASI & VALIDASI ---
    if (role === "PRINCIPAL") {
      const guard = requireRole(session, "PRINCIPAL");
      if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
    } 
    else if (role === "TEACHER") {
      // 1. Cari Profil Guru berdasarkan userId dari session
      const teacherProfile = await db.teacher.findUnique({
        where: { userId: (session as any)?.userId }
      });

      if (!teacherProfile) {
        return NextResponse.json({ success: false, message: "Profil guru tidak ditemukan" }, { status: 404 });
      }

      // 2. Cari kelas siswa
      const studentWithClass = await db.student.findUnique({
        where: { id },
        select: { class: { select: { id: true } } }
      });

      // 3. Validasi apakah guru tersebut mengajar kelas siswa ini
      const isTeaching = await db.classSubject.findFirst({
        where: { 
          classId: studentWithClass?.class?.id, 
          teacherId: teacherProfile.id 
        }
      });

      if (!isTeaching) {
        return NextResponse.json({ success: false, message: "Akses dilarang. Siswa ini bukan bagian dari kelas bimbingan Anda." }, { status: 403 });
      }
    } 
    else {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // --- 📊 QUERY DATA UTAMA ---
    const student = await db.student.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        totalPoints: true,
        user: { select: { name: true } },
        class: { select: { name: true } }
      }
    });

    if (!student) {
      return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const [subjectProgress, allQuizSessions, videoWatches] = await Promise.all([
      db.studentProgress.findMany({
        where: { studentId: id },
        select: {
          id: true,
          completionPercent: true,
          totalScore: true,
          adaptiveLevel: true,
          lastActivity: true,
          classSubject: {
            select: { subject: { select: { id: true, name: true, code: true } } }
          }
        },
        orderBy: { lastActivity: "desc" }
      }),
      db.quizSession.findMany({
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
            select: { subject: { select: { name: true } } }
          }
        },
        orderBy: { startedAt: "desc" }
      }),
      db.videoWatch.findMany({
        where: { studentId: id },
        select: {
          id: true,
          isCompleted: true,
          watchedSeconds: true,
          watchedAt: true,
        },
        orderBy: { watchedAt: "desc" }
      })
    ]);

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